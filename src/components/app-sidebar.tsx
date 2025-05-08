"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Target,
  ReceiptText,
  Landmark,
  ArrowRightLeft,
  Sparkles,
  Settings2,
  PiggyBank,
} from 'lucide-react';
import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const menuItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/goals', label: 'Savings Goals', icon: Target },
  { href: '/expenses', label: 'Expenses', icon: ReceiptText },
  { href: '/accounts', label: 'Accounts', icon: Landmark },
  { href: '/transfers', label: 'Transfers', icon: ArrowRightLeft },
  { href: '/ai-advisor', label: 'AI Advisor', icon: Sparkles },
];

const settingsItem = { href: '/settings', label: 'Settings', icon: Settings2 };

export function AppSidebar() {
  const pathname = usePathname();
  const { open } = useSidebar();

  return (
    <>
      <SidebarHeader className="p-4">
        <Link href="/" className="flex items-center gap-2">
          <PiggyBank className="h-8 w-8 text-primary" />
          {open && <h1 className="text-2xl font-bold text-foreground">FinanceFlow</h1>}
        </Link>
      </SidebarHeader>
      <Separator />
      <SidebarContent className="p-2">
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} legacyBehavior passHref>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={open ? undefined : item.label}
                  className="justify-start"
                >
                  <a>
                    <item.icon />
                    <span>{item.label}</span>
                  </a>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <Separator />
      <SidebarFooter className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href={settingsItem.href} legacyBehavior passHref>
              <SidebarMenuButton
                asChild
                isActive={pathname === settingsItem.href}
                tooltip={open ? undefined : settingsItem.label}
                 className="justify-start"
              >
                <a>
                  <settingsItem.icon />
                  <span>{settingsItem.label}</span>
                </a>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}
