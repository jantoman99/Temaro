"use client";

import type { ReactNode } from "react";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { UserRoundCog } from "lucide-react";

import { DemoSubmitButton } from "@/components/demo/demo-submit-button";
import { useUrlTableState } from "@/components/entity-table/use-url-table-state";
import { StaffEditForm } from "@/components/staff/staff-edit-form";
import { StaffExceptionForm } from "@/components/staff/staff-exception-form";
import { StaffHideForm } from "@/components/staff/staff-hide-form";
import { StaffServiceAssignForm } from "@/components/staff/staff-service-assign-form";
import { StaffServiceRemoveForm } from "@/components/staff/staff-service-remove-form";
import { EmptyState } from "@/components/ui/empty-state";
import type { Database } from "@/types/database";

type Staff = Database["public"]["Tables"]["staff"]["Row"] & {
  staff_exceptions: Database["public"]["Tables"]["staff_exceptions"]["Row"][];
  staff_hours: Database["public"]["Tables"]["staff_hours"]["Row"][];
  staff_services: Database["public"]["Tables"]["staff_services"]["Row"][];
};
type Service = Database["public"]["Tables"]["services"]["Row"];
type ColumnKey = "name" | "hours" | "services" | "exceptions" | "account" | "actions";
type FilterKey = "all" | "withAccount" | "withoutAccount" | "withExceptions";
type SortKey = Exclude<ColumnKey, "actions">;
type SortDirection = "asc" | "desc";

const COLUMN_STORAGE_KEY = "temaro.staff.visibleColumns";
const PAGE_SIZE_STORAGE_KEY = "temaro.staff.pageSize";
const DEFAULT_COLUMNS: ColumnKey[] = ["name", "hours", "services", "exceptions", "account", "actions"];
const PAGE_SIZE_OPTIONS = [10, 25, 50];
const COLUMN_LABELS: Record<ColumnKey, string> = {
  account: "Účet",
  actions: "Akce",
  exceptions: "Výjimky",
  hours: "Pracovní doba",
  name: "Člen týmu",
  services: "Služby",
};
const FILTER_LABELS: Record<FilterKey, string> = {
  all: "Celý tým",
  withAccount: "S účtem",
  withExceptions: "S výjimkou",
  withoutAccount: "Bez účtu",
};
const dayLabels = ["Po", "Út", "St", "Čt", "Pá", "So", "Ne"];

function formatHours(staffHours: Staff["staff_hours"]) {
  if (staffHours.length === 0) return "Bez pracovní doby";

  const sortedHours = [...staffHours].sort((a, b) => a.day_of_week - b.day_of_week);
  const days = sortedHours.map((hour) => dayLabels[hour.day_of_week]).join(", ");
  const firstHour = sortedHours[0];

  return `${days} · ${firstHour.start_time.slice(0, 5)}-${firstHour.end_time.slice(0, 5)}`;
}

function formatException(exception: Staff["staff_exceptions"][number]) {
  if (!exception.is_working) return `${exception.date} · volno`;
  return `${exception.date} · ${exception.start_time?.slice(0, 5)}-${exception.end_time?.slice(0, 5)}`;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

function compareValues(left: string | number, right: string | number, direction: SortDirection) {
  const result = typeof left === "number" && typeof right === "number"
    ? left - right
    : String(left).localeCompare(String(right), "cs");

  return direction === "asc" ? result : -result;
}

function useVisibleColumns() {
  const [visibleColumns, setVisibleColumns] = useState<Set<ColumnKey>>(() => new Set(DEFAULT_COLUMNS));

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const storedValue = window.localStorage.getItem(COLUMN_STORAGE_KEY);
      if (!storedValue) return;

      try {
        const parsed = JSON.parse(storedValue) as ColumnKey[];
        const validColumns = parsed.filter((column): column is ColumnKey => DEFAULT_COLUMNS.includes(column));
        if (validColumns.length > 0 && validColumns.includes("name")) setVisibleColumns(new Set(validColumns));
      } catch {
        window.localStorage.removeItem(COLUMN_STORAGE_KEY);
      }
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  function toggleColumn(column: ColumnKey) {
    setVisibleColumns((current) => {
      if (column === "name") return current;

      const next = new Set(current);
      if (next.has(column)) next.delete(column);
      else next.add(column);
      if (!next.has("name")) next.add("name");
      window.localStorage.setItem(COLUMN_STORAGE_KEY, JSON.stringify([...next]));
      return next;
    });
  }

  return { toggleColumn, visibleColumns };
}

export function StaffList({
  createSlot,
  isDemo = false,
  pagination,
  services,
  staff,
}: {
  createSlot?: ReactNode;
  isDemo?: boolean;
  pagination?: {
    filter: FilterKey;
    page: number;
    pageSize: number;
    query: string;
    sortDirection: SortDirection;
    sortKey: SortKey;
    totalCount: number;
  };
  services: Service[];
  staff: Staff[];
}) {
  const isServerTable = Boolean(pagination);
  const [query, setQuery] = useState(pagination?.query ?? "");
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [pageSize, setPageSize] = useState(10);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const deferredQuery = useDeferredValue(query);
  const { toggleColumn, visibleColumns } = useVisibleColumns();
  const { replaceParams } = useUrlTableState();
  const effectiveFilter = pagination?.filter ?? filter;
  const effectivePage = pagination?.page ?? currentPage;
  const effectivePageSize = pagination?.pageSize ?? pageSize;
  const effectiveSortDirection = pagination?.sortDirection ?? sortDirection;
  const effectiveSortKey = pagination?.sortKey ?? sortKey;
  const normalizedQuery = normalize((isServerTable ? pagination?.query : deferredQuery)?.trim() ?? "");
  const rows = useMemo(() => {
    return staff.map((member) => {
      const assignedServiceIds = new Set(member.staff_services.map((item) => item.service_id));
      const assignedServices = services.filter((service) => assignedServiceIds.has(service.id));
      const assignableServices = services.filter((service) => !assignedServiceIds.has(service.id));
      const searchIndex = normalize(
        [
          member.name,
          member.bio ?? "",
          formatHours(member.staff_hours),
          assignedServices.map((service) => service.name).join(" "),
          member.user_id ? "účet aktivní" : "bez účtu",
        ].join(" "),
      );

      return { assignableServices, assignedServices, member, searchIndex };
    });
  }, [services, staff]);
  const filteredRows = rows
    .filter((row) => {
      if (isServerTable) return true;
      if (effectiveFilter === "withAccount" && !row.member.user_id) return false;
      if (effectiveFilter === "withoutAccount" && row.member.user_id) return false;
      if (effectiveFilter === "withExceptions" && row.member.staff_exceptions.length === 0) return false;
      return normalizedQuery ? row.searchIndex.includes(normalizedQuery) : true;
    })
    .toSorted((left, right) => {
      const getSortValue = (row: typeof left) => {
        if (effectiveSortKey === "name") return row.member.name;
        if (effectiveSortKey === "hours") return formatHours(row.member.staff_hours);
        if (effectiveSortKey === "services") return row.assignedServices.length;
        if (effectiveSortKey === "exceptions") return row.member.staff_exceptions.length;
        return row.member.user_id ? 1 : 0;
      };

      return compareValues(getSortValue(left), getSortValue(right), effectiveSortDirection);
    });
  const totalCount = pagination?.totalCount ?? filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / effectivePageSize));
  const safeCurrentPage = Math.min(effectivePage, totalPages);
  const pageStartIndex = (safeCurrentPage - 1) * effectivePageSize;
  const pagedRows = isServerTable ? rows : filteredRows.slice(pageStartIndex, pageStartIndex + effectivePageSize);
  const visibleFrom = totalCount === 0 ? 0 : pageStartIndex + 1;
  const visibleTo = Math.min(pageStartIndex + pagedRows.length, totalCount);

  useEffect(() => {
    if (!isServerTable || query === (pagination?.query ?? "")) return;

    const timeoutId = window.setTimeout(() => {
      replaceParams({ page: 1, query });
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [isServerTable, pagination?.query, query, replaceParams]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const storedValue = Number(window.localStorage.getItem(PAGE_SIZE_STORAGE_KEY));
      if (PAGE_SIZE_OPTIONS.includes(storedValue)) setPageSize(storedValue);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  function toggleSort(nextSortKey: SortKey) {
    if (isServerTable) {
      replaceParams({
        page: 1,
        sort: nextSortKey,
        sortDir: effectiveSortKey === nextSortKey && effectiveSortDirection === "asc" ? "desc" : "asc",
      });
      return;
    }

    setCurrentPage(1);
    setSortDirection((currentDirection) => {
      if (sortKey !== nextSortKey) return "asc";
      return currentDirection === "asc" ? "desc" : "asc";
    });
    setSortKey(nextSortKey);
  }

  function sortLabel(column: SortKey) {
    if (effectiveSortKey !== column) return "";
    return effectiveSortDirection === "asc" ? " ↑" : " ↓";
  }

  if (!isServerTable && staff.length === 0) {
    return (
      <EmptyState
        description="Přidejte prvního poskytovatele služeb a nastavte mu pracovní dobu."
        icon={UserRoundCog}
        title={<>Tým je zatím <span className="font-serif-accent text-primary">prázdný</span></>}
      />
    );
  }

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="flex flex-col gap-2 border-b border-border px-4 py-3 lg:flex-row lg:items-center lg:justify-end">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {createSlot ? (
            <details className="relative">
              <summary className="inline-flex h-9 cursor-pointer list-none items-center rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90">
                Přidat člena
              </summary>
              <div className="absolute right-0 top-11 z-40 w-[min(46rem,calc(100vw-2rem))] rounded-xl border border-border bg-card p-4 shadow-xl">
                {createSlot}
              </div>
            </details>
          ) : null}
          <input
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              if (!isServerTable) setCurrentPage(1);
            }}
            placeholder="Hledat napříč týmem..."
            className="h-9 min-w-64 rounded-md border border-input bg-background px-3 text-sm font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
          />
          <details className="relative">
            <summary className="inline-flex h-9 cursor-pointer list-none items-center rounded-md border border-border bg-background px-3 text-sm font-semibold shadow-sm hover:bg-muted">
              Filtry
            </summary>
            <div className="absolute right-0 top-11 z-30 grid w-56 gap-2 rounded-xl border border-border bg-card p-3 shadow-xl">
              {(Object.keys(FILTER_LABELS) as FilterKey[]).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    if (isServerTable) {
                      replaceParams({ filter: option === "all" ? null : option, page: 1 });
                    } else {
                      setFilter(option);
                      setCurrentPage(1);
                    }
                  }}
                  className={`h-8 rounded-md px-2 text-left text-sm font-semibold ${effectiveFilter === option ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                >
                  {FILTER_LABELS[option]}
                </button>
              ))}
            </div>
          </details>
          <details className="relative">
            <summary className="inline-flex h-9 cursor-pointer list-none items-center rounded-md border border-border bg-background px-3 text-sm font-semibold shadow-sm hover:bg-muted">
              Sloupce
            </summary>
            <div className="absolute right-0 top-11 z-30 grid w-56 gap-2 rounded-xl border border-border bg-card p-3 shadow-xl">
              {DEFAULT_COLUMNS.map((column) => (
                <label key={column} className="flex items-center gap-2 text-sm font-semibold">
                  <input
                    type="checkbox"
                    checked={visibleColumns.has(column)}
                    disabled={column === "name"}
                    onChange={() => toggleColumn(column)}
                    className="size-4 rounded border-border accent-primary"
                  />
                  {COLUMN_LABELS[column]}
                </label>
              ))}
            </div>
          </details>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] border-collapse text-left text-sm">
          <thead className="bg-muted/45 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
            <tr>
              {visibleColumns.has("name") ? <th className="w-[22%] px-4 py-3"><button type="button" onClick={() => toggleSort("name")}>Člen týmu{sortLabel("name")}</button></th> : null}
              {visibleColumns.has("hours") ? <th className="w-[20%] px-4 py-3"><button type="button" onClick={() => toggleSort("hours")}>Pracovní doba{sortLabel("hours")}</button></th> : null}
              {visibleColumns.has("services") ? <th className="w-[24%] px-4 py-3"><button type="button" onClick={() => toggleSort("services")}>Služby{sortLabel("services")}</button></th> : null}
              {visibleColumns.has("exceptions") ? <th className="w-[12%] px-4 py-3"><button type="button" onClick={() => toggleSort("exceptions")}>Výjimky{sortLabel("exceptions")}</button></th> : null}
              {visibleColumns.has("account") ? <th className="w-[10%] px-4 py-3"><button type="button" onClick={() => toggleSort("account")}>Účet{sortLabel("account")}</button></th> : null}
              {visibleColumns.has("actions") ? <th className="w-[12%] px-4 py-3 text-right">Akce</th> : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {pagedRows.map(({ assignableServices, assignedServices, member }) => (
              <tr key={member.id} className="transition hover:bg-muted/35">
                {visibleColumns.has("name") ? (
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="grid size-9 shrink-0 place-items-center rounded-md text-xs font-semibold text-white" style={{ backgroundColor: member.color ?? "#111827" }}>
                        {getInitials(member.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold">{member.name}</p>
                        {member.bio ? <p className="line-clamp-1 text-xs font-medium text-muted-foreground">{member.bio}</p> : null}
                      </div>
                    </div>
                  </td>
                ) : null}
                {visibleColumns.has("hours") ? <td className="px-4 py-3 text-muted-foreground">{formatHours(member.staff_hours)}</td> : null}
                {visibleColumns.has("services") ? (
                  <td className="px-4 py-3 text-muted-foreground">
                    <span className="line-clamp-1">
                      {assignedServices.length > 0 ? assignedServices.map((service) => service.name).join(", ") : "Žádné služby"}
                    </span>
                  </td>
                ) : null}
                {visibleColumns.has("exceptions") ? (
                  <td className="px-4 py-3 nums-tabular text-muted-foreground">{member.staff_exceptions.length}</td>
                ) : null}
                {visibleColumns.has("account") ? (
                  <td className="px-4 py-3">
                    <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${member.user_id ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-700" : "border-border bg-background text-muted-foreground"}`}>
                      {member.user_id ? "Aktivní" : "Bez účtu"}
                    </span>
                  </td>
                ) : null}
                {visibleColumns.has("actions") ? (
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1.5">
                      {isDemo ? (
                        <DemoSubmitButton>Skrýt</DemoSubmitButton>
                      ) : (
                        <>
                          <StaffEditForm member={member} />
                          <details className="relative">
                            <summary className="inline-flex h-8 cursor-pointer list-none items-center rounded-md border border-border bg-card px-2.5 text-xs font-semibold shadow-sm hover:bg-muted">
                              Správa
                            </summary>
                            <div className="absolute right-0 top-10 z-30 grid w-[28rem] gap-3 rounded-xl border border-border bg-card p-3 text-left shadow-xl">
                              <div>
                                <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Přiřazené služby</p>
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {assignedServices.length > 0 ? (
                                    assignedServices.map((service) => (
                                      <StaffServiceRemoveForm key={service.id} serviceId={service.id} serviceName={service.name} staffId={member.id} />
                                    ))
                                  ) : (
                                    <span className="text-sm font-medium text-muted-foreground">Žádná služba není přiřazená.</span>
                                  )}
                                </div>
                                {assignableServices.length > 0 ? <StaffServiceAssignForm services={assignableServices} staffId={member.id} /> : null}
                              </div>
                              <div className="border-t border-border pt-3">
                                <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Výjimky</p>
                                <div className="mt-2 grid gap-1.5">
                                  {member.staff_exceptions.slice(0, 3).map((exception) => (
                                    <p key={exception.id} className="rounded-md border border-border bg-background px-2 py-1 text-xs font-medium">
                                      {formatException(exception)}
                                    </p>
                                  ))}
                                </div>
                                <StaffExceptionForm staffId={member.id} />
                              </div>
                            </div>
                          </details>
                          <StaffHideForm staffId={member.id} />
                        </>
                      )}
                    </div>
                  </td>
                ) : null}
              </tr>
            ))}
            {totalCount === 0 ? (
              <tr>
                <td className="px-4 py-8 text-center text-sm font-medium text-muted-foreground" colSpan={visibleColumns.size}>
                  Nic neodpovídá hledání.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      <div className="flex flex-col gap-3 border-t border-border px-4 py-3 text-sm font-medium text-muted-foreground md:flex-row md:items-center md:justify-between">
        <span>
          Zobrazeno <span className="nums-tabular text-foreground">{visibleFrom}-{visibleTo}</span> z{" "}
          <span className="nums-tabular text-foreground">{totalCount}</span>
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2">
            Řádků
            <select
              value={effectivePageSize}
              onChange={(event) => {
                const nextPageSize = Number(event.target.value);
                if (isServerTable) {
                  replaceParams({ page: 1, pageSize: nextPageSize });
                } else {
                  setPageSize(nextPageSize);
                  setCurrentPage(1);
                  window.localStorage.setItem(PAGE_SIZE_STORAGE_KEY, String(nextPageSize));
                }
              }}
              className="h-8 rounded-md border border-input bg-background px-2 text-sm font-semibold text-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
            >
              {PAGE_SIZE_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>
          <button type="button" onClick={() => {
            if (isServerTable) replaceParams({ page: Math.max(1, safeCurrentPage - 1) });
            else setCurrentPage((page) => Math.max(1, page - 1));
          }} disabled={safeCurrentPage === 1} className="h-8 rounded-md border border-border bg-background px-3 text-sm font-semibold text-foreground shadow-sm disabled:cursor-not-allowed disabled:opacity-45">
            Předchozí
          </button>
          <span className="nums-tabular rounded-md border border-border bg-background px-2.5 py-1 text-xs font-semibold">
            {safeCurrentPage} / {totalPages}
          </span>
          <button type="button" onClick={() => {
            if (isServerTable) replaceParams({ page: Math.min(totalPages, safeCurrentPage + 1) });
            else setCurrentPage((page) => Math.min(totalPages, page + 1));
          }} disabled={safeCurrentPage === totalPages} className="h-8 rounded-md border border-border bg-background px-3 text-sm font-semibold text-foreground shadow-sm disabled:cursor-not-allowed disabled:opacity-45">
            Další
          </button>
        </div>
      </div>
    </section>
  );
}
