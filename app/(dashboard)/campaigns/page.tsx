import { redirect } from "next/navigation";

import { MarketingCampaignForm, LastMinuteOfferForm } from "@/components/campaigns/campaign-forms";
import { DemoBanner } from "@/components/demo/demo-banner";
import { PageHeader } from "@/components/layouts/page-header";
import { requireOwner } from "@/lib/auth/require-owner";
import { hasSupabaseEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

type MarketingCampaign = {
  id: string;
  name: string;
  channel: string;
  segment: string;
  status: string;
  created_at: string;
};

type LastMinuteOffer = {
  id: string;
  starts_at: string;
  ends_at: string;
  discount_percent: number;
  status: string;
  services: { name: string | null } | null;
  staff: { name: string | null } | null;
};

type ServiceOption = { id: string; name: string };
type StaffOption = { id: string; name: string };

const segmentLabels: Record<string, string> = {
  all: "Všichni",
  flagged: "Flagovaní",
  inactive_60d: "Neaktivní 60 dní",
  last_visit_30d: "Návštěva do 30 dní",
  no_show_risk: "No-show riziko",
};

function CampaignsHeader() {
  return (
    <PageHeader
      description="Growth vrstva pro plánování kampaní, segmentů klientů a Last Minute zaplnění volných slotů."
      eyebrow="Growth"
      title="Kampaně"
    />
  );
}

function CampaignSummary({ campaigns, offers }: { campaigns: MarketingCampaign[]; offers: LastMinuteOffer[] }) {
  return (
    <section className="grid gap-3 md:grid-cols-3">
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Kampaně</p>
        <p className="mt-2 text-2xl font-semibold">{campaigns.length}</p>
      </div>
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Last Minute</p>
        <p className="mt-2 text-2xl font-semibold">{offers.length}</p>
      </div>
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Drafty</p>
        <p className="mt-2 text-2xl font-semibold">{campaigns.filter((campaign) => campaign.status === "draft").length}</p>
      </div>
    </section>
  );
}

function CampaignList({ campaigns }: { campaigns: MarketingCampaign[] }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h2 className="text-lg font-semibold">Marketingové kampaně</h2>
      <div className="mt-4 grid gap-3">
        {campaigns.length === 0 ? (
          <p className="text-sm font-medium text-muted-foreground">Zatím není uložená žádná kampaň.</p>
        ) : (
          campaigns.map((campaign) => (
            <article key={campaign.id} className="rounded-xl border border-border bg-background p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{campaign.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {campaign.channel.toUpperCase()} · {segmentLabels[campaign.segment] ?? campaign.segment} · {new Date(campaign.created_at).toLocaleString("cs-CZ")}
                  </p>
                </div>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-primary">{campaign.status}</p>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

function LastMinuteList({ offers }: { offers: LastMinuteOffer[] }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h2 className="text-lg font-semibold">Last Minute nabídky</h2>
      <div className="mt-4 grid gap-3">
        {offers.length === 0 ? (
          <p className="text-sm font-medium text-muted-foreground">Zatím není uložená žádná Last Minute nabídka.</p>
        ) : (
          offers.map((offer) => (
            <article key={offer.id} className="rounded-xl border border-border bg-background p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">
                    {offer.services?.name ?? "Jakákoliv služba"} · {offer.staff?.name ?? "Kdokoliv"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(offer.starts_at).toLocaleString("cs-CZ")} - {new Date(offer.ends_at).toLocaleTimeString("cs-CZ")}
                  </p>
                </div>
                <p className="font-bold text-warning">{offer.discount_percent}%</p>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

const demoCampaigns: MarketingCampaign[] = [
  {
    channel: "email",
    created_at: "2026-05-08T15:00:00.000Z",
    id: "demo-campaign-1",
    name: "Jarní návrat klientů",
    segment: "inactive_60d",
    status: "draft",
  },
];

export default async function CampaignsPage() {
  if (!hasSupabaseEnv()) {
    return (
      <section className="flex flex-col gap-6">
        <DemoBanner />
        <CampaignsHeader />
        <CampaignSummary campaigns={demoCampaigns} offers={[]} />
        <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
          <div className="grid gap-6">
            <CampaignList campaigns={demoCampaigns} />
            <LastMinuteList offers={[]} />
          </div>
          <div className="grid gap-6">
            <MarketingCampaignForm />
            <LastMinuteOfferForm services={[]} staff={[]} />
          </div>
        </div>
      </section>
    );
  }

  const auth = await requireOwner();

  if ("error" in auth) {
    redirect(auth.error === "Unauthorized" ? "/login" : "/dashboard");
  }

  const [{ data: campaigns }, { data: offers }, { data: services }, { data: staff }] = await Promise.all([
    auth.supabase
      .from("marketing_campaigns")
      .select("id, name, channel, segment, status, created_at")
      .eq("tenant_id", auth.tenantId)
      .order("created_at", { ascending: false })
      .limit(20),
    auth.supabase
      .from("last_minute_offers")
      .select("id, starts_at, ends_at, discount_percent, status, services(name), staff(name)")
      .eq("tenant_id", auth.tenantId)
      .order("starts_at", { ascending: true })
      .limit(20),
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
      .order("name", { ascending: true }),
  ]);

  const campaignRows = (campaigns ?? []) as MarketingCampaign[];
  const offerRows = (offers ?? []) as LastMinuteOffer[];

  return (
    <section className="flex flex-col gap-6">
      <CampaignsHeader />
      <CampaignSummary campaigns={campaignRows} offers={offerRows} />
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="grid gap-6">
          <CampaignList campaigns={campaignRows} />
          <LastMinuteList offers={offerRows} />
        </div>
        <div className="grid gap-6">
          <MarketingCampaignForm />
          <LastMinuteOfferForm services={(services ?? []) as ServiceOption[]} staff={(staff ?? []) as StaffOption[]} />
        </div>
      </div>
    </section>
  );
}
