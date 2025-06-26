"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ListChecks, Megaphone, Dumbbell } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';

const navItems = [
  { href: '/me/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/me/check-ins', label: 'Check-ins', icon: ListChecks },
  { href: '/me/announcements', label: 'Announcements', icon: Megaphone },
];

export function MemberNav() {
  const pathname = usePathname();
  const { open } = useSidebar();

  return (
    <>
      <SidebarHeader className="p-4">
          <Link href="/me/dashboard" className="flex items-center gap-2">
              <Dumbbell className={cn("transition-all duration-300 ease-in-out", open ? "size-8 rotate-[30deg]" : "size-7")} />
              <h1 className={cn("font-headline font-semibold text-xl transition-opacity duration-200", open ? "opacity-100" : "opacity-0")}>
                  GymTrack Lite
              </h1>
          </Link>
      </SidebarHeader>
      <SidebarContent className="p-4">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} passHref legacyBehavior>
                <SidebarMenuButton
                  isActive={pathname === item.href}
                  className="w-full justify-start"
                  tooltip={open ? undefined : item.label}
                >
                  <item.icon className="h-5 w-5" />
                  <span className={cn(open ? "opacity-100" : "opacity-0 delay-200")}>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4 mt-auto">
          <p className={cn("text-xs text-sidebar-foreground/70", open ? "opacity-100" : "opacity-0")}>
              &copy; {new Date().getFullYear()} GymTrack Lite
          </p>
      </SidebarFooter>
    </>
  );
}
