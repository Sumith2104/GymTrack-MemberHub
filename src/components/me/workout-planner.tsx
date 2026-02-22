"use client";

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getWorkoutPlan, type WorkoutPlanOutput } from '@/app/me/workout-planner/actions';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, AlertTriangle, Sparkles, CalendarDays, Dumbbell, TrendingUp } from 'lucide-react';
import { Separator } from '../ui/separator';

const experienceLevels = ["Beginner", "Intermediate", "Advanced"] as const;

const formSchema = z.object({
  experience: z.enum(experienceLevels, { required_error: "Please select an experience level."}),
});

type FormValues = z.infer<typeof formSchema>;

export function WorkoutPlanner() {
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlanOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { control, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      experience: "Beginner",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    setError(null);
    setWorkoutPlan(null);
    try {
      const plan = await getWorkoutPlan(data.experience);
      if (!plan) {
        throw new Error('No plan found for the selected experience level.');
      }
      setWorkoutPlan(plan);
    } catch (err) {
      console.error(err);
      setError("Failed to load workout plan. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
            <CardTitle>Select Your Plan</CardTitle>
            <CardDescription>Choose your experience level to see a recommended workout plan.</CardDescription>
        </CardHeader>
        <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="experience-level">Fitness Experience Level</Label>
                    <Controller
                    name="experience"
                    control={control}
                    render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger id="experience-level">
                            <SelectValue placeholder="Select your experience" />
                        </SelectTrigger>
                        <SelectContent>
                            {experienceLevels.map(level => (
                            <SelectItem key={level} value={level}>{level}</SelectItem>
                            ))}
                        </SelectContent>
                        </Select>
                    )}
                    />
                </div>

                <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                {isLoading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Getting Plan...</>
                ) : (
                    <><Sparkles className="mr-2 h-4 w-4" /> Get Plan</>
                )}
                </Button>
            </form>
        </CardContent>
      </Card>
      
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {workoutPlan && (
        <Card className="mt-8">
            <CardHeader>
                <CardTitle className="text-2xl text-primary">{workoutPlan.title}</CardTitle>
                <CardDescription>{workoutPlan.summary}</CardDescription>
                <div className="flex flex-wrap gap-4 pt-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2"><TrendingUp className="h-4 w-4"/> {workoutPlan.weeklySchedule[0].focus} Split</div>
                    <div className="flex items-center gap-2"><CalendarDays className="h-4 w-4"/> {workoutPlan.weeklySchedule.length} days/week</div>
                </div>
            </CardHeader>
            <CardContent>
            <Separator className="my-4"/>
            <Accordion type="single" collapsible defaultValue="day-1" className="w-full">
              {workoutPlan.weeklySchedule.map((day) => (
                <AccordionItem key={day.day} value={`day-${day.day}`}>
                  <AccordionTrigger className="text-lg font-semibold">Day {day.day}: {day.focus}</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                        {day.notes && <p className="text-sm text-muted-foreground italic border-l-4 pl-4">{day.notes}</p>}
                        <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead>Exercise</TableHead>
                            <TableHead>Sets</TableHead>
                            <TableHead>Reps</TableHead>
                            <TableHead>Rest</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {day.exercises.map((exercise) => (
                            <TableRow key={exercise.name}>
                                <TableCell className="font-medium">{exercise.name}</TableCell>
                                <TableCell>{exercise.sets}</TableCell>
                                <TableCell>{exercise.reps}</TableCell>
                                <TableCell>{exercise.rest}</TableCell>
                            </TableRow>
                            ))}
                        </TableBody>
                        </Table>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
