
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

interface CheckinHistoryTableProps {
  checkins: Checkin[];
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

  return (
    <Table>
      <TableCaption>A list of your recent gym check-ins.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-1/2">Check-in</TableHead>
          <TableHead className="w-1/2">Check-out</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {checkins.map((checkin) => (
          <TableRow key={checkin.id}>
            <TableCell className="font-medium whitespace-nowrap">
              <ClientFormattedDate dateString={checkin.check_in_time} options={dateTimeFormatOptions} />
            </TableCell>
            <TableCell className="whitespace-nowrap">
              <ClientFormattedDate dateString={checkin.check_out_time} options={dateTimeFormatOptions} fallback="N/A" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
