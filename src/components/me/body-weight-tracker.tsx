
"use client";

import type { BodyWeightLog } from '@/lib/types';
import { useState, useEffect } from 'react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from 'date-fns';
import { logWeightAction, type LogWeightState } from '@/app/me/workout-tracking/actions';
import { PlusCircle, Loader2, Info } from 'lucide-react';

interface BodyWeightTrackerProps {
    initialLogs: BodyWeightLog[];
    memberId: string;
}

const chartConfig = {
  weight: {
    label: "Weight (kg)",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

const initialState: LogWeightState = { success: false, message: '' };

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending} className="w-full">
            {pending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
            ) : (
                <><PlusCircle className="mr-2 h-4 w-4" /> Add Entry</>
            )}
        </Button>
    )
}

export function BodyWeightTracker({ initialLogs, memberId }: BodyWeightTrackerProps) {
    const [logs, setLogs] = useState(initialLogs);
    const { toast } = useToast();
    const [actionState, formAction] = useActionState(logWeightAction, initialState);
    
    const chartData = logs.map(log => ({
        date: format(parseISO(log.date), 'MMM d'),
        weight: log.weight,
    }));
    
    useEffect(() => {
        if (actionState.success && actionState.data) {
            setLogs(prevLogs => [...prevLogs, actionState.data!].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
            toast({ title: "Success", description: "New weight entry added." });
        } else if (!actionState.success && actionState.message && actionState.message !== 'Invalid input.') {
             toast({ title: "Error", description: actionState.message, variant: 'destructive' });
        }
    }, [actionState, toast]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Body Weight Tracker</CardTitle>
                <CardDescription>Monitor your body weight changes over time.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {logs.length > 1 ? (
                    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                                <YAxis domain={['dataMin - 2', 'dataMax + 2']} tickLine={false} axisLine={false} tickMargin={8} />
                                <Tooltip content={<ChartTooltipContent />} />
                                <Line type="monotone" dataKey="weight" stroke="var(--color-weight)" strokeWidth={2} dot={true} />
                            </LineChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                ) : (
                    <Alert>
                        <Info className="h-4 w-4" />
                        <AlertTitle>Not Enough Data</AlertTitle>
                        <AlertDescription>Log at least two weight entries to see a progress chart.</AlertDescription>
                    </Alert>
                )}
            </CardContent>
            <CardFooter>
                 <form action={formAction} className="w-full max-w-sm mx-auto space-y-4 p-4 border rounded-lg">
                    <h4 className="font-semibold text-center">Log New Weight Entry</h4>
                    <input type="hidden" name="memberId" value={memberId} />
                    <input type="hidden" name="date" value={new Date().toISOString().split('T')[0]} />
                    <div className="space-y-2">
                        <Label htmlFor="weight-input">Today's Weight (kg)</Label>
                        <Input 
                            id="weight-input"
                            name="weight"
                            type="number"
                            step="0.1"
                            placeholder="e.g., 75.5"
                            required
                        />
                        {actionState.errors?.weight && <p className="text-sm text-destructive">{actionState.errors.weight}</p>}
                    </div>
                    <SubmitButton />
                </form>
            </CardFooter>
        </Card>
    );
}
