
'use server';

import { z } from 'zod';
import { updateMemberEmail, updateMemberProfile, updateProfilePictureUrl } from '@/lib/data';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { sendOtpEmail } from '@/lib/email';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabase: ReturnType<typeof createClient> | null = null;
if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}


export interface RequestEmailChangeState {
  success: boolean;
  message: string;
  otp?: string;
  newEmail?: string;
}

const emailSchema = z.string().email({ message: 'Invalid email address.' });

export async function requestEmailChange(
  currentState: RequestEmailChangeState,
  formData: FormData
): Promise<RequestEmailChangeState> {
  const newEmail = formData.get('newEmail') as string;
  const currentEmail = formData.get('currentEmail') as string;
  const gymId = formData.get('gymId') as string;

  const validation = emailSchema.safeParse(newEmail);
  if (!validation.success) {
    return { success: false, message: validation.error.errors[0].message };
  }

  if (!currentEmail || !gymId) {
    return { success: false, message: 'Could not identify your account details. Please refresh and try again.' };
  }

  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    const emailResult = await sendOtpEmail({ to: currentEmail, otp, gymId });

    if (!emailResult.success) {
        return { success: false, message: emailResult.error || 'Failed to send OTP email.' };
    }
    
    console.log(`[DEV-ONLY] Email change OTP for ${currentEmail} to authorize change to ${newEmail}: ${otp}`);

    return {
      success: true,
      message: `An OTP has been sent to your current email address (${currentEmail}). Please check your inbox.`,
      otp: otp,
      newEmail: newEmail,
    };
  } catch (error) {
    console.error('[requestEmailChange] Error:', error);
    return { success: false, message: 'An unexpected server error occurred.' };
  }
}

export interface VerifyEmailChangeState {
  success: boolean;
  message: string;
}

export async function verifyEmailChange(
  currentState: VerifyEmailChangeState,
  formData: FormData
): Promise<VerifyEmailChangeState> {
  const memberId = formData.get('memberId') as string;
  const newEmail = formData.get('newEmail') as string;
  const originalOtp = formData.get('originalOtp') as string;
  const userOtp = formData.get('otp') as string;

  if (!memberId || !newEmail || !originalOtp || !userOtp) {
    return { success: false, message: 'Missing required information.' };
  }

  if (userOtp !== originalOtp) {
    return { success: false, message: 'Invalid OTP. Please try again.' };
  }

  try {
    const result = await updateMemberEmail(memberId, newEmail);

    if (!result.success) {
      return { success: false, message: result.error || 'Failed to update email.' };
    }
  } catch (error) {
    console.error('[verifyEmailChange] Error:', error);
    return { success: false, message: 'An unexpected server error occurred.' };
  }
  
  revalidatePath('/me/settings');
  redirect(`/me/settings?memberId=${encodeURIComponent(memberId)}&email=${encodeURIComponent(newEmail)}&updated=true`);
}

const profileSchema = z.object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters long.' }),
    phone_number: z.string().optional(),
    age: z.preprocess(
      (val) => (val === '' ? undefined : val),
      z.coerce
        .number({ invalid_type_error: 'Age must be a number.' })
        .int({ message: 'Age must be whole number.' })
        .positive({ message: 'Age must be a positive number.' })
        .optional()
    ),
});

export interface UpdateProfileState {
    success: boolean;
    message: string;
    errors?: Partial<Record<'name' | 'phone_number' | 'age', string>>;
}

export async function updateProfile(
    currentState: UpdateProfileState,
    formData: FormData
): Promise<UpdateProfileState> {
    const memberId = formData.get('memberId') as string;
    if (!memberId) {
        return { success: false, message: 'Member ID is missing.' };
    }

    const parsedData = {
        name: formData.get('name'),
        phone_number: formData.get('phone'),
        age: formData.get('age'),
    };
    
    const validation = profileSchema.safeParse(parsedData);

    if (!validation.success) {
        const fieldErrors = validation.error.flatten().fieldErrors;
        return {
            success: false,
            message: 'Validation failed. Please check your inputs.',
            errors: {
                name: fieldErrors.name?.[0],
                phone_number: fieldErrors.phone_number?.[0],
                age: fieldErrors.age?.[0],
            }
        };
    }
    
    try {
        const result = await updateMemberProfile(memberId, validation.data);
        if (!result.success) {
            return { success: false, message: result.error || 'Failed to update profile.' };
        }

        revalidatePath('/me/settings');
        revalidatePath('/me/dashboard');
        return { success: true, message: 'Profile updated successfully!' };
    } catch (error) {
        console.error('[updateProfile] Error:', error);
        return { success: false, message: 'An unexpected server error occurred.' };
    }
}

export interface UpdateProfilePictureState {
    success: boolean;
    message: string;
    profileUrl?: string;
}

export async function updateProfilePicture(
    currentState: UpdateProfilePictureState,
    formData: FormData
): Promise<UpdateProfilePictureState> {
    if (!supabase) {
        return { success: false, message: 'File storage is not configured.' };
    }

    const memberUUID = formData.get('memberUUID') as string;
    const file = formData.get('profilePicture') as File;

    if (!memberUUID) {
        return { success: false, message: 'Member identifier is missing.' };
    }
    if (!file || file.size === 0) {
        return { success: false, message: 'No file was selected for upload.' };
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${memberUUID}-${Date.now()}.${fileExt}`;
    const filePath = `profile-pictures/${fileName}`;

    try {
        const { error: uploadError } = await supabase.storage
            .from('media')
            .upload(filePath, file);

        if (uploadError) {
            console.error('[updateProfilePicture] Supabase Storage error:', uploadError);
            return { success: false, message: `Storage error: ${uploadError.message}` };
        }

        const { data: { publicUrl } } = supabase.storage
            .from('media')
            .getPublicUrl(filePath);

        const { success, error: dbError } = await updateProfilePictureUrl(memberUUID, publicUrl);

        if (!success) {
            return { success: false, message: dbError || 'Failed to save picture URL to profile.' };
        }
        
        revalidatePath('/me/settings');
        revalidatePath('/me/dashboard');
        return { success: true, message: 'Profile picture updated!', profileUrl: publicUrl };

    } catch (error) {
        console.error('[updateProfilePicture] Action error:', error);
        return { success: false, message: 'An unexpected error occurred during file upload.' };
    }
}
