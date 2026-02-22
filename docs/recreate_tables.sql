-- SQL script to drop and recreate workout and weight logging tables.
-- Run this in your Supabase SQL editor to reset the tables.

-- Drop existing tables if they exist to ensure a clean slate.
-- The "CASCADE" option will also remove any dependent objects like foreign key constraints.
DROP TABLE IF EXISTS public.workout_exercises;
DROP TABLE IF EXISTS public.workouts;
DROP TABLE IF EXISTS public.body_weight_logs;

-- Recreate the "workouts" table to store each workout session.
CREATE TABLE public.workouts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL,
  date date NOT NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT workouts_pkey PRIMARY KEY (id),
  CONSTRAINT workouts_member_id_fkey FOREIGN KEY (member_id) REFERENCES public.members(id) ON DELETE CASCADE
);

-- Recreate the "workout_exercises" table to store individual exercises for each workout.
CREATE TABLE public.workout_exercises (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  workout_id uuid NOT NULL,
  name text NOT NULL,
  sets integer NOT NULL,
  reps integer NOT NULL,
  weight numeric NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT workout_exercises_pkey PRIMARY KEY (id),
  CONSTRAINT workout_exercises_workout_id_fkey FOREIGN KEY (workout_id) REFERENCES public.workouts(id) ON DELETE CASCADE
);

-- Recreate the "body_weight_logs" table to store a history of weight entries.
CREATE TABLE public.body_weight_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL,
  date date NOT NULL,
  weight numeric NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT body_weight_logs_pkey PRIMARY KEY (id),
  CONSTRAINT body_weight_logs_member_id_fkey FOREIGN KEY (member_id) REFERENCES public.members(id) ON DELETE CASCADE
);

-- Add comments to explain the purpose of each table for future reference.
COMMENT ON TABLE public.workouts IS 'Stores individual workout sessions for members.';
COMMENT ON TABLE public.workout_exercises IS 'Stores the specific exercises performed in each workout session.';
COMMENT ON TABLE public.body_weight_logs IS 'Stores a chronological log of a member''s body weight.';
