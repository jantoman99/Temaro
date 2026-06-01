import { describe, expect, it } from "vitest";

import { buildLaunchPlan, getLaunchReadiness } from "@/lib/onboarding/setup";

describe("onboarding setup", () => {
  it("vede novy podnik k prvni sdilene rezervacni strance", () => {
    const plan = buildLaunchPlan({
      bookingsCount: 0,
      servicesCount: 0,
      staffCount: 0,
      tenant: { name: "Studio Magnolia", slug: "studio-magnolia" },
    });

    expect(plan.steps.map((step) => step.title)).toEqual([
      "Zkontrolovat podnik",
      "Přidat první službu",
      "Nastavit tým a pracovní dobu",
      "Projít rezervační stránku",
      "Poslat odkaz prvním klientům",
    ]);
    expect(plan.nextAction).toMatchObject({
      href: "/services",
      label: "Přidat první službu",
    });
    expect(plan.bookingUrlPath).toBe("/studio-magnolia");
    expect(plan.isReadyToShare).toBe(false);
  });

  it("posle pripraveny podnik rovnou na sdileni odkazu", () => {
    const plan = buildLaunchPlan({
      bookingsCount: 0,
      servicesCount: 2,
      staffCount: 1,
      tenant: { name: "Studio Magnolia", slug: "studio-magnolia" },
    });

    expect(plan.nextAction).toMatchObject({
      href: "/studio-magnolia",
      label: "Otevřít rezervační stránku",
    });
    expect(plan.isReadyToShare).toBe(true);
  });

  it("spocita procenta bez deleni nulou", () => {
    expect(getLaunchReadiness([])).toBe(0);
    expect(getLaunchReadiness([{ done: true }, { done: false }, { done: true }])).toBe(67);
  });
});
