
'use client';

import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { CheckCheck } from 'lucide-react';
import type { Checkin } from '@/lib/types';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy, limit, Timestamp } from 'firebase/firestore';

export function CheckinNotificationListener() {
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const checkInsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    const fiveMinutesAgo = Timestamp.fromMillis(Date.now() - 5 * 60 * 1000);
    return query(
      collection(firestore, `users/${user.uid}/checkIns`),
      where('checkInTime', '>=', fiveMinutesAgo),
      orderBy('checkInTime', 'desc'),
      limit(1)
    );
  }, [user, firestore]);

  const { data: checkIns } = useCollection<Checkin>(checkInsQuery);

  useEffect(() => {
    if (checkIns && checkIns.length > 0) {
      const latestCheckin = checkIns[0];
      const checkinTime = (latestCheckin.checkInTime as unknown as Timestamp).toDate();
      const now = new Date();
      const timeDiffMinutes = (now.getTime() - checkinTime.getTime()) / (1000 * 60);

      if (timeDiffMinutes < 1) { 
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
  }, [checkIns, toast]);

  return null;
}
