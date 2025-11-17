
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, AlertTriangle, Loader2 } from "lucide-react";
import { MemberLookupForm } from '@/components/member-lookup-form';
import { HomePageHeader } from '@/components/home-page-header';
import { useUser, useAuth } from '@/firebase';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { getMemberProfile } from '@/lib/data';

export default function HomePage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);

  useEffect(() => {
    if (!isUserLoading && user) {
      // If user is already signed in, check for member details in sessionStorage
      const memberId = sessionStorage.getItem('memberId');
      const email = sessionStorage.getItem('email');
      if (memberId && email) {
        router.push(`/me/dashboard?memberId=${encodeURIComponent(memberId)}&email=${encodeURIComponent(email)}`);
      }
    }
  }, [user, isUserLoading, router]);

  const handleLookup = async (email: string, memberId: string) => {
    setIsLookingUp(true);
    setError(null);
    try {
      // Non-blocking sign-in
      initiateAnonymousSignIn(auth);

      const member = await getMemberProfile(email, memberId);
      if (member) {
        // Store details in sessionStorage to persist across page reloads
        sessionStorage.setItem('memberId', member.member_id);
        sessionStorage.setItem('email', member.email);
        
        // We don't wait for sign-in, just redirect. 
        // The auth state listener will handle the rest.
        router.push(`/me/dashboard?memberId=${encodeURIComponent(member.member_id)}&email=${encodeURIComponent(member.email)}`);

      } else {
        setError('Invalid email or Member ID. Please check your details and try again.');
        setIsLookingUp(false);
      }
    } catch (e) {
      setError('An unexpected error occurred. Please try again.');
      setIsLookingUp(false);
    }
  };
  
  // Display a loading state while checking auth status or redirecting
  if (isUserLoading || (user && sessionStorage.getItem('memberId'))) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading your session...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <HomePageHeader />
      <main className="flex-1 flex flex-col items-center justify-center bg-background p-6">
        <div className="w-full max-w-md space-y-8">
          <MemberLookupForm onLookup={handleLookup} isSubmitting={isLookingUp} />

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" /> 
              <AlertTitle>Access Denied</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!error && (
            <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Welcome to Member Hub</AlertTitle>
                <AlertDescription>
                    Please enter your email and Member ID above to access your profile.
                </AlertDescription>
            </Alert>
          )}
        </div>
      </main>
    </div>
  );
}
