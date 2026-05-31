"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CalendarDays,
  Megaphone,
  ClipboardCheck,
  Coins,
  CreditCard,
  Dumbbell,
  KeyRound,
  Layers3,
  Repeat2,
  RotateCcw,
  Boxes,
  MapPinned,
  PackageSearch,
  Share2,
  MonitorSmartphone,
  ReceiptText,
  ShoppingCart,
  Settings,
  Tag,
  TicketPercent,
  Upload,
  UsersRound,
  UserRoundCog,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

type DashboardNavigationProps = {
  isOwner: boolean;
};

type NavItem = {
  badge?: string;
  href: string;
  icon: LucideIcon;
  label: string;
};

const ownerLinks: NavItem[] = [
  { href: "/start", icon: ClipboardCheck, label: "Start" },
  { href: "/booking-page", icon: MonitorSmartphone, label: "Booking stránka" },
  { href: "/clients", icon: UsersRound, label: "Klienti" },
  { href: "/services", icon: Tag, label: "Služby" },
  { href: "/staff", icon: UserRoundCog, label: "Tým" },
  { href: "/payments", icon: CreditCard, label: "Platby" },
  { href: "/pos", icon: ShoppingCart, label: "POS" },
  { href: "/inventory", icon: PackageSearch, label: "Sklad" },
  { href: "/vouchers", icon: TicketPercent, label: "Vouchery" },
  { href: "/packages", icon: Layers3, label: "Balíčky" },
  { href: "/memberships", icon: Repeat2, label: "Členství" },
  { href: "/campaigns", icon: Megaphone, label: "Kampaně" },
  { href: "/resources", icon: Boxes, label: "Resources" },
  { href: "/locations", icon: MapPinned, label: "Pobočky" },
  { href: "/classes", icon: Dumbbell, label: "Lekce" },
  { href: "/referrals", icon: Share2, label: "Referral" },
  { href: "/commissions", icon: Coins, label: "Provize" },
  { href: "/recovery", icon: RotateCcw, label: "Recovery" },
  { href: "/integrations", icon: KeyRound, label: "Integrace" },
  { href: "/reports", icon: ReceiptText, label: "Reporty" },
  { href: "/import", icon: Upload, label: "Import" },
  { href: "/settings", icon: Settings, label: "Nastavení" },
];

function getNavItems(isOwner: boolean): NavItem[] {
  return [
    { href: "/dashboard", icon: BarChart3, label: "Přehled" },
    { href: "/calendar", icon: CalendarDays, label: "Kalendář", badge: "12" },
    ...(isOwner ? ownerLinks : []),
  ];
}

function isActivePath(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DashboardSidebarNavigation({ isOwner }: DashboardNavigationProps) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 space-y-1 px-3 py-4 text-sm font-medium">
      {getNavItems(isOwner).map((item) => {
        const isActive = isActivePath(pathname, item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "relative flex h-10 items-center gap-3 rounded-xl px-3 py-2 transition",
              isActive
                ? "bg-white/10 text-white shadow-sm"
                : "text-white/58 hover:bg-sidebar-accent hover:text-white",
            )}
          >
            {isActive ? (
              <span className="absolute bottom-2 left-0 top-2 w-[3px] rounded-r-full bg-primary" aria-hidden="true" />
            ) : null}
            <Icon className="size-4 stroke-[1.75]" />
            {item.label}
            {item.badge ? (
              <span
                className={cn(
                  "ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold",
                  isActive ? "bg-white/12 text-white" : "bg-info/15 text-info",
                )}
              >
                {item.badge}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

export function DashboardMobileNavigation({ isOwner }: DashboardNavigationProps) {
  const pathname = usePathname();

  return (
    <nav className="flex gap-2 overflow-x-auto border-b border-border bg-card/70 px-4 py-3 backdrop-blur lg:hidden">
      {getNavItems(isOwner).map((item) => {
        const isActive = isActivePath(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "shrink-0 rounded-full border px-3 py-2 text-sm font-semibold shadow-sm transition",
              isActive
                ? "border-primary/30 bg-primary text-primary-foreground"
                : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
