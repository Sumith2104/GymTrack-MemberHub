'use client';

import { useEffect, useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { CheckCheck } from 'lucide-react';
import { getMemberCheckins } from '@/lib/data';

export function CheckinNotificationListener() {
  const { toast } = useToast();
  const [memberId, setMemberId] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMemberId(sessionStorage.getItem('memberId'));
  }, []);

  useEffect(() => {
    if (!memberId) return;

    const checkRecentCheckins = async () => {
      try {
        const checkIns = await getMemberCheckins(memberId);
        if (checkIns && checkIns.length > 0) {
          const latestCheckin = checkIns[0];
          const checkinTime = new Date(latestCheckin.check_in_time);
          const now = new Date();
          const timeDiffMinutes = (now.getTime() - checkinTime.getTime()) / (1000 * 60);

          const notificationShownKey = `notif_${latestCheckin.id}`;
          const hasBeenShown = sessionStorage.getItem(notificationShownKey);

          if (timeDiffMinutes < 1.5 && !hasBeenShown) {
            toast({
              title: "Check-in Successful!",
              description: "Welcome to the gym! Have a great workout.",
            });
            sessionStorage.setItem(notificationShownKey, 'true');
          }
        }
      } catch (e) {
        console.error("Error polling check-ins:", e);
      }
    };

    checkRecentCheckins();
    intervalRef.current = setInterval(checkRecentCheckins, 30000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [memberId, toast]);

  return null;
}
