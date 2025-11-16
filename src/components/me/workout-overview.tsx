

"use client";

import type { Workout, BodyWeightLog, PersonalRecord } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell, Weight, Trophy, Flame } from 'lucide-react';
import { useMemo } from 'react';

interface WorkoutOverviewProps {
    workouts: Workout[];
    bodyWeightLogs: BodyWeightLog[];
    personalRecords: PersonalRecord[];
    streak: number;
}

interface StatCardProps {
    title: string;
    value: string;
    icon: React.ElementType;
    description: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, description }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-muted-foreground">{description}</p>
        </CardContent>
    </Card>
);

export function WorkoutOverview({ workouts, bodyWeightLogs, personalRecords, streak }: WorkoutOverviewProps) {
    const totalWorkouts = workouts.length;

    const latestWeight = useMemo(() => {
        if (bodyWeightLogs.length === 0) return "N/A";
        return `${bodyWeightLogs[bodyWeightLogs.length - 1].weight.toFixed(1)} kg`;
    }, [bodyWeightLogs]);
    
    const topPR = useMemo(() => {
        if (personalRecords.length === 0) return "N/A";
        const sorted = [...personalRecords].sort((a,b) => b.estimatedOneRepMax - a.estimatedOneRepMax);
        return `${sorted[0].exercise}`;
    }, [personalRecords]);

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
                title="Total Workouts"
                value={totalWorkouts.toString()}
                icon={Dumbbell}
                description="Total number of logged sessions."
            />
            <StatCard
                title="Current Weight"
                value={latestWeight}
                icon={Weight}
                description="Your most recently logged body weight."
            />
            <StatCard
                title="Top Lift"
                value={topPR}
                icon={Trophy}
                description="Your best lift by estimated 1RM."
            />
             <StatCard
                title="Workout Streak"
                value={`${streak} Day${streak === 1 ? '' : 's'}`}
                icon={Flame}
                description="Consecutive days with a check-in."
            />
        </div>
    );
}
