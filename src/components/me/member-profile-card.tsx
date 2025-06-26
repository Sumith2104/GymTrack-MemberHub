
"use client";

import type { Member, MembershipPlan } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { formatDate } from '@/lib/utils';
import { AtSign, Cake, CalendarDays, Fingerprint, Phone, CreditCard, User, CalendarClock, QrCode, RefreshCw, Loader2, Building } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { useState, useEffect } from 'react';
import { getAllMembershipPlans } from '@/lib/data';

interface MemberProfileCardProps {
  member: Member;
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

export function MemberProfileCard({ member }: MemberProfileCardProps) {
  const [formattedJoinDate, setFormattedJoinDate] = useState<string | null>(null);
  const [formattedExpiryDate, setFormattedExpiryDate] = useState<string | null>(null);
  const [isExpiryToday, setIsExpiryToday] = useState(false);

  const [isRenewDialogOpen, setIsRenewDialogOpen] = useState(false);
  const [availablePlans, setAvailablePlans] = useState<MembershipPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | undefined>(undefined); // This will be the UUID of the plan
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);

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

  useEffect(() => {
    if (isRenewDialogOpen && member.gym_id && availablePlans.length === 0 && !isLoadingPlans) {
      setIsLoadingPlans(true);
      getAllMembershipPlans(member.gym_id)
        .then(plans => {
          setAvailablePlans(plans);
          if (member.plan_id) {
            const currentMemberPlan = plans.find(p => p.id === member.plan_id);
            if (currentMemberPlan) {
              setSelectedPlanId(currentMemberPlan.id);
            }
          } else if (plans.length > 0 && !member.plan_id) {
            const currentMemberPlanByName = plans.find(p => p.plan.toLowerCase() === member.membership_type?.toLowerCase());
            if (currentMemberPlanByName) {
              setSelectedPlanId(currentMemberPlanByName.id);
            }
          }
        })
        .catch(error => console.error("Failed to load membership plans for gym", error))
        .finally(() => setIsLoadingPlans(false));
    }
  }, [isRenewDialogOpen, availablePlans.length, isLoadingPlans, member.gym_id, member.plan_id, member.membership_type]);


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
  
  const selectedPlanObject = availablePlans.find(p => p.id === selectedPlanId);
  const selectedPlanPrice = selectedPlanObject ? selectedPlanObject.price : 0;
  
  const upiRenewLink = (member.payment_id && selectedPlanPrice > 0)
    ? `upi://pay?pa=${member.payment_id}&pn=${encodeURIComponent(member.gym_name || 'Gym Payment')}&am=${selectedPlanPrice.toFixed(2)}&cu=INR`
    : null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center space-x-4 pb-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={member.profile_url || undefined} alt={member.name} />
          <AvatarFallback className="text-2xl font-semibold">{getInitials(member.name)}</AvatarFallback>
        </Avatar>
        <div>
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
            <Dialog open={isRenewDialogOpen} onOpenChange={setIsRenewDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="default">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Renew Membership
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                  <DialogTitle>Renew Membership</DialogTitle>
                  <DialogDescription>
                    Select a new plan to renew your membership. Your current plan is {member.membership_type}.
                  </DialogDescription>
                </DialogHeader>
                {isLoadingPlans ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="ml-2">Loading plans...</p>
                  </div>
                ) : availablePlans.length > 0 ? (
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="plan-select" className="text-right col-span-1">
                        Plan
                      </Label>
                      <Select
                        value={selectedPlanId}
                        onValueChange={setSelectedPlanId}
                      >
                        <SelectTrigger id="plan-select" className="col-span-3">
                          <SelectValue placeholder="Select a membership plan" />
                        </SelectTrigger>
                        <SelectContent>
                          {availablePlans.map((plan) => (
                            <SelectItem key={plan.id} value={plan.id}>
                              {plan.plan} - ₹{plan.price}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ) : (
                  <p className="py-4 text-center text-muted-foreground">No membership plans available for your gym.</p>
                )}
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  {upiRenewLink ? (
                     <Button asChild>
                       <a href={upiRenewLink} target="_blank" rel="noopener noreferrer" onClick={() => setIsRenewDialogOpen(false)}>
                         <CreditCard className="mr-2 h-4 w-4" />
                         Proceed to Pay (₹{selectedPlanPrice})
                       </a>
                     </Button>
                  ) : (
                    <Button disabled>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Select a Plan
                    </Button>
                  )}
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
