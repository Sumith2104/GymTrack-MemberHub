
"use client";

import type { Member, MembershipPlan } from '@/lib/types';
import { useState, useEffect } from 'react';
import { differenceInDays } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { CreditCard, Loader2, IndianRupee, AlertTriangle, ChevronDown, ShieldCheck } from 'lucide-react';
import { getAllMembershipPlans } from '@/lib/data';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { QRCodeCanvas } from 'qrcode.react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

interface PaymentFormProps {
  member: Member;
}

export function PaymentForm({ member }: PaymentFormProps) {
  const [availablePlans, setAvailablePlans] = useState<MembershipPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | undefined>(undefined);
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [daysUntilExpiry, setDaysUntilExpiry] = useState<number | null>(null);

  useEffect(() => {
    if (member.expiry_date) {
        const today = new Date();
        const expiryDate = new Date(member.expiry_date);
        const diff = differenceInDays(expiryDate, today);
        setDaysUntilExpiry(diff);
    } else {
        setDaysUntilExpiry(-1); 
    }
  }, [member.expiry_date]);

  
  useEffect(() => {
    if (!member.gym_id) {
      setError("Your gym information is missing. Cannot load plans.");
      return;
    }

    setIsLoadingPlans(true);
    setError(null);
    getAllMembershipPlans(member.gym_id)
      .then(plans => {
        setAvailablePlans(plans);
        if (member.plan_id && plans.some(p => p.id === member.plan_id)) {
          setSelectedPlanId(member.plan_id);
        } else if (plans.length > 0) {
          // Default to the first plan if current plan isn't in the list
          setSelectedPlanId(plans[0].id);
        }
      })
      .catch(err => {
        console.error("Failed to load membership plans:", err);
        setError("Could not load available membership plans for your gym. Please try again later.");
      })
      .finally(() => setIsLoadingPlans(false));
  }, [member.gym_id, member.plan_id]);

  const selectedPlan = availablePlans.find(p => p.id === selectedPlanId);
  const planPrice = selectedPlan ? selectedPlan.price : 0;
  
  const baseUpiLink = (member.payment_id && planPrice > 0)
    ? `upi://pay?pa=${member.payment_id}&pn=${encodeURIComponent(member.gym_name || 'Gym Payment')}&am=${planPrice.toFixed(2)}&cu=INR`
    : null;

  const paymentLinks = baseUpiLink ? {
      any: baseUpiLink,
      gpay: baseUpiLink,
      phonepe: baseUpiLink.replace('upi://', 'phonepe://'),
      paytm: baseUpiLink.replace('upi://', 'paytmmp://'),
  } : null;
  
  const needsRenewal = daysUntilExpiry === null || daysUntilExpiry <= 7;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Renew or Purchase Membership</CardTitle>
        <CardDescription>
          Select a plan below to proceed with the payment. Your current gym is {member.gym_name || 'your gym'}.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoadingPlans ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading available plans...</span>
          </div>
        ) : (
          <div className="grid gap-2">
            <Label htmlFor="plan-select">Choose a Membership Plan</Label>
            <Select
              value={selectedPlanId}
              onValueChange={setSelectedPlanId}
              disabled={availablePlans.length === 0}
            >
              <SelectTrigger id="plan-select">
                <SelectValue placeholder="Select a plan" />
              </SelectTrigger>
              <SelectContent>
                {availablePlans.length > 0 ? (
                  availablePlans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.plan} - ₹{plan.price}
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No plans available for your gym.
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>
        )}

        {selectedPlan && (
          <div className="pt-4">
            <h3 className="font-semibold">Payment Summary</h3>
            <div className="flex justify-between items-center mt-2 p-3 bg-muted rounded-lg">
              <p>Selected Plan: <span className="font-medium">{selectedPlan.plan}</span></p>
              <p className="flex items-center text-lg font-bold">
                <IndianRupee className="h-5 w-5 mr-1" />
                {planPrice.toFixed(2)}
              </p>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <div className="flex flex-col gap-4 w-full">
            {!needsRenewal && (
                 <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 p-3 rounded-md bg-green-500/10">
                    <ShieldCheck className="h-5 w-5" />
                    <p>Your membership is active with plenty of time remaining.</p>
                </div>
            )}

            <Dialog>
            <DialogTrigger asChild>
                <Button className="w-full sm:w-auto" disabled={!baseUpiLink}>
                <CreditCard className="mr-2 h-4 w-4" />
                Proceed to Pay
                </Button>
            </DialogTrigger>
            {baseUpiLink && selectedPlan && paymentLinks && (
                <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Complete Your Payment</DialogTitle>
                    <DialogDescription>
                    Scan the QR code with any UPI app or use the button below to pay for your <span className="font-semibold">{selectedPlan.plan}</span> plan.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col items-center justify-center pt-4 space-y-4">
                    <div className="p-4 border rounded-lg bg-white">
                    <QRCodeCanvas
                        value={baseUpiLink}
                        size={200}
                        bgColor={"#ffffff"}
                        fgColor={"#000000"}
                        level={"H"}
                        includeMargin={true}
                        imageSettings={{
                        src: "/icon.ico",
                        height: 40,
                        width: 40,
                        excavate: true,
                        }}
                    />
                    </div>
                    <p className="text-sm text-muted-foreground text-center">
                    Total Amount: <span className="font-bold">₹{planPrice.toFixed(2)}</span>
                    </p>
                </div>
                <DialogFooter className="pt-4">
                    <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button className="w-full">
                        <CreditCard className="mr-2 h-4 w-4" />
                        Pay with UPI App
                        <ChevronDown className="ml-auto h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]">
                        <DropdownMenuItem asChild>
                        <a href={paymentLinks.any} target="_blank" rel="noopener noreferrer" className="cursor-pointer">
                            Pay with any UPI App
                        </a>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                        <a href={paymentLinks.gpay} target="_blank" rel="noopener noreferrer" className="cursor-pointer">
                            Pay with Google Pay
                        </a>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                        <a href={paymentLinks.phonepe} target="_blank" rel="noopener noreferrer" className="cursor-pointer">
                            Pay with PhonePe
                        </a>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                        <a href={paymentLinks.paytm} target="_blank" rel="noopener noreferrer" className="cursor-pointer">
                            Pay with Paytm
                        </a>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                    </DropdownMenu>
                </DialogFooter>
                </DialogContent>
            )}
            </Dialog>
        </div>
      </CardFooter>
    </Card>
  );
}

