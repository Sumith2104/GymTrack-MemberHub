
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';
import { CheckCheck } from 'lucide-react';
import type { Checkin } from '@/lib/types';

async function getMemberUUID(memberDisplayId: string): Promise<string | null> {
  if (!supabase || !memberDisplayId) return null;
  const { data, error } = await supabase
    .from('members')
    .select('id')
    .ilike('member_id', memberDisplayId)
    .single();
  if (error) {
    console.error(`[Realtime:getMemberUUID] Error fetching UUID for ${memberDisplayId}:`, error.message);
    return null;
  }
  return data.id;
}


export function CheckinNotificationListener() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [memberUUID, setMemberUUID] = useState<string | null>(null);

  const memberId = searchParams.get('memberId');

  useEffect(() => {
    if (memberId) {
      getMemberUUID(memberId).then(setMemberUUID);
    }
  }, [memberId]);


  useEffect(() => {
    if (!supabase || !memberUUID) {
      return;
    }

    const channel = supabase
      .channel(`public:check_ins:member_table_id=eq.${memberUUID}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'check_ins',
          filter: `member_table_id=eq.${memberUUID}`
        },
        (payload) => {
          const newCheckin = payload.new as Checkin;
          
          const checkinTime = new Date(newCheckin.check_in_time);
          const now = new Date();
          const timeDiffMinutes = (now.getTime() - checkinTime.getTime()) / (1000 * 60);

          if (timeDiffMinutes < 5) {
            toast({
              title: (
                <div className="flex items-center gap-2">
                  <CheckCheck className="h-5 w-5 text-green-500" />
                  <span className="font-bold">Check-in Successful!</span>
                </div>
              ),
              description: "Welcome to the gym! Have a great workout.",
            });
          }
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log(`[Realtime] Subscribed to check-in notifications for member UUID ${memberUUID}.`);
        }
        if (status === 'CHANNEL_ERROR') {
          console.error('[Realtime] Channel Error:', err);
        }
        if (status === 'TIMED_OUT') {
          console.warn('[Realtime] Connection timed out.');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [memberUUID, toast]);

  return null; // This component does not render anything
}
