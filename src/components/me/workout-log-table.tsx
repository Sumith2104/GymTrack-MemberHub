
"use client";

import type { Workout } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, Calendar, StickyNote, Dumbbell } from 'lucide-react';
import React from 'react';

interface WorkoutLogTableProps {
  workouts: Workout[];
}

export function WorkoutLogTable({ workouts }: WorkoutLogTableProps) {
  if (!workouts || workouts.length === 0) {
    return (
        <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>No Workouts Logged</AlertTitle>
            <AlertDescription>
                You haven't logged any workouts yet. Click the "Log New Workout" button to get started.
            </AlertDescription>
        </Alert>
    );
  }

  return (
    <Accordion type="multiple" className="w-full space-y-4">
      {workouts.map((workout, index) => (
        <AccordionItem value={`item-${index}`} key={workout.id} className="border rounded-lg px-4 bg-card">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex justify-between items-center w-full pr-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-primary"/>
                <span className="font-bold text-lg">
                  {formatDate(workout.date, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
              <span className="text-sm text-muted-foreground hidden sm:block">
                {workout.exercises.length} exercises
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-4">
            {workout.notes && (
                <div className="flex items-start gap-3 p-3 mb-4 text-sm italic border bg-muted/50 rounded-lg">
                    <StickyNote className="h-4 w-4 mt-1 flex-shrink-0" />
                    <p>{workout.notes}</p>
                </div>
            )}
             <div className="border rounded-lg overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Exercise</TableHead>
                        <TableHead className="text-center">Sets</TableHead>
                        <TableHead className="text-center">Reps</TableHead>
                        <TableHead className="text-right">Weight (kg)</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {workout.exercises.map((exercise) => (
                        <TableRow key={exercise.id}>
                            <TableCell className="font-medium">{exercise.name}</TableCell>
                            <TableCell className="text-center">{exercise.sets}</TableCell>
                            <TableCell className="text-center">{exercise.reps}</TableCell>
                            <TableCell className="text-right">{exercise.weight}</TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
