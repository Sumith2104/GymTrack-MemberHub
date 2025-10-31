'use server';
import { PRE_BUILT_PLANS } from '@/lib/workout-plans';
import type { WorkoutPlanOutput } from '@/lib/workout-plans';

export type { WorkoutPlanOutput };

type ExperienceLevel = "Beginner" | "Intermediate" | "Advanced";

export async function getWorkoutPlan(experience: ExperienceLevel): Promise<WorkoutPlanOutput | null> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  if (PRE_BUILT_PLANS[experience]) {
    return PRE_BUILT_PLANS[experience];
  }
  
  return null;
}
