
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Weight, Dumbbell, BarChart3, TrendingUp, LineChart, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function WorkoutTrackingPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-3">
            <Weight className="h-8 w-8 text-primary" />
            Workout Tracking
        </h1>
        <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Log New Workout
        </Button>
      </div>
      
      <p className="text-muted-foreground">
        Track your workouts, monitor your body weight, and view your progress over time.
      </p>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview"><BarChart3 className="w-4 h-4 mr-2"/>Overview</TabsTrigger>
          <TabsTrigger value="log"><Dumbbell className="w-4 h-4 mr-2"/>Workout Log</TabsTrigger>
          <TabsTrigger value="weight"><LineChart className="w-4 h-4 mr-2"/>Weight</TabsTrigger>
          <TabsTrigger value="prs"><TrendingUp className="w-4 h-4 mr-2"/>Personal Records</TabsTrigger>
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
              </CardDescription>
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
