"use client";

import type { ReactNode } from "react";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { Tag } from "lucide-react";

import { DemoSubmitButton } from "@/components/demo/demo-submit-button";
import { useUrlTableState } from "@/components/entity-table/use-url-table-state";
import { ServiceEditForm } from "@/components/services/service-edit-form";
import { ServiceHideForm } from "@/components/services/service-hide-form";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCurrencyForDisplay } from "@/lib/currency";
import type { Database } from "@/types/database";

type Service = Database["public"]["Tables"]["services"]["Row"];
type ColumnKey = "name" | "duration" | "price" | "deposit" | "buffer" | "description" | "actions";
type FilterKey = "all" | "paid" | "free" | "withBuffer" | "withDeposit";
type SortKey = Exclude<ColumnKey, "actions">;
type SortDirection = "asc" | "desc";

const COLUMN_STORAGE_KEY = "temaro.services.visibleColumns";
const PAGE_SIZE_STORAGE_KEY = "temaro.services.pageSize";
const DEFAULT_COLUMNS: ColumnKey[] = ["name", "duration", "price", "deposit", "buffer", "description", "actions"];
const PAGE_SIZE_OPTIONS = [10, 25, 50];
const COLUMN_LABELS: Record<ColumnKey, string> = {
  actions: "Akce",
  buffer: "Buffer",
  description: "Popis",
  deposit: "Záloha",
  duration: "Délka",
  name: "Služba",
  price: "Cena",
};
const FILTER_LABELS: Record<FilterKey, string> = {
  all: "Všechny služby",
  free: "Zdarma",
  paid: "Placené",
  withDeposit: "Se zálohou",
  withBuffer: "S bufferem",
};

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

function getSearchIndex(service: Service) {
  return normalize(
    [
      service.name,
      service.description ?? "",
      `${service.duration_minutes} min`,
      `${service.buffer_minutes} buffer`,
      getDepositLabel(service),
      formatCurrencyForDisplay(service.price, service.currency, 2),
    ].join(" "),
  );
}

function getSortValue(service: Service, sortKey: SortKey) {
  if (sortKey === "name") return service.name;
  if (sortKey === "duration") return service.duration_minutes;
  if (sortKey === "price") return service.price;
  if (sortKey === "deposit") return getDepositSortValue(service);
  if (sortKey === "buffer") return service.buffer_minutes;
  return service.description ?? "";
}

function getDepositAmount(service: Service) {
  if (service.deposit_type === "fixed") return service.deposit_value;
  if (service.deposit_type === "percent") return Math.ceil((service.price * service.deposit_value) / 100);
  return 0;
}

function getDepositSortValue(service: Service) {
  return getDepositAmount(service);
}

function getDepositLabel(service: Service) {
  if (service.deposit_type === "fixed") {
    return formatCurrencyForDisplay(service.deposit_value, service.currency, 2);
  }

  if (service.deposit_type === "percent") {
    return `${service.deposit_value} % (${formatCurrencyForDisplay(getDepositAmount(service), service.currency, 2)})`;
  }

  return "Bez zálohy";
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

        if (validColumns.length > 0 && validColumns.includes("name")) {
          setVisibleColumns(new Set(validColumns));
        }
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

export function ServiceList({
  createSlot,
  isDemo = false,
  pagination,
  services,
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
  const filteredServices = useMemo(() => {
    if (isServerTable) return services;

    return services
      .filter((service) => {
        if (effectiveFilter === "paid" && service.price <= 0) return false;
        if (effectiveFilter === "free" && service.price > 0) return false;
        if (effectiveFilter === "withBuffer" && service.buffer_minutes === 0) return false;
        if (effectiveFilter === "withDeposit" && service.deposit_type === "none") return false;
        return normalizedQuery ? getSearchIndex(service).includes(normalizedQuery) : true;
      })
      .toSorted((left, right) => compareValues(getSortValue(left, effectiveSortKey), getSortValue(right, effectiveSortKey), effectiveSortDirection));
  }, [effectiveFilter, effectiveSortDirection, effectiveSortKey, isServerTable, normalizedQuery, services]);
  const totalCount = pagination?.totalCount ?? filteredServices.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / effectivePageSize));
  const safeCurrentPage = Math.min(effectivePage, totalPages);
  const pageStartIndex = (safeCurrentPage - 1) * effectivePageSize;
  const pagedServices = isServerTable ? services : filteredServices.slice(pageStartIndex, pageStartIndex + effectivePageSize);
  const visibleFrom = totalCount === 0 ? 0 : pageStartIndex + 1;
  const visibleTo = Math.min(pageStartIndex + pagedServices.length, totalCount);

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

  if (!isServerTable && services.length === 0) {
    return (
      <EmptyState
        description="Přidejte první službu a veřejný booking bude mít co nabídnout."
        icon={Tag}
        title={<>Žádné <span className="font-serif-accent text-primary">aktivní</span> služby</>}
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
                Přidat službu
              </summary>
              <div className="absolute right-0 top-11 z-40 w-[min(34rem,calc(100vw-2rem))] rounded-xl border border-border bg-card p-4 shadow-xl">
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
            placeholder="Hledat napříč službami..."
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
        <table className="w-full min-w-[860px] border-collapse text-left text-sm">
          <thead className="bg-muted/45 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
            <tr>
              {visibleColumns.has("name") ? <th className="w-[24%] px-4 py-3"><button type="button" onClick={() => toggleSort("name")}>Služba{sortLabel("name")}</button></th> : null}
              {visibleColumns.has("duration") ? <th className="w-[11%] px-4 py-3"><button type="button" onClick={() => toggleSort("duration")}>Délka{sortLabel("duration")}</button></th> : null}
              {visibleColumns.has("price") ? <th className="w-[12%] px-4 py-3"><button type="button" onClick={() => toggleSort("price")}>Cena{sortLabel("price")}</button></th> : null}
              {visibleColumns.has("deposit") ? <th className="w-[14%] px-4 py-3"><button type="button" onClick={() => toggleSort("deposit")}>Záloha{sortLabel("deposit")}</button></th> : null}
              {visibleColumns.has("buffer") ? <th className="w-[11%] px-4 py-3"><button type="button" onClick={() => toggleSort("buffer")}>Buffer{sortLabel("buffer")}</button></th> : null}
              {visibleColumns.has("description") ? <th className="w-[32%] px-4 py-3"><button type="button" onClick={() => toggleSort("description")}>Popis{sortLabel("description")}</button></th> : null}
              {visibleColumns.has("actions") ? <th className="w-[10%] px-4 py-3 text-right">Akce</th> : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {pagedServices.map((service) => (
              <tr key={service.id} className="transition hover:bg-muted/35">
                {visibleColumns.has("name") ? <td className="px-4 py-3 font-semibold">{service.name}</td> : null}
                {visibleColumns.has("duration") ? <td className="px-4 py-3 nums-tabular text-muted-foreground">{service.duration_minutes} min</td> : null}
                {visibleColumns.has("price") ? <td className="px-4 py-3 nums-tabular font-semibold">{formatCurrencyForDisplay(service.price, service.currency, 2)}</td> : null}
                {visibleColumns.has("deposit") ? <td className="px-4 py-3 nums-tabular text-muted-foreground">{getDepositLabel(service)}</td> : null}
                {visibleColumns.has("buffer") ? <td className="px-4 py-3 nums-tabular text-muted-foreground">{service.buffer_minutes} min</td> : null}
                {visibleColumns.has("description") ? <td className="px-4 py-3 text-muted-foreground"><span className="line-clamp-1">{service.description || "Bez popisu"}</span></td> : null}
                {visibleColumns.has("actions") ? (
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1.5">
                      {isDemo ? (
                        <DemoSubmitButton>Skrýt</DemoSubmitButton>
                      ) : (
                        <>
                          <ServiceEditForm service={service} />
                          <ServiceHideForm serviceId={service.id} />
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
