"use client";

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generateWorkoutPlan, type WorkoutPlanOutput } from '@/ai/flows/workout-planner-flow';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
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

const fitnessGoals = [
  { id: "build-muscle", label: "Build Muscle" },
  { id: "lose-fat", label: "Lose Fat" },
  { id: "improve-endurance", label: "Improve Endurance" },
  { id: "increase-strength", label: "Increase Strength" },
  { id: "general-fitness", label: "General Fitness" },
];

const experienceLevels = ["Beginner", "Intermediate", "Advanced"] as const;
const daysPerWeekOptions = ["1", "2", "3", "4", "5", "6", "7"];

const formSchema = z.object({
  goals: z.array(z.string()).refine(value => value.some(item => item), {
    message: "You have to select at least one goal.",
  }),
  experience: z.enum(experienceLevels),
  daysPerWeek: z.string().refine(val => daysPerWeekOptions.includes(val), { message: "Please select number of days." }),
});

type FormValues = z.infer<typeof formSchema>;

export function WorkoutPlanner() {
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlanOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { control, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      goals: [],
      experience: "Beginner",
      daysPerWeek: "3",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    setError(null);
    setWorkoutPlan(null);
    try {
      const plan = await generateWorkoutPlan({
        ...data,
        daysPerWeek: parseInt(data.daysPerWeek, 10),
      });
      setWorkoutPlan(plan);
    } catch (err) {
      console.error(err);
      setError("Failed to generate workout plan. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
            <CardTitle>Create Your Plan</CardTitle>
            <CardDescription>Fill out the form below to get a customized workout plan.</CardDescription>
        </CardHeader>
        <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                <Label>What are your fitness goals?</Label>
                <Controller
                    name="goals"
                    control={control}
                    render={({ field }) => (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {fitnessGoals.map((item) => (
                        <div key={item.id} className="flex items-center space-x-2">
                            <Checkbox
                            id={item.id}
                            checked={field.value?.includes(item.label)}
                            onCheckedChange={(checked) => {
                                return checked
                                ? field.onChange([...field.value, item.label])
                                : field.onChange(
                                    field.value?.filter(
                                    (value) => value !== item.label
                                    )
                                );
                            }}
                            />
                            <label htmlFor={item.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            {item.label}
                            </label>
                        </div>
                        ))}
                    </div>
                    )}
                />
                {errors.goals && <p className="text-sm font-medium text-destructive">{errors.goals.message}</p>}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                    <div className="space-y-2">
                        <Label htmlFor="days-per-week">Workout Days Per Week</Label>
                        <Controller
                        name="daysPerWeek"
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger id="days-per-week">
                                <SelectValue placeholder="Select days" />
                            </SelectTrigger>
                            <SelectContent>
                                {daysPerWeekOptions.map(day => (
                                <SelectItem key={day} value={day}>{day} Day{parseInt(day) > 1 ? 's' : ''}</SelectItem>
                                ))}
                            </SelectContent>
                            </Select>
                        )}
                        />
                    </div>
                </div>

                <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                {isLoading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating Plan...</>
                ) : (
                    <><Sparkles className="mr-2 h-4 w-4" /> Generate Plan</>
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
                    <div className="flex items-center gap-2"><Dumbbell className="h-4 w-4"/> Beginner Friendly</div>
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
