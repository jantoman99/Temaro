import { redirect } from "next/navigation";
import { z } from "zod";

import { DemoBanner } from "@/components/demo/demo-banner";
import { ClientForm } from "@/components/clients/client-form";
import { ClientList } from "@/components/clients/client-list";
import { PageHeader } from "@/components/layouts/page-header";
import { requireOwner } from "@/lib/auth/require-owner";
import { buildClientSearchFilter } from "@/lib/clients/search-filter";
import { demoClients } from "@/lib/demo/data";
import { hasSupabaseEnv } from "@/lib/env";

const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;
const DEFAULT_PAGE_SIZE = 10;

type ClientsPageProps = {
  searchParams: Promise<{
    filter?: string;
    flagged?: string;
    noShow?: string;
    page?: string;
    pageSize?: string;
    query?: string;
    sortDir?: string;
    sort?: string;
  }>;
};

const clientsSearchParamsSchema = z.object({
  filter: z.enum(["all", "flagged", "noShow"]).optional(),
  flagged: z.enum(["all", "clean", "flagged"]).optional(),
  noShow: z.enum(["all", "yes"]).optional(),
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().refine((value) => PAGE_SIZE_OPTIONS.includes(value as (typeof PAGE_SIZE_OPTIONS)[number])).optional(),
  query: z.string().trim().max(100).optional(),
  sort: z.enum(["alpha", "recent", "no_show", "client", "contact", "risk", "note", "createdAt"]).optional(),
  sortDir: z.enum(["asc", "desc"]).optional(),
});

export default async function ClientsPage({ searchParams }: ClientsPageProps) {
  const rawSearchParams = await searchParams;
  const parsedSearchParams = clientsSearchParamsSchema.safeParse(rawSearchParams);
  const explicitFilter = parsedSearchParams.success ? parsedSearchParams.data.filter : undefined;
  const flagged = parsedSearchParams.success ? (parsedSearchParams.data.flagged ?? "all") : "all";
  const noShow = parsedSearchParams.success ? (parsedSearchParams.data.noShow ?? "all") : "all";
  const filter = explicitFilter ?? (flagged === "flagged" ? "flagged" : noShow === "yes" ? "noShow" : "all");
  const page = parsedSearchParams.success ? (parsedSearchParams.data.page ?? 1) : 1;
  const pageSize = parsedSearchParams.success ? (parsedSearchParams.data.pageSize ?? DEFAULT_PAGE_SIZE) : DEFAULT_PAGE_SIZE;
  const query = parsedSearchParams.success ? (parsedSearchParams.data.query ?? "") : "";
  const rawSort = parsedSearchParams.success ? (parsedSearchParams.data.sort ?? "client") : "client";
  const sort = rawSort === "alpha" ? "client" : rawSort === "recent" ? "createdAt" : rawSort === "no_show" ? "risk" : rawSort;
  const sortDirection = parsedSearchParams.success ? (parsedSearchParams.data.sortDir ?? (sort === "createdAt" || sort === "risk" ? "desc" : "asc")) : "asc";

  return <ClientsContent filter={filter} page={page} pageSize={pageSize} query={query} sort={sort} sortDirection={sortDirection} />;
}

function ClientsHeader({ isDemo }: { isDemo: boolean }) {
  return (
    <PageHeader
      description="Historie, poznámky a flagy. Veřejný booking nikdy nezobrazuje interní data."
      eyebrow={isDemo ? "Demo režim" : "Adresář"}
      title="Klienti"
    />
  );
}

function CreateClientPanel() {
  return (
    <ClientForm embedded />
  );
}

async function ClientsContent({
  filter,
  page,
  pageSize,
  query,
  sort,
  sortDirection,
}: {
  filter: "all" | "flagged" | "noShow";
  page: number;
  pageSize: number;
  query: string;
  sort: "client" | "contact" | "risk" | "note" | "createdAt";
  sortDirection: "asc" | "desc";
}) {
  if (!hasSupabaseEnv()) {
    const baseClients = [...demoClients];
    const filteredClients = baseClients.filter((client) => {
      const matchesFlagged =
        filter === "all" || (filter === "flagged" ? client.is_flagged : true);
      const matchesNoShow = filter !== "noShow" || client.no_show_count > 0;

      if (!matchesFlagged || !matchesNoShow) {
        return false;
      }

      if (!query) {
        return true;
      }

      const normalizedQuery = query.toLowerCase();

      return [client.full_name, client.phone ?? "", client.email ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    });
    const sortedClients = filteredClients.sort((left, right) => {
      if (sort === "createdAt") {
        return new Date(right.created_at).getTime() - new Date(left.created_at).getTime();
      }

      if (sort === "risk") {
        return right.no_show_count - left.no_show_count || left.full_name.localeCompare(right.full_name);
      }

      return left.full_name.localeCompare(right.full_name);
    });
    return (
      <section className="flex flex-col gap-5">
          <DemoBanner />
          <ClientsHeader isDemo />
          <ClientList clients={sortedClients} createSlot={<CreateClientPanel />} isDemo />
      </section>
    );
  }

  const auth = await requireOwner();

  if ("error" in auth) {
    if (auth.error === "Unauthorized") {
      redirect("/login");
    }

    redirect("/login");
  }

  const owner = auth;

  function getClientsQuery() {
    let queryBuilder = owner.supabase
      .from("clients")
      .select("*", { count: "exact" })
      .eq("tenant_id", owner.tenantId)
      .is("deleted_at", null);

    if (filter === "flagged") {
      queryBuilder = queryBuilder.eq("is_flagged", true);
    }

    if (filter === "noShow") {
      queryBuilder = queryBuilder.gt("no_show_count", 0);
    }

    if (query) {
      queryBuilder = queryBuilder.or(buildClientSearchFilter(query));
    }

    const ascending = sortDirection === "asc";
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    if (sort === "createdAt") {
      return queryBuilder.order("created_at", { ascending }).range(from, to);
    }

    if (sort === "risk") {
      return queryBuilder.order("no_show_count", { ascending }).order("full_name", { ascending: true }).range(from, to);
    }

    if (sort === "contact") {
      return queryBuilder.order("email", { ascending, nullsFirst: false }).order("phone", { ascending, nullsFirst: false }).range(from, to);
    }

    if (sort === "note") {
      return queryBuilder.order("flag_reason", { ascending, nullsFirst: false }).order("notes", { ascending, nullsFirst: false }).range(from, to);
    }

    return queryBuilder.order("full_name", { ascending }).range(from, to);
  }

  const clientsResult = await getClientsQuery();
  const clients = clientsResult.data ?? [];
  const hasLoadError = Boolean(clientsResult.error);

  return (
    <section className="flex flex-col gap-5">
        <ClientsHeader isDemo={false} />
        {hasLoadError ? (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            Klienty se nepodařilo načíst. Zkuste stránku obnovit.
          </div>
        ) : null}
        <ClientList
          clients={clients}
          createSlot={<CreateClientPanel />}
          pagination={{
            filter,
            page,
            pageSize,
            query,
            sortDirection,
            sortKey: sort,
            totalCount: clientsResult.count ?? 0,
          }}
        />
    </section>
  );
}
