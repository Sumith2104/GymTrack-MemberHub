import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell } from "lucide-react";
import { WorkoutPlanner } from "@/components/me/workout-planner";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

function PlannerFallback() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-10 w-1/4" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-1/4" />
            <Skeleton className="h-24 w-full" />
        </div>
    );
}

export default function WorkoutPlannerPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Dumbbell className="h-6 w-6 text-primary" />
            Workout Planner
          </CardTitle>
          <CardDescription>
            Select your experience level to get a pre-built workout plan.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <Suspense fallback={<PlannerFallback />}>
                <WorkoutPlanner />
            </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
