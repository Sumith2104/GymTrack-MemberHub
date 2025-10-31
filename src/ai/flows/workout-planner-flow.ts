'use server';
import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// ------------------ Schemas ------------------
const WorkoutPlanInputSchema = z.object({
  goals: z.array(z.string()).describe('User’s primary fitness goals (e.g., "Build Muscle", "Lose Fat").'),
  experience: z.enum(['Beginner', 'Intermediate', 'Advanced']).describe('User’s fitness experience level.'),
  daysPerWeek: z.number().min(1).max(7).describe('Number of workout days per week.'),
});
export type WorkoutPlanInput = z.infer<typeof WorkoutPlanInputSchema>;

const ExerciseSchema = z.object({
  name: z.string(),
  sets: z.string(),
  reps: z.string(),
  rest: z.string(),
});

const DailyWorkoutSchema = z.object({
  day: z.number(),
  focus: z.string(),
  exercises: z.array(ExerciseSchema),
  notes: z.string().optional(),
});

const WorkoutPlanOutputSchema = z.object({
  title: z.string(),
  summary: z.string(),
  weeklySchedule: z.array(DailyWorkoutSchema),
});
export type WorkoutPlanOutput = z.infer<typeof WorkoutPlanOutputSchema>;

// ------------------ Strong Prompt Definition ------------------
const prompt = ai.definePrompt({
  name: 'workoutPlannerPrompt',
  input: { schema: WorkoutPlanInputSchema },
  output: { schema: WorkoutPlanOutputSchema },
  model: 'googleai/gemini-1.5-flash', // ✅ works with v1, not v1beta
  prompt: `
You are a **certified strength and conditioning coach**. Your job is to create a **personalized, effective, and safe 1-week workout plan** for the following user:

🏋️‍♂️ **User Profile**
- Fitness Goals: {{{goals}}}
- Experience Level: {{{experience}}}
- Days Available per Week: {{{daysPerWeek}}}

🧠 **Guidelines**
1. The plan must match the user's experience level and goals.
2. Each day must have a clear **focus** (e.g., Upper Body, Lower Body, Push, Pull, Full Body, Core, Cardio).
3. Include **3–6 exercises** per day, each with:
   - Name
   - Sets
   - Reps
   - Rest
4. For beginners: use simpler compound and bodyweight movements.
5. For advanced users: include progressive overload and variation.
6. Add warm-up or recovery notes where helpful.
7. The final response must strictly follow the JSON schema:
   \`WorkoutPlanOutputSchema\` → { title, summary, weeklySchedule }

🎯 **Output Goal**
Return a **structured, motivational, and realistic workout plan** that could be followed immediately by the user, formatted as JSON only.
`,
});

// ------------------ Flow ------------------
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

// ------------------ Exported Function ------------------
export async function generateWorkoutPlan(input: WorkoutPlanInput): Promise<WorkoutPlanOutput> {
  return workoutPlannerFlow(input);
}
