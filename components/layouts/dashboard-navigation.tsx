"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { getDashboardNavigationGroups } from "@/lib/dashboard-navigation";
import { cn } from "@/lib/utils";

type DashboardNavigationProps = {
  isOwner: boolean;
};

function isActivePath(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DashboardSidebarNavigation({ isOwner }: DashboardNavigationProps) {
  const pathname = usePathname();
  const groups = getDashboardNavigationGroups(isOwner);

  return (
    <nav className="flex-1 overflow-y-auto px-3 py-4 text-sm font-medium">
      {groups.map((group, groupIndex) => (
        <div key={group.label} className={groupIndex === 0 ? "" : "mt-5 border-t border-sidebar-border pt-4"}>
          <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-white/38">{group.label}</p>
          <div className="space-y-1">
            {group.items.map((item) => {
              const isActive = isActivePath(pathname, item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  data-tour={item.tourId}
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
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

export function DashboardMobileNavigation({ isOwner }: DashboardNavigationProps) {
  const pathname = usePathname();
  const items = getDashboardNavigationGroups(isOwner).flatMap((group) => group.items);

  return (
    <nav className="flex gap-2 overflow-x-auto border-b border-border bg-card/70 px-4 py-3 backdrop-blur lg:hidden">
      {items.map((item) => {
        const isActive = isActivePath(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            data-tour={item.tourId}
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
