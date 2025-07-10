
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ListChecks, BarChartHorizontalBig, Info } from "lucide-react";
import { getMemberProfile, getMemberCheckins } from '@/lib/data';
import type { Checkin } from '@/lib/types';
import { CheckinHistoryTable } from '@/components/me/checkin-history-table';
import dynamic from 'next/dynamic';
import { Skeleton } from "@/components/ui/skeleton";

const CheckinFrequencyChart = dynamic(() => import('@/components/me/checkin-frequency-chart').then(mod => mod.CheckinFrequencyChart), {
  ssr: false,
  loading: () => <Skeleton className="h-[300px] w-full" />,
});


export default async function CheckInsPage({
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
          <AlertTitle>Information Missing</AlertTitle>
          <AlertDescription>
            Member ID and Email are required to view check-in history. Please access this page via your profile.
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
          <Info className="h-4 w-4" />
          <AlertTitle>Member Not Found</AlertTitle>
          <AlertDescription>
            Could not retrieve profile for Member ID: {memberDisplayId}.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const checkins: Checkin[] = await getMemberCheckins(member.member_id);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListChecks className="h-6 w-6 text-primary" />
            Check-in History for {member.name}
          </CardTitle>
          <CardDescription>
            Review your recent visits to the gym.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CheckinHistoryTable checkins={checkins} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChartHorizontalBig className="h-6 w-6 text-primary" />
            Monthly Check-in Frequency
          </CardTitle>
          <CardDescription>
            Visualize your gym visits over the past months.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CheckinFrequencyChart checkins={checkins} />
        </CardContent>
      </Card>
    </div>
  );
}
