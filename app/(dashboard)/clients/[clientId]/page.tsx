import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { ClientEditForm } from "@/components/clients/client-edit-form";
import { DemoBanner } from "@/components/demo/demo-banner";
import { requireOwner } from "@/lib/auth/require-owner";
import { formatCurrencyForDisplay } from "@/lib/currency";
import {
  formatDateForDisplay,
  formatDateTimeForDisplay,
  getDateKeyForCalendar,
  getValidTimestamp,
} from "@/lib/date-format";
import { demoBookings, demoClients, demoStaff, demoTenant } from "@/lib/demo/data";
import { hasSupabaseEnv } from "@/lib/env";
import { getSafeTimeZone } from "@/lib/time-zone";
import { clientIdSchema } from "@/lib/validations/clients";
import { getBookingSourceDescription } from "@/lib/booking/source";

type ClientDetailPageProps = {
  params: Promise<{
    clientId: string;
  }>;
};

type BookingHistoryItem = {
  id: string;
  starts_at: string;
  status: string;
  notes: string | null;
  source: string;
  source_detail?: string | null;
  services: {
    currency?: string;
    name: string;
    price?: number;
  } | null;
  staff: {
    name: string;
    color: string | null;
  } | null;
};

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    cancelled: "zrušeno",
    completed: "hotovo",
    confirmed: "potvrzeno",
    no_show: "no-show",
    pending: "čeká na potvrzení",
  };

  return labels[status] ?? status;
}

function getStatusClasses(status: string) {
  const classes: Record<string, string> = {
    cancelled: "border-border bg-muted text-muted-foreground",
    completed: "border-success/25 bg-success/10 text-emerald-800",
    confirmed: "border-primary/25 bg-primary/10 text-primary",
    no_show: "border-destructive/25 bg-destructive/10 text-destructive",
    pending: "border-warning/30 bg-warning/15 text-amber-800",
  };

  return classes[status] ?? "border-border bg-muted text-muted-foreground";
}

function getUpcomingBooking(bookings: BookingHistoryItem[]) {
  const now = Date.now();

  return bookings
    .filter((booking) => {
      const startsAt = getValidTimestamp(booking.starts_at);
      return startsAt !== null && startsAt >= now && (booking.status === "pending" || booking.status === "confirmed");
    })
    .sort((left, right) => (getValidTimestamp(left.starts_at) ?? 0) - (getValidTimestamp(right.starts_at) ?? 0))[0] ?? null;
}

function getCompletedBookings(bookings: BookingHistoryItem[]) {
  return bookings.filter((booking) => booking.status === "completed");
}

function getLastCompletedBooking(bookings: BookingHistoryItem[]) {
  return getCompletedBookings(bookings)
    .filter((booking) => getValidTimestamp(booking.starts_at) !== null)
    .sort((left, right) => (getValidTimestamp(right.starts_at) ?? 0) - (getValidTimestamp(left.starts_at) ?? 0))[0] ?? null;
}

function getCompletedRevenue(bookings: BookingHistoryItem[]) {
  return getCompletedBookings(bookings).reduce(
    (sum, booking) => sum + (typeof booking.services?.price === "number" ? booking.services.price : 0),
    0,
  );
}

function getManualBookingHref(clientId: string, preferredStaffId?: string | null) {
  const searchParams = new URLSearchParams();
  searchParams.set("draftClientId", clientId);

  if (preferredStaffId) {
    searchParams.set("draftStaffId", preferredStaffId);
  }

  return `/calendar?${searchParams.toString()}`;
}

function getContactPreferenceLabel(value?: string | null) {
  const labels: Record<string, string> = {
    any: "Bez preference",
    email: "E-mail",
    phone: "Telefon",
    sms: "SMS",
  };

  return labels[value ?? "any"] ?? "Bez preference";
}

function getTimePreferenceLabel(value?: string | null) {
  const labels: Record<string, string> = {
    afternoon: "Odpoledne",
    any: "Bez preference",
    evening: "Večer",
    morning: "Ráno",
  };

  return labels[value ?? "any"] ?? "Bez preference";
}

function getClientTierLabel(value?: string | null) {
  const labels: Record<string, string> = {
    risk: "Rizikový",
    standard: "Standard",
    trusted: "Trusted/VIP",
  };

  return labels[value ?? "standard"] ?? "Standard";
}

function getBookingDetailHref(bookingId: string, startsAt: string, timeZone: string) {
  const searchParams = new URLSearchParams();
  searchParams.set("booking", bookingId);
  searchParams.set("day", getDateKeyForCalendar(startsAt, timeZone));
  searchParams.set("view", "day");

  return `/calendar?${searchParams.toString()}`;
}

function ClientDetailContent({
  bookings,
  client,
  clientBookingHref,
  preferredStaffName,
  staffOptions,
  timeZone,
}: {
  bookings: BookingHistoryItem[];
  client: {
    client_tier?: "standard" | "trusted" | "risk";
    created_at: string;
    email: string | null;
    flag_reason: string | null;
    full_name: string;
    id: string;
    is_flagged: boolean;
    no_show_count: number;
    notes: string | null;
    phone: string | null;
    preference_notes?: string | null;
    preferred_contact_channel?: "any" | "email" | "sms" | "phone";
    preferred_staff_id?: string | null;
    preferred_time_of_day?: "any" | "morning" | "afternoon" | "evening";
  };
  clientBookingHref: string;
  preferredStaffName: string | null;
  staffOptions: { id: string; name: string }[];
  timeZone: string;
}) {
  const upcomingBooking = getUpcomingBooking(bookings);
  const completedBookings = getCompletedBookings(bookings);
  const lastCompletedBooking = getLastCompletedBooking(bookings);
  const completedRevenue = getCompletedRevenue(bookings);
  const revenueCurrency =
    completedBookings.find((booking) => booking.services?.currency)?.services?.currency ?? "CZK";

  return (
    <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_21rem]">
      <div className="flex flex-col gap-6">
        <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          <div className="flex flex-col gap-5 bg-card p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Profil klienta
                </p>
                {client.is_flagged ? (
                  <span className="rounded-full border border-warning/30 bg-warning/15 px-2.5 py-1 text-xs font-semibold text-amber-800">
                    Flagovaný
                  </span>
                ) : null}
                {client.client_tier === "trusted" ? (
                  <span className="rounded-full border border-success/25 bg-success/10 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                    Trusted/VIP
                  </span>
                ) : null}
                {client.client_tier === "risk" ? (
                  <span className="rounded-full border border-destructive/25 bg-destructive/10 px-2.5 py-1 text-xs font-semibold text-destructive">
                    Rizikový
                  </span>
                ) : null}
              </div>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{client.full_name}</h1>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
                {client.phone ? (
                  <span className="rounded-full border border-border bg-background px-3 py-1.5 shadow-sm">
                    {client.phone}
                  </span>
                ) : null}
                {client.email ? (
                  <span className="rounded-full border border-border bg-background px-3 py-1.5 shadow-sm">
                    {client.email}
                  </span>
                ) : null}
                <span className="rounded-full border border-border bg-background px-3 py-1.5 shadow-sm">
                  V systému od {formatDateForDisplay(client.created_at)}
                </span>
              </div>
            </div>
            <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
              <Link
                href="/clients"
                className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-card px-3 text-sm font-semibold shadow-sm transition hover:bg-muted"
              >
                Zpět na klienty
              </Link>
              <Link
                href={clientBookingHref}
                className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
              >
                Nová rezervace
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Rezervace</p>
            <p className="nums-tabular mt-2 text-2xl font-semibold tracking-tight">{bookings.length}</p>
          </div>
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wider text-emerald-800">Hotovo</p>
            <p className="nums-tabular mt-2 text-2xl font-semibold tracking-tight">{completedBookings.length}</p>
          </div>
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wider text-destructive">No-show</p>
            <p className="nums-tabular mt-2 text-2xl font-semibold tracking-tight">{client.no_show_count}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4 shadow-sm md:col-span-2">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Utraceno celkem</p>
            <p className="nums-tabular mt-2 text-2xl font-semibold tracking-tight">{formatCurrencyForDisplay(completedRevenue, revenueCurrency)}</p>
            <p className="mt-2 text-xs text-muted-foreground">Počítáno jen z hotových návštěv.</p>
          </div>
          <div className="rounded-lg border border-primary/20 bg-primary/10 p-4 shadow-sm md:col-span-2 xl:col-span-5">
            <p className="text-xs font-medium uppercase tracking-wider text-primary">Další termín</p>
            <p className="mt-3 text-sm font-medium">
              {upcomingBooking ? formatDateTimeForDisplay(upcomingBooking.starts_at, timeZone) : "Žádný potvrzený termín"}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Poslední hotovo: {lastCompletedBooking ? formatDateTimeForDisplay(lastCompletedBooking.starts_at, timeZone) : "zatím nikdy"}
            </p>
          </div>
        </div>

        <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Historie rezervací
              </p>
              <h2 className="mt-1 text-lg font-semibold tracking-tight">Přehled návštěv</h2>
            </div>
            <Link
              href={clientBookingHref}
              className="hidden h-9 items-center justify-center rounded-md border border-border bg-background px-3 text-sm font-semibold shadow-sm transition hover:bg-muted sm:inline-flex"
            >
              Nová rezervace
            </Link>
          </div>
          <div className="mt-5 grid gap-3">
            {bookings.length > 0 ? (
              bookings.map((booking) => (
                <article
                  key={booking.id}
                  className="group rounded-lg border border-border bg-secondary p-4 shadow-sm transition hover:border-primary/30"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-medium">
                          {booking.services?.name ?? "Služba"} · {booking.staff?.name ?? "Zaměstnanec"}
                        </h3>
                        <span
                          className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusClasses(booking.status)}`}
                        >
                          {getStatusLabel(booking.status)}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">{formatDateTimeForDisplay(booking.starts_at, timeZone)}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {getBookingSourceDescription({ source: booking.source, sourceDetail: booking.source_detail })}
                      </p>
                      <div className="mt-3">
                        <Link
                          href={getBookingDetailHref(booking.id, booking.starts_at, timeZone)}
                          className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
                        >
                          Otevřít v kalendáři
                        </Link>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span
                        className="size-3 rounded-full border border-border"
                        style={{ backgroundColor: booking.staff?.color ?? "#111827" }}
                      />
                      <span className="text-muted-foreground">{booking.staff?.name ?? "Bez zaměstnance"}</span>
                    </div>
                  </div>
                  {booking.notes ? (
                    <p className="mt-3 rounded-lg border border-border bg-card px-3 py-2 text-sm text-muted-foreground">
                      {booking.notes}
                    </p>
                  ) : null}
                </article>
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-primary/20 bg-primary/10 p-8 text-center shadow-sm">
                <p className="text-base font-semibold text-foreground">Zatím žádná historie</p>
                <p className="mt-2 text-sm text-muted-foreground">Klient zatím nemá žádnou rezervaci.</p>
              </div>
            )}
          </div>
        </section>
      </div>

      <aside className="grid gap-4 self-start">
        <ClientEditForm
          client={{
            email: client.email,
            fullName: client.full_name,
            id: client.id,
            notes: client.notes,
            phone: client.phone,
            clientTier: client.client_tier,
            preferenceNotes: client.preference_notes,
            preferredContactChannel: client.preferred_contact_channel,
            preferredStaffId: client.preferred_staff_id,
            preferredTimeOfDay: client.preferred_time_of_day,
          }}
          staff={staffOptions}
        />
        <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Interní informace
          </p>
          <dl className="mt-4 grid gap-3 text-sm">
            <div className="rounded-lg border border-border bg-secondary p-3 shadow-sm">
              <dt className="text-xs text-muted-foreground">Preferovaný zaměstnanec</dt>
              <dd className="mt-1 font-medium">{preferredStaffName ?? "Není nastaveno"}</dd>
            </div>
            <div className="rounded-lg border border-border bg-secondary p-3 shadow-sm">
              <dt className="text-xs text-muted-foreground">Profil klienta</dt>
              <dd className="mt-1 font-medium">{getClientTierLabel(client.client_tier)}</dd>
            </div>
            <div className="rounded-lg border border-border bg-secondary p-3 shadow-sm">
              <dt className="text-xs text-muted-foreground">Preferovaný kontakt</dt>
              <dd className="mt-1 font-medium">{getContactPreferenceLabel(client.preferred_contact_channel)}</dd>
            </div>
            <div className="rounded-lg border border-border bg-secondary p-3 shadow-sm">
              <dt className="text-xs text-muted-foreground">Preferovaný čas</dt>
              <dd className="mt-1 font-medium">{getTimePreferenceLabel(client.preferred_time_of_day)}</dd>
            </div>
            <div className="rounded-lg border border-border bg-secondary p-3 shadow-sm">
              <dt className="text-xs text-muted-foreground">Preference</dt>
              <dd className="mt-1 whitespace-pre-wrap text-muted-foreground">
                {client.preference_notes ?? "Zatím bez strukturovaných preferencí."}
              </dd>
            </div>
            <div className="rounded-lg border border-border bg-secondary p-3 shadow-sm">
              <dt className="text-xs text-muted-foreground">Flag</dt>
              <dd className="mt-1 font-medium">{client.is_flagged ? "Ano" : "Ne"}</dd>
              {client.flag_reason ? (
                <dd className="mt-2 text-muted-foreground">{client.flag_reason}</dd>
              ) : null}
            </div>
            <div className="rounded-lg border border-border bg-secondary p-3 shadow-sm">
              <dt className="text-xs text-muted-foreground">Interní poznámky</dt>
              <dd className="mt-1 whitespace-pre-wrap text-muted-foreground">
                {client.notes ?? "Zatím bez interních poznámek."}
              </dd>
            </div>
          </dl>
        </section>
      </aside>
    </section>
  );
}

export default async function ClientDetailPage({ params }: ClientDetailPageProps) {
  const { clientId } = await params;
  const parsedClientId = clientIdSchema.safeParse({ clientId });

  if (!hasSupabaseEnv()) {
    if (!parsedClientId.success) {
      notFound();
    }

    const client = demoClients.find((item) => item.id === parsedClientId.data.clientId);

    if (!client) {
      notFound();
    }

    const bookings = demoBookings
      .filter((booking) => booking.client_id === client.id)
      .map((booking) => ({
        id: booking.id,
        starts_at: booking.starts_at,
        status: booking.status,
        notes: booking.notes,
        source: booking.source,
        services: booking.services,
        staff: booking.staff,
      }));
    const preferredStaffName =
      demoStaff.find((member) => member.id === client.preferred_staff_id)?.name ?? null;
    const staffOptions = demoStaff.map((member) => ({ id: member.id, name: member.name }));

    return (
      <div className="flex flex-col gap-6">
        <DemoBanner />
        <ClientDetailContent
          bookings={bookings}
          client={client}
          clientBookingHref={getManualBookingHref(client.id, client.preferred_staff_id)}
          preferredStaffName={preferredStaffName}
          staffOptions={staffOptions}
          timeZone={getSafeTimeZone(demoTenant.timezone)}
        />
      </div>
    );
  }

  if (!parsedClientId.success) {
    notFound();
  }

  const auth = await requireOwner();

  if ("error" in auth) {
    if (auth.error === "Unauthorized") {
      redirect("/login");
    }

    redirect("/login");
  }

  const [
    { data: client, error: clientError },
    { data: bookings, error: bookingsError },
    { data: staffOptions, error: staffOptionsError },
    { data: tenant, error: tenantError },
  ] = await Promise.all([
    auth.supabase
      .from("clients")
      .select("*")
      .eq("tenant_id", auth.tenantId)
      .eq("id", parsedClientId.data.clientId)
      .is("deleted_at", null)
      .maybeSingle(),
    auth.supabase
      .from("bookings")
      .select("id, starts_at, status, notes, source, source_detail, services(name, price, currency), staff(name, color)")
      .eq("tenant_id", auth.tenantId)
      .eq("client_id", parsedClientId.data.clientId)
      .order("starts_at", { ascending: false }),
    auth.supabase
      .from("staff")
      .select("id, name")
      .eq("tenant_id", auth.tenantId)
      .eq("is_active", true)
      .is("deleted_at", null)
      .order("name", { ascending: true }),
    auth.supabase
      .from("tenants")
      .select("timezone")
      .eq("id", auth.tenantId)
      .is("deleted_at", null)
      .maybeSingle(),
  ]);

  if (clientError) {
    return (
      <section className="flex flex-col gap-5">
        <div>
          <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Klientský profil
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">Detail klienta</h1>
        </div>
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          Detail klienta se nepodařilo načíst. Zkuste stránku obnovit.
        </div>
      </section>
    );
  }

  if (!client) {
    notFound();
  }

  let preferredStaffName: string | null = null;
  let preferredStaffError = false;

  if (client.preferred_staff_id) {
    const { data: preferredStaff, error } = await auth.supabase
      .from("staff")
      .select("name")
      .eq("tenant_id", auth.tenantId)
      .eq("id", client.preferred_staff_id)
      .is("deleted_at", null)
      .maybeSingle();

    preferredStaffError = Boolean(error);
    preferredStaffName = preferredStaff?.name ?? null;
  }
  const hasLoadError = Boolean(bookingsError || staffOptionsError || tenantError || preferredStaffError);

  return (
    <div className="flex flex-col gap-5">
      {hasLoadError ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          Část detailu klienta se nepodařilo načíst. Zkuste stránku obnovit.
        </div>
      ) : null}
      <ClientDetailContent
        bookings={bookings ?? []}
        client={client}
        clientBookingHref={getManualBookingHref(client.id, client.preferred_staff_id)}
        preferredStaffName={preferredStaffName}
        staffOptions={staffOptions ?? []}
        timeZone={getSafeTimeZone(tenant?.timezone)}
      />
    </div>
  );
}
