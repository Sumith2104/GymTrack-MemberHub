
"use client";

import type { Checkin } from '@/lib/types';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { format } from 'date-fns';

interface CheckinFrequencyChartProps {
  checkins: Checkin[];
}

interface MonthlyCheckinData {
  month: string; // e.g., "Jan 2024"
  visits: number;
}

const processCheckinDataForChart = (checkins: Checkin[]): MonthlyCheckinData[] => {
  if (!checkins || checkins.length === 0) {
    return [];
  }

  const monthlyCounts: { [key: string]: number } = {};

  checkins.forEach((checkin) => {
    try {
      const monthYear = format(new Date(checkin.check_in_time), 'MMM yyyy');
      monthlyCounts[monthYear] = (monthlyCounts[monthYear] || 0) + 1;
    } catch (error) {
      console.error("Error processing date for chart:", checkin.check_in_time, error);
    }
  });

  // Sort by date for chronological order on the chart
  const sortedMonths = Object.keys(monthlyCounts).sort((a, b) => {
    return new Date(a).getTime() - new Date(b).getTime();
  });
  
  // Limit to last 12 months for better readability, or adjust as needed
  const recentMonths = sortedMonths.slice(-12);

  return recentMonths.map((monthYear) => ({
    month: monthYear,
    visits: monthlyCounts[monthYear],
  }));
};


const chartConfig = {
  visits: {
    label: "Visits",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function CheckinFrequencyChart({ checkins }: CheckinFrequencyChartProps) {
  const chartData = processCheckinDataForChart(checkins);

  if (chartData.length === 0) {
    return <p className="text-muted-foreground">Not enough data for check-in frequency chart.</p>;
  }

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            // tickFormatter={(value) => value.slice(0, 3)} // Abbreviate month name if needed
          />
          <YAxis 
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            allowDecimals={false} // Ensure whole numbers for visit counts
           />
           <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Bar dataKey="visits" fill="var(--color-visits)" radius={4} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
