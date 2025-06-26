
'use server';

import { z } from 'zod';
import { updateMemberEmail, updateMemberProfile, updateMemberProfileUrl } from '@/lib/data';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { sendOtpEmail } from '@/lib/email';
import { supabase } from '@/lib/supabaseClient';

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
    
    // Send the OTP via the new email service
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
        .int({ message: 'Age must be a whole number.' })
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
        revalidatePath('/me/dashboard'); // Also revalidate dashboard to show updated info
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
    const memberUUID = formData.get('memberUUID') as string;
    const file = formData.get('profilePicture') as File;

    if (!memberUUID) {
        return { success: false, message: 'Member identifier is missing.' };
    }
    if (!file || file.size === 0) {
        return { success: false, message: 'Please select an image to upload.' };
    }
    if (!supabase) {
        return { success: false, message: 'Storage service is not configured.' };
    }

    const fileExtension = file.name.split('.').pop();
    const filePath = `${memberUUID}/profile-${Date.now()}.${fileExtension}`;

    try {
        // Upload file to Supabase Storage.
        // Removed `upsert: true` as each upload has a unique path, simplifying permissions.
        const { error: uploadError } = await supabase.storage
            .from('avatars') // Bucket name, must exist and be public
            .upload(filePath, file, {
                cacheControl: '3600',
            });

        if (uploadError) {
            console.error('[updateProfilePicture] Supabase Storage upload error:', uploadError);
            return { success: false, message: `Failed to upload profile picture. Storage error: ${uploadError.message}` };
        }

        // Get public URL of the uploaded file
        const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);

        if (!publicUrl) {
            return { success: false, message: 'Could not get public URL for the uploaded image.' };
        }

        // Update the member's profile_url in the database
        const dbResult = await updateMemberProfileUrl(memberUUID, publicUrl);
        if (!dbResult.success) {
            // If the DB update fails, remove the orphaned file from storage to prevent clutter.
            await supabase.storage.from('avatars').remove([filePath]);
            return { success: false, message: dbResult.error || 'Failed to update profile picture in database.' };
        }

        revalidatePath('/me/settings');
        revalidatePath('/me/dashboard');
        revalidatePath('/me/messages');

        return { success: true, message: 'Profile picture updated successfully!', profileUrl: publicUrl };

    } catch (error) {
        console.error('[updateProfilePicture] Error:', error);
        return { success: false, message: 'An unexpected server error occurred.' };
    }
}
