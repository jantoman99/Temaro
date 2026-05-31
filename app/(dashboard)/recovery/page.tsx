import { redirect } from "next/navigation";

import { DemoBanner } from "@/components/demo/demo-banner";
import { PageHeader } from "@/components/layouts/page-header";
import { RecoveryOfferForm, RecoveryRecipientForm } from "@/components/recovery/recovery-forms";
import { requireOwner } from "@/lib/auth/require-owner";
import { formatDateTimeForDisplay } from "@/lib/date-format";
import { hasSupabaseEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

type Option = { id: string; name: string };

type RecoveryOffer = {
  id: string;
  starts_at: string;
  ends_at: string;
  discount_percent: number;
  status: "draft" | "ready" | "sent" | "expired" | "cancelled";
  note: string | null;
  services: { name: string | null } | null;
  staff: { name: string | null } | null;
  empty_slot_recovery_recipients: { status: "selected" | "sent" | "booked" | "skipped" }[];
};

type Recipient = {
  id: string;
  status: "selected" | "sent" | "booked" | "skipped";
  clients: { full_name: string | null; email: string | null; phone: string | null } | null;
  empty_slot_recovery_offers: { starts_at: string | null; services: { name: string | null } | null } | null;
};

function RecoveryHeader() {
  return (
    <PageHeader
      description="Cílené nabídky uvolněných termínů pro vybrané klienty. Bez odesílání, dokud nebude zapnutý produkční SMS/e-mail provider."
      eyebrow="Anti no-show"
      title="Empty-slot recovery"
    />
  );
}

function OfferList({ offers }: { offers: RecoveryOffer[] }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h2 className="text-lg font-semibold">Uvolněné termíny</h2>
      <div className="mt-4 grid gap-3">
        {offers.length === 0 ? (
          <p className="text-sm font-medium text-muted-foreground">Zatím není připravená žádná recovery nabídka.</p>
        ) : (
          offers.map((offer) => (
            <article key={offer.id} className="rounded-xl border border-border bg-background p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-semibold">{offer.services?.name ?? "Služba"}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatDateTimeForDisplay(offer.starts_at)} - {formatDateTimeForDisplay(offer.ends_at)}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">Tým: {offer.staff?.name ?? "Kdokoliv"}</p>
                  {offer.note ? <p className="mt-2 text-sm text-muted-foreground">{offer.note}</p> : null}
                </div>
                <div className="text-sm font-medium text-muted-foreground sm:text-right">
                  <p>{offer.discount_percent > 0 ? `Sleva ${offer.discount_percent} %` : "Bez slevy"}</p>
                  <p>{offer.empty_slot_recovery_recipients.length} klientů</p>
                  <p className="uppercase tracking-[0.14em]">{offer.status}</p>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

function RecipientList({ recipients }: { recipients: Recipient[] }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h2 className="text-lg font-semibold">Vybraní klienti</h2>
      <div className="mt-4 grid gap-3">
        {recipients.length === 0 ? (
          <p className="text-sm font-medium text-muted-foreground">Zatím není vybraný žádný klient.</p>
        ) : (
          recipients.map((recipient) => (
            <article key={recipient.id} className="rounded-xl border border-border bg-background p-3">
              <p className="font-semibold">{recipient.clients?.full_name ?? recipient.clients?.email ?? recipient.clients?.phone ?? "Klient"}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {recipient.empty_slot_recovery_offers?.services?.name ?? "Služba"} ·{" "}
                {recipient.empty_slot_recovery_offers?.starts_at ? formatDateTimeForDisplay(recipient.empty_slot_recovery_offers.starts_at) : "Bez termínu"}
              </p>
              <p className="mt-1 text-xs uppercase tracking-[0.14em] text-muted-foreground">{recipient.status}</p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

const demoOffers: RecoveryOffer[] = [{
  discount_percent: 10,
  empty_slot_recovery_recipients: [{ status: "selected" }],
  ends_at: new Date(Date.UTC(2026, 4, 9, 11, 0)).toISOString(),
  id: "demo-recovery",
  note: "Zrušený dopolední termín.",
  services: { name: "Střih" },
  staff: { name: "Eva" },
  starts_at: new Date(Date.UTC(2026, 4, 9, 10, 0)).toISOString(),
  status: "draft",
}];

export default async function RecoveryPage() {
  if (!hasSupabaseEnv()) {
    return (
      <section className="flex flex-col gap-6">
        <DemoBanner />
        <RecoveryHeader />
        <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
          <div className="grid gap-6">
            <OfferList offers={demoOffers} />
            <RecipientList recipients={[]} />
          </div>
          <div className="grid gap-6">
            <RecoveryOfferForm services={[]} staff={[]} />
            <RecoveryRecipientForm clients={[]} offers={demoOffers.map((offer) => ({ id: offer.id, name: offer.services?.name ?? "Nabídka" }))} />
          </div>
        </div>
      </section>
    );
  }

  const auth = await requireOwner();

  if ("error" in auth) {
    redirect(auth.error === "Unauthorized" ? "/login" : "/dashboard");
  }

  const [{ data: offers }, { data: recipients }, { data: services }, { data: staff }, { data: clients }] = await Promise.all([
    auth.supabase
      .from("empty_slot_recovery_offers")
      .select("id, starts_at, ends_at, discount_percent, status, note, services(name), staff(name), empty_slot_recovery_recipients(status)")
      .eq("tenant_id", auth.tenantId)
      .order("starts_at", { ascending: false })
      .limit(50),
    auth.supabase
      .from("empty_slot_recovery_recipients")
      .select("id, status, clients(full_name, email, phone), empty_slot_recovery_offers(starts_at, services(name))")
      .eq("tenant_id", auth.tenantId)
      .order("created_at", { ascending: false })
      .limit(50),
    auth.supabase
      .from("services")
      .select("id, name")
      .eq("tenant_id", auth.tenantId)
      .is("deleted_at", null)
      .eq("is_active", true)
      .order("name", { ascending: true }),
    auth.supabase
      .from("staff")
      .select("id, name")
      .eq("tenant_id", auth.tenantId)
      .is("deleted_at", null)
      .eq("is_active", true)
      .order("name", { ascending: true }),
    auth.supabase
      .from("clients")
      .select("id, full_name, email, phone")
      .eq("tenant_id", auth.tenantId)
      .is("deleted_at", null)
      .order("full_name", { ascending: true })
      .limit(200),
  ]);

  const offerRows = (offers ?? []) as RecoveryOffer[];
  const offerOptions: Option[] = offerRows.map((offer) => ({
    id: offer.id,
    name: `${offer.services?.name ?? "Nabídka"} · ${formatDateTimeForDisplay(offer.starts_at)}`,
  }));
  const clientOptions: Option[] = (clients ?? []).map((client) => ({
    id: client.id,
    name: client.full_name ?? client.email ?? client.phone ?? "Klient",
  }));

  return (
    <section className="flex flex-col gap-6">
      <RecoveryHeader />
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="grid gap-6">
          <OfferList offers={offerRows} />
          <RecipientList recipients={(recipients ?? []) as Recipient[]} />
        </div>
        <div className="grid gap-6">
          <RecoveryOfferForm services={(services ?? []) as Option[]} staff={(staff ?? []) as Option[]} />
          <RecoveryRecipientForm clients={clientOptions} offers={offerOptions} />
        </div>
      </div>
    </section>
  );
}
