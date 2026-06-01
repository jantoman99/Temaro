import { describe, expect, it } from "vitest";

import { getDashboardNavigationGroups } from "@/lib/dashboard-navigation";
import { buildLaunchPlan } from "@/lib/onboarding/setup";
import { PRODUCT_TOUR_STEPS } from "@/lib/product-tour";

describe("onboarding wizard", () => {
  it("zacina vyberem oboru pred plnym dashboardem", () => {
    const plan = buildLaunchPlan({
      bookingsCount: 0,
      servicesCount: 0,
      staffCount: 0,
      tenant: { industry: null, name: "Studio Magnolia", slug: "studio-magnolia" },
    });

    expect(plan.steps[0]).toMatchObject({
      done: false,
      href: "/start#obor",
      title: "Vybrat obor podnikání",
    });
    expect(plan.nextAction).toMatchObject({
      href: "/start#obor",
      label: "Vybrat obor podnikání",
    });
  });

  it("po vybranem oboru vede k doporucenym sluzbam", () => {
    const plan = buildLaunchPlan({
      bookingsCount: 0,
      servicesCount: 0,
      staffCount: 0,
      tenant: { industry: "hair", name: "Studio Magnolia", slug: "studio-magnolia" },
    });

    expect(plan.steps[0]?.done).toBe(true);
    expect(plan.nextAction).toMatchObject({
      href: "/services",
      label: "Přidat doporučené služby",
    });
  });

  it("sidebar oddeli zakladni kroky od pokrocilych modulu", () => {
    const groups = getDashboardNavigationGroups(true);

    expect(groups.map((group) => group.label)).toEqual(["Základ", "Pokročilé"]);
    expect(groups[0]?.items.map((item) => item.label)).toEqual([
      "Start",
      "Kalendář",
      "Klienti",
      "Služby",
      "Tým",
      "Rezervační stránka",
    ]);
    expect(groups[1]?.items.map((item) => item.label)).toContain("Platby");
  });

  it("produktovy tutorial ma kratky pruchod pres prvni akce", () => {
    expect(PRODUCT_TOUR_STEPS.map((step) => step.target)).toEqual([
      "start",
      "services",
      "staff",
      "booking-page",
      "calendar",
    ]);
  });
});
