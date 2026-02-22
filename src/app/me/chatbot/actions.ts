'use server';

import { generateChatResponse } from '@/ai/flows/chatbot-flow';
import type { ChatMessage } from '@/lib/types';

export async function getChatbotResponse(history: ChatMessage[]): Promise<string> {
  if (history.length === 0) {
    return "I'm sorry, I can't respond to an empty conversation.";
  }
  try {
    const response = await generateChatResponse(history);
    return response;
  } catch (error) {
    console.error('[Chatbot Action Error]', error);
    return 'Sorry, I encountered an error and cannot respond right now. Please try again later.';
  }
}
