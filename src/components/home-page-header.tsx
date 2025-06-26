
"use client";

import Link from 'next/link';
import { Dumbbell } from 'lucide-react';

export function HomePageHeader() {
    return (
        <header className="sticky top-0 z-50 flex h-16 items-center justify-between gap-4 border-b bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <Link href="/" className="flex items-center gap-2" aria-label="Member Hub Home">
                <Dumbbell className="h-7 w-7 text-primary" />
                <span className="text-xl font-semibold font-headline">Member Hub</span>
            </Link>
            <div className="flex items-center gap-1">
                {/* Intentionally empty as navigation is handled in the member area */}
            </div>
        </header>
    );
}
