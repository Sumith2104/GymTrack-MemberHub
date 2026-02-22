
"use client";

import type { Checkin } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from '@/components/ui/table';
import { useState, useEffect } from 'react';
import { Separator } from '@/components/ui/separator';
import React from 'react';

interface CheckinHistoryTableProps {
  checkins: Checkin[];
}

interface GroupedCheckins {
  [key: string]: Checkin[];
}

const ClientFormattedDate: React.FC<{ dateString: string | null | undefined; options?: Intl.DateTimeFormatOptions; fallback?: string }> = ({ dateString, options, fallback = 'N/A' }) => {
  const [formattedDate, setFormattedDate] = useState<string | null>(null);

  useEffect(() => {
    if (dateString) {
      setFormattedDate(formatDate(dateString, options));
    } else {
      setFormattedDate(fallback);
    }
  }, [dateString, options, fallback]);

  return <>{formattedDate === null ? '...' : formattedDate}</>;
};

export function CheckinHistoryTable({ checkins }: CheckinHistoryTableProps) {
  const [groupedCheckins, setGroupedCheckins] = useState<GroupedCheckins>({});

  useEffect(() => {
    const processCheckins = (data: Checkin[]) => {
      const groups: GroupedCheckins = {};
      data.forEach(checkin => {
        const monthYear = formatDate(checkin.check_in_time, { month: 'long', year: 'numeric' });
        if (!groups[monthYear]) {
          groups[monthYear] = [];
        }
        groups[monthYear].push(checkin);
      });
      return groups;
    };
    setGroupedCheckins(processCheckins(checkins));
  }, [checkins]);

  if (!checkins || checkins.length === 0) {
    return <p className="text-muted-foreground">No check-in history found.</p>;
  }

  const dateTimeFormatOptions: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  };

  const dayFormatOptions: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  };

  const timeFormatOptions: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  };


  return (
    <div className="space-y-6">
      {Object.entries(groupedCheckins).map(([month, monthCheckins], index) => (
        <div key={month}>
          <h3 className="text-xl font-semibold mb-4 text-primary">{month}</h3>
          <div className="border rounded-lg">
            <Table>
              {index === 0 && <TableCaption>A list of your recent gym check-ins, grouped by month.</TableCaption>}
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/3 sm:w-1/2">Day</TableHead>
                  <TableHead className="text-center">Check-in</TableHead>
                  <TableHead className="text-center">Check-out</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthCheckins.map((checkin) => (
                  <TableRow key={checkin.id}>
                    <TableCell className="font-medium whitespace-nowrap">
                      <ClientFormattedDate dateString={checkin.check_in_time} options={dayFormatOptions} />
                    </TableCell>
                    <TableCell className="text-center whitespace-nowrap">
                       <ClientFormattedDate dateString={checkin.check_in_time} options={timeFormatOptions} />
                    </TableCell>
                    <TableCell className="text-center whitespace-nowrap">
                      <ClientFormattedDate dateString={checkin.check_out_time} options={timeFormatOptions} fallback="N/A" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ))}
    </div>
  );
}
