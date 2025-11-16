

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Weight, Dumbbell, BarChart3, TrendingUp, LineChart } from "lucide-react";
import { LogWorkoutForm } from "@/components/me/log-workout-form";
import { getMemberProfile, getMemberWorkouts, getMemberBodyWeightLogs, calculatePersonalRecords, getMemberCheckins, calculateWorkoutStreak } from '@/lib/data';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, UserSearch } from "lucide-react";
import Link from 'next/link';
import { WorkoutLogTable } from "@/components/me/workout-log-table";
import { BodyWeightTracker } from "@/components/me/body-weight-tracker";
import { PersonalRecordsList } from "@/components/me/personal-records-list";
import { WorkoutOverview } from "@/components/me/workout-overview";

export default async function WorkoutTrackingPage({
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
            Member ID and Email are required to view workout tracking. Please access this page via your dashboard.
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
          <AlertTitle>Cannot Load Page</AlertTitle>
          <AlertDescription>
            Could not retrieve your profile. Please check your login details or use the 
            <Link href="/" className="underline hover:text-destructive-foreground/80"> main lookup page</Link>.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  const workouts = await getMemberWorkouts(member.id);
  const bodyWeightLogs = await getMemberBodyWeightLogs(member.id);
  const personalRecords = calculatePersonalRecords(workouts);
  const checkins = await getMemberCheckins(member.member_id);
  const streak = calculateWorkoutStreak(checkins);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-3">
            <Weight className="h-8 w-8 text-primary" />
            Workout Tracking
        </h1>
        <LogWorkoutForm memberId={member.id} />
      </div>
      
      <p className="text-muted-foreground">
        Track your workouts, monitor your body weight, and view your progress over time.
      </p>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="log" className="flex items-center gap-2">
            <Dumbbell className="h-4 w-4" />
            <span className="hidden sm:inline">Workout Log</span>
          </TabsTrigger>
          <TabsTrigger value="weight" className="flex items-center gap-2">
            <LineChart className="h-4 w-4" />
            <span className="hidden sm:inline">Weight</span>
          </TabsTrigger>
          <TabsTrigger value="prs" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Personal Records</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
            <WorkoutOverview
              workouts={workouts}
              bodyWeightLogs={bodyWeightLogs}
              personalRecords={personalRecords}
              streak={streak}
            />
        </TabsContent>

        <TabsContent value="log">
          <Card>
            <CardHeader>
              <CardTitle>Workout Log</CardTitle>
              <CardDescription>
                A detailed history of your logged workout sessions.
              </CardDescription>
            </CardHeader>
            <CardContent>
                <WorkoutLogTable workouts={workouts} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weight">
           <BodyWeightTracker initialLogs={bodyWeightLogs} memberId={member.id} />
        </TabsContent>

        <TabsContent value="prs">
          <Card>
            <CardHeader>
              <CardTitle>Personal Records</CardTitle>
              <CardDescription>
                Your best lifts and performance milestones, with estimated 1-Rep Max (1RM).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PersonalRecordsList records={personalRecords} />
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
