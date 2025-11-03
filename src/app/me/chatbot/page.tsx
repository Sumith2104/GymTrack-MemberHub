
import { ChatbotInterface } from '@/components/me/chatbot-interface';
import { Bot } from 'lucide-react';

export default function ChatbotPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-6rem)]">
      <header className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-3">
              <Bot className="h-8 w-8 text-primary" />
              Fitness Assistant
          </h1>
          <p className="text-muted-foreground mt-1">
              Ask me anything about fitness, nutrition, or workout plans!
          </p>
      </header>
      <ChatbotInterface />
    </div>
  );
}
