'use server';

import type { Member, Checkin, Announcement, MembershipPlan, Message, SmtpConfig, Workout, WorkoutExercise, BodyWeightLog, PersonalRecord } from './types';
import { differenceInDays, parseISO, startOfDay } from 'date-fns';
import { flux } from '@/lib/flux/client';
import { getISTTimestamp } from '@/lib/utils';

export async function getMemberProfile(email: string, memberDisplayId: string): Promise<Member | null> {
  const normalizedEmail = email.toLowerCase().replace(/'/g, "''");
  const normalizedMemberId = memberDisplayId.toUpperCase().replace(/'/g, "''");

  try {
    const query = `
      SELECT 
        m.id,
        m.member_id,
        m.name,
        m.email,
        m.age,
        m.phone_number,
        m.join_date,
        m.membership_type,
        m.membership_status,
        m.expiry_date,
        m.plan_id,
        m.gym_id,
        m.profile_url,
        p.price as plan_price,
        g.name as gym_name,
        g.formatted_gym_id,
        g.payment_id
      FROM members m
      LEFT JOIN plans p ON m.plan_id = p.id
      LEFT JOIN gyms g ON m.gym_id = g.id
      WHERE m.email = '${normalizedEmail}'
      AND m.member_id = '${normalizedMemberId}'
    `;

    const result = await flux.sql(query);

    if (!result.rows || result.rows.length === 0) {
      console.log(`[getMemberProfile] No member found for Email: "${email}", Member ID: "${memberDisplayId}".`);
      return null;
    }

    const rawData = result.rows[0];

    // Calculate status dynamically based on expiry date
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
      plan_price: rawData.plan_price ?? null,
      plan_id: rawData.plan_id,
      gym_id: rawData.gym_id,
      formatted_gym_id: rawData.formatted_gym_id ?? null,
      gym_name: rawData.gym_name ?? null,
      payment_id: rawData.payment_id ?? null,
      profile_url: rawData.profile_url ?? null,
    };

    return member;

  } catch (e: any) {
    console.error(`[getMemberProfile] Unexpected error: ${e?.message || e}`);
    return null;
  }
}

export async function getMemberCheckins(memberDisplayId: string): Promise<Checkin[]> {
  const normalizedMemberId = memberDisplayId.toUpperCase().replace(/'/g, "''");
  const query = `
    SELECT 
      c.id, 
      c.member_table_id, 
      c.check_in_time, 
      c.check_out_time 
    FROM check_ins c
    JOIN members m ON c.member_table_id = m.id
    WHERE m.member_id = '${normalizedMemberId}'
    ORDER BY c.check_in_time DESC
  `;

  try {
    const result = await flux.sql(query);
    if (!result.rows) return [];

    return result.rows.map((c: any) => ({
      id: c.id,
      member_table_id: c.member_table_id,
      check_in_time: c.check_in_time,
      check_out_time: c.check_out_time,
    }));
  } catch (error: any) {
    console.error('[getMemberCheckins] Error fetching check-ins:', error.message);
    return [];
  }
}

export async function getGymAnnouncements(gymId: string): Promise<Announcement[]> {
  if (!gymId) return [];
  const safeGymId = gymId.replace(/'/g, "''");

  const query = `
    SELECT id, title, content, created_at
    FROM announcements
    WHERE gym_id = '${safeGymId}'
    ORDER BY created_at DESC
  `;
  try {
    const result = await flux.sql(query);
    return (result.rows as Announcement[]) || [];
  } catch (error: any) {
    console.error(`[getGymAnnouncements] Error fetching announcements for gym ${gymId}:`, error.message);
    return [];
  }
}

export async function getAllMembershipPlans(gymId: string): Promise<MembershipPlan[]> {
  if (!gymId) return [];
  const safeGymId = gymId.replace(/'/g, "''");

  const query = `
    SELECT id, plan_name, price
    FROM plans
    WHERE is_active = true AND gym_id = '${safeGymId}'
  `;
  try {
    const result = await flux.sql(query);
    if (!result.rows) return [];

    return result.rows.map((item: any) => ({
      id: item.id,
      plan: item.plan_name,
      price: item.price,
    }));
  } catch (error: any) {
    console.error(`[getAllMembershipPlans] Error fetching membership plans:`, error.message);
    return [];
  }
}

export async function getConversation(memberId: string, adminId: string): Promise<Message[]> {
  const safeMemberId = memberId.replace(/'/g, "''");
  const safeAdminId = adminId.replace(/'/g, "''");

  const query = `
    SELECT * FROM messages
    WHERE (sender_id = '${safeMemberId}' AND receiver_id = '${safeAdminId}')
       OR (sender_id = '${safeAdminId}' AND receiver_id = '${safeMemberId}')
    ORDER BY created_at ASC
  `;

  try {
    const result = await flux.sql(query);
    return (result.rows as Message[]) || [];
  } catch (error: any) {
    console.error("[getConversation] Error fetching conversation:", error.message);
    return [];
  }
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
  try {
    const newMessageId = crypto.randomUUID();
    const createdAt = getISTTimestamp();


    const query = `
      INSERT INTO messages (id, gym_id, sender_id, receiver_id, sender_type, receiver_type, content, formatted_gym_id, created_at)
      VALUES (
        '${newMessageId}',
        '${params.gymId.replace(/'/g, "''")}',
        '${params.senderId.replace(/'/g, "''")}',
        '${params.receiverId.replace(/'/g, "''")}',
        '${params.senderType}',
        '${params.receiverType}',
        '${params.content.replace(/'/g, "''")}',
        '${params.formattedGymId.replace(/'/g, "''")}',
        '${createdAt}'
      )
    `;
    await flux.sql(query);

    // Construct and return the message object since we know all its properties
    const insertedMessage: Message = {
      id: newMessageId,
      gym_id: params.gymId,
      sender_id: params.senderId,
      receiver_id: params.receiverId,
      sender_type: params.senderType,
      receiver_type: params.receiverType,
      content: params.content,
      formatted_gym_id: params.formattedGymId,
      created_at: createdAt,
      read_at: null
    };

    return { success: true, data: insertedMessage };
  } catch (error: any) {
    console.error('[createMessage] Error:', error.message);
    return { success: false, error: 'There was a database error saving your message.' };
  }
}

export async function updateMemberProfile(memberDisplayId: string, data: { name: string; phone_number?: string; age?: number }): Promise<{ success: boolean; error?: string }> {
  const { name, phone_number, age } = data;
  const updates: string[] = [];

  if (name !== undefined) updates.push(`name = '${name.replace(/'/g, "''")}'`);
  if (phone_number !== undefined) updates.push(`phone_number = '${phone_number?.replace(/'/g, "''") || ''}'`);
  if (age !== undefined) updates.push(`age = ${age || 'NULL'}`);

  if (updates.length === 0) return { success: false, error: "No data provided to update." };

  const query = `
    UPDATE members
    SET ${updates.join(', ')}
    WHERE member_id = '${memberDisplayId.toUpperCase().replace(/'/g, "''")}'
  `;

  try {
    await flux.sql(query);
    return { success: true };
  } catch (error: any) {
    console.error(`[updateMemberProfile] Error:`, error.message);
    return { success: false, error: 'Database error while updating profile.' };
  }
}

export async function updateMemberEmail(memberDisplayId: string, newEmail: string): Promise<{ success: boolean; error?: string }> {
  try {
    const query = `
      UPDATE members
      SET email = '${newEmail.toLowerCase().replace(/'/g, "''")}'
      WHERE member_id = '${memberDisplayId.toUpperCase().replace(/'/g, "''")}'
    `;
    await flux.sql(query);
    return { success: true };
  } catch (error: any) {
    console.error(`[updateMemberEmail] Error:`, error.message);
    return { success: false, error: 'Database error while updating email.' };
  }
}

export async function updateProfilePictureUrl(memberUUID: string, profileUrl: string): Promise<{ success: boolean; error?: string; }> {
  try {
    const query = `
      UPDATE members
      SET profile_url = '${profileUrl.replace(/'/g, "''")}'
      WHERE id = '${memberUUID.replace(/'/g, "''")}'
    `;
    await flux.sql(query);
    return { success: true };
  } catch (error: any) {
    console.error(`[updateProfilePictureUrl] Error:`, error.message);
    return { success: false, error: 'Failed to save picture URL to profile.' };
  }
}


export async function getGymSmtpConfig(gymId: string): Promise<SmtpConfig | null> {
  if (!gymId) return null;
  const safeGymId = gymId.replace(/'/g, "''");

  const query = `
    SELECT app_email, app_pass, app_host, from_email, port
    FROM gyms
    WHERE id = '${safeGymId}'
  `;

  try {
    const result = await flux.sql(query);
    if (!result.rows || result.rows.length === 0) return null;

    const data = result.rows[0];

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
    console.error(`[getGymSmtpConfig] Unexpected error:`, e.message || e);
    return null;
  }
}

export async function createWorkout(workoutData: Omit<Workout, 'id' | 'created_at' | 'exercises'> & { exercises: Omit<WorkoutExercise, 'id' | 'workout_id' | 'created_at'>[], member_id: string }): Promise<{ success: boolean; data?: Workout; error?: string }> {
  try {
    // Step 1: Insert the main workout record
    const queryWorkout = `
      INSERT INTO workouts (member_id, date, notes)
      VALUES ('${workoutData.member_id.replace(/'/g, "''")}', '${workoutData.date.replace(/'/g, "''")}', '${workoutData.notes?.replace(/'/g, "''") || ''}')
      RETURNING *
    `;
    const workoutRes = await flux.sql(queryWorkout);
    console.log("Workout Query Response:", workoutRes); // DEBUG LOG
    if (!workoutRes.rows || workoutRes.rows.length === 0) throw new Error("Workout insert failed");
    const newWorkout = workoutRes.rows[0];

    // Step 2: Prepare and insert the associated exercises
    if (workoutData.exercises && workoutData.exercises.length > 0) {
      const values = workoutData.exercises.map((ex: any) => `('${newWorkout.id}', '${ex.name.replace(/'/g, "''")}', ${ex.sets}, ${ex.reps}, ${ex.weight})`).join(', ');
      const queryExercises = `
        INSERT INTO workout_exercises (workout_id, name, sets, reps, weight)
        VALUES ${values}
        RETURNING *
      `;
      const exercisesRes = await flux.sql(queryExercises);
      return { success: true, data: { ...newWorkout, exercises: exercisesRes.rows as WorkoutExercise[] } };
    }

    return { success: true, data: { ...newWorkout, exercises: [] } };
  } catch (error: any) {
    console.error('[createWorkout] Error:', error.message);
    return { success: false, error: 'Database error while saving workout.' };
  }
}


export async function updateProfilePicture(memberUUID: string, profileUrl: string): Promise<{ success: boolean; error?: string; }> {
  try {
    const query = `
      UPDATE members
      SET profile_url = '${profileUrl.replace(/'/g, "''")}'
      WHERE id = '${memberUUID.replace(/'/g, "''")}'
    `;
    await flux.sql(query);
    return { success: true };
  } catch (error: any) {
    console.error(`[updateProfilePicture] Error:`, error.message);
    return { success: false, error: 'Failed to update profile picture in the database.' };
  }
}


export async function getMemberWorkouts(memberId: string): Promise<Workout[]> {
  const query = `
    SELECT 
      w.id as workout_id, w.member_id, w.date, w.notes, w.created_at as workout_created_at,
      e.id as exercise_id, e.name, e.sets, e.reps, e.weight, e.created_at as exercise_created_at
    FROM workouts w
    LEFT JOIN workout_exercises e ON w.id = e.workout_id
    WHERE w.member_id = '${memberId.replace(/'/g, "''")}'
    ORDER BY w.date DESC, e.created_at ASC
  `;

  try {
    const result = await flux.sql(query);
    if (!result.rows) return [];

    const workoutsMap = new Map<string, Workout>();

    for (const row of result.rows) {
      if (!workoutsMap.has(row.workout_id)) {
        workoutsMap.set(row.workout_id, {
          id: row.workout_id,
          member_id: row.member_id,
          date: row.date,
          notes: row.notes,
          created_at: row.workout_created_at,
          exercises: []
        });
      }

      if (row.exercise_id) {
        workoutsMap.get(row.workout_id)!.exercises.push({
          id: row.exercise_id,
          workout_id: row.workout_id,
          name: row.name,
          sets: row.sets,
          reps: row.reps,
          weight: row.weight,
          created_at: row.exercise_created_at
        });
      }
    }

    return Array.from(workoutsMap.values());
  } catch (error: any) {
    console.error('[getMemberWorkouts] Error fetching workouts:', error.message);
    return [];
  }
}


export async function getMemberBodyWeightLogs(memberId: string): Promise<BodyWeightLog[]> {
  const query = `
    SELECT * FROM body_weight_logs
    WHERE member_id = '${memberId.replace(/'/g, "''")}'
    ORDER BY date DESC
  `;

  try {
    const result = await flux.sql(query);
    return (result.rows as BodyWeightLog[]) || [];
  } catch (error: any) {
    console.error('[getMemberBodyWeightLogs] Error fetching body weight logs:', error.message);
    return [];
  }
}

export async function logBodyWeight(memberId: string, weight: number, date: string): Promise<{ success: boolean; data?: BodyWeightLog; error?: string }> {
  try {
    const query = `
      INSERT INTO body_weight_logs (member_id, weight, date)
      VALUES ('${memberId.replace(/'/g, "''")}', ${weight}, '${date.replace(/'/g, "''")}')
      RETURNING *
    `;
    const result = await flux.sql(query);
    if (!result.rows || result.rows.length === 0) throw new Error("Insert failed");
    return { success: true, data: result.rows[0] as BodyWeightLog };
  } catch (error: any) {
    console.error('[logBodyWeight] Error:', error.message);
    return { success: false, error: 'Database error while saving body weight.' };
  }
}


// Epley formula for 1-rep max estimation
const calculateEpley1RM = (weight: number, reps: number): number => {
  if (reps === 1) return weight;
  return weight * (1 + reps / 30);
};

export async function calculatePersonalRecords(workouts: Workout[]): Promise<PersonalRecord[]> {
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

export async function calculateWorkoutStreak(checkins: Checkin[]): Promise<number> {
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
    const previousDay = sortedCheckinDates[i + 1];

    if (differenceInDays(currentDay, previousDay) === 1) {
      currentStreak++;
    } else {
      break;
    }
  }

  return currentStreak;
}
