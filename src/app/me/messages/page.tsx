
import { getMemberProfile, getConversation } from '@/lib/data';
import type { Message } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, UserSearch, MessageSquare } from "lucide-react";
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const MessageInterface = dynamic(() => import('./message-interface').then(mod => mod.MessageInterface), {
  ssr: false,
  loading: () => <MessageInterfaceSkeleton />,
});

function MessageInterfaceSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 flex-1 min-h-0">
      {/* Left Sidebar Skeleton */}
      <div className="md:col-span-1 lg:col-span-1 hidden md:flex flex-col">
        <Skeleton className="h-[200px] w-full" />
      </div>

      {/* Main Chat Area Skeleton */}
      <div className="col-span-1 md:col-span-2 lg:col-span-3">
        <div className="flex flex-col h-full border rounded-lg">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>

          {/* Chat Area Skeleton */}
          <div className="flex-1 p-6 space-y-4">
            <div className="flex justify-start items-end gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-10 w-48" />
            </div>
            <div className="flex justify-end items-end gap-2">
              <Skeleton className="h-12 w-56" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
            <div className="flex justify-start items-end gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-32" />
            </div>
          </div>

          {/* Input Skeleton */}
          <div className="p-4 border-t">
            <div className="flex items-center gap-2">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-10" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


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
