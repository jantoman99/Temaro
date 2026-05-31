import { describe, expect, it } from "vitest";

import { buildPaymentsCsv, escapeCsvCell, formatPaymentAmountForCsv, getPaymentsExportFilename } from "@/lib/payments/export";

describe("payments CSV export", () => {
  it("formatuje castku v halerich pro cesky CSV export", () => {
    expect(formatPaymentAmountForCsv(123456)).toBe("1234,56");
  });

  it("escapuje CSV bunky pro strednikovy export", () => {
    expect(escapeCsvCell('Klient "VIP"; test')).toBe('"Klient ""VIP""; test"');
  });

  it("vytvori Excel-friendly CSV s ceskymi popisky a booking kontextem", () => {
    const csv = buildPaymentsCsv(
      [
        {
          id: "payment-1",
          amount: 10000,
          bookings: {
            starts_at: "2026-05-03T10:00:00.000Z",
            clients: {
              email: "jan@example.com",
              full_name: "Jan Novak",
              phone: "+420777111222",
            },
            services: { name: "Strih" },
            staff: { name: "Petr" },
          },
          created_at: "2026-05-03T09:00:00.000Z",
          currency: "CZK",
          method: "cash",
          note: "Zaplaceno na miste",
          paid_at: "2026-05-03T09:05:00.000Z",
          payment_scope: "deposit",
          status: "paid",
        },
      ],
      "Europe/Prague",
    );

    expect(csv.startsWith("\uFEFF")).toBe(true);
    expect(csv).toContain('"Datum platby";"Stav";"Typ platby";"Metoda";"Částka"');
    expect(csv).toContain('"Zaplaceno";"Záloha";"Hotově";"100,00";"CZK"');
    expect(csv).toContain('"Jan Novak";"jan@example.com";"+420777111222";"Strih";"Petr"');
  });

  it("generuje stabilni nazev souboru podle data", () => {
    expect(getPaymentsExportFilename(new Date("2026-05-03T12:00:00.000Z"))).toBe("temaro-platby-2026-05-03.csv");
  });
});
