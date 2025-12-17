
import type { Member, Checkin, Announcement, MembershipPlan, Message, SmtpConfig, Workout, WorkoutExercise, BodyWeightLog, PersonalRecord } from './types';
import { createClient } from '@supabase/supabase-js';
import { differenceInDays, parseISO, startOfDay } from 'date-fns';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabase: ReturnType<typeof createClient> | null = null;
if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  console.error("Supabase URL or Anon Key is missing.");
}

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

  const { data: memberData, error: memberError } = await supabase
    .from('members')
    .select('id')
    .ilike('member_id', memberDisplayId)
    .single();

  if (memberError || !memberData) {
    console.error(`[getMemberCheckins] Error fetching member UUID for member_id ${memberDisplayId}:`, memberError?.message);
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
  
  const checkins = (checkinsData || []).map(c => ({
    id: c.id,
    member_table_id: c.member_table_id,
    check_in_time: c.check_in_time,
    check_out_time: c.check_out_time,
  }));

  return checkins as Checkin[];
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

export async function updateProfilePictureUrl(memberUUID: string, profileUrl: string): Promise<{ success: boolean; error?: string; }> {
  if (!supabase) {
    return { success: false, error: "Database connection not available." };
  }
  
  const { error } = await supabase
    .from('members')
    .update({ profile_url: profileUrl })
    .eq('id', memberUUID);

  if (error) {
    console.error(`[updateProfilePictureUrl] Supabase error for member ${memberUUID}:`, error);
    return { success: false, error: 'Failed to save picture URL to profile.' };
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

export async function createWorkout(workoutData: Omit<Workout, 'id' | 'created_at' | 'exercises'> & { exercises: Omit<WorkoutExercise, 'id' | 'workout_id' | 'created_at'>[], member_id: string }): Promise<{ success: boolean; data?: Workout; error?: string }> {
    if (!supabase) {
        return { success: false, error: 'Database connection not available.' };
    }

    // Step 1: Insert the main workout record
    const { data: newWorkout, error: workoutError } = await supabase
        .from('workouts')
        .insert({
            member_id: workoutData.member_id,
            date: workoutData.date,
            notes: workoutData.notes,
        })
        .select()
        .single();

    if (workoutError) {
        console.error('[createWorkout] Error creating workout entry:', workoutError);
        return { success: false, error: `Failed to save workout session: ${workoutError.message}` };
    }

    // Step 2: Prepare and insert the associated exercises
    const exercisesToInsert = workoutData.exercises.map(ex => ({
        ...ex,
        workout_id: newWorkout.id, // Use the ID from the newly created workout
    }));

    const { data: insertedExercises, error: exercisesError } = await supabase
        .from('workout_exercises')
        .insert(exercisesToInsert)
        .select();

    if (exercisesError) {
        console.error('[createWorkout] Error creating exercises:', exercisesError);
        // Optional: Attempt to delete the orphaned workout record for cleanup
        await supabase.from('workouts').delete().eq('id', newWorkout.id);
        return { success: false, error: `Failed to save exercises for the workout: ${exercisesError.message}` };
    }

    // Step 3: Return the complete workout object
    const completeWorkout: Workout = {
        ...newWorkout,
        exercises: insertedExercises as WorkoutExercise[],
    };

    return { success: true, data: completeWorkout };
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


export async function getMemberWorkouts(memberId: string): Promise<Workout[]> {
  if (!supabase) return [];
  const { data: workouts, error: workoutsError } = await supabase
    .from('workouts')
    .select('*, workout_exercises(*)')
    .eq('member_id', memberId)
    .order('date', { ascending: false });

  if (workoutsError) {
    console.error('[getMemberWorkouts] Error fetching workouts:', workoutsError);
    return [];
  }
  
  // The 'workout_exercises' are returned as a nested array.
  // We need to map them to the 'exercises' property of the Workout type.
  return workouts.map(w => ({
    id: w.id,
    member_id: w.member_id,
    date: w.date,
    notes: w.notes,
    created_at: w.created_at,
    exercises: w.workout_exercises.map((ex: any) => ({
      id: ex.id,
      workout_id: ex.workout_id,
      name: ex.name,
      sets: ex.sets,
      reps: ex.reps,
      weight: ex.weight,
      created_at: ex.created_at,
    })),
  })) as Workout[];
}


export async function getMemberBodyWeightLogs(memberId: string): Promise<BodyWeightLog[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('body_weight_logs')
    .select('*')
    .eq('member_id', memberId)
    .order('date', { ascending: false });
  
  if (error) {
    console.error('[getMemberBodyWeightLogs] Error fetching body weight logs:', error);
    return [];
  }
  return data || [];
}

export async function logBodyWeight(memberId: string, weight: number, date: string): Promise<{ success: boolean; data?: BodyWeightLog; error?: string }> {
  if (!supabase) {
    const errorMessage = 'Server is not configured for database operations.';
    console.error(`[logBodyWeight] ${errorMessage}`);
    return { success: false, error: errorMessage };
  }

  const { data, error } = await supabase
    .from('body_weight_logs')
    .insert({
      member_id: memberId,
      weight: weight,
      date: date,
    })
    .select()
    .single();

  if (error) {
    console.error('[logBodyWeight] Supabase error:', error);
    return { success: false, error: `Database error: ${error.message}` };
  }

  return { success: true, data: data as BodyWeightLog };
}


// Epley formula for 1-rep max estimation
const calculateEpley1RM = (weight: number, reps: number): number => {
    if (reps === 1) return weight;
    return weight * (1 + reps / 30);
};

export function calculatePersonalRecords(workouts: Workout[]): PersonalRecord[] {
    if (!workouts || workouts.length === 0) return [];

    const records: { [key: string]: PersonalRecord } = {};

    workouts.forEach(workout => {
        workout.exercises.forEach(exercise => {
            if (exercise.weight <= 0) return;

            const estimated1RM = calculateEpley1RM(exercise.weight, exercise.reps);

            const existingRecord = records[exercise.name.toLowerCase()];

            if (!existingRecord || estimated1RM > existingRecord.estimatedOneRepMax) {
                records[exercise.name.toLowerCase()] = {
                    exercise: exercise.name,
                    maxWeight: exercise.weight,
                    estimatedOneRepMax: estimated1RM,
                    date: workout.date,
                };
            }
        });
    });

    const sortedRecords = Object.values(records).sort((a, b) => {
        if (a.exercise < b.exercise) return -1;
        if (a.exercise > b.exercise) return 1;
        return 0;
    });

    return sortedRecords;
}

export function calculateWorkoutStreak(checkins: Checkin[]): number {
  if (checkins.length === 0) return 0;

  const sortedCheckinDates = checkins
    .map(c => startOfDay(parseISO(c.check_in_time)))
    .filter((date, index, self) => 
        index === self.findIndex(d => d.getTime() === date.getTime())
    )
    .sort((a, b) => b.getTime() - a.getTime());

  if (sortedCheckinDates.length === 0) return 0;
  
  const today = startOfDay(new Date());
  const yesterday = startOfDay(new Date());
  yesterday.setDate(yesterday.getDate() - 1);
  
  const mostRecentCheckin = sortedCheckinDates[0];

  if (mostRecentCheckin.getTime() !== today.getTime() && mostRecentCheckin.getTime() !== yesterday.getTime()) {
    return 0;
  }
  
  let currentStreak = 0;
  if (mostRecentCheckin.getTime() === today.getTime() || mostRecentCheckin.getTime() === yesterday.getTime()) {
    currentStreak = 1;
  } else {
    return 0;
  }
  
  for (let i = 0; i < sortedCheckinDates.length - 1; i++) {
    const currentDay = sortedCheckinDates[i];
    const previousDay = sortedCheckinDates[i+1];
    
    if (differenceInDays(currentDay, previousDay) === 1) {
      currentStreak++;
    } else {
      break;
    }
  }
  
  return currentStreak;
}
