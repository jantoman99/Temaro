import { redirect } from "next/navigation";

import { ApiKeyCreateForm, ApiKeyRevokeForm } from "@/components/integrations/api-key-forms";
import { DemoBanner } from "@/components/demo/demo-banner";
import { PageHeader } from "@/components/layouts/page-header";
import { requireOwner } from "@/lib/auth/require-owner";
import { formatDateTimeForDisplay } from "@/lib/date-format";
import { hasSupabaseEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

type ApiKeyRow = {
  id: string;
  name: string;
  token_prefix: string;
  token_last4: string;
  scopes: string[];
  last_used_at: string | null;
  revoked_at: string | null;
  created_at: string;
};

function IntegrationsHeader() {
  return (
    <PageHeader
      description="Bezpečný základ pro budoucí partnery: hashované API klíče, read-only scope a revokace bez ukládání raw tokenu."
      eyebrow="Integrace"
      title="API a integrace"
    />
  );
}

function ApiKeyList({ keys }: { keys: ApiKeyRow[] }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h2 className="text-lg font-semibold">API klíče</h2>
      <div className="mt-4 grid gap-3">
        {keys.length === 0 ? (
          <p className="text-sm font-medium text-muted-foreground">Zatím není vytvořený žádný API klíč.</p>
        ) : (
          keys.map((key) => (
            <article key={key.id} className="grid gap-4 rounded-xl border border-border bg-background p-4 md:grid-cols-[1fr_180px] md:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{key.name}</p>
                  <span className={key.revoked_at ? "rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground" : "rounded-full bg-success/15 px-2 py-0.5 text-xs font-semibold text-success"}>
                    {key.revoked_at ? "Odvolaný" : "Aktivní"}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {key.token_prefix}…{key.token_last4} · scope {key.scopes.join(", ")}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Vytvořeno {formatDateTimeForDisplay(key.created_at)}
                  {key.last_used_at ? ` · naposledy použito ${formatDateTimeForDisplay(key.last_used_at)}` : ""}
                </p>
              </div>
              <ApiKeyRevokeForm keyId={key.id} revoked={Boolean(key.revoked_at)} />
            </article>
          ))
        )}
      </div>
    </section>
  );
}

const demoKeys: ApiKeyRow[] = [{
  created_at: "2026-05-08T17:55:00.000Z",
  id: "demo-api-key",
  last_used_at: null,
  name: "Demo partner",
  revoked_at: null,
  scopes: ["bookings:read"],
  token_last4: "X9Q2",
  token_prefix: "tmro_demo",
}];

export default async function IntegrationsPage() {
  if (!hasSupabaseEnv()) {
    return (
      <section className="flex flex-col gap-6">
        <DemoBanner />
        <IntegrationsHeader />
        <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
          <ApiKeyList keys={demoKeys} />
          <ApiKeyCreateForm />
        </div>
      </section>
    );
  }

  const auth = await requireOwner();

  if ("error" in auth) {
    redirect(auth.error === "Unauthorized" ? "/login" : "/dashboard");
  }

  const { data } = await auth.supabase
    .from("tenant_api_keys")
    .select("id, name, token_prefix, token_last4, scopes, last_used_at, revoked_at, created_at")
    .eq("tenant_id", auth.tenantId)
    .order("created_at", { ascending: false });

  return (
    <section className="flex flex-col gap-6">
      <IntegrationsHeader />
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <ApiKeyList keys={(data ?? []) as ApiKeyRow[]} />
        <ApiKeyCreateForm />
      </div>
    </section>
  );
}
