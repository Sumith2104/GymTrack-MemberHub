'use server';
/**
 * @fileOverview A workout planning AI agent.
 *
 * - generateWorkoutPlan - A function that creates a workout plan based on user preferences.
 * - WorkoutPlanInput - The input type for the generateWorkoutPlan function.
 * - WorkoutPlanOutput - The return type for the generateWorkoutPlan function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const WorkoutPlanInputSchema = z.object({
  goals: z.array(z.string()).describe('The user\'s primary fitness goals (e.g., "Build Muscle", "Lose Fat", "Improve Endurance").'),
  experience: z.enum(['Beginner', 'Intermediate', 'Advanced']).describe('The user\'s fitness experience level.'),
  daysPerWeek: z.number().min(1).max(7).describe('The number of days per week the user can work out.'),
});
export type WorkoutPlanInput = z.infer<typeof WorkoutPlanInputSchema>;

const ExerciseSchema = z.object({
  name: z.string().describe('The name of the exercise.'),
  sets: z.string().describe('The number of sets to perform (e.g., "3-4").'),
  reps: z.string().describe('The number of repetitions per set (e.g., "8-12").'),
  rest: z.string().describe('The rest time between sets (e.g., "60-90 seconds").'),
});

const DailyWorkoutSchema = z.object({
  day: z.number().describe('The day of the week for this workout (e.g., 1 for Day 1).'),
  focus: z.string().describe('The main focus of the day\'s workout (e.g., "Full Body", "Upper Body", "Leg Day").'),
  exercises: z.array(ExerciseSchema).describe('A list of exercises for this day.'),
  notes: z.string().optional().describe('Any additional notes or tips for the day\'s workout.'),
});

const WorkoutPlanOutputSchema = z.object({
  title: z.string().describe('A catchy and descriptive title for the generated workout plan.'),
  summary: z.string().describe('A brief summary of the workout plan, its focus, and who it is for.'),
  weeklySchedule: z.array(DailyWorkoutSchema).describe('The detailed workout schedule for the week.'),
});
export type WorkoutPlanOutput = z.infer<typeof WorkoutPlanOutputSchema>;

export async function generateWorkoutPlan(input: WorkoutPlanInput): Promise<WorkoutPlanOutput> {
  return workoutPlannerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'workoutPlannerPrompt',
  input: { schema: WorkoutPlanInputSchema },
  output: { schema: WorkoutPlanOutputSchema },
  model: 'googleai/gemini-1.5-flash-latest',
  prompt: `You are an expert fitness coach. Your task is to create a personalized workout plan based on the user's goals, experience level, and available time.

Generate a structured workout plan for a user with the following profile:
- Fitness Goals: {{{goals}}}
- Experience Level: {{{experience}}}
- Days per week: {{{daysPerWeek}}}

Instructions:
1.  Create a clear, actionable, and safe workout plan.
2.  The plan should be for one full week.
3.  Choose exercises that are appropriate for the user's experience level.
4.  For each day, provide a list of exercises with the recommended number of sets, reps, and rest time.
5.  Group the workout days logically (e.g., Push/Pull/Legs, Upper/Lower, or Full Body splits).
6.  Provide a title and a short summary for the plan.
7.  If you have any important tips, like suggesting warm-ups or cool-downs, add them to the 'notes' for the first day.
8.  Ensure the output strictly follows the provided JSON schema.
`,
});

const workoutPlannerFlow = ai.defineFlow(
  {
    name: 'workoutPlannerFlow',
    inputSchema: WorkoutPlanInputSchema,
    outputSchema: WorkoutPlanOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
