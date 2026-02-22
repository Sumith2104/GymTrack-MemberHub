
"use client";

import type { PersonalRecord } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { formatDate } from '@/lib/utils';
import { Trophy, Info, Calendar, Repeat, Weight } from 'lucide-react';
import React from 'react';

interface PersonalRecordsListProps {
  records: PersonalRecord[];
}

export function PersonalRecordsList({ records }: PersonalRecordsListProps) {
    if (!records || records.length === 0) {
        return (
            <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>No Personal Records Found</AlertTitle>
                <AlertDescription>
                    Log some workouts with weight to see your personal records here.
                </AlertDescription>
            </Alert>
        );
    }
  
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {records.map((pr) => (
                <Card key={pr.exercise} className="p-4 flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div>
                        <h3 className="text-xl font-bold text-primary flex items-center gap-2">
                            <Trophy className="h-5 w-5" />
                            {pr.exercise}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Achieved on {formatDate(pr.date)}
                        </p>
                    </div>
                    <div className="mt-4 space-y-3">
                        <div className="flex items-baseline gap-2 p-3 bg-muted rounded-lg">
                           <Repeat className="h-5 w-5 text-muted-foreground"/>
                           <div>
                                <p className="text-sm text-muted-foreground">Estimated 1-Rep Max</p>
                                <p className="text-2xl font-bold">{Math.round(pr.estimatedOneRepMax)} kg</p>
                           </div>
                        </div>
                        <div className="flex items-baseline gap-2 p-3 bg-muted/50 rounded-lg">
                           <Weight className="h-5 w-5 text-muted-foreground"/>
                           <div>
                                <p className="text-sm text-muted-foreground">Heaviest Lift</p>
                                <p className="text-lg font-semibold">{pr.maxWeight} kg</p>
                           </div>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
}
