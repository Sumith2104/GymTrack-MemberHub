
import { MemberProfileCard } from '@/components/me/member-profile-card';
import { getMemberProfile } from '@/lib/data';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, Info, UserSearch } from "lucide-react";
import Link from 'next/link';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: { memberId?: string; email?: string };
}) {
  const memberDisplayId = searchParams?.memberId;
  const email = searchParams?.email;

  if (!memberDisplayId || !email) {
    return (
      <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <Alert variant="destructive">
          <Info className="h-4 w-4" />
          <AlertTitle>Member Information Missing</AlertTitle>
          <AlertDescription>
            Member ID and Email are required to view the dashboard. Please access this page via the 
            <Link href="/" className="underline hover:text-destructive-foreground/80"> main lookup page</Link>.
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
          <AlertTitle>Member Not Found</AlertTitle>
          <AlertDescription>
            Could not retrieve profile for Member ID: {memberDisplayId} and Email: {email}. 
            Please check the details or use the 
            <Link href="/" className="underline hover:text-destructive-foreground/80"> main lookup page</Link>.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <MemberProfileCard member={member} />
    </div>
  );
}
