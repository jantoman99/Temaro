import { beforeEach, describe, expect, it, vi } from "vitest";

const createClientMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/supabase/server", () => ({
  createClient: createClientMock,
}));

import { requireOwner } from "@/lib/auth/require-owner";
import {
  getDashboardContextRedirect,
  requireDashboardContext,
} from "@/lib/auth/require-dashboard-context";

function createTenantLookup(result: { data: { id: string } | null; error: unknown }) {
  const chain = {
    eq: vi.fn(() => chain),
    is: vi.fn(() => chain),
    maybeSingle: vi.fn(async () => result),
    select: vi.fn(() => chain),
  };

  return chain;
}

function createSupabaseMock({
  staffId,
  staffLookup = { data: { id: "staff-1" }, error: null },
  role = "owner",
  tenantLookup = { data: { id: "tenant-1" }, error: null },
  tenantId = "tenant-1",
}: {
  staffId?: string;
  staffLookup?: { data: { id: string } | null; error: unknown };
  role?: string;
  tenantLookup?: { data: { id: string } | null; error: unknown };
  tenantId?: string;
} = {}) {
  const tenantChain = createTenantLookup(tenantLookup);
  const staffChain = createTenantLookup(staffLookup);

  return {
    auth: {
      getUser: vi.fn(async () => ({
        data: {
          user: {
            app_metadata: {
              role,
              ...(staffId === undefined ? {} : { staff_id: staffId }),
              tenant_id: tenantId,
            },
          },
        },
        error: null,
      })),
    },
    from: vi.fn((table: string) => {
      if (table === "tenants") {
        return {
          select: vi.fn(() => tenantChain),
        };
      }

      if (table === "staff") {
        return {
          select: vi.fn(() => staffChain),
        };
      }

      throw new Error(`Unexpected table ${table}`);
    }),
    staffChain,
    tenantChain,
  };
}

describe("requireOwner", () => {
  beforeEach(() => {
    createClientMock.mockReset();
  });

  it("povoli ownera jen s aktivnim nesmazanym tenantem", async () => {
    const supabase = createSupabaseMock();
    createClientMock.mockResolvedValue(supabase);

    const result = await requireOwner();

    expect(result).toEqual(expect.objectContaining({
      tenantId: "tenant-1",
      user: expect.objectContaining({ app_metadata: expect.objectContaining({ role: "owner" }) }),
    }));
    expect(supabase.from).toHaveBeenCalledWith("tenants");
    expect(supabase.tenantChain.is).toHaveBeenCalledWith("deleted_at", null);
  });

  it("odmitne ownera, kdyz tenant mezitim neexistuje nebo je smazany", async () => {
    const supabase = createSupabaseMock({ tenantLookup: { data: null, error: null } });
    createClientMock.mockResolvedValue(supabase);

    await expect(requireOwner()).resolves.toEqual({ error: "Forbidden" });
  });

  it("odmitne ownera, kdyz tenant nejde overit v databazi", async () => {
    const supabase = createSupabaseMock({ tenantLookup: { data: null, error: { code: "500" } } });
    createClientMock.mockResolvedValue(supabase);

    await expect(requireOwner()).resolves.toEqual({ error: "Forbidden" });
  });

  it("odmitne ucet bez owner role pred owner server action", async () => {
    const supabase = createSupabaseMock({ role: "staff", staffId: "staff-1" });
    createClientMock.mockResolvedValue(supabase);

    await expect(requireOwner()).resolves.toEqual({ error: "Forbidden" });
    expect(supabase.from).not.toHaveBeenCalled();
  });
});

describe("requireDashboardContext", () => {
  beforeEach(() => {
    createClientMock.mockReset();
  });

  it("povoli ownera s aktivnim tenantem", async () => {
    const supabase = createSupabaseMock();
    createClientMock.mockResolvedValue(supabase);

    const result = await requireDashboardContext();

    expect(result).toEqual(expect.objectContaining({
      isOwner: true,
      role: "owner",
      staffId: null,
      tenantId: "tenant-1",
    }));
    expect(supabase.tenantChain.is).toHaveBeenCalledWith("deleted_at", null);
  });

  it("povoli staff jen s aktivnim profilem zamestnance", async () => {
    const supabase = createSupabaseMock({
      role: "staff",
      staffId: " staff-1 ",
    });
    createClientMock.mockResolvedValue(supabase);

    const result = await requireDashboardContext();

    expect(result).toEqual(expect.objectContaining({
      isOwner: false,
      role: "staff",
      staffId: "staff-1",
      tenantId: "tenant-1",
    }));
    expect(supabase.staffChain.eq).toHaveBeenCalledWith("id", "staff-1");
    expect(supabase.staffChain.eq).toHaveBeenCalledWith("is_active", true);
    expect(supabase.staffChain.is).toHaveBeenCalledWith("deleted_at", null);
  });

  it("odmitne staff bez aktivniho profilu zamestnance", async () => {
    const supabase = createSupabaseMock({
      role: "staff",
      staffId: "staff-1",
      staffLookup: { data: null, error: null },
    });
    createClientMock.mockResolvedValue(supabase);

    await expect(requireDashboardContext()).resolves.toEqual({ error: "missing_staff" });
  });

  it("vrati bezpecny login redirect podle chyby kontextu", () => {
    expect(getDashboardContextRedirect("Unauthorized")).toBe("/login");
    expect(getDashboardContextRedirect("missing_tenant")).toBe("/login?error=missing_tenant");
    expect(getDashboardContextRedirect("missing_role")).toBe("/login?error=missing_role");
    expect(getDashboardContextRedirect("missing_staff")).toBe("/login?error=missing_staff");
  });
});
