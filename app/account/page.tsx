import Link from "next/link";
import { redirect } from "next/navigation";

import { logoutAction } from "@/app/(auth)/actions";
import { TemaroLogo } from "@/components/brand/temaro-logo";
import { Button } from "@/components/ui/button";
import { formatCurrencyForDisplay } from "@/lib/currency";
import { formatDateTimeForDisplay } from "@/lib/date-format";
import { hasSupabaseAdminEnv, hasSupabaseEnv } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const ACTIVE_STATUSES = new Set(["pending", "confirmed"]);

type CustomerBooking = {
  id: string;
  starts_at: string;
  ends_at: string;
  status: "pending" | "confirmed" | "completed" | "cancelled" | "no_show";
  deposit_amount: number;
  deposit_paid: boolean;
  services: { currency: "CZK" | "EUR"; name: string; price: number } | null;
  staff: { name: string } | null;
  tenants: { name: string; slug: string; timezone: string } | null;
};

function getStatusLabel(status: CustomerBooking["status"]) {
  const labels = {
    cancelled: "Zrušeno",
    completed: "Dokončeno",
    confirmed: "Potvrzeno",
    no_show: "Nedorazil/a",
    pending: "Čeká na potvrzení",
  };

  return labels[status];
}

function sortBookings(bookings: CustomerBooking[]) {
  return bookings.toSorted((left, right) => {
    const leftActive = ACTIVE_STATUSES.has(left.status) ? 0 : 1;
    const rightActive = ACTIVE_STATUSES.has(right.status) ? 0 : 1;

    if (leftActive !== rightActive) {
      return leftActive - rightActive;
    }

    return new Date(left.starts_at).getTime() - new Date(right.starts_at).getTime();
  });
}

function splitCustomerBookings(bookings: CustomerBooking[]) {
  return {
    history: bookings.filter((booking) => !ACTIVE_STATUSES.has(booking.status)),
    upcoming: bookings.filter((booking) => ACTIVE_STATUSES.has(booking.status)),
  };
}

async function getCustomerBookings(email: string) {
  if (!hasSupabaseAdminEnv()) {
    return { bookings: [] as CustomerBooking[], missingAdminEnv: true };
  }

  const admin = createAdminClient();
  const normalizedEmail = email.trim().toLowerCase();
  const { data: clients, error: clientsError } = await admin
    .from("clients")
    .select("id")
    .ilike("email", normalizedEmail)
    .is("deleted_at", null)
    .limit(100);

  if (clientsError || !clients?.length) {
    return { bookings: [] as CustomerBooking[], missingAdminEnv: false };
  }

  const { data: bookings } = await admin
    .from("bookings")
    .select("id, starts_at, ends_at, status, deposit_amount, deposit_paid, services(name, price, currency), staff(name), tenants(name, slug, timezone)")
    .in("client_id", clients.map((client) => client.id))
    .order("starts_at", { ascending: true })
    .limit(50);

  return {
    bookings: sortBookings((bookings ?? []) as CustomerBooking[]),
    missingAdminEnv: false,
  };
}

export default async function CustomerAccountPage() {
  if (!hasSupabaseEnv()) {
    return (
      <main className="min-h-screen bg-background px-4 py-8 text-foreground sm:px-6">
        <section className="mx-auto w-full max-w-4xl">
          <TemaroLogo />
          <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Demo</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Zákaznický účet</h1>
            <p className="mt-3 text-sm font-medium leading-6 text-muted-foreground">
              Bez Supabase env se ukazuje jen demo stav. V reálném běhu se rezervace párují podle ověřeného e-mailu z Google účtu.
            </p>
          </div>
        </section>
      </main>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/account/login");
  }

  const { bookings, missingAdminEnv } = await getCustomerBookings(user.email);
  const { history, upcoming } = splitCustomerBookings(bookings);

  const renderBookingCard = (booking: CustomerBooking) => {
    const tenant = booking.tenants;
    const timeZone = tenant?.timezone ?? "Europe/Prague";
    const service = booking.services;

    return (
      <article key={booking.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-primary">{tenant?.name ?? "Podnik"}</p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight">{service?.name ?? "Rezervace"}</h2>
            <p className="mt-2 text-sm font-medium text-muted-foreground">
              {formatDateTimeForDisplay(booking.starts_at, timeZone)}
              {booking.staff?.name ? ` · ${booking.staff.name}` : ""}
            </p>
          </div>
          <span className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-bold text-muted-foreground">
            {getStatusLabel(booking.status)}
          </span>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-muted/30 p-3">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Cena</p>
            <p className="mt-1 font-semibold">{service ? formatCurrencyForDisplay(service.price, service.currency, 2) : "Dle služby"}</p>
          </div>
          <div className="rounded-xl border border-border bg-muted/30 p-3">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Záloha</p>
            <p className="mt-1 font-semibold">
              {booking.deposit_amount > 0
                ? `${formatCurrencyForDisplay(booking.deposit_amount, service?.currency ?? "CZK", 2)} · ${booking.deposit_paid ? "zaplaceno" : "čeká"}`
                : "Bez zálohy"}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-muted/30 p-3">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Booking</p>
            {tenant?.slug ? (
              <Link href={`/${tenant.slug}`} className="mt-1 inline-flex font-semibold text-primary underline-offset-4 hover:underline">
                Otevřít stránku
              </Link>
            ) : (
              <p className="mt-1 font-semibold">Není dostupné</p>
            )}
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Link
            href={`/account/bookings/${booking.id}`}
            className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-background px-4 text-sm font-semibold text-foreground shadow-sm transition hover:bg-muted"
          >
            Detail rezervace
          </Link>
        </div>
      </article>
    );
  };

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground sm:px-6">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <TemaroLogo />
          <form action={logoutAction}>
            <Button type="submit" variant="outline">
              Odhlásit
            </Button>
          </form>
        </div>
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Zákaznický účet</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Vaše rezervace</h1>
          <p className="mt-3 text-sm font-medium leading-6 text-muted-foreground">
            Zobrazené termíny jsou spárované podle ověřeného e-mailu {user.email}. Interní poznámky podniků ani tenant data se tu nezobrazují.
          </p>
          <Link
            href="/account/profile"
            className="mt-5 inline-flex h-10 items-center justify-center rounded-md border border-border bg-background px-4 text-sm font-semibold shadow-sm transition hover:bg-muted"
          >
            Upravit zákaznický profil
          </Link>
        </section>
        {missingAdminEnv ? (
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
            Zákaznický přehled vyžaduje Supabase service role klíč na serveru.
          </p>
        ) : null}
        <section className="grid gap-6">
          {bookings.length > 0 ? (
            <>
              <div className="grid gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Nadcházející</p>
                  <h2 className="mt-1 text-2xl font-semibold tracking-tight">Aktivní rezervace</h2>
                </div>
                {upcoming.length > 0 ? upcoming.map(renderBookingCard) : (
                  <p className="rounded-2xl border border-dashed border-border bg-card px-5 py-6 text-sm font-semibold text-muted-foreground shadow-sm">
                    Nemáte žádné nadcházející rezervace.
                  </p>
                )}
              </div>

              <div className="grid gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Historie</p>
                  <h2 className="mt-1 text-2xl font-semibold tracking-tight">Minulé a uzavřené termíny</h2>
                </div>
                {history.length > 0 ? history.map(renderBookingCard) : (
                  <p className="rounded-2xl border border-dashed border-border bg-card px-5 py-6 text-sm font-semibold text-muted-foreground shadow-sm">
                    Historie návštěv je zatím prázdná.
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center shadow-sm">
              <h2 className="text-xl font-semibold tracking-tight">Zatím tu nejsou žádné rezervace</h2>
              <p className="mt-2 text-sm font-medium leading-6 text-muted-foreground">
                Pokud jste rezervaci vytvořili s jiným e-mailem, nebude se v tomto účtu zobrazovat.
              </p>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
