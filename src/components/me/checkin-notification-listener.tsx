
'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';
import { CheckCheck } from 'lucide-react';
import type { Checkin } from '@/lib/types';

export function CheckinNotificationListener() {
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const memberId = searchParams.get('memberId');
  const email = searchParams.get('email');

  useEffect(() => {
    if (!supabase || !memberId || !email) {
      return;
    }

    const channel = supabase
      .channel(`public:check_ins:memberId=eq.${memberId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'check_ins',
          filter: `member_id=eq.${memberId}`
        },
        (payload) => {
          const newCheckin = payload.new as Checkin;
          
          // A simple check to avoid showing toasts for very old, back-dated checkins
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
          console.log(`[Realtime] Subscribed to check-in notifications for member ${memberId}.`);
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
  }, [memberId, email, toast]);

  return null; // This component does not render anything
}
