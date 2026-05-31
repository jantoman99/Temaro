import { redirect } from "next/navigation";

import { DemoBanner } from "@/components/demo/demo-banner";
import { CsvImportForm } from "@/components/import/csv-import-form";
import { PageHeader } from "@/components/layouts/page-header";
import { requireOwner } from "@/lib/auth/require-owner";
import { hasSupabaseEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function ImportPage() {
  if (!hasSupabaseEnv()) {
    return (
      <section className="flex flex-col gap-6">
        <DemoBanner />
        <ImportHeader />
        <CsvImportForm />
      </section>
    );
  }

  const auth = await requireOwner();

  if ("error" in auth) {
    redirect(auth.error === "Unauthorized" ? "/login" : "/dashboard");
  }

  return (
    <section className="flex flex-col gap-6">
      <ImportHeader />
      <CsvImportForm />
    </section>
  );
}

function ImportHeader() {
  return (
    <PageHeader
      description="Migrační vstup pro přechod z konkurence. Import začíná bezpečným dry-runem, validuje hlavičky a nikdy nebere tenant_id z CSV."
      eyebrow="Migrace dat"
      title="Import"
    />
  );
}
