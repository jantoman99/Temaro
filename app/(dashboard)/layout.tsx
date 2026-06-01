import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Bell,
  Command,
  LogOut,
  Plus,
  Search,
} from "lucide-react";

import { logoutAction } from "@/app/(auth)/actions";
import { TemaroLogo } from "@/components/brand/temaro-logo";
import { DashboardMobileNavigation, DashboardSidebarNavigation } from "@/components/layouts/dashboard-navigation";
import { ProductTour, ProductTourLauncher } from "@/components/onboarding/product-tour";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { getDashboardContextRedirect, requireDashboardContext } from "@/lib/auth/require-dashboard-context";
import { demoTenant } from "@/lib/demo/data";
import { hasSupabaseEnv } from "@/lib/env";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let tenantName = demoTenant.name;
  let tenantSlug = demoTenant.slug;
  let isOwner = true;

  if (hasSupabaseEnv()) {
    const auth = await requireDashboardContext();

    if ("error" in auth) {
      redirect(getDashboardContextRedirect(auth.error));
    }

    isOwner = auth.isOwner;

    const { data: tenant, error: tenantError } = await auth.supabase
      .from("tenants")
      .select("name, slug")
      .eq("id", auth.tenantId)
      .is("deleted_at", null)
      .single();

    if (tenantError || !tenant) {
      redirect("/login?error=missing_tenant");
    }

    tenantName = tenant.name;
    tenantSlug = tenant.slug;
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="grid min-h-screen lg:grid-cols-[260px_1fr]">
        <aside className="hidden border-r border-border bg-sidebar text-sidebar-foreground lg:flex lg:flex-col">
          <div className="border-b border-sidebar-border px-4 py-4">
            <TemaroLogo
              className="mb-4 px-3"
              markClassName="shadow-none"
              textClassName="text-sidebar-foreground"
            />
            <Link
              href="/dashboard"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 transition hover:bg-sidebar-accent"
            >
              <div className="grid size-10 place-items-center rounded-xl bg-primary text-sm font-black text-primary-foreground">
                {tenantName.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1 text-left">
                <div className="truncate text-sm font-semibold">{tenantName}</div>
                <div className="truncate text-xs font-medium text-white/50">/{tenantSlug}</div>
              </div>
            </Link>
          </div>

          <DashboardSidebarNavigation isOwner={isOwner} />

          <div className="p-3">
            <div className="rounded-2xl border border-sidebar-border bg-white/8 p-4 shadow-sm">
              <div className="text-xs font-bold uppercase tracking-wider text-info">MVP režim</div>
              <div className="mt-2 text-xs font-medium leading-5 text-white/58">
                Booking, kalendář a klienti jsou připravení pro runtime ověření.
              </div>
              <Link
                href={`/${tenantSlug}`}
                className="mt-4 inline-flex h-9 w-full items-center justify-center rounded-md bg-primary px-3 text-xs font-black text-primary-foreground transition hover:bg-primary/90"
              >
                Otevřít booking
              </Link>
            </div>
          </div>
        </aside>

        <section className="flex min-w-0 flex-col">
          <header className="flex h-auto flex-col gap-3 border-b border-border bg-card/82 px-4 py-4 shadow-sm backdrop-blur sm:h-18 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-0">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                className="h-10 w-full rounded-lg border border-input bg-background pl-10 pr-16 text-sm font-semibold text-foreground transition placeholder:text-muted-foreground focus:border-primary focus:bg-card focus:outline-none focus:ring-4 focus:ring-primary/15"
                placeholder="Hledat klienta, službu, rezervaci..."
              />
              <kbd className="absolute right-2.5 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-md border border-border bg-card px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground sm:flex">
                <Command className="size-3" /> K
              </kbd>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle compact />
              <ProductTourLauncher />
              <button className="grid size-10 place-items-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground">
                <Bell className="size-4 stroke-[1.75]" />
              </button>
              <Link
                href="/calendar"
                className="hidden h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 sm:flex"
              >
                <Plus className="size-4" />
                Nová rezervace
              </Link>
              <form action={logoutAction}>
                <Button type="submit" variant="outline" size="icon-sm" aria-label="Odhlásit">
                  <LogOut className="size-4" />
                </Button>
              </form>
            </div>
          </header>
          <DashboardMobileNavigation isOwner={isOwner} />

          <div className="w-full flex-1 px-4 py-6 sm:px-8 sm:py-8">
            {children}
          </div>
          <ProductTour />
        </section>
      </div>
    </main>
  );
}
