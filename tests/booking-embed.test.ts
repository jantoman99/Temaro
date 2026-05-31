import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { getBookingButtonEmbedCode, getBookingIframeEmbedCode, isSafeBookingSlug } from "@/lib/booking/embed";

describe("booking embed button", () => {
  it("vygeneruje vlozitelny script bez tenant id v query stringu", () => {
    const code = getBookingButtonEmbedCode({
      appUrl: "https://app.temaro.cz/path",
      brandColor: "#123ABC",
      label: "Objednat online",
      slug: "demo-barber",
    });

    expect(code).toBe('<script async src="https://app.temaro.cz/embed/booking-button.js" data-slug="demo-barber" data-label="Objednat online" data-color="#123ABC"></script>');
    expect(code).not.toContain("tenant");
    expect(code).not.toContain("?");
  });

  it("odmitne nebezpecny booking slug", () => {
    expect(isSafeBookingSlug("demo-barber")).toBe(true);
    expect(isSafeBookingSlug("../admin")).toBe(false);
    expect(isSafeBookingSlug("demo<script>")).toBe(false);
  });

  it("staticky script nevklada hodnoty pres innerHTML", () => {
    const script = readFileSync(join(process.cwd(), "public/embed/booking-button.js"), "utf8");

    expect(script).toContain("document.currentScript");
    expect(script).toContain("data-slug");
    expect(script).toContain("textContent");
    expect(script).not.toContain("innerHTML");
  });
});

describe("booking iframe widget", () => {
  it("vygeneruje bezpecny iframe widget snippet bez tenant id v query stringu", () => {
    const code = getBookingIframeEmbedCode({
      appUrl: "https://app.temaro.cz/admin",
      height: 820,
      slug: "demo-barber",
      title: "Rezervace <demo>",
    });

    expect(code).toBe(
      '<script async src="https://app.temaro.cz/embed/booking-widget.js" data-slug="demo-barber" data-title="Rezervace &lt;demo&gt;" data-height="820"></script>',
    );
    expect(code).not.toContain("tenant");
    expect(code).not.toContain("?");
  });

  it("normalizuje vysku widgetu do podporovaneho rozsahu", () => {
    const code = getBookingIframeEmbedCode({
      appUrl: "https://app.temaro.cz",
      height: 2400,
      slug: "demo-barber",
    });

    expect(code).toContain('data-height="760"');
  });

  it("staticky iframe script nepouziva innerHTML a omezuje schopnosti iframe", () => {
    const script = readFileSync(join(process.cwd(), "public/embed/booking-widget.js"), "utf8");

    expect(script).toContain("document.currentScript");
    expect(script).toContain("data-slug");
    expect(script).toContain('"/embed/booking/"');
    expect(script).toContain('"?source=widget"');
    expect(script).toContain('iframe.loading = "lazy"');
    expect(script).toContain("iframe.sandbox");
    expect(script).toContain("allow-forms");
    expect(script).toContain("allow-scripts");
    expect(script).toContain("referrerpolicy");
    expect(script).not.toContain("innerHTML");
  });
});
