import { z } from 'zod';

export type Member = {
  id: string; // Internal UUID
  member_id: string; // User-facing Member ID
  name: string;
  email: string;
  age: number | null;
  phone_number: string | null;
  join_date: string; // ISO date string
  membership_type: string; // Name of the current plan, e.g. "Premium"
  membership_status: string; // e.g., 'active', 'expired', 'expiring_soon'
  expiry_date: string | null; // ISO date string
  plan_price: number | null; // Price for the member's current plan
  plan_id: string | null; // UUID of the current plan from the 'plans' table
  gym_id: string | null; // UUID of the gym from the 'gyms' table
  formatted_gym_id: string | null; // User-facing Gym ID
  gym_name?: string | null;
  payment_id?: string | null;
  profile_url?: string | null;
};

export type Checkin = {
  id: string; // uuid
  member_table_id: string; // uuid (foreign key to members.id)
  check_in_time: string; // timestamptz (ISO string)
  check_out_time: string | null; // timestamptz (ISO string) or null
  created_at: string; // timestamptz (ISO string)
};

export type Announcement = {
  id: string; // uuid
  title: string; // text
  content: string; // text
  created_at: string; // timestamptz (ISO string)
};

export type MembershipPlan = {
  id: string; // UUID from 'plans' table
  plan: string; // This will hold the plan_name from the database
  price: number;
};

export type Message = {
  id: string;
  gym_id: string;
  sender_id: string;
  receiver_id: string;
  sender_type: 'admin' | 'member';
  receiver_type: 'admin' | 'member';
  content: string;
  created_at: string;
  read_at: string | null;
  formatted_gym_id: string | null;
};

export type SmtpConfig = {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: string;
};

export type WorkoutExercise = {
    id: string; // uuid
    workout_id?: string; // FK to workouts.id
    name: string;
    sets: number;
    reps: number;
    weight: number;
    created_at?: string;
};

export type Workout = {
    id: string; // uuid
    member_id: string; // FK to members.id
    date: string; // date
    notes: string | null;
    created_at: string;
    exercises: WorkoutExercise[];
};

export type BodyWeightLog = {
    id: string; // uuid
    member_id: string; // FK to members.id
    date: string; // date
    weight: number;
    created_at: string;
};

export type PersonalRecord = {
    exercise: string;
    maxWeight: number;
    estimatedOneRepMax: number;
    date: string;
}

export const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

export type ChatMessage = z.infer<typeof ChatMessageSchema>;