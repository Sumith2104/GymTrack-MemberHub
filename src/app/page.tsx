
import { redirect } from 'next/navigation';
import { getMemberProfile } from '@/lib/data';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Search, Info, AlertTriangle } from "lucide-react";
import { MemberLookupForm } from '@/components/member-lookup-form';
import { HomePageHeader } from '@/components/home-page-header';

export default async function HomePage({
  searchParams,
}: {
  searchParams?: { email?: string; memberId?: string; message?: string; error?: string };
}) {
  const emailParam = searchParams?.email;
  const memberIdParam = searchParams?.memberId;
  let displayError = searchParams?.error || searchParams?.message;

  if (emailParam && memberIdParam) {
    const member = await getMemberProfile(emailParam, memberIdParam);
    if (member) {
      redirect(`/me/dashboard?memberId=${encodeURIComponent(member.member_id)}&email=${encodeURIComponent(member.email)}`);
    } else {
      // If the profile wasn't found, we redirect back to the home page with an error.
      // This prevents the user from being stuck on a URL with invalid lookup params.
      redirect(`/?error=${encodeURIComponent('Invalid email or Member ID. Please check your details and try again.')}`);
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <HomePageHeader />
      <main className="flex-1 flex flex-col items-center justify-center bg-background p-6">
        <div className="w-full max-w-md space-y-8">
          <MemberLookupForm />

          {displayError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" /> 
              <AlertTitle>Access Denied</AlertTitle>
              <AlertDescription>{displayError}</AlertDescription>
            </Alert>
          )}

          {!displayError && (
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
