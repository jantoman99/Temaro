import { describe, expect, it } from "vitest";

import {
  analyzeBookingCsv,
  analyzeClientCsv,
  analyzeServiceCsv,
  CSV_IMPORT_MAX_ROWS,
  parseCsv,
} from "@/lib/import/csv";

describe("CSV import", () => {
  it("parsuje strednikove CSV s uvozovkami", () => {
    const parsed = parseCsv('jmeno;email;poznamky\n"Petr Svoboda";petr@example.cz;"Poznamka; s oddelovacem"');

    expect(parsed.errors).toEqual([]);
    expect(parsed.records[0]?.values).toMatchObject({
      email: "petr@example.cz",
      jmeno: "Petr Svoboda",
      poznamky: "Poznamka; s oddelovacem",
    });
  });

  it("odmitne prazdne CSV a prilis mnoho radku", () => {
    expect(parseCsv("").errors).toEqual(["CSV je prázdné."]);

    const tooManyRows = [
      "jmeno;email",
      ...Array.from({ length: CSV_IMPORT_MAX_ROWS + 1 }, (_, index) => `Klient ${index};k${index}@example.cz`),
    ].join("\n");

    expect(parseCsv(tooManyRows).errors[0]).toContain("příliš mnoho řádků");
  });

  it("validuje klienty, normalizuje telefon a detekuje duplicity", () => {
    const analysis = analyzeClientCsv(
      "jmeno;telefon;email\nPetr Svoboda;+420 777 123 456;petr@example.cz\nEva Novakova;+420777123456;eva@example.cz",
      [{ email: "old@example.cz", phone: null }],
    );

    expect(analysis.errors).toEqual([]);
    expect(analysis.rows).toHaveLength(1);
    expect(analysis.rows[0]).toMatchObject({
      email: "petr@example.cz",
      fullName: "Petr Svoboda",
      phone: "+420777123456",
    });
    expect(analysis.preview).toEqual([
      { errors: [], label: "Petr Svoboda", rowNumber: 2, status: "valid" },
      {
        errors: ["Klient se stejným e-mailem nebo telefonem už existuje."],
        label: "Eva Novakova",
        rowNumber: 3,
        status: "duplicate",
      },
    ]);
  });

  it("validuje sluzby vcetne cen, bufferu a zaloh", () => {
    const analysis = analyzeServiceCsv(
      "nazev;delka;cena;mena;buffer;zaloha_typ;zaloha\nPansky strih;45;450 Kč;CZK;0;bez;\nBarveni;120;1800;CZK;15;procento;30",
      [{ name: "Existujici sluzba" }],
    );

    expect(analysis.errors).toEqual([]);
    expect(analysis.rows).toEqual([
      {
        bufferMinutes: 0,
        currency: "CZK",
        depositType: "none",
        depositValue: 0,
        durationMinutes: 45,
        name: "Pansky strih",
        price: 45000,
      },
      {
        bufferMinutes: 15,
        currency: "CZK",
        depositType: "percent",
        depositValue: 30,
        durationMinutes: 120,
        name: "Barveni",
        price: 180000,
      },
    ]);
  });

  it("preskoci duplicitni sluzby podle nazvu", () => {
    const analysis = analyzeServiceCsv(
      "nazev;delka;cena\nStřih;45;450\nStřih;60;500",
      [],
    );

    expect(analysis.rows).toHaveLength(1);
    expect(analysis.preview[1]).toMatchObject({
      errors: ["Služba se stejným názvem už existuje."],
      label: "Střih",
      status: "duplicate",
    });
  });

  it("sparuje rezervace podle klienta, sluzby a zamestnance", () => {
    const analysis = analyzeBookingCsv({
      existingClients: [{ email: "petr@example.cz", full_name: "Petr Svoboda", id: "11111111-1111-4111-8111-111111111111", phone: "+420777123456" }],
      existingServices: [{ id: "22222222-2222-4222-8222-222222222222", name: "Pansky strih" }],
      existingStaff: [
        {
          id: "33333333-3333-4333-8333-333333333333",
          name: "Anna Novakova",
          staff_services: [{ service_id: "22222222-2222-4222-8222-222222222222" }],
        },
      ],
      text: "klient;telefon;email;sluzba;zamestnanec;datum;cas;poznamky\nPetr Svoboda;+420777123456;petr@example.cz;Pansky strih;Anna Novakova;2026-06-10;10:00;Import",
      timeZone: "Europe/Prague",
    });

    expect(analysis.errors).toEqual([]);
    expect(analysis.preview).toEqual([
      {
        errors: [],
        label: "Petr Svoboda · Pansky strih · Anna Novakova",
        rowNumber: 2,
        status: "valid",
      },
    ]);
    expect(analysis.rows).toEqual([
      {
        clientEmail: "petr@example.cz",
        clientFullName: "Petr Svoboda",
        clientId: "11111111-1111-4111-8111-111111111111",
        clientPhone: "+420777123456",
        notes: "Import",
        sendNotification: false,
        serviceId: "22222222-2222-4222-8222-222222222222",
        staffId: "33333333-3333-4333-8333-333333333333",
        startsAt: "2026-06-10T08:00:00.000Z",
      },
    ]);
  });

  it("odmitne rezervaci kdyz zamestnanec nema prirazenou sluzbu", () => {
    const analysis = analyzeBookingCsv({
      existingServices: [{ id: "22222222-2222-4222-8222-222222222222", name: "Pansky strih" }],
      existingStaff: [
        {
          id: "33333333-3333-4333-8333-333333333333",
          name: "Anna Novakova",
          staff_services: [],
        },
      ],
      text: "klient;sluzba;zamestnanec;datum;cas\nPetr Svoboda;Pansky strih;Anna Novakova;2026-06-10;10:00",
      timeZone: "Europe/Prague",
    });

    expect(analysis.rows).toEqual([]);
    expect(analysis.preview[0]).toMatchObject({
      errors: ["Zaměstnanec nemá přiřazenou vybranou službu."],
      status: "invalid",
    });
  });
});
