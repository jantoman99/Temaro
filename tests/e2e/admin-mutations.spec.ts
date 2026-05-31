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

test.describe("authenticated admin mutations", () => {
  test("owner can create a staff member from team table toolbar", async ({ page }) => {
    test.setTimeout(60_000);
    test.skip(!hasSupabaseAdminRuntime(), "Real Supabase env is required for authenticated admin E2E.");

    const setup = createE2ERun("Staff");
    const staffName = `E2E UI člen ${setup.runId}`;

    try {
      await registerE2EOwner(page, setup);
      await page.goto("/staff");
      await page.locator("summary").filter({ hasText: "Přidat člena" }).click();
      await page.getByLabel("Jméno poskytovatele").fill(staffName);
      await page.getByLabel("Bio").fill("E2E vytvořený člen týmu.");
      await page.locator("form").nth(1).evaluate((form) => {
        (form as HTMLFormElement).requestSubmit();
      });

      await expect(page.getByRole("table").getByText(staffName)).toBeVisible();
    } finally {
      await cleanupE2EAccount(setup.email, setup.businessName);
    }
  });

  test("owner can create a manual booking from calendar form", async ({ page }) => {
    test.setTimeout(60_000);
    test.skip(!hasSupabaseAdminRuntime(), "Real Supabase env is required for authenticated admin E2E.");

    const setup = createE2ERun("Booking");
    const bookingClientName = `E2E UI rezervace klient ${setup.runId}`;

    try {
      await registerE2EOwner(page, setup);
      const prerequisites = await seedManualBookingPrerequisites(setup.businessName, setup.runId);
      const futureSlot = getFutureLocalDateTime(5);
      const params = new URLSearchParams({
        day: futureSlot.dateKey,
        draftStaffId: prerequisites.staffId,
        draftStartsAt: futureSlot.dateTime,
        range: "week",
        view: "week",
      });

      await page.goto(`/calendar?${params.toString()}`);
      await expect(page.getByRole("heading", { name: "Nová rezervace" })).toBeVisible();
      await page.getByLabel("Jméno nového klienta").fill(bookingClientName);
      await page.getByLabel("Telefon").fill("+420 777 333 444");
      await page.getByRole("textbox", { name: "Email", exact: true }).fill(`manual-booking-${setup.runId}@temaro.test`);
      await page.getByLabel("Poslat klientovi potvrzovací email").uncheck();
      await page.locator("form").filter({ has: page.getByRole("heading", { name: "Nová rezervace" }) }).evaluate((form) => {
        (form as HTMLFormElement).requestSubmit();
      });

      await expect(page).toHaveURL(new RegExp(`/calendar\\?view=week.*day=${futureSlot.dateKey}`));
      await expect(page.getByText(bookingClientName)).toBeVisible();
    } finally {
      await cleanupE2EAccount(setup.email, setup.businessName);
    }
  });

  test("owner can record a payment from booking detail", async ({ page }) => {
    test.setTimeout(60_000);
    test.skip(!hasSupabaseAdminRuntime(), "Real Supabase env is required for authenticated admin E2E.");

    const setup = createE2ERun("Payment");
    const bookingClientName = `E2E platba klient ${setup.runId}`;
    const paymentAmount = "123,45";

    try {
      await registerE2EOwner(page, setup);
      const prerequisites = await seedManualBookingPrerequisites(setup.businessName, setup.runId);
      const futureSlot = getFutureLocalDateTime(6);

      await seedCalendarBooking({
        clientName: bookingClientName,
        dateTime: futureSlot.dateTime,
        runId: setup.runId,
        serviceId: prerequisites.serviceId,
        staffId: prerequisites.staffId,
        tenantId: prerequisites.tenantId,
      });

      await page.goto(`/calendar?view=week&range=week&day=${futureSlot.dateKey}`);
      await page.getByText(bookingClientName).click();
      await expect(page.getByText("Evidence platby")).toBeVisible();
      await page.getByLabel("Částka").fill(paymentAmount);
      await page.getByRole("button", { name: "Zaevidovat platbu" }).click();

      await expect(page.getByText("Platba byla zaevidována.")).toBeVisible({ timeout: 20_000 });

      await page.goto("/payments");
      await expect(page.getByRole("heading", { name: "Platby" })).toBeVisible();
      await expect(page.getByRole("table").getByText(bookingClientName)).toBeVisible();
      await expect(page.getByRole("table").getByText("Doplatek")).toBeVisible();
      await expect(page.getByRole("table").getByText("Hotově")).toBeVisible();
      await expect(page.getByRole("table").getByText("123,45")).toBeVisible();

      const exportResponse = await page.request.get("/payments/export");
      expect(exportResponse.status()).toBe(200);
      expect(exportResponse.headers()["content-type"]).toContain("text/csv");
      expect(exportResponse.headers()["content-disposition"]).toContain("temaro-platby");
      const csv = await exportResponse.text();
      expect(csv).toContain(bookingClientName);
      expect(csv).toContain("Doplatek");
      expect(csv).toContain("Hotově");
      expect(csv).toContain("123,45");
    } finally {
      await cleanupE2EAccount(setup.email, setup.businessName);
    }
  });
});
