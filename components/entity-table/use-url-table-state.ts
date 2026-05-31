"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

import { buildTableSearchParams, type TableParamValue } from "@/components/entity-table/table-url-state";

export function useUrlTableState() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const replaceParams = useCallback((updates: Record<string, TableParamValue>) => {
    const query = buildTableSearchParams(searchParams.toString(), updates);
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  return { replaceParams };
}
