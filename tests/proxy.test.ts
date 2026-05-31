import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";

import { proxy } from "@/proxy";

function createRequest(path: string, cookie?: string) {
  return new NextRequest(new URL(`http://localhost:3000${path}`), {
    headers: cookie ? { cookie } : undefined,
  });
}

describe("proxy auth guard", () => {
  it("pusti verejnou stranku bez prihlaseni", async () => {
    const response = await proxy(createRequest("/demo-podnik"));

    expect(response.status).toBe(200);
  });

  it("presmeruje dashboard bez Supabase session cookie na login", async () => {
    const response = await proxy(createRequest("/calendar?view=day"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/login?redirectedFrom=%2Fcalendar%3Fview%3Dday");
  });

  it("pusti dashboard se Supabase session cookie do serveroveho auth overeni", async () => {
    const response = await proxy(createRequest("/settings", "sb-project-auth-token=fake-token"));

    expect(response.status).toBe(200);
  });

  it("chrani platby stejne jako ostatni dashboard routy", async () => {
    const response = await proxy(createRequest("/payments/export"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/login?redirectedFrom=%2Fpayments%2Fexport");
  });

  it("chrani reporty stejne jako ostatni dashboard routy", async () => {
    const response = await proxy(createRequest("/reports?period=90d"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/login?redirectedFrom=%2Freports%3Fperiod%3D90d");
  });

  it("chrani POS pokladnu stejne jako ostatni owner routy", async () => {
    const response = await proxy(createRequest("/pos"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/login?redirectedFrom=%2Fpos");
  });

  it("chrani sklad stejne jako ostatni owner routy", async () => {
    const response = await proxy(createRequest("/inventory"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/login?redirectedFrom=%2Finventory");
  });

  it("chrani vouchery stejne jako ostatni owner routy", async () => {
    const response = await proxy(createRequest("/vouchers"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/login?redirectedFrom=%2Fvouchers");
  });

  it("chrani balicky stejne jako ostatni owner routy", async () => {
    const response = await proxy(createRequest("/packages"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/login?redirectedFrom=%2Fpackages");
  });

  it("chrani clenstvi stejne jako ostatni owner routy", async () => {
    const response = await proxy(createRequest("/memberships"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/login?redirectedFrom=%2Fmemberships");
  });

  it("chrani kampane stejne jako ostatni owner routy", async () => {
    const response = await proxy(createRequest("/campaigns"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/login?redirectedFrom=%2Fcampaigns");
  });

  it("chrani resources stejne jako ostatni owner routy", async () => {
    const response = await proxy(createRequest("/resources"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/login?redirectedFrom=%2Fresources");
  });

  it("chrani pobocky stejne jako ostatni owner routy", async () => {
    const response = await proxy(createRequest("/locations"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/login?redirectedFrom=%2Flocations");
  });

  it("chrani skupinove lekce stejne jako ostatni owner routy", async () => {
    const response = await proxy(createRequest("/classes"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/login?redirectedFrom=%2Fclasses");
  });

  it("chrani referral stejne jako ostatni owner routy", async () => {
    const response = await proxy(createRequest("/referrals"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/login?redirectedFrom=%2Freferrals");
  });

  it("chrani provize stejne jako ostatni owner routy", async () => {
    const response = await proxy(createRequest("/commissions"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/login?redirectedFrom=%2Fcommissions");
  });

  it("chrani empty-slot recovery stejne jako ostatni owner routy", async () => {
    const response = await proxy(createRequest("/recovery"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/login?redirectedFrom=%2Frecovery");
  });

  it("chrani import dat stejne jako ostatni owner routy", async () => {
    const response = await proxy(createRequest("/import"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/login?redirectedFrom=%2Fimport");
  });

  it("chrani integrace stejne jako ostatni owner routy", async () => {
    const response = await proxy(createRequest("/integrations"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/login?redirectedFrom=%2Fintegrations");
  });

  it("chrani zakaznicky ucet bez Supabase session cookie", async () => {
    const response = await proxy(createRequest("/account"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/login?redirectedFrom=%2Faccount");
  });

  it("chrani detail zakaznicke rezervace bez Supabase session cookie", async () => {
    const response = await proxy(createRequest("/account/bookings/11111111-1111-4111-8111-111111111111"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/login?redirectedFrom=%2Faccount%2Fbookings%2F11111111-1111-4111-8111-111111111111",
    );
  });

  it("pusti chunkovanou Supabase session cookie", async () => {
    const response = await proxy(createRequest("/dashboard", "sb-project-auth-token.0=fake-token"));

    expect(response.status).toBe(200);
  });

  it("ignoruje prazdnou auth cookie", async () => {
    const response = await proxy(createRequest("/dashboard", "sb-project-auth-token="));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/login?redirectedFrom=%2Fdashboard");
  });
});
