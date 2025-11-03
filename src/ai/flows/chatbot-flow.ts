
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { ChatMessageSchema } from '@/lib/types';
import type { ChatMessage } from '@/lib/types';

const HistorySchema = z.array(ChatMessageSchema);

const chatPrompt = ai.definePrompt({
  name: 'chatbotPrompt',
  input: { schema: HistorySchema },
  output: { schema: z.string() },
  model: 'googleai/gemini-1.5-flash-latest',
  prompt: `
You are a friendly and knowledgeable AI fitness assistant for the "Member Hub" app.
Your goal is to provide helpful, safe, and encouraging advice on fitness, nutrition, and wellness.

- Keep your answers concise and easy to understand.
- If a user asks for medical advice, gently decline and advise them to consult a doctor or registered dietitian.
- Use the conversation history to maintain context.

Conversation History:
{{#each input}}
{{role}}: {{content}}
{{/each}}

Assistant:
`,
});

const chatbotFlow = ai.defineFlow(
  {
    name: 'chatbotFlow',
    inputSchema: HistorySchema,
    outputSchema: z.string(),
  },
  async (history) => {
    const { output } = await chatPrompt(history);
    return output!;
  }
);

export async function generateChatResponse(history: ChatMessage[]): Promise<string> {
  return chatbotFlow(history);
}
