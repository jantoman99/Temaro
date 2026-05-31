import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import manifest from "@/app/manifest";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

describe("PWA configuration", () => {
  it("definuje instalovatelny manifest", () => {
    const data = manifest();

    expect(data.name).toBe("Temaro");
    expect(data.display).toBe("standalone");
    expect(data.start_url).toBe("/dashboard");
    expect(data.icons?.some((icon) => icon.src === "/icon.svg")).toBe(true);
  });

  it("service worker necachuje API, platby ani auth callbacky", () => {
    const script = readFileSync(path.join(rootDir, "public", "sw.js"), "utf8");

    expect(script).toContain('url.pathname.startsWith("/api/")');
    expect(script).toContain('url.pathname.includes("/payments/")');
    expect(script).toContain('url.pathname.includes("/auth/")');
    expect(script).toContain("TEMARO_CACHE");
  });
});
