
"use client";

import type { Message, Member } from '@/lib/types';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Loader2, Users, RefreshCw, AlertTriangle, Search, X } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import { sendMessage } from './actions';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/lib/supabaseClient';

interface MessageInterfaceProps {
  initialMessages: Message[];
  member: Member;
}

type FormState = 'idle' | 'submitting' | 'success' | 'error';

// Helper component to prevent hydration mismatch for timestamps.
// It renders the formatted time only on the client-side.
const ClientTimestamp: React.FC<{ dateString: string }> = ({ dateString }) => {
  const [formattedTime, setFormattedTime] = useState<string | null>(null);

  useEffect(() => {
    // This effect runs only on the client, after the component has mounted.
    setFormattedTime(formatDate(dateString, { hour: 'numeric', minute: '2-digit', hour12: true }));
  }, [dateString]);

  // Return null on the server and initial client render to avoid mismatch.
  // The time will appear after hydration.
  return <>{formattedTime}</>;
};

const getInitials = (name: string): string => {
    if (!name) return '??';
    const nameParts = name.trim().split(' ');
    if (nameParts.length === 1) {
        return nameParts[0].substring(0, 2).toUpperCase();
    }
    return (nameParts[0][0] + (nameParts[nameParts.length - 1][0] || '')).toUpperCase();
};

export function MessageInterface({ initialMessages, member }: MessageInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [groupedMessages, setGroupedMessages] = useState<{ [key: string]: Message[] }>({});
  const [newMessage, setNewMessage] = useState('');
  const [formState, setFormState] = useState<FormState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const adminId = member.formatted_gym_id!;
  const gymName = member.gym_name || 'Gym Admin';
  const gymInitials = getInitials(gymName);

  // Syncs server-fetched messages and stops the refresh spinner
  useEffect(() => {
    setMessages(initialMessages);
    setIsRefreshing(false);
  }, [initialMessages]);
  
  // Realtime subscription for new messages
  useEffect(() => {
    if (!supabase) {
      console.error('Supabase client not initialized for realtime.');
      return;
    }

    const channel = supabase
      .channel(`public:messages:convo:${member.member_id}:${adminId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const receivedMessage = payload.new as Message;
          // RLS should filter messages, but we also check client-side for the current conversation
          const isForThisConversation =
            (receivedMessage.sender_id === member.member_id && receivedMessage.receiver_id === adminId) ||
            (receivedMessage.sender_id === adminId && receivedMessage.receiver_id === member.member_id);

          if (isForThisConversation) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === receivedMessage.id)) {
                return prev; // Avoid adding duplicates
              }
              return [...prev, receivedMessage];
            });
          }
        }
      )
      .subscribe();

    // Cleanup subscription on component unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [member.member_id, adminId]);

  // Group messages by date on the client side to avoid hydration errors
  useEffect(() => {
    const groupMessagesByDate = (msgs: Message[]) => {
      const groups: { [key: string]: Message[] } = {};
      msgs.forEach(message => {
        const messageDate = new Date(message.created_at);
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        let key: string;
        if (messageDate.toDateString() === today.toDateString()) key = 'Today';
        else if (messageDate.toDateString() === yesterday.toDateString()) key = 'Yesterday';
        else key = formatDate(message.created_at, { month: 'long', day: 'numeric', year: 'numeric' });

        if (!groups[key]) groups[key] = [];
        groups[key].push(message);
      });
      return groups;
    };

    setGroupedMessages(groupMessagesByDate(messages));
  }, [messages]);


  // Scrolls to the bottom when messages update
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [groupedMessages]); // Depends on groupedMessages to scroll after render

  const handleRefresh = () => {
    setIsRefreshing(true);
    router.refresh();
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !member.gym_id || !member.formatted_gym_id) return;

    setFormState('submitting');
    setErrorMessage('');
    const messageContent = newMessage;
    setNewMessage(''); // Clear input immediately
    
    try {
        const result = await sendMessage({
            content: messageContent,
            senderId: member.member_id,
            receiverId: adminId,
            gymId: member.gym_id,
            formattedGymId: member.formatted_gym_id,
        });
        
        if (result.success && result.data) {
            setFormState('success');
            // Manually add the sent message to the state.
            // The realtime listener has a duplicate check, so this is safe even with potential race conditions.
            setMessages((prev) => {
                // Ensure we don't add a duplicate if the realtime event somehow fires and updates state first.
                if (prev.some(m => m.id === result.data!.id)) {
                    return prev;
                }
                return [...prev, result.data!];
            });
        } else {
            setFormState('error');
            setErrorMessage(result.error || 'An unknown error occurred.');
            setNewMessage(messageContent); // Restore message on error
        }
    } catch (error) {
        setFormState('error');
        setErrorMessage('Failed to send message. Please try again later.');
        setNewMessage(messageContent); // Restore message on error
        console.error(error);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 flex-1 min-h-0">
      <div className="md:col-span-1 lg:col-span-1 hidden md:flex flex-col">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users />Members</CardTitle>
            <CardDescription>Click on a member to chat.</CardDescription>
            <div className="relative pt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search members..." className="pl-9 bg-input" />
            </div>
          </CardHeader>
          <CardContent className="p-2">
            <div className="bg-muted p-3 rounded-lg flex items-center gap-3">
                <Avatar>
                    <AvatarFallback className="bg-primary text-primary-foreground">{gymInitials}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-semibold">{gymName}</p>
                    <p className="text-xs text-muted-foreground">{member.formatted_gym_id}</p>
                </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="col-span-1 md:col-span-2 lg:col-span-3">
        <Card className="flex flex-col h-full">
            <CardHeader className="flex flex-row items-center justify-between border-b">
                <div className="flex items-center gap-3">
                    <Avatar>
                         <AvatarFallback>{gymInitials}</AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle>{gymName}</CardTitle>
                        <CardDescription>{adminId}</CardDescription>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={handleRefresh} disabled={isRefreshing}>
                    {isRefreshing ? <Loader2 className="h-5 w-5 animate-spin" /> : <RefreshCw className="h-5 w-5" />}
                    <span className="sr-only">Refresh chat</span>
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <X className="h-5 w-5" />
                    <span className="sr-only">Close chat</span>
                  </Button>
                </div>
            </CardHeader>
          <ScrollArea ref={scrollAreaRef} className="flex-1 p-6">
              <div className="space-y-4">
              {Object.keys(groupedMessages).length === 0 ? (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  No messages yet. Start the conversation!
                </div>
              ) : (
                Object.entries(groupedMessages).map(([date, msgs]) => (
                  <div key={date} className="relative py-4">
                    <div className="relative flex justify-center">
                      <span className="bg-card px-2 text-xs text-muted-foreground">{date}</span>
                    </div>
                    <div className="mt-4 space-y-6">
                      {msgs.map((message) => {
                        const isSender = message.sender_id === member.member_id;
                        return (
                          <div key={message.id} className={cn('flex items-end gap-2 group', isSender ? 'justify-end' : 'justify-start')}>
                              {!isSender && (
                                  <Avatar className="h-8 w-8">
                                      <AvatarFallback className="bg-primary text-primary-foreground">{gymInitials}</AvatarFallback>
                                  </Avatar>
                              )}
                              
                              <div className={cn('flex items-end gap-2', isSender ? 'flex-row-reverse' : 'flex-row')}>
                                <div className={cn('max-w-xs rounded-lg p-3 md:max-w-md shadow', isSender ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-muted rounded-bl-none')}>
                                    <p className="text-sm">{message.content}</p>
                                </div>
                                <div className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <ClientTimestamp dateString={message.created_at} />
                                </div>
                              </div>

                              {isSender && (
                                  <Avatar className="h-8 w-8">
                                      <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                                  </Avatar>
                              )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
              </div>
          </ScrollArea>
          <div className="border-t p-4">
            {formState === 'error' && (
                <Alert variant="destructive" className="mb-2">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Send Failed</AlertTitle>
                    <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
            )}
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <Input
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 bg-muted border-none focus-visible:ring-1 focus-visible:ring-primary"
                disabled={formState === 'submitting'}
              />
              <Button type="submit" size="icon" className="h-10 w-10 shrink-0" disabled={!newMessage.trim() || formState === 'submitting'}>
                {formState === 'submitting' ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                <span className="sr-only">Send</span>
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
}
