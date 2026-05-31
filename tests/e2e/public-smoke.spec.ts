import { expect, test } from "@playwright/test";

test.describe("public smoke", () => {
  test("health endpoint and security headers are available", async ({ page, request }) => {
    const health = await request.get("/api/health");
    expect([200, 503]).toContain(health.status());

    const payload = await health.json();
    expect(payload).toMatchObject({
      checks: {
        env: expect.any(Object),
        rate_limit: expect.any(Object),
        supabase: expect.any(Object),
      },
      status: expect.any(String),
      version: expect.any(String),
    });
    expect(JSON.stringify(payload)).not.toContain("SUPABASE_SERVICE_ROLE_KEY");

    const response = await page.goto("/");
    expect(response?.headers()["content-security-policy"]).toContain("default-src 'self'");
    expect(response?.headers()["x-frame-options"]).toBe("DENY");
  });

  test("landing page exposes primary marketing paths", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: /Méně telefonátů\. Klidnější/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Začít zdarma/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Pro barbery", exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Pro kadeřnictví", exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Pro beauty salon", exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Pro masáže", exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "No-show guide", exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "SMS připomínky", exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Bez marketplace provizí", exact: true })).toBeVisible();
  });

  test("segment SEO pages render and cross-link", async ({ page }) => {
    await page.goto("/rezervacni-system-pro-barbery");
    await expect(page.getByText("Rezervační systém pro barbery").first()).toBeVisible();
    await expect(page.getByRole("link", { name: "No-show guide", exact: true })).toBeVisible();

    await page.goto("/rezervacni-system-pro-kadernictvi");
    await expect(page.getByText("Rezervační systém pro kadeřnictví").first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Pro beauty salon", exact: true })).toBeVisible();

    await page.goto("/rezervacni-system-pro-kosmeticky-salon");
    await expect(page.getByText("Rezervační systém pro kosmetický salon").first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Pro masáže", exact: true })).toBeVisible();

    await page.goto("/rezervacni-system-pro-masaze");
    await expect(page.getByText("Rezervační systém pro masáže").first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Pro wellness", exact: true })).toBeVisible();

    await page.goto("/rezervacni-system-pro-wellness");
    await expect(page.getByText("Rezervační systém pro wellness").first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Pro masáže", exact: true })).toBeVisible();

    await page.goto("/jak-snizit-no-show");
    await expect(page.getByRole("heading", { name: /Jak snížit no-show/i })).toBeVisible();
    await expect(page.getByRole("link", { name: "Pro barbery", exact: true }).first()).toBeVisible();

    await page.goto("/sms-pripominky-rezervaci");
    await expect(page.getByRole("heading", { name: /Kdy SMS opravdu/i })).toBeVisible();
    await expect(page.getByRole("link", { name: "No-show guide", exact: true }).first()).toBeVisible();

    await page.goto("/rezervacni-system-bez-marketplace-provizi");
    await expect(page.getByRole("heading", { name: /Vlastní klienti\./i })).toBeVisible();
    await expect(page.getByRole("link", { name: "SMS připomínky", exact: true }).first()).toBeVisible();
  });

  test("demo booking page renders selectable booking flow", async ({ page }) => {
    await page.goto("/demo-barber");

    await expect(page.getByRole("heading", { name: /Rezervovat se k/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Vyberte službu, termín a kontakt/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Vyberte službu", exact: true })).toBeVisible();
    await expect(page.getByText(/Vybraný termín/i)).toBeVisible();
  });

  test("demo booking flow can be submitted without writing to the database", async ({ page }) => {
    await page.goto("/demo-barber");

    await page.getByRole("button", { name: /\d{1,2}:\d{2}/ }).first().click();
    await page.getByLabel("Jméno").fill("E2E Demo Klient");
    await page.getByLabel("Telefon").fill("+420 777 111 222");
    await page.getByLabel("Email").fill("e2e-demo@example.com");
    await page.getByLabel("Poznámka k rezervaci").fill("Playwright demo submit bez zápisu do databáze.");
    await page.getByRole("button", { name: "Potvrdit rezervaci" }).click();

    await expect(page.getByRole("heading", { name: "Rezervace je odeslaná" })).toBeVisible();
    await expect(page.getByText("E2E Demo Klient")).toBeVisible();
    await expect(page.getByRole("link", { name: "Přidat do kalendáře" })).toBeVisible();
  });

  test("demo booking validates contact details before showing success", async ({ page }) => {
    await page.goto("/demo-barber");

    await page.getByRole("button", { name: /\d{1,2}:\d{2}/ }).first().click();
    await page.getByLabel("Jméno").fill("E2E Validace");
    await page.getByLabel("Telefon").fill("123");
    await page.getByRole("button", { name: "Potvrdit rezervaci" }).click();

    await expect(page.getByText("Telefon musí mít 9 až 20 číslic")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Rezervace je odeslaná" })).not.toBeVisible();
  });

  test("customer account login exposes Google entry point", async ({ page }) => {
    await page.goto("/account/login");

    await expect(page.getByRole("heading", { name: "Vaše rezervace napříč podniky" })).toBeVisible();
    await expect(page.getByText("podle ověřeného e-mailu")).toBeVisible();
    await expect(page.getByRole("button", { name: "Pokračovat přes Google" })).toBeVisible();
  });

  test("booking button embed script renders a safe CTA in browser", async ({ page }) => {
    await page.goto("/");
    await page.setContent(`
      <main>
        <script
          async
          src="/embed/booking-button.js"
          data-slug="demo-barber"
          data-label="Objednat online"
          data-color="#0F766E"
          data-target="_self"
        ></script>
      </main>
    `);

    const button = page.locator("[data-temaro-booking-button='demo-barber']");
    await expect(button).toBeVisible();
    await expect(button).toHaveText("Objednat online");
    await expect(button).toHaveAttribute("href", /\/demo-barber$/);
    await expect(button).toHaveAttribute("target", "_self");
  });
});
