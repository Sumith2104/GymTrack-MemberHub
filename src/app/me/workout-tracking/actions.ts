
'use server';

import { z } from 'zod';
import { createWorkout } from '@/lib/data';
import type { Workout } from '@/lib/types';
import { revalidatePath } from 'next/cache';

const exerciseSchema = z.object({
  name: z.string().min(1, 'Exercise name is required.'),
  sets: z.coerce.number().int().positive('Sets must be a positive number.'),
  reps: z.coerce.number().int().positive('Reps must be a positive number.'),
  weight: z.coerce.number().min(0, 'Weight cannot be negative.'),
});

const workoutSchema = z.object({
  memberId: z.string().uuid('Invalid member ID.'),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date.'),
  notes: z.string().optional(),
  exercises: z.array(exerciseSchema).min(1, 'At least one exercise is required.'),
});

export interface LogWorkoutState {
  success: boolean;
  message: string;
  errors?: Partial<Record<string, string | string[]>>;
}

export async function logWorkoutAction(
  currentState: LogWorkoutState,
  formData: FormData
): Promise<LogWorkoutState> {
  const memberId = formData.get('memberId') as string;
  const date = formData.get('date') as string;
  const notes = formData.get('notes') as string;
  
  const exercises: any[] = [];
  let exerciseIndex = 0;
  while (formData.get(`exercises[${exerciseIndex}].name`)) {
    exercises.push({
      name: formData.get(`exercises[${exerciseIndex}].name`),
      sets: formData.get(`exercises-sets-${exerciseIndex}`),
      reps: formData.get(`exercises-reps-${exerciseIndex}`),
      weight: formData.get(`exercises-weight-${exerciseIndex}`),
    });
    exerciseIndex++;
  }

  const validation = workoutSchema.safeParse({
    memberId,
    date,
    notes,
    exercises,
  });

  if (!validation.success) {
    const fieldErrors = validation.error.flatten().fieldErrors;
    console.log("Validation Errors:", fieldErrors);
    return {
      success: false,
      message: 'Validation failed. Please check your inputs.',
      errors: {
        ...fieldErrors,
        exercises: (fieldErrors.exercises as string[]) || 'Error with exercise inputs.'
      },
    };
  }

  try {
    const newWorkout: Workout = {
      member_id: validation.data.memberId,
      date: new Date(validation.data.date).toISOString(),
      notes: validation.data.notes || null,
      exercises: validation.data.exercises,
    };

    const result = await createWorkout(newWorkout);

    if (!result.success) {
      return { success: false, message: result.error || 'Failed to save workout.' };
    }

    revalidatePath('/me/workout-tracking');
    return { success: true, message: 'Workout logged successfully!' };
  } catch (error) {
    console.error('[logWorkoutAction] Error:', error);
    return { success: false, message: 'An unexpected server error occurred.' };
  }
}

