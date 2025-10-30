
'use server';

/**
 * @fileOverview An AI flow for analyzing a user's workout form from an image.
 * 
 * - analyzeWorkoutForm - A function that analyzes the form.
 * - AnalyzeWorkoutFormInput - The input type for the analysis function.
 * - AnalyzeWorkoutFormOutput - The return type for the analysis function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AnalyzeWorkoutFormInputSchema = z.object({
  exercise: z.enum(['push-up', 'plank', 'dips']).describe('The name of the exercise being performed.'),
  photoDataUri: z.string().describe("A photo of the user performing the exercise, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type AnalyzeWorkoutFormInput = z.infer<typeof AnalyzeWorkoutFormInputSchema>;

const AnalyzeWorkoutFormOutputSchema = z.object({
  isCorrect: z.boolean().describe('A boolean indicating if the overall form is correct.'),
  feedback: z.string().describe('A concise, encouraging, one-sentence summary of the user\'s form.'),
  tips: z.array(z.string()).describe('A list of 2-3 specific, actionable tips for improvement. If the form is perfect, the tips should be about maintaining consistency or advancing the exercise.'),
});
export type AnalyzeWorkoutFormOutput = z.infer<typeof AnalyzeWorkoutFormOutputSchema>;

const systemPrompt = `You are an expert AI personal trainer. Your task is to analyze an image of a user performing an exercise and provide immediate, clear, and encouraging feedback on their form.

You will be given the name of the exercise and an image.

Based on the image, you must determine if the user's form is correct.
- If the form is good, provide positive reinforcement.
- If the form is incorrect, gently point out the main issue and provide simple, actionable tips to fix it.

Your response must be in the structured JSON format.`;

const prompt = ai.definePrompt({
  name: 'analyzeWorkoutFormPrompt',
  input: { schema: AnalyzeWorkoutFormInputSchema },
  output: { schema: AnalyzeWorkoutFormOutputSchema },
  prompt: `${systemPrompt}

Exercise to analyze: {{{exercise}}}
User's photo: {{media url=photoDataUri}}

Analyze the photo and provide feedback now.`,
});

export async function analyzeWorkoutForm(input: AnalyzeWorkoutFormInput): Promise<AnalyzeWorkoutFormOutput> {
  const { output } = await prompt(input);
  if (!output) {
    throw new Error("The AI model did not return a valid response.");
  }
  return output;
}

// Ensure the AI flow is registered with Genkit for observability.
ai.defineFlow(
  {
    name: 'analyzeWorkoutFormFlow',
    inputSchema: AnalyzeWorkoutFormInputSchema,
    outputSchema: AnalyzeWorkoutFormOutputSchema,
  },
  async (input) => {
    // This is a wrapper for the prompt call to make it an observable flow.
    const result = await analyzeWorkoutForm(input);
    return result;
  }
);
