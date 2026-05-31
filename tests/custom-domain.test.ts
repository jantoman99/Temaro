import { describe, expect, it } from "vitest";

import {
  createCustomDomainVerificationToken,
  getCustomDomainTxtName,
  isLikelyPlatformHost,
  isSafeCustomDomain,
  normalizeCustomDomain,
  normalizeRequestHost,
} from "@/lib/custom-domain";
import { customDomainSchema } from "@/lib/validations/custom-domain";

describe("custom domain helpers", () => {
  it("normalizuje domenu bez protokolu, cesty, www a portu", () => {
    expect(normalizeCustomDomain("https://www.Rezervace.Example.cz:443/path")).toBe("rezervace.example.cz");
  });

  it("validuje jen bezpecne domeny", () => {
    expect(isSafeCustomDomain("rezervace.example.cz")).toBe(true);
    expect(isSafeCustomDomain("localhost")).toBe(false);
    expect(isSafeCustomDomain("https://evil.test/path")).toBe(true);
    expect(customDomainSchema.safeParse({ customDomain: "https://booking.example.cz/path" }).data?.customDomain).toBe("booking.example.cz");
  });

  it("vytvori deterministicky testovatelny verification token a TXT nazev", () => {
    const token = createCustomDomainVerificationToken(new Uint8Array(16).fill(10));

    expect(token).toBe("temaro-domain-verification=0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a");
    expect(getCustomDomainTxtName("booking.example.cz")).toBe("_temaro.booking.example.cz");
  });

  it("rozpozna platform hosty ktere nemaji renderovat tenant booking", () => {
    expect(normalizeRequestHost("Example.cz:3000")).toBe("example.cz");
    expect(isLikelyPlatformHost("localhost:3000", "https://app.temaro.cz")).toBe(true);
    expect(isLikelyPlatformHost("preview.vercel.app", "https://app.temaro.cz")).toBe(true);
    expect(isLikelyPlatformHost("app.temaro.cz", "https://app.temaro.cz")).toBe(true);
    expect(isLikelyPlatformHost("rezervace.example.cz", "https://app.temaro.cz")).toBe(false);
  });
});
