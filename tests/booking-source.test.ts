import { describe, expect, it } from "vitest";

import {
  getBookingSourceDescription,
  getBookingSourceLabel,
  getBookingSourceTracking,
} from "@/lib/booking/source";

describe("booking source tracking", () => {
  it("odvodi zdroj rezervace z UTM a omezi delku metadat", () => {
    const tracking = getBookingSourceTracking({
      source: "ig",
      source_detail: "  Story kampan  ",
      utm_campaign: "x".repeat(180),
      utm_medium: " social ",
      utm_source: " instagram ",
    });

    expect(tracking.source).toBe("instagram");
    expect(tracking.sourceDetail).toBe("Story kampan");
    expect(tracking.metadata.utm_campaign).toHaveLength(120);
    expect(tracking.metadata.utm_medium).toBe("social");
  });

  it("pouzije bezpecny webovy fallback pro neznamy zdroj", () => {
    const tracking = getBookingSourceTracking({
      source: "javascript:alert(1)",
      utm_source: "unknown-network",
    });

    expect(tracking.source).toBe("online");
  });

  it("vraci citelny popisek zdroje", () => {
    expect(getBookingSourceLabel("qr")).toBe("QR");
    expect(getBookingSourceDescription({ source: "widget", sourceDetail: "homepage" })).toBe("Widget · homepage");
  });
});
