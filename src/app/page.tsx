
import { redirect } from 'next/navigation';
import { getMemberProfile } from '@/lib/data';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Search, Info, AlertTriangle } from "lucide-react";
import { MemberLookupForm } from '@/components/member-lookup-form';
import { HomePageHeader } from '@/components/home-page-header';

export default async function HomePage({
  searchParams,
}: {
  searchParams?: { email?: string; memberId?: string; message?: string };
}) {
  const emailParam = searchParams?.email;
  const memberIdParam = searchParams?.memberId;
  let displayError: string | undefined = undefined;

  if (emailParam && memberIdParam) {
    const member = await getMemberProfile(emailParam, memberIdParam);
    if (member) {
      // On successful login, redirect to the member dashboard
      redirect(`/me/dashboard?memberId=${encodeURIComponent(member.member_id)}&email=${encodeURIComponent(member.email)}`);
    } else {
      // If member fetch failed (e.g., wrong credentials), set an error to display on this page.
      displayError = 'Invalid email or Member ID. Please check your details and try again.';
    }
  } else if (searchParams?.message) {
    // If there's a message from client-side form validation (e.g., "Please enter both fields")
    displayError = searchParams.message;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <HomePageHeader />
      <main className="flex-1 flex flex-col items-center justify-center bg-background p-6">
        <div className="w-full max-w-md space-y-8">
          <MemberLookupForm />

          {/* Error Alert: Shows if displayError is set */}
          {displayError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" /> 
              <AlertTitle>Access Denied</AlertTitle>
              <AlertDescription>{displayError}</AlertDescription>
            </Alert>
          )}

          {/* Verifying Details Alert: Shows when actively trying to log in AND no error yet */}
          {emailParam && memberIdParam && !displayError && (
             <Alert>
               <Search className="h-4 w-4" />
               <AlertTitle>Verifying Details</AlertTitle>
               <AlertDescription>
                 Attempting to access profile...
               </AlertDescription>
             </Alert>
           )}
          
          {/* Initial welcome message: Shows on initial load if no login attempted and no error */}
          {!emailParam && !memberIdParam && !displayError && (
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
