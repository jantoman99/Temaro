import { redirect } from "next/navigation";
import { z } from "zod";

import { DemoBanner } from "@/components/demo/demo-banner";
import { PageHeader } from "@/components/layouts/page-header";
import { ServiceForm } from "@/components/services/service-form";
import { ServiceList } from "@/components/services/service-list";
import { ServiceTemplatePanel } from "@/components/services/service-template-panel";
import { demoServices, demoTenant } from "@/lib/demo/data";
import { hasSupabaseEnv } from "@/lib/env";
import { requireOwner } from "@/lib/auth/require-owner";
import { getServiceTemplate, getServiceTemplatesForIndustry, type ServiceTemplate } from "@/lib/service-templates";
import { escapeSupabaseLike } from "@/lib/utils/normalize-search";

const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;
const DEFAULT_PAGE_SIZE = 10;

type ServicesPageProps = {
  searchParams: Promise<{
    filter?: string;
    page?: string;
    pageSize?: string;
    query?: string;
    sort?: string;
    sortDir?: string;
    template?: string;
  }>;
};

const servicesSearchParamsSchema = z.object({
  filter: z.enum(["all", "paid", "free", "withBuffer", "withDeposit"]).optional(),
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().refine((value) => PAGE_SIZE_OPTIONS.includes(value as (typeof PAGE_SIZE_OPTIONS)[number])).optional(),
  query: z.string().trim().max(100).optional(),
  sort: z.enum(["name", "duration", "price", "deposit", "buffer", "description"]).optional(),
  sortDir: z.enum(["asc", "desc"]).optional(),
  template: z.string().trim().max(80).optional(),
});

export default async function ServicesPage({ searchParams }: ServicesPageProps) {
  const rawSearchParams = await searchParams;
  const parsedSearchParams = servicesSearchParamsSchema.safeParse(rawSearchParams);
  const filter = parsedSearchParams.success ? (parsedSearchParams.data.filter ?? "all") : "all";
  const page = parsedSearchParams.success ? (parsedSearchParams.data.page ?? 1) : 1;
  const pageSize = parsedSearchParams.success ? (parsedSearchParams.data.pageSize ?? DEFAULT_PAGE_SIZE) : DEFAULT_PAGE_SIZE;
  const query = parsedSearchParams.success ? (parsedSearchParams.data.query ?? "") : "";
  const sort = parsedSearchParams.success ? (parsedSearchParams.data.sort ?? "name") : "name";
  const sortDirection = parsedSearchParams.success ? (parsedSearchParams.data.sortDir ?? "asc") : "asc";
  const templateId = parsedSearchParams.success ? (parsedSearchParams.data.template ?? "") : "";

  return <ServicesContent filter={filter} page={page} pageSize={pageSize} query={query} sort={sort} sortDirection={sortDirection} templateId={templateId} />;
}

function ServicesHeader({ isDemo }: { isDemo: boolean }) {
  return (
    <PageHeader
      description="Ceny, délky, buffery a nabídka, kterou klient uvidí ve veřejném booking flow."
      eyebrow={isDemo ? "Demo režim" : "Tenant-scoped CRUD"}
      title="Služby"
    />
  );
}

function CreateServicePanel({
  defaultCurrency,
  initialTemplate,
}: {
  defaultCurrency?: string | null;
  initialTemplate?: ServiceTemplate | null;
}) {
  return (
    <ServiceForm defaultCurrency={defaultCurrency} embedded initialTemplate={initialTemplate} />
  );
}

async function ServicesContent({
  filter,
  page,
  pageSize,
  query,
  sort,
  sortDirection,
  templateId,
}: {
  filter: "all" | "paid" | "free" | "withBuffer" | "withDeposit";
  page: number;
  pageSize: number;
  query: string;
  sort: "name" | "duration" | "price" | "deposit" | "buffer" | "description";
  sortDirection: "asc" | "desc";
  templateId: string;
}) {
  if (!hasSupabaseEnv()) {
    const templates = getServiceTemplatesForIndustry(demoTenant.industry);
    const initialTemplate = getServiceTemplate(templateId, demoTenant.industry);
    const filteredServices = demoServices.filter((service) => {
      if (filter === "paid" && service.price <= 0) return false;
      if (filter === "free" && service.price > 0) return false;
      if (filter === "withBuffer" && service.buffer_minutes === 0) return false;
      if (filter === "withDeposit" && service.deposit_type === "none") return false;

      if (!query) {
        return true;
      }

      const normalizedQuery = query.toLowerCase();

      return [service.name, service.description ?? ""].join(" ").toLowerCase().includes(normalizedQuery);
    });

    return (
        <section className="flex flex-col gap-5">
          <DemoBanner />
          <ServicesHeader isDemo />
          <ServiceTemplatePanel industry={demoTenant.industry} selectedTemplateId={initialTemplate?.id ?? ""} templates={templates} />
          <ServiceList createSlot={<CreateServicePanel defaultCurrency="CZK" initialTemplate={initialTemplate} />} services={filteredServices} isDemo />
      </section>
    );
  }

  const auth = await requireOwner();

  if ("error" in auth) {
    redirect(auth.error === "Unauthorized" ? "/login" : "/dashboard");
  }

  let servicesQuery = auth.supabase
    .from("services")
    .select("*", { count: "exact" })
    .eq("tenant_id", auth.tenantId)
    .eq("is_active", true)
    .is("deleted_at", null);

  if (filter === "paid") {
    servicesQuery = servicesQuery.gt("price", 0);
  }

  if (filter === "free") {
    servicesQuery = servicesQuery.eq("price", 0);
  }

  if (filter === "withBuffer") {
    servicesQuery = servicesQuery.gt("buffer_minutes", 0);
  }

  if (filter === "withDeposit") {
    servicesQuery = servicesQuery.neq("deposit_type", "none");
  }

  if (query) {
    const escapedQuery = escapeSupabaseLike(query);
    servicesQuery = servicesQuery.or(`name.ilike.%${escapedQuery}%,description.ilike.%${escapedQuery}%`);
  }

  const ascending = sortDirection === "asc";
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const orderColumn = sort === "duration"
    ? "duration_minutes"
    : sort === "buffer"
      ? "buffer_minutes"
      : sort === "deposit"
        ? "deposit_value"
        : sort;

  const [
    { count: servicesCount, data: services, error: servicesError },
    { data: tenant, error: tenantError },
  ] = await Promise.all([
    servicesQuery.order(orderColumn, { ascending, nullsFirst: false }).order("name", { ascending: true }).range(from, to),
    auth.supabase
      .from("tenants")
      .select("default_currency, industry")
      .eq("id", auth.tenantId)
      .is("deleted_at", null)
      .single(),
  ]);
  const hasLoadError = Boolean(servicesError || tenantError);
  const industry = tenant?.industry ?? "hair";
  const templates = getServiceTemplatesForIndustry(industry);
  const initialTemplate = getServiceTemplate(templateId, industry);

  return (
    <section className="flex flex-col gap-5">
        <ServicesHeader isDemo={false} />
        {hasLoadError ? (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            Služby se nepodařilo načíst. Zkuste stránku obnovit.
          </div>
        ) : null}
        <ServiceTemplatePanel industry={industry} selectedTemplateId={initialTemplate?.id ?? ""} templates={templates} />
        <ServiceList
          createSlot={<CreateServicePanel defaultCurrency={tenant?.default_currency ?? "CZK"} initialTemplate={initialTemplate} />}
          pagination={{
            filter,
            page,
            pageSize,
            query,
            sortDirection,
            sortKey: sort,
            totalCount: servicesCount ?? 0,
          }}
          services={services ?? []}
        />
    </section>
  );
}
