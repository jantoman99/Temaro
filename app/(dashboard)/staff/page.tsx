import { redirect } from "next/navigation";
import { z } from "zod";

import { DemoBanner } from "@/components/demo/demo-banner";
import { PageHeader } from "@/components/layouts/page-header";
import { StaffForm } from "@/components/staff/staff-form";
import { StaffInviteForm } from "@/components/staff/staff-invite-form";
import { StaffList } from "@/components/staff/staff-list";
import { demoServices, demoStaff } from "@/lib/demo/data";
import { hasSupabaseEnv } from "@/lib/env";
import { requireOwner } from "@/lib/auth/require-owner";
import { escapeSupabaseLike } from "@/lib/utils/normalize-search";
import type { Database } from "@/types/database";

const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;
const DEFAULT_PAGE_SIZE = 10;
type StaffMetricSortColumn = keyof Pick<
  Database["public"]["Views"]["staff_directory_metrics"]["Row"],
  "exception_count" | "name" | "service_count" | "user_id" | "working_days_count"
>;

type StaffPageProps = {
  searchParams: Promise<{
    filter?: string;
    page?: string;
    pageSize?: string;
    query?: string;
    sort?: string;
    sortDir?: string;
  }>;
};

const staffSearchParamsSchema = z.object({
  filter: z.enum(["all", "withAccount", "withoutAccount", "withExceptions"]).optional(),
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().refine((value) => PAGE_SIZE_OPTIONS.includes(value as (typeof PAGE_SIZE_OPTIONS)[number])).optional(),
  query: z.string().trim().max(100).optional(),
  sort: z.enum(["name", "hours", "services", "exceptions", "account"]).optional(),
  sortDir: z.enum(["asc", "desc"]).optional(),
});

function StaffHeader({ isDemo }: { isDemo: boolean }) {
  return (
    <PageHeader
      description="Pracovní doba, výjimky, pozvánky a vazby mezi lidmi a službami."
      eyebrow={isDemo ? "Demo režim" : "Poskytovatelé"}
      title="Tým"
    />
  );
}

function CreateStaffPanel({ staff }: { staff: Parameters<typeof StaffInviteForm>[0]["staff"] }) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <StaffForm embedded />
      <StaffInviteForm embedded staff={staff} />
    </div>
  );
}

export default async function StaffPage({ searchParams }: StaffPageProps) {
  const rawSearchParams = await searchParams;
  const parsedSearchParams = staffSearchParamsSchema.safeParse(rawSearchParams);
  const filter = parsedSearchParams.success ? (parsedSearchParams.data.filter ?? "all") : "all";
  const page = parsedSearchParams.success ? (parsedSearchParams.data.page ?? 1) : 1;
  const pageSize = parsedSearchParams.success ? (parsedSearchParams.data.pageSize ?? DEFAULT_PAGE_SIZE) : DEFAULT_PAGE_SIZE;
  const query = parsedSearchParams.success ? (parsedSearchParams.data.query ?? "") : "";
  const sort = parsedSearchParams.success ? (parsedSearchParams.data.sort ?? "name") : "name";
  const sortDirection = parsedSearchParams.success ? (parsedSearchParams.data.sortDir ?? "asc") : "asc";

  return <StaffContent filter={filter} page={page} pageSize={pageSize} query={query} sort={sort} sortDirection={sortDirection} />;
}

async function StaffContent({
  filter,
  page,
  pageSize,
  query,
  sort,
  sortDirection,
}: {
  filter: "all" | "withAccount" | "withoutAccount" | "withExceptions";
  page: number;
  pageSize: number;
  query: string;
  sort: "name" | "hours" | "services" | "exceptions" | "account";
  sortDirection: "asc" | "desc";
}) {
  if (!hasSupabaseEnv()) {
    const filteredStaff = demoStaff.filter((member) => {
      if (filter === "withAccount" && !member.user_id) return false;
      if (filter === "withoutAccount" && member.user_id) return false;
      if (filter === "withExceptions" && member.staff_exceptions.length === 0) return false;

      if (!query) {
        return true;
      }

      const normalizedQuery = query.toLowerCase();

      return [member.name, member.bio ?? ""].join(" ").toLowerCase().includes(normalizedQuery);
    });
    return (
      <section className="flex flex-col gap-6">
          <DemoBanner />
          <StaffHeader isDemo />
          <StaffList createSlot={<CreateStaffPanel staff={demoStaff} />} isDemo services={demoServices} staff={filteredStaff} />
      </section>
    );
  }

  const auth = await requireOwner();

  if ("error" in auth) {
    redirect(auth.error === "Unauthorized" ? "/login" : "/dashboard");
  }

  let metricsQuery = auth.supabase
    .from("staff_directory_metrics")
    .select("*", { count: "exact" })
    .eq("tenant_id", auth.tenantId);

  if (filter === "withAccount") {
    metricsQuery = metricsQuery.not("user_id", "is", null);
  }

  if (filter === "withoutAccount") {
    metricsQuery = metricsQuery.is("user_id", null);
  }

  if (filter === "withExceptions") {
    metricsQuery = metricsQuery.gt("exception_count", 0);
  }

  if (query) {
    const escapedQuery = escapeSupabaseLike(query);
    metricsQuery = metricsQuery.or(`name.ilike.%${escapedQuery}%,bio.ilike.%${escapedQuery}%`);
  }

  const ascending = sortDirection === "asc";
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const orderColumn: StaffMetricSortColumn =
    sort === "account"
      ? "user_id"
      : sort === "exceptions"
        ? "exception_count"
        : sort === "hours"
          ? "working_days_count"
          : sort === "services"
            ? "service_count"
            : "name";

  const [
    { count: staffCount, data: staffMetrics, error: staffMetricsError },
    { data: services, error: servicesError },
  ] = await Promise.all([
    metricsQuery.order(orderColumn, { ascending, nullsFirst: false }).order("name", { ascending: true }).range(from, to),
    auth.supabase
      .from("services")
      .select("*")
      .eq("tenant_id", auth.tenantId)
      .eq("is_active", true)
      .is("deleted_at", null)
      .order("position", { ascending: true })
      .order("name", { ascending: true }),
  ]);
  const staffIds = staffMetrics?.map((metric) => metric.id) ?? [];
  const { data: staff, error: staffError } = staffIds.length > 0
    ? await auth.supabase
        .from("staff")
        .select("*, staff_exceptions(*), staff_hours(*), staff_services(*)")
        .eq("tenant_id", auth.tenantId)
        .in("id", staffIds)
    : { data: [], error: null };
  const staffOrder = new Map(staffIds.map((staffId, index) => [staffId, index]));
  const hasLoadError = Boolean(staffMetricsError || staffError || servicesError);
  const staffRows = (staff ?? []).toSorted((left, right) => {
    return (staffOrder.get(left.id) ?? Number.MAX_SAFE_INTEGER) - (staffOrder.get(right.id) ?? Number.MAX_SAFE_INTEGER);
  });
  const serviceRows = services ?? [];

  return (
    <section className="flex flex-col gap-6">
        <StaffHeader isDemo={false} />
        {hasLoadError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700 shadow-sm">
            Zaměstnance se nepodařilo načíst. Zkuste stránku obnovit.
          </div>
        ) : null}
        <StaffList
          createSlot={<CreateStaffPanel staff={staffRows} />}
          pagination={{
            filter,
            page,
            pageSize,
            query,
            sortDirection,
            sortKey: sort,
            totalCount: staffCount ?? 0,
          }}
          services={serviceRows}
          staff={staffRows}
        />
    </section>
  );
}
