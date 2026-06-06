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

    await expect(page.getByRole("heading", { name: /Méně telefonátů\. Více rezervací/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Začít zdarma/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Pro podniky", exact: true }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Pro zákazníky", exact: true }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Ukázka", exact: true }).first()).toHaveAttribute("href", "/ukazka");
    await expect(page.getByRole("link", { name: "Pro barbery", exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Pro kadeřnictví", exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Pro beauty salon", exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Pro masáže", exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "No-show návod", exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "SMS připomínky", exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Bez marketplace provizí", exact: true })).toBeVisible();
  });

  test("customer directory uses address search without coordinate fields", async ({ page }) => {
    await page.goto("/podniky");

    await expect(page.getByRole("heading", { name: /Najděte podnik a rezervujte/i })).toBeVisible();
    await expect(page.getByText("Pro zákazníky").first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Přepnout vzhled: Světlý" })).toBeVisible();
    await expect(page.getByLabel("Kde")).toBeVisible();
    await expect(page.getByPlaceholder("Město, adresa nebo čtvrť")).toBeVisible();
    await expect(page.locator('input[name="lat"]')).toHaveCount(0);
    await expect(page.locator('input[name="lng"]')).toHaveCount(0);
    await expect(page.locator('input[name="radius"]')).toHaveCount(0);
  });

  test("interactive product demo page renders", async ({ page }) => {
    await page.goto("/ukazka");

    await expect(page.getByText("Interaktivní ukázka Temara").first()).toBeVisible();
    await expect(page.getByRole("heading", { name: /Projděte si Temaro/i })).toBeVisible();
    await expect(page.getByRole("button", { name: "Spustit ukázku" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Začít zdarma" }).first()).toBeVisible();
  });

  test("segment SEO pages render and cross-link", async ({ page }) => {
    await page.goto("/rezervacni-system-pro-barbery", { waitUntil: "domcontentloaded" });
    await expect(page.getByText("Rezervační systém pro barbery").first()).toBeVisible();
    await expect(page.getByRole("link", { name: "No-show návod", exact: true })).toBeVisible();

    await page.goto("/rezervacni-system-pro-kadernictvi", { waitUntil: "domcontentloaded" });
    await expect(page.getByText("Rezervační systém pro kadeřnictví").first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Pro beauty salon", exact: true })).toBeVisible();

    await page.goto("/rezervacni-system-pro-kosmeticky-salon", { waitUntil: "domcontentloaded" });
    await expect(page.getByText("Rezervační systém pro kosmetický salon").first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Pro masáže", exact: true })).toBeVisible();

    await page.goto("/rezervacni-system-pro-masaze", { waitUntil: "domcontentloaded" });
    await expect(page.getByText("Rezervační systém pro masáže").first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Pro wellness", exact: true })).toBeVisible();

    await page.goto("/rezervacni-system-pro-wellness", { waitUntil: "domcontentloaded" });
    await expect(page.getByText("Rezervační systém pro wellness").first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Pro masáže", exact: true })).toBeVisible();

    await page.goto("/jak-snizit-no-show", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: /Jak snížit no-show/i })).toBeVisible();
    await expect(page.getByRole("link", { name: "Pro barbery", exact: true }).first()).toBeVisible();

    await page.goto("/sms-pripominky-rezervaci", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: /Kdy SMS opravdu/i })).toBeVisible();
    await expect(page.getByRole("link", { name: "No-show návod", exact: true }).first()).toBeVisible();

    await page.goto("/rezervacni-system-bez-marketplace-provizi", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: /Vlastní klienti\./i })).toBeVisible();
    await expect(page.getByRole("link", { name: "SMS připomínky", exact: true }).first()).toBeVisible();
  });

  test("demo booking page renders selectable booking flow", async ({ page }) => {
    await page.goto("/demo-barber");

    await expect(page.getByRole("link", { name: "Zpět na web", exact: true })).toHaveAttribute("href", "/");
    await expect(page.getByRole("link", { name: "Interaktivní ukázka" })).toHaveAttribute("href", "/ukazka");
    await expect(page.getByRole("button", { name: "Přepnout vzhled: Světlý" })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Temaro Demo Studio/i })).toBeVisible();
    await expect(page.getByText("Co tu najdete")).toBeVisible();
    await expect(page.getByRole("link", { name: /Instagram/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Navigovat/i })).toBeVisible();
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

    await expect(page.getByRole("link", { name: "Zpět na web" })).toHaveAttribute("href", "/");
    await expect(page.getByRole("button", { name: "Přepnout vzhled: Světlý" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Vaše rezervace napříč podniky" })).toBeVisible();
    await expect(page.getByText("podle ověřeného e-mailu")).toBeVisible();
    await expect(page.getByRole("button", { name: "Pokračovat přes Google" })).toBeVisible();
  });

  test("booking button embed script renders a safe CTA in browser", async ({ page }) => {
    const baseUrl = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000";

    await page.setContent(`
      <main>
        <script
          async
          src="${baseUrl}/embed/booking-button.js"
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
