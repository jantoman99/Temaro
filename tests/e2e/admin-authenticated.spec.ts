import { config as loadEnv } from "dotenv";
import { expect, test } from "@playwright/test";

import {
  cleanupE2EAccount,
  createE2ERun,
  getFutureLocalDateTime,
  hasSupabaseAdminRuntime,
  registerE2EOwner,
  seedCalendarBooking,
  seedManualBookingPrerequisites,
} from "./admin-helpers";

loadEnv({ path: ".env.local" });

test.describe("authenticated admin smoke", () => {
  test("new owner can register and open core admin sections", async ({ page }) => {
    test.setTimeout(60_000);
    test.skip(!hasSupabaseAdminRuntime(), "Real Supabase env is required for authenticated admin E2E.");

    const setup = createE2ERun("Smoke");

    try {
      await registerE2EOwner(page, setup);

      for (const route of ["/calendar", "/clients", "/services", "/staff", "/start", "/booking-page", "/settings"] as const) {
        await page.goto(route);
        await expect(page).toHaveURL(new RegExp(`${route}$`));
        await expect(page.getByRole("link", { name: "Přehled" })).toBeVisible();
      }

      await page.goto("/start");
      await expect(page.getByRole("heading", { name: "První kroky" })).toBeVisible();
      await expect(page.getByText("Zkontrolovat booking stránku")).toBeVisible();

      await page.goto("/booking-page");
      await expect(page.getByRole("heading", { name: "Booking stránka", exact: true })).toBeVisible();
      await expect(page.getByRole("heading", { name: "Instagram a QR minimum" })).toBeVisible();
      await expect(page.getByRole("heading", { name: "Rezervační tlačítko" })).toBeVisible();
      await expect(page.getByRole("link", { name: "Rezervovat termín" })).toHaveAttribute("href", /^\/[a-z0-9-]+$/);

      await page.goto("/settings");
      await page.getByRole("button", { name: "Vygenerovat iCal odkaz" }).click();
      const feedUrlPattern = /\/calendar-feed\/[a-f0-9]{64}\.ics/;
      await expect(page.getByText(feedUrlPattern)).toBeVisible();
      const feedText = await page.getByText(feedUrlPattern).innerText();
      const feedUrl = new URL(feedText.trim(), "http://127.0.0.1:3000");
      const feedResponse = await page.request.get(`${feedUrl.pathname}${feedUrl.search}`);

      expect(feedResponse.status()).toBe(200);
      expect(feedResponse.headers()["content-type"]).toContain("text/calendar");
      expect(await feedResponse.text()).toContain("BEGIN:VCALENDAR");
      await page.goto("/settings");
      await page.getByRole("button", { name: "Zrušit feed" }).click();
      await expect(page.getByText("Zatím není vytvořený žádný aktivní iCal feed.")).toBeVisible();
      const revokedFeedResponse = await page.request.get(`${feedUrl.pathname}${feedUrl.search}`);

      expect(revokedFeedResponse.status()).toBe(404);

      const manualBooking = await seedManualBookingPrerequisites(setup.businessName, setup.runId);
      const futureSlot = getFutureLocalDateTime();
      const bookingClientName = `E2E rezervace klient ${setup.runId}`;

      await seedCalendarBooking({
        clientName: bookingClientName,
        dateTime: futureSlot.dateTime,
        runId: setup.runId,
        serviceId: manualBooking.serviceId,
        staffId: manualBooking.staffId,
        tenantId: manualBooking.tenantId,
      });
      await page.goto(`/calendar?view=week&range=week&day=${futureSlot.dateKey}`);
      await expect(page.getByText(bookingClientName)).toBeVisible();
    } finally {
      await cleanupE2EAccount(setup.email, setup.businessName);
    }
  });
});
