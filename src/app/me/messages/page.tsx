
import { getMemberProfile, getConversation } from '@/lib/data';
import type { Message } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, UserSearch, MessageSquare } from "lucide-react";
import { MessageInterface } from './message-interface';
import Link from 'next/link';

export default async function MessagesPage({
  searchParams,
}: {
  searchParams?: { memberId?: string; email?: string };
}) {
  const memberDisplayId = searchParams?.memberId;
  const email = searchParams?.email;

  if (!memberDisplayId || !email) {
    return (
      <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <Alert variant="destructive">
          <Info className="h-4 w-4" />
          <AlertTitle>Information Missing</AlertTitle>
          <AlertDescription>
            Member ID and Email are required to view messages. Please access this page via your dashboard.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const member = await getMemberProfile(email, memberDisplayId);

  if (!member || !member.gym_id || !member.formatted_gym_id) {
    return (
      <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <Alert variant="destructive">
          <UserSearch className="h-4 w-4" />
          <AlertTitle>Cannot Load Messages</AlertTitle>
          <AlertDescription>
            Could not retrieve your complete profile details required for messaging. Please check your login details or use the 
            <Link href="/" className="underline hover:text-destructive-foreground/80"> main lookup page</Link>.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  const conversation: Message[] = await getConversation(member.member_id, member.formatted_gym_id);

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)]">
        <header className="mb-6">
            <h1 className="text-3xl font-bold flex items-center gap-3">
                <MessageSquare className="h-8 w-8 text-primary" />
                Messages
            </h1>
            <p className="text-muted-foreground relative mt-1">
                Select a member to view or start a conversation.
            </p>
        </header>
        <MessageInterface 
          member={member}
          initialMessages={conversation}
        />
    </div>
  );
}
