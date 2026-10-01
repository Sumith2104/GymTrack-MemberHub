-- ====================================================================
-- GymTrack MemberHub: Fluxbase Database Schema
-- Paste and execute this script inside the Fluxbase SQL Studio at:
-- https://fluxbasedb.me (or your project's SQL Console)
-- ====================================================================

-- 1. GYMS TABLE
CREATE TABLE IF NOT EXISTS public.gyms (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  formatted_gym_id VARCHAR(100) UNIQUE NOT NULL,
  payment_id VARCHAR(255),
  app_email VARCHAR(255),
  app_pass VARCHAR(255),
  app_host VARCHAR(255),
  from_email VARCHAR(255),
  port VARCHAR(10) DEFAULT '587',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT gyms_pkey PRIMARY KEY (id)
);

-- 2. PLANS TABLE
CREATE TABLE IF NOT EXISTS public.plans (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  gym_id UUID REFERENCES public.gyms(id) ON DELETE CASCADE,
  plan_name VARCHAR(255) NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT plans_pkey PRIMARY KEY (id)
);

-- 3. MEMBERS TABLE
CREATE TABLE IF NOT EXISTS public.members (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  member_id VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  age INTEGER,
  phone_number VARCHAR(50),
  join_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  membership_type VARCHAR(100),
  membership_status VARCHAR(50) DEFAULT 'Active',
  expiry_date TIMESTAMPTZ,
  plan_id UUID REFERENCES public.plans(id) ON DELETE SET NULL,
  gym_id UUID REFERENCES public.gyms(id) ON DELETE CASCADE,
  profile_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT members_pkey PRIMARY KEY (id)
);

-- Create fast lookup indexes for member authentication
CREATE INDEX IF NOT EXISTS idx_members_email ON public.members (email);
CREATE INDEX IF NOT EXISTS idx_members_member_id ON public.members (member_id);

-- 4. CHECK-INS TABLE
CREATE TABLE IF NOT EXISTS public.check_ins (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  member_table_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  check_in_time TIMESTAMPTZ NOT NULL DEFAULT now(),
  check_out_time TIMESTAMPTZ,
  CONSTRAINT check_ins_pkey PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_check_ins_member ON public.check_ins (member_table_id);

-- 5. ANNOUNCEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  gym_id UUID REFERENCES public.gyms(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT announcements_pkey PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_announcements_gym ON public.announcements (gym_id);

-- 6. MESSAGES TABLE (Real-time & Chat)
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  gym_id VARCHAR(100) NOT NULL,
  sender_id VARCHAR(100) NOT NULL,
  receiver_id VARCHAR(100) NOT NULL,
  sender_type VARCHAR(50) NOT NULL,
  receiver_type VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  formatted_gym_id VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  read_at TIMESTAMPTZ,
  CONSTRAINT messages_pkey PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages (sender_id, receiver_id);

-- 7. WORKOUTS TABLE
CREATE TABLE IF NOT EXISTS public.workouts (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  member_id VARCHAR(100) NOT NULL,
  date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT workouts_pkey PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_workouts_member ON public.workouts (member_id);

-- 8. WORKOUT EXERCISES TABLE
CREATE TABLE IF NOT EXISTS public.workout_exercises (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  workout_id UUID NOT NULL REFERENCES public.workouts(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  sets INTEGER NOT NULL,
  reps INTEGER NOT NULL,
  weight NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT workout_exercises_pkey PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_workout_exercises_workout ON public.workout_exercises (workout_id);

-- 9. BODY WEIGHT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.body_weight_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  member_id VARCHAR(100) NOT NULL,
  date DATE NOT NULL,
  weight NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT body_weight_logs_pkey PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_body_weight_logs_member ON public.body_weight_logs (member_id);
