
"use client";

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Dumbbell } from 'lucide-react';
import { MemberHubNavigation } from '@/components/me/member-hub-navigation';

export function MemberHubHeader() {
  const searchParams = useSearchParams();

  const memberId = searchParams.get('memberId');
  const email = searchParams.get('email');

  const constructDashboardUrl = () => {
    if (memberId && email) {
      return `/me/dashboard?memberId=${encodeURIComponent(memberId)}&email=${encodeURIComponent(email)}`;
    }
    return '/me/dashboard';
  };

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between gap-4 border-b bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Left Side: Logo/Title */}
      <Link href={constructDashboardUrl()} className="flex items-center gap-2" aria-label="Member Hub Dashboard">
        <Dumbbell className="h-7 w-7 text-primary" />
        <span className="text-xl font-semibold font-headline">Member Hub</span>
      </Link>

      {/* Right Side: Navigation */}
      <div className="flex items-center gap-2">
        <MemberHubNavigation />
      </div>
    </header>
  );
}
