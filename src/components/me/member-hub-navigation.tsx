
"use client";

import Link from 'next/link';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  ListChecks, 
  Megaphone, 
  Menu,
  Dumbbell,
  MessageSquare,
  LogOut,
  CreditCard,
  Settings,
  Sparkles,
  Weight,
  Bot
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export function MemberHubNavigation() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const memberId = searchParams.get('memberId');
  const email = searchParams.get('email');
  
  const constructMemberUrl = (basePath: string) => {
    if (memberId && email) {
      return `${basePath}?memberId=${encodeURIComponent(memberId)}&email=${encodeURIComponent(email)}`;
    }
    return basePath;
  };

  const handleLogout = () => {
    router.push('/');
  };

  const navLinks = [
    { href: "/me/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/me/check-ins", icon: ListChecks, label: "Check-ins" },
    { href: "/me/announcements", icon: Megaphone, label: "Announcements" },
    { href: "/me/messages", icon: MessageSquare, label: "Messages" },
    { href: "/me/workout-planner", icon: Sparkles, label: "Workout Planner" },
    { href: "/me/workout-tracking", icon: Weight, label: "Workout Tracking" },
    { href: "/me/chatbot", icon: Bot, label: "Chatbot" },
    { href: "/me/payments", icon: CreditCard, label: "Payments" },
    { href: "/me/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <>
      {/* Desktop Navigation: Visible on medium screens and up */}
      <nav className="hidden md:flex items-center gap-1">
        {navLinks.map(link => (
            <Link key={link.href} href={constructMemberUrl(link.href)} passHref>
              <Button variant="ghost" size="sm" className="text-sm px-3 py-2 gap-1">
                <link.icon className="h-4 w-4" />
                <span>{link.label}</span>
              </Button>
            </Link>
        ))}
        <Button onClick={handleLogout} variant="ghost" size="sm" className="text-sm px-3 py-2 gap-1">
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
        </Button>
      </nav>

      {/* Mobile Navigation: Burger menu */}
      <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 max-w-[280px]">
              <SheetHeader className="p-6 pb-4 border-b">
                <SheetTitle asChild>
                  <Link
                    href={constructMemberUrl("/me/dashboard")}
                    className="flex items-center gap-2 text-lg font-semibold"
                  >
                    <Dumbbell className="h-6 w-6 text-primary" />
                    <span>Member Hub</span>
                  </Link>
                </SheetTitle>
              </SheetHeader>
              <nav className="grid gap-4 text-base font-medium p-6">
                {navLinks.map(link => (
                    <SheetClose asChild key={link.href}>
                      <Link
                        href={constructMemberUrl(link.href)}
                        className="flex items-center gap-4 px-2.5 py-2 text-muted-foreground hover:text-foreground rounded-lg"
                      >
                        <link.icon className="h-5 w-5" />
                        {link.label}
                      </Link>
                    </SheetClose>
                ))}
                 <SheetClose asChild>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-4 px-2.5 py-2 text-muted-foreground hover:text-foreground rounded-lg w-full text-left"
                      >
                        <LogOut className="h-5 w-5" />
                        Logout
                      </button>
                  </SheetClose>
              </nav>
            </SheetContent>
          </Sheet>
      </div>
    </>
  );
}
