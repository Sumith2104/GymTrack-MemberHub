

"use client";

import type { Member } from '@/lib/types';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatDate } from '@/lib/utils';
import { AtSign, Cake, CalendarDays, Fingerprint, Phone, CreditCard, CalendarClock, QrCode, RefreshCw, Flame } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { useState, useEffect } from 'react';

interface MemberProfileCardProps {
  member: Member;
  streak: number;
}

const DetailItem: React.FC<{ icon: React.ElementType, label: string, value: string | number | null | undefined }> = ({ icon: Icon, label, value }) => (
  <div className="flex items-start space-x-3">
    <Icon className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-medium">{value || 'N/A'}</p>
    </div>
  </div>
);

export function MemberProfileCard({ member, streak }: MemberProfileCardProps) {
  const [formattedJoinDate, setFormattedJoinDate] = useState<string | null>(null);
  const [formattedExpiryDate, setFormattedExpiryDate] = useState<string | null>(null);
  const [isExpiryToday, setIsExpiryToday] = useState(false);

  useEffect(() => {
    if (member.join_date) {
      setFormattedJoinDate(formatDate(member.join_date));
    } else {
      setFormattedJoinDate('N/A');
    }

    if (member.expiry_date) {
      setFormattedExpiryDate(formatDate(member.expiry_date));
      const expiry = new Date(member.expiry_date);
      const today = new Date();
      expiry.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      const isToday = expiry.getTime() === today.getTime();
      setIsExpiryToday(isToday);
    } else {
      setFormattedExpiryDate('N/A');
      setIsExpiryToday(false);
    }
  }, [member.join_date, member.expiry_date]);

  const canRenew = (member.membership_status &&
                    (member.membership_status.toLowerCase() === 'expired' ||
                     member.membership_status.toLowerCase() === 'expiring_soon')) ||
                   isExpiryToday;

  const getInitials = (name: string): string => {
    if (!name || typeof name !== 'string') return '??';
    const nameParts = name.trim().match(/\b(\p{L}+)\b/gu); 
    if (!nameParts || nameParts.length === 0) {
      const cleanedName = name.trim().replace(/[^a-zA-Z0-9]/g, "");
      if (cleanedName.length > 0) {
          return cleanedName.substring(0, Math.min(2, cleanedName.length)).toUpperCase();
      }
      return '??';
    }
    if (nameParts.length === 1) {
      return nameParts[0].substring(0, Math.min(2, nameParts[0].length)).toUpperCase();
    } else {
      const firstInitial = nameParts[0].substring(0, 1);
      const secondInitial = nameParts[1].substring(0, 1);
      return (firstInitial + secondInitial).toUpperCase();
    }
  };

  const isActiveMember = member.membership_status?.toLowerCase() === 'active';
  
  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 pb-4">
        <Avatar className="h-20 w-20">
          <AvatarFallback className="text-2xl font-semibold">{getInitials(member.name)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 text-center sm:text-left">
          <CardTitle className="text-3xl font-headline">{member.name}</CardTitle>
          <CardDescription className="text-lg">
            Member ID: {member.member_id}
          </CardDescription>
          {member.formatted_gym_id && (
            <CardDescription className="text-base text-muted-foreground">
                Gym ID: {member.formatted_gym_id}
            </CardDescription>
          )}
          <Badge 
            variant={isActiveMember ? 'default' : 'destructive'} 
            className={`mt-2 ${isActiveMember ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-primary-foreground`}
          >
            {member.membership_status}
          </Badge>
        </div>
        {streak > 0 && (
            <div className="flex flex-col items-center gap-1 p-4 bg-amber-400/10 border border-amber-400/20 rounded-lg text-amber-500">
                <Flame className="h-8 w-8"/>
                <div className="text-3xl font-bold">{streak}</div>
                <div className="text-sm font-medium tracking-wider">DAY STREAK</div>
            </div>
        )}
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 pt-4">
        <DetailItem icon={AtSign} label="Email" value={member.email} />
        <DetailItem icon={Phone} label="Phone" value={member.phone_number} />
        <DetailItem icon={Cake} label="Age" value={member.age?.toString()} />
        <DetailItem icon={CalendarDays} label="Join Date" value={formattedJoinDate === null ? 'Loading...' : formattedJoinDate} />
        <DetailItem icon={Fingerprint} label="Membership Type" value={member.membership_type} />
        <DetailItem icon={CalendarClock} label="Expiry Date" value={formattedExpiryDate === null ? 'Loading...' : formattedExpiryDate} />
        {member.plan_price && <DetailItem icon={CreditCard} label="Current Plan Price" value={`₹${member.plan_price}`} />}
      </CardContent>
      {(member.member_id || canRenew) && (
        <CardFooter className="flex flex-col items-center pt-6 space-y-4 sm:flex-row sm:justify-center sm:space-y-0 sm:space-x-4">
          {member.member_id && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <QrCode className="mr-2 h-4 w-4" />
                  Show Member ID QR Code
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <QrCode className="h-6 w-6" /> Member ID QR Code
                  </DialogTitle>
                  <DialogDescription>
                    Scan this QR code for quick member identification. Member ID: {member.member_id}
                  </DialogDescription>
                </DialogHeader>
                <div className="flex justify-center items-center p-4">
                  <div className="p-2 border rounded-md bg-white">
                    <QRCodeCanvas value={member.member_id} size={200} bgColor="#ffffff" fgColor="#000000" level="Q" />
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
          {canRenew && (
            <Button asChild variant="default">
              <Link href={`/me/payments?memberId=${encodeURIComponent(member.member_id)}&email=${encodeURIComponent(member.email)}`}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Renew Membership
              </Link>
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
