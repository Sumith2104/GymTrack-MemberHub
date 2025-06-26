import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Megaphone, Info, UserSearch } from "lucide-react";
import { getGymAnnouncements, getMemberProfile } from '@/lib/data';
import type { Announcement } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import { Separator } from "@/components/ui/separator";
import React from "react";

export default async function AnnouncementsPage({
  searchParams,
}: {
  searchParams?: { memberId?: string; email?: string };
}) {
  const memberDisplayId = searchParams?.memberId;
  const email = searchParams?.email;

  if (!memberDisplayId || !email) {
    return (
      <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <Alert variant="destructive">
          <Info className="h-4 w-4" />
          <AlertTitle>Information Missing</AlertTitle>
          <AlertDescription>
            Member ID and Email are required to view announcements. Please access this page via your dashboard.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const member = await getMemberProfile(email, memberDisplayId);

  if (!member || !member.gym_id) {
    return (
      <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <Alert variant="destructive">
          <UserSearch className="h-4 w-4" />
          <AlertTitle>Cannot Load Announcements</AlertTitle>
          <AlertDescription>
            Could not retrieve your complete profile details required for announcements. Please check your login details or use the 
            <Link href="/" className="underline hover:text-destructive-foreground/80"> main lookup page</Link>.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const announcements: Announcement[] = await getGymAnnouncements(member.gym_id);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Megaphone className="h-6 w-6 text-primary" />
            Gym Announcements
          </CardTitle>
        </CardHeader>
        <CardContent>
          {announcements.length === 0 ? (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>No Announcements</AlertTitle>
              <AlertDescription>
                There are no new announcements at this time. Please check back later.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-6">
              {announcements.map((announcement, index) => (
                <React.Fragment key={announcement.id}>
                  <div className="space-y-1">
                    <h3 className="text-xl font-semibold">{announcement.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      Posted on: {formatDate(announcement.created_at, { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                    </p>
                    <p className="text-foreground whitespace-pre-wrap pt-2">{announcement.content}</p>
                  </div>
                  {index < announcements.length - 1 && <Separator />}
                </React.Fragment>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
