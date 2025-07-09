
import { getMemberProfile } from '@/lib/data';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, UserSearch, Settings } from "lucide-react";
import { ChangeEmailForm } from '@/components/me/change-email-form';
import { UpdateProfileForm } from '@/components/me/update-profile-form';
import Link from 'next/link';

export default async function SettingsPage({
  searchParams,
}: {
  searchParams?: { memberId?: string; email?: string; updated?: string };
}) {
    const memberDisplayId = searchParams?.memberId;
    const email = searchParams?.email;

    if (!memberDisplayId || !email) {
        return (
          <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
            <Alert variant="destructive">
              <Info className="h-4 w-4" />
              <AlertTitle>Information Missing</AlertTitle>
              <AlertDescription>
                Member ID and Email are required to view settings. Please access this page via your dashboard.
              </AlertDescription>
            </Alert>
          </div>
        );
    }
  
    const member = await getMemberProfile(email, memberDisplayId);

    if (!member) {
      return (
        <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
          <Alert variant="destructive">
            <UserSearch className="h-4 w-4" />
            <AlertTitle>Cannot Load Settings</AlertTitle>
            <AlertDescription>
              Could not retrieve your profile. Please check your login details or use the 
              <Link href="/" className="underline hover:text-destructive-foreground/80"> main lookup page</Link>.
            </AlertDescription>
          </Alert>
        </div>
      );
    }

  return (
    <div className="space-y-6">
       <h1 className="text-3xl font-bold flex items-center gap-3">
          <Settings className="h-8 w-8 text-primary" />
          Settings
      </h1>
      <UpdateProfileForm member={member} />
      <ChangeEmailForm member={member} />
    </div>
  );
}
