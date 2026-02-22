"use client";

import type { Member } from '@/lib/types';
import { useState, useEffect } from 'react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { requestEmailChange, verifyEmailChange, type RequestEmailChangeState, type VerifyEmailChangeState } from '@/app/me/settings/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from 'next/navigation';

interface ChangeEmailFormProps {
  member: Member;
}

const initialRequestState: RequestEmailChangeState = { success: false, message: '' };
const initialVerifyState: VerifyEmailChangeState = { success: false, message: '' };

function SubmitButton({ title, loadingTitle }: { title: string; loadingTitle: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {loadingTitle}
        </>
      ) : (
        title
      )}
    </Button>
  );
}

export function ChangeEmailForm({ member }: ChangeEmailFormProps) {
  const { toast } = useToast();
  const searchParams = useSearchParams();

  const [requestState, requestAction] = useActionState(requestEmailChange, initialRequestState);
  const [verifyState, verifyAction] = useActionState(verifyEmailChange, initialVerifyState);
  
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (requestState.success && requestState.otp) {
      setStep(2);
      toast({
        title: "OTP Sent",
        description: requestState.message,
        duration: 10000,
        variant: 'default',
      });
    }
  }, [requestState, toast]);

  useEffect(() => {
    if (searchParams.get('updated') === 'true') {
        toast({
            title: "Success!",
            description: "Your email has been updated successfully.",
            variant: "default",
        });
        window.history.replaceState(null, '', window.location.pathname + `?memberId=${member.member_id}&email=${member.email}`);
    }
  }, [searchParams, toast, member.email, member.member_id]);

  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Update Email Address</CardTitle>
        <CardDescription>
          Your current email is <span className="font-semibold">{member.email}</span>.
          Enter a new email below. A verification code will be sent to your current email to authorize the change.
        </CardDescription>
      </CardHeader>
      
      {step === 1 ? (
        <form action={requestAction}>
          <CardContent className="space-y-4">
            {!requestState.success && requestState.message && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{requestState.message}</AlertDescription>
              </Alert>
            )}
            <input type="hidden" name="currentEmail" value={member.email} />
            <input type="hidden" name="gymId" value={member.gym_id!} />
            <div className="space-y-2">
              <Label htmlFor="newEmail">New Email Address</Label>
              <Input
                id="newEmail"
                name="newEmail"
                type="email"
                placeholder="your.new.email@example.com"
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <SubmitButton title="Request OTP" loadingTitle="Requesting..." />
          </CardFooter>
        </form>
      ) : (
        <form action={verifyAction}>
          <CardContent className="space-y-4">
            <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Check Your Current Email</AlertTitle>
                <AlertDescription>
                    We've sent a 6-digit OTP to <span className="font-semibold">{member.email}</span>. Enter it below to confirm the change to your new email address.
                </AlertDescription>
            </Alert>
            
            {verifyState.message && (
              <Alert variant="destructive" className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Verification Failed</AlertTitle>
                <AlertDescription>{verifyState.message}</AlertDescription>
              </Alert>
            )}

            <input type="hidden" name="memberId" value={member.member_id} />
            <input type="hidden" name="newEmail" value={requestState.newEmail || ''} />
            <input type="hidden" name="originalOtp" value={requestState.otp || ''} />
            
            <div className="space-y-2">
              <Label htmlFor="otp">Verification Code (OTP)</Label>
              <Input
                id="otp"
                name="otp"
                type="tel"
                placeholder="Enter 6-digit code"
                maxLength={6}
                required
                pattern="[0-9]{6}"
                inputMode="numeric"
                autoComplete="one-time-code"
              />
            </div>
          </CardContent>
          <CardFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" type="button" onClick={() => setStep(1)} className="w-full sm:w-auto">Go Back</Button>
            <SubmitButton title="Verify and Update Email" loadingTitle="Verifying..." />
          </CardFooter>
        </form>
      )}
    </Card>
  );
}
