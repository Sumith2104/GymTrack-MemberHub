
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Weight, Dumbbell, BarChart3, TrendingUp, LineChart } from "lucide-react";
import { LogWorkoutForm } from "@/components/me/log-workout-form";
import { getMemberProfile } from '@/lib/data';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, UserSearch } from "lucide-react";
import Link from 'next/link';

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
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
            <Card>
                <CardHeader>
                <CardTitle>Workout Overview</CardTitle>
                <CardDescription>
                    Analytics and summary of your workout progress. 
                    Implementation is pending.
                </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    <p className="text-muted-foreground">Charts and stats will be displayed here.</p>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="log">
          <Card>
            <CardHeader>
              <CardTitle>Workout Log</CardTitle>
              <CardDescription>
                A detailed history of your logged workout sessions.
                Implementation is pending.
              </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">A table of your past workouts will be shown here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weight">
          <Card>
            <CardHeader>
              <CardTitle>Body Weight Tracker</CardTitle>
              <CardDescription>
                Monitor your body weight changes over time.
                Implementation is pending.
              </d'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useMediaQuery } from '@/hooks/use-media-query';

const data = [
  { name: 'Jan', desktop: 186, mobile: 80 },
  { name: 'Feb', desktop: 305, mobile: 200 },
  { name: 'Mar', desktop: 237, mobile: 120 },
  { name: 'Apr', desktop: 73, mobile: 190 },
  { name: 'May', desktop: 209, mobile: 130 },
  { name: 'Jun', desktop: 214, mobile: 140 },
];

export function RecentSales() {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip />
        <Legend />
        <Bar dataKey="desktop" fill="#adfa1d" radius={[4, 4, 0, 0]} />
        {isDesktop && (
          <Bar dataKey="mobile" fill="#1d82fa" radius={[4, 4, 0, 0]} />
        )}
      </BarChart>
    </ResponsiveContainer>
  );
}
escription>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-muted-foreground">A chart of your weight log and an input form will be available here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prs">
          <Card>
            <CardHeader>
              <CardTitle>Personal Records</CardTitle>
              <CardDescription>
                Your best lifts and performance milestones.
                Implementation is pending.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">A list of your personal records for major lifts will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
