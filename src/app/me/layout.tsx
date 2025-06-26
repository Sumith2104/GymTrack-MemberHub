
import type { Metadata } from 'next';
import { MemberHubHeader } from '@/components/me/member-hub-header';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'GymTrack Lite - Member Hub',
  description: 'Your personal member area for GymTrack Lite.',
};

function HeaderFallback() {
  return <header className="sticky top-0 z-50 h-16 border-b bg-background" />;
}

export default function MemberHubLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Suspense fallback={<HeaderFallback />}>
        <MemberHubHeader />
      </Suspense>
      <main className="flex-1 p-6 bg-background">
        {children}
      </main>
    </div>
  );
}
