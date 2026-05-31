import { expect, test } from "@playwright/test";

test.describe("admin auth smoke", () => {
  test("core admin sections redirect anonymous users to login", async ({ page }) => {
    for (const route of [
      "/dashboard",
      "/calendar",
      "/clients",
      "/services",
      "/staff",
      "/start",
      "/booking-page",
      "/payments",
      "/payments/export",
      "/settings",
    ] as const) {
      await page.goto(route);
      await expect(page).toHaveURL(new RegExp(`/login\\?redirectedFrom=${encodeURIComponent(route)}`));
      await expect(page.getByRole("heading", { name: "Vítejte zpět" })).toBeVisible();
    }
  });
});
