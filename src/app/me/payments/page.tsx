
import { getMemberProfile } from '@/lib/data';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, UserSearch, CreditCard } from "lucide-react";
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const PaymentForm = dynamic(() => import('@/components/me/payment-form').then(mod => mod.PaymentForm), {
  ssr: false,
  loading: () => <PaymentFormSkeleton />,
});

function PaymentFormSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-1/3" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="pt-4 space-y-2">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
      <div className="pt-2">
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
}

export default async function PaymentsPage({
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
            Member ID and Email are required to view the payments page. Please access this page via your dashboard.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const member = await getMemberProfile(email, memberDisplayId);

  if (!member || !member.gym_id || !member.payment_id) {
    return (
      <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <Alert variant="destructive">
          <UserSearch className="h-4 w-4" />
          <AlertTitle>Cannot Load Payments</AlertTitle>
          <AlertDescription>
            Could not retrieve your complete profile details or payment information for your gym. Please contact support.
            You can return to the <Link href="/" className="underline hover:text-destructive-foreground/80"> main lookup page</Link>.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
       <h1 className="text-3xl font-bold flex items-center gap-3">
          <CreditCard className="h-8 w-8 text-primary" />
          Payments
      </h1>
      <PaymentForm member={member} />
    </div>
  );
}
