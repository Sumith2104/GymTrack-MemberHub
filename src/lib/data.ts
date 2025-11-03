
import type { Member, Checkin, Announcement, MembershipPlan, Message, SmtpConfig, Workout, WorkoutExercise } from './types';
import { supabase } from './supabaseClient';
import { differenceInDays } from 'date-fns';

export async function getMemberProfile(email: string, memberDisplayId: string): Promise<Member | null> {
  if (!supabase) {
    console.error("[getMemberProfile] Supabase client is not initialized.");
    return null;
  }

  const normalizedEmail = email.toLowerCase();
  const normalizedMemberId = memberDisplayId.toUpperCase();

  try {
    const { data: rawData, error } = await supabase
      .from('members')
      .select(`
        id,
        member_id,
        name,
        email,
        age,
        phone_number,
        join_date,
        membership_type,
        membership_status,
        expiry_date,
        plan_id,
        gym_id,
        profile_url,
        plans (
          price
        ),
        gyms (
          name,
          formatted_gym_id,
          payment_id
        )
      `)
      .ilike('email', normalizedEmail)
      .ilike('member_id', normalizedMemberId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        console.log(`[getMemberProfile] No member found for Email: "${normalizedEmail}", Member ID: "${normalizedMemberId}".`);
      } else {
        console.error(`[getMemberProfile] Supabase error for Email: "${normalizedEmail}", Member ID: "${normalizedMemberId}".`, error);
      }
      return null;
    }

    if (!rawData) {
      console.log(`[getMemberProfile] No member data returned from Supabase for Email: "${normalizedEmail}", Member ID: "${normalizedMemberId}".`);
      return null;
    }

    let calculatedStatus = rawData.membership_status;
    if (rawData.expiry_date) {
        const expiryDate = new Date(rawData.expiry_date);
        const today = new Date();
        
        expiryDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        
        const daysUntilExpiry = differenceInDays(expiryDate, today);

        if (daysUntilExpiry < 0) {
            calculatedStatus = 'Expired';
        } else if (daysUntilExpiry <= 7) {
            calculatedStatus = 'expiring_soon';
        }
    }

    const member: Member = {
      id: rawData.id,
      member_id: rawData.member_id,
      name: rawData.name,
      email: rawData.email,
      age: rawData.age,
      phone_number: rawData.phone_number,
      join_date: rawData.join_date,
      membership_type: rawData.membership_type,
      membership_status: calculatedStatus,
      expiry_date: rawData.expiry_date,
      plan_id: rawData.plan_id,
      plan_price: rawData.plans?.price ?? null,
      gym_id: rawData.gym_id,
      formatted_gym_id: rawData.gyms?.formatted_gym_id ?? null,
      gym_name: rawData.gyms?.name ?? null,
      payment_id: rawData.gyms?.payment_id ?? null,
      profile_url: rawData.profile_url ?? null,
    };

    return member;

  } catch (e: any) {
    console.error(`[getMemberProfile] Unexpected JavaScript error during member profile fetch (Email: "${normalizedEmail}", Member ID: "${normalizedMemberId}"): ${e?.message || e}`, e);
    return null;
  }
}

export async function getMemberCheckins(memberDisplayId: string): Promise<Checkin[]> {
  if (!supabase) {
    console.warn("[getMemberCheckins] Supabase client is not initialized. Cannot fetch real check-in data.");
    return [];
  }
  
  const memberIdUpper = memberDisplayId.toUpperCase();

  const { data: memberData, error: memberError } = await supabase
    .from('members')
    .select('id') 
    .ilike('member_id', memberIdUpper) 
    .single();

  if (memberError) {
    if (memberError.code !== 'PGRST116') {
      console.warn(`[getMemberCheckins] Error fetching member UUID for member_id ${memberIdUpper}:`, memberError.message);
    }
    return [];
  }
  if (!memberData) {
    return [];
  }

  const memberUUID = memberData.id;

  const { data: checkinsData, error: checkinsError } = await supabase
    .from('check_ins') 
    .select('*') 
    .eq('member_table_id', memberUUID) 
    .order('check_in_time', { ascending: false });

  if (checkinsError) {
    console.error('[getMemberCheckins] Error fetching check-ins from Supabase:', checkinsError.message);
    return [];
  }
  
  return (checkinsData as Checkin[]) || [];
}

export async function getGymAnnouncements(gymId: string): Promise<Announcement[]> {
  if (!supabase) {
    console.warn("[getGymAnnouncements] Supabase client is not initialized. Cannot fetch announcements.");
    return [];
  }
  if (!gymId) {
    console.warn("[getGymAnnouncements] No Gym ID provided. Cannot fetch announcements.");
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('announcements')
      .select('id, title, content, created_at')
      .eq('gym_id', gymId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(`[getGymAnnouncements] Error fetching announcements for gym ${gymId} from Supabase:`, error.message);
      return [];
    }
    return (data as Announcement[]) || [];
  } catch (e: any) {
    console.error(`[getGymAnnouncements] Unexpected JavaScript error during Supabase call for gym ${gymId}:`, e?.message || e);
    return [];
  }
}

export async function getAllMembershipPlans(gymId: string): Promise<MembershipPlan[]> {
  if (!supabase) {
    console.warn("[getAllMembershipPlans] Supabase client is not initialized. Cannot fetch membership plans.");
    return [];
  }
  if (!gymId) {
    console.warn("[getAllMembershipPlans] Gym ID is required to fetch membership plans for a specific gym.");
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('plans')
      .select('id, plan_name, price')
      .eq('is_active', true)
      .eq('gym_id', gymId);

    if (error) {
      console.error(`[getAllMembershipPlans] Error fetching membership plans for gym ${gymId} from Supabase:`, error.message);
      return [];
    }
    
    const plans = data?.map(item => ({
      id: item.id,
      plan: item.plan_name,
      price: item.price,
    }));
    return (plans as MembershipPlan[]) || [];
  } catch (e: any) {
    console.error(`[getAllMembershipPlans] Unexpected JavaScript error during Supabase call for gym ${gymId}:`, e?.message || e);
    return [];
  }
}

export async function getConversation(memberId: string, adminId: string): Promise<Message[]> {
  if (!supabase) {
    console.warn("[getConversation] Supabase client not initialized.");
    return [];
  }

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .or(
      `and(sender_id.eq.${memberId},receiver_id.eq.${adminId}),and(sender_id.eq.${adminId},receiver_id.eq.${memberId})`
    )
    .order('created_at', { ascending: true });

  if (error) {
    console.error("[getConversation] Error fetching conversation:", error.message);
    return [];
  }
  
  if (!data || data.length === 0) {
    console.log(`[getConversation] No conversation found for member ${memberId}. This could be due to RLS policies or no messages existing.`);
  }

  return (data as Message[]) || [];
}

interface CreateMessageParams {
  gymId: string;
  senderId: string;
  receiverId: string;
  senderType: 'admin' | 'member';
  receiverType: 'admin' | 'member';
  content: string;
  formattedGymId: string;
}

export async function createMessage(params: CreateMessageParams): Promise<{ success: boolean; data?: Message; error?: string }> {
  if (!supabase) {
    return { success: false, error: "Supabase client not initialized." };
  }

  const { data, error } = await supabase.from('messages').insert([
    {
      gym_id: params.gymId,
      sender_id: params.senderId,
      receiver_id: params.receiverId,
      sender_type: params.senderType,
      receiver_type: params.receiverType,
      content: params.content,
      formatted_gym_id: params.formattedGymId,
    },
  ]).select().single();

  if (error) {
    console.error('[createMessage] Supabase error:', error);
    return { success: false, error: 'There was a database error saving your message.' };
  }

  return { success: true, data: data as Message };
}

export async function updateMemberProfile(memberDisplayId: string, data: { name: string; phone_number?: string; age?: number }): Promise<{ success: boolean; error?: string }> {
    if (!supabase) {
        return { success: false, error: "Supabase client not initialized." };
    }

    const { name, phone_number, age } = data;
    
    const updateObject: { [key: string]: any } = {};
    if (name !== undefined) updateObject.name = name;
    if (phone_number !== undefined) updateObject.phone_number = phone_number || null;
    if (age !== undefined) updateObject.age = age || null;

    if (Object.keys(updateObject).length === 0) {
        return { success: false, error: "No data provided to update." };
    }
    
    const { error } = await supabase
        .from('members')
        .update(updateObject)
        .ilike('member_id', memberDisplayId);

    if (error) {
        console.error(`[updateMemberProfile] Supabase error updating profile for member ${memberDisplayId}:`, error);
        return { success: false, error: 'Database error while updating profile.' };
    }

    return { success: true };
}

export async function updateMemberEmail(memberDisplayId: string, newEmail: string): Promise<{ success: boolean; error?: string }> {
  if (!supabase) {
    return { success: false, error: "Supabase client not initialized." };
  }

  const { error } = await supabase
    .from('members')
    .update({ email: newEmail.toLowerCase() })
    .ilike('member_id', memberDisplayId);

  if (error) {
    console.error(`[updateMemberEmail] Supabase error updating email for member ${memberDisplayId}:`, error);
    return { success: false, error: 'Database error while updating email.' };
  }

  return { success: true };
}

export async function getGymSmtpConfig(gymId: string): Promise<SmtpConfig | null> {
  if (!supabase) {
    console.error("[getGymSmtpConfig] Supabase client is not initialized.");
    return null;
  }
  if (!gymId) {
    console.error("[getGymSmtpConfig] Gym ID is required.");
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('gyms')
      .select('app_email, app_pass, app_host, from_email, port')
      .eq('id', gymId)
      .single();

    if (error) {
      console.error(`[getGymSmtpConfig] Error fetching SMTP config for gym ${gymId}:`, error);
      return null;
    }

    if (!data.app_email || !data.app_pass || !data.app_host || !data.from_email || !data.port) {
        console.error(`[getGymSmtpConfig] Incomplete SMTP configuration for gym ${gymId}.`);
        return null;
    }

    const portNumber = parseInt(data.port, 10);

    return {
      host: data.app_host,
      port: portNumber,
      secure: portNumber === 465,
      auth: {
        user: data.app_email,
        pass: data.app_pass,
      },
      from: data.from_email,
    };

  } catch (e: any) {
    console.error(`[getGymSmtpConfig] Unexpected error for gym ${gymId}:`, e.message || e);
    return null;
  }
}

export async function createWorkout(workout: Workout): Promise<{ success: boolean; data?: Workout; error?: string }> {
  if (!supabase) {
    return { success: false, error: 'Database connection not available.' };
  }
  
  const { data, error } = await supabase
    .rpc('create_workout_with_exercises', {
      p_member_id: workout.member_id,
      p_date: workout.date,
      p_notes: workout.notes,
      p_exercises: workout.exercises,
    });

  if (error) {
    console.error('[createWorkout RPC] Error:', error);
    return { success: false, error: `Failed to save workout session: ${error.message}` };
  }

  return { success: true, data: data as Workout };
}

export async function updateProfilePicture(memberUUID: string, profileUrl: string): Promise<{ success: boolean; error?: string; }> {
  if (!supabase) {
    return { success: false, error: "Database connection not available." };
  }
  
  const { error } = await supabase
    .from('members')
    .update({ profile_url: profileUrl })
    .eq('id', memberUUID);

  if (error) {
    console.error(`[updateProfilePicture] Supabase error for member ${memberUUID}:`, error);
    return { success: false, error: 'Failed to update profile picture in the database.' };
  }

  return { success: true };
}
