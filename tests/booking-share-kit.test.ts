import { describe, expect, it } from "vitest";

import { getBookingShareKit } from "@/lib/booking/share-kit";

describe("booking share kit", () => {
  it("vytvori texty pro Instagram a QR URL z verejne booking adresy", () => {
    const kit = getBookingShareKit({
      bookingUrl: "https://app.temaro.cz/demo-barber",
      businessName: "Demo Barber",
    });

    expect(kit.instagramBio).toBe("Rezervace online: https://app.temaro.cz/demo-barber");
    expect(kit.instagramStory).toContain("Objednejte se k Demo Barber online.");
    expect(kit.instagramStory).toContain("https://app.temaro.cz/demo-barber");
    expect(kit.googleBusinessProfileUrl).toBe(
      "https://app.temaro.cz/demo-barber?source=google&source_detail=business_profile&utm_source=google&utm_medium=profile&utm_campaign=booking_cta",
    );
    expect(kit.qrImageUrl).toBe("https://chart.googleapis.com/chart?cht=qr&chs=320x320&chl=https%3A%2F%2Fapp.temaro.cz%2Fdemo-barber");
  });
});
