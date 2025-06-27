"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, LogIn, Mail, Shield } from 'lucide-react';

export function MemberLookupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [emailInput, setEmailInput] = useState('');
  const [memberIdInput, setMemberIdInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // If the URL has 'email', 'memberId', or 'message' params, it means a submission attempt was made.
    // Since we are still on this page, the login must have failed or validation failed.
    // In either case, we should stop the loading spinner.
    const emailParam = searchParams.get('email');
    const memberIdParam = searchParams.get('memberId');
    const messageParam = searchParams.get('message');
    
    if ((emailParam && memberIdParam) || messageParam) {
      setIsSubmitting(false);
    }
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (emailInput.trim() && memberIdInput.trim()) {
      setIsSubmitting(true);
      router.push(`/?email=${encodeURIComponent(emailInput.trim())}&memberId=${encodeURIComponent(memberIdInput.trim())}`);
    } else {
      // Explicitly stop submission state for client-side validation failure.
      setIsSubmitting(false);
      router.push('/?message=Please enter both email and Member ID.');
    }
  };

  return (
    <Card className="shadow-lg w-full max-w-md border-border/50">
       <CardHeader className="flex flex-col items-center text-center space-y-2 pt-8">
        <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-primary">
            <LogIn className="h-9 w-9 text-primary-foreground" />
        </div>
        <CardTitle className="text-2xl font-bold">Member Access</CardTitle>
        <CardDescription>Enter your credentials to access your Member Hub.</CardDescription>
      </CardHeader>
      <CardContent className="px-8 pb-8 pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Mail className="h-5 w-5 text-primary" />
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="e.g., user@example.com"
              className="w-full bg-input"
              aria-label="Email Input"
              required
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="memberId" className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Shield className="h-5 w-5 text-primary" />
              Member ID
            </label>
            <Input
              id="memberId"
              type="text"
              value={memberIdInput}
              onChange={(e) => setMemberIdInput(e.target.value)}
              placeholder="e.g., MEMBER123"
              className="w-full bg-input"
              aria-label="Member ID Input"
              required
              disabled={isSubmitting}
            />
          </div>
          <Button type="submit" className="w-full !mt-8 h-12 text-base font-bold" disabled={isSubmitting}>
             {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
             Login
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
