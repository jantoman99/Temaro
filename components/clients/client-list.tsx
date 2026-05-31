"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { CalendarPlus, Eye, UsersRound } from "lucide-react";

import { ClientFlagForm } from "@/components/clients/client-flag-form";
import { ClientHideForm } from "@/components/clients/client-hide-form";
import { DemoSubmitButton } from "@/components/demo/demo-submit-button";
import { useUrlTableState } from "@/components/entity-table/use-url-table-state";
import { EmptyState } from "@/components/ui/empty-state";
import type { Database } from "@/types/database";

type Client = Database["public"]["Tables"]["clients"]["Row"];
type ColumnKey = "client" | "contact" | "risk" | "note" | "createdAt" | "actions";
type FilterKey = "all" | "flagged" | "noShow";
type SortKey = Exclude<ColumnKey, "actions">;
type SortDirection = "asc" | "desc";

const COLUMN_STORAGE_KEY = "temaro.clients.visibleColumns";
const PAGE_SIZE_STORAGE_KEY = "temaro.clients.pageSize";
const DEFAULT_COLUMNS: ColumnKey[] = ["client", "contact", "risk", "note", "createdAt", "actions"];
const PAGE_SIZE_OPTIONS = [10, 25, 50];
const COLUMN_LABELS: Record<ColumnKey, string> = {
  actions: "Akce",
  client: "Klient",
  contact: "Kontakt",
  createdAt: "Vytvořen",
  note: "Poznámka",
  risk: "Riziko",
};
const FILTER_LABELS: Record<FilterKey, string> = {
  all: "Všichni klienti",
  flagged: "Jen flagovaní",
  noShow: "S no-show",
};

function getContactLabel(client: Client) {
  if (client.phone && client.email) return `${client.phone} · ${client.email}`;
  return client.phone || client.email || "Bez kontaktu";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("cs-CZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

function getSearchIndex(client: Client) {
  return normalize(
    [
      client.full_name,
      client.phone ?? "",
      client.email ?? "",
      client.notes ?? "",
      client.flag_reason ?? "",
      String(client.no_show_count),
      formatDate(client.created_at),
    ].join(" "),
  );
}

function getSortValue(client: Client, sortKey: SortKey) {
  if (sortKey === "client") return client.full_name;
  if (sortKey === "contact") return getContactLabel(client);
  if (sortKey === "risk") return client.no_show_count;
  if (sortKey === "note") return client.flag_reason || client.notes || "";
  return new Date(client.created_at).getTime();
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

        if (validColumns.length > 0 && validColumns.includes("client")) {
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
      if (column === "client") return current;

      const next = new Set(current);

      if (next.has(column)) {
        next.delete(column);
      } else {
        next.add(column);
      }

      if (!next.has("client")) next.add("client");
      window.localStorage.setItem(COLUMN_STORAGE_KEY, JSON.stringify([...next]));
      return next;
    });
  }

  return { toggleColumn, visibleColumns };
}

export function ClientList({
  clients,
  createSlot,
  isDemo = false,
  pagination,
}: {
  clients: Client[];
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
}) {
  const isServerTable = Boolean(pagination);
  const [query, setQuery] = useState(pagination?.query ?? "");
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [pageSize, setPageSize] = useState(10);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [sortKey, setSortKey] = useState<SortKey>("client");
  const deferredQuery = useDeferredValue(query);
  const { toggleColumn, visibleColumns } = useVisibleColumns();
  const { replaceParams } = useUrlTableState();
  const effectiveFilter = pagination?.filter ?? filter;
  const effectivePage = pagination?.page ?? currentPage;
  const effectivePageSize = pagination?.pageSize ?? pageSize;
  const effectiveSortDirection = pagination?.sortDirection ?? sortDirection;
  const effectiveSortKey = pagination?.sortKey ?? sortKey;
  const normalizedQuery = normalize((isServerTable ? pagination?.query : deferredQuery)?.trim() ?? "");
  const filteredClients = useMemo(() => {
    if (isServerTable) return clients;

    return clients
      .filter((client) => {
        if (effectiveFilter === "flagged" && !client.is_flagged) return false;
        if (effectiveFilter === "noShow" && client.no_show_count === 0) return false;
        return normalizedQuery ? getSearchIndex(client).includes(normalizedQuery) : true;
      })
      .toSorted((left, right) => compareValues(getSortValue(left, effectiveSortKey), getSortValue(right, effectiveSortKey), effectiveSortDirection));
  }, [clients, effectiveFilter, effectiveSortDirection, effectiveSortKey, isServerTable, normalizedQuery]);
  const totalCount = pagination?.totalCount ?? filteredClients.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / effectivePageSize));
  const safeCurrentPage = Math.min(effectivePage, totalPages);
  const pageStartIndex = (safeCurrentPage - 1) * effectivePageSize;
  const pagedClients = isServerTable ? clients : filteredClients.slice(pageStartIndex, pageStartIndex + effectivePageSize);
  const visibleFrom = totalCount === 0 ? 0 : pageStartIndex + 1;
  const visibleTo = Math.min(pageStartIndex + pagedClients.length, totalCount);

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

  if (!isServerTable && clients.length === 0) {
    return (
      <EmptyState
        description="První profily se vytvoří ručně tady nebo automaticky při rezervaci."
        icon={UsersRound}
        title={<>Zatím <span className="font-serif-accent text-primary">žádní</span> klienti</>}
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
                Přidat klienta
              </summary>
              <div className="absolute right-0 top-11 z-40 w-[min(38rem,calc(100vw-2rem))] rounded-xl border border-border bg-card p-4 shadow-xl">
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
            placeholder="Hledat napříč klienty..."
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
                    disabled={column === "client"}
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
        <table className="w-full min-w-[920px] border-collapse text-left text-sm">
          <thead className="bg-muted/45 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
            <tr>
              {visibleColumns.has("client") ? <th className="w-[24%] px-4 py-3"><button type="button" onClick={() => toggleSort("client")}>Klient{sortLabel("client")}</button></th> : null}
              {visibleColumns.has("contact") ? <th className="w-[27%] px-4 py-3"><button type="button" onClick={() => toggleSort("contact")}>Kontakt{sortLabel("contact")}</button></th> : null}
              {visibleColumns.has("risk") ? <th className="w-[13%] px-4 py-3"><button type="button" onClick={() => toggleSort("risk")}>Riziko{sortLabel("risk")}</button></th> : null}
              {visibleColumns.has("note") ? <th className="w-[22%] px-4 py-3"><button type="button" onClick={() => toggleSort("note")}>Poznámka{sortLabel("note")}</button></th> : null}
              {visibleColumns.has("createdAt") ? <th className="w-[8%] px-4 py-3"><button type="button" onClick={() => toggleSort("createdAt")}>Vytvořen{sortLabel("createdAt")}</button></th> : null}
              {visibleColumns.has("actions") ? <th className="w-[6%] px-4 py-3 text-right">Akce</th> : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {pagedClients.map((client) => (
              <tr key={client.id} className="transition hover:bg-muted/35">
                {visibleColumns.has("client") ? (
                  <td className="px-4 py-3 align-middle">
                    <Link href={`/clients/${client.id}`} className="font-semibold text-foreground underline-offset-4 hover:text-primary hover:underline">
                      {client.full_name}
                    </Link>
                    {client.is_flagged ? <p className="mt-1 text-xs font-semibold text-amber-700">Flagovaný klient</p> : null}
                  </td>
                ) : null}
                {visibleColumns.has("contact") ? (
                  <td className="px-4 py-3 align-middle text-sm font-medium text-muted-foreground">
                    <span className="line-clamp-1">{getContactLabel(client)}</span>
                  </td>
                ) : null}
                {visibleColumns.has("risk") ? (
                  <td className="px-4 py-3 align-middle">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold nums-tabular ${client.no_show_count > 0 ? "border-red-500/25 bg-red-500/10 text-red-700" : "border-border bg-background text-muted-foreground"}`}>
                        No-show {client.no_show_count}
                      </span>
                      {client.is_flagged ? (
                        <span className="rounded-full border border-amber-500/25 bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-800">
                          Flag
                        </span>
                      ) : null}
                    </div>
                  </td>
                ) : null}
                {visibleColumns.has("note") ? (
                  <td className="px-4 py-3 align-middle text-sm font-medium text-muted-foreground">
                    <span className="line-clamp-1">{client.flag_reason || client.notes || "Bez poznámky"}</span>
                  </td>
                ) : null}
                {visibleColumns.has("createdAt") ? (
                  <td className="px-4 py-3 align-middle nums-tabular text-xs font-semibold text-muted-foreground">
                    {formatDate(client.created_at)}
                  </td>
                ) : null}
                {visibleColumns.has("actions") ? (
                  <td className="px-4 py-3 align-middle">
                    <div className="flex justify-end gap-1.5">
                      <Link href={`/clients/${client.id}`} className="grid size-8 place-items-center rounded-md border border-border bg-card text-muted-foreground shadow-sm hover:bg-muted hover:text-foreground" aria-label={`Otevřít ${client.full_name}`}>
                        <Eye className="size-4" />
                      </Link>
                      <Link href={`/calendar?draftClientId=${client.id}`} className="grid size-8 place-items-center rounded-md border border-border bg-card text-muted-foreground shadow-sm hover:bg-muted hover:text-foreground" aria-label={`Nová rezervace pro ${client.full_name}`}>
                        <CalendarPlus className="size-4" />
                      </Link>
                      {isDemo ? (
                        <>
                          <DemoSubmitButton>Flag</DemoSubmitButton>
                          <DemoSubmitButton>Skrýt</DemoSubmitButton>
                        </>
                      ) : (
                        <>
                          <ClientFlagForm compact clientId={client.id} flagReason={client.flag_reason} isFlagged={client.is_flagged} />
                          <ClientHideForm compact clientId={client.id} />
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
          <button
            type="button"
            onClick={() => {
              if (isServerTable) replaceParams({ page: Math.max(1, safeCurrentPage - 1) });
              else setCurrentPage((page) => Math.max(1, page - 1));
            }}
            disabled={safeCurrentPage === 1}
            className="h-8 rounded-md border border-border bg-background px-3 text-sm font-semibold text-foreground shadow-sm disabled:cursor-not-allowed disabled:opacity-45"
          >
            Předchozí
          </button>
          <span className="nums-tabular rounded-md border border-border bg-background px-2.5 py-1 text-xs font-semibold">
            {safeCurrentPage} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => {
              if (isServerTable) replaceParams({ page: Math.min(totalPages, safeCurrentPage + 1) });
              else setCurrentPage((page) => Math.min(totalPages, page + 1));
            }}
            disabled={safeCurrentPage === totalPages}
            className="h-8 rounded-md border border-border bg-background px-3 text-sm font-semibold text-foreground shadow-sm disabled:cursor-not-allowed disabled:opacity-45"
          >
            Další
          </button>
        </div>
      </div>
    </section>
  );
}
