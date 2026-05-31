import { describe, expect, it } from "vitest";

import { buildTableSearchParams } from "@/components/entity-table/table-url-state";

describe("entity table URL state", () => {
  it("sets and keeps table query params", () => {
    expect(buildTableSearchParams("query=eva&page=2", { page: 1, sort: "name" })).toBe("query=eva&page=1&sort=name");
  });

  it("removes empty table params", () => {
    expect(buildTableSearchParams("query=eva&filter=flagged&page=3", { filter: null, query: "", page: 1 })).toBe("page=1");
  });

  it("serializes numeric page size", () => {
    expect(buildTableSearchParams("", { pageSize: 25 })).toBe("pageSize=25");
  });
});
