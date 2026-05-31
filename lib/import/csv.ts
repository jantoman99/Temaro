import { normalizePhoneInput } from "@/lib/phone";
import { localDatetimeToUtcIso } from "@/lib/time-zone";
import { createBookingSchema, type CreateBookingInput } from "@/lib/validations/bookings";
import { createClientSchema, type CreateClientInput } from "@/lib/validations/clients";
import { createServiceSchema, type CreateServiceInput } from "@/lib/validations/services";

export const CSV_IMPORT_MAX_BYTES = 200_000;
export const CSV_IMPORT_MAX_ROWS = 200;

type CsvRecord = {
  rowNumber: number;
  values: Record<string, string>;
};

export type ImportEntityType = "bookings" | "clients" | "services";

export type ImportPreviewRow = {
  errors: string[];
  label: string;
  rowNumber: number;
  status: "valid" | "invalid" | "duplicate";
};

export type ClientImportRow = CreateClientInput;
export type ServiceImportRow = CreateServiceInput;
export type BookingImportRow = CreateBookingInput & {
  clientEmail: string | null;
  clientFullName: string | null;
  clientPhone: string | null;
};

export type ClientImportAnalysis = {
  errors: string[];
  rows: ClientImportRow[];
  preview: ImportPreviewRow[];
};

export type ServiceImportAnalysis = {
  errors: string[];
  rows: ServiceImportRow[];
  preview: ImportPreviewRow[];
};

export type BookingImportAnalysis = {
  errors: string[];
  rows: BookingImportRow[];
  preview: ImportPreviewRow[];
};

type ExistingClient = {
  email: string | null;
  phone: string | null;
};

type ExistingService = {
  id?: string;
  name: string;
};

type ExistingStaff = {
  id: string;
  name: string;
  staff_services?: Array<{
    service_id: string;
  }>;
};

function normalizeHeader(value: string) {
  return value
    .replace(/^\uFEFF/, "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function normalizeCompare(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

function detectDelimiter(headerLine: string) {
  const commaCount = (headerLine.match(/,/g) ?? []).length;
  const semicolonCount = (headerLine.match(/;/g) ?? []).length;

  return semicolonCount > commaCount ? ";" : ",";
}

function parseCsvLine(line: string, delimiter: string) {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const nextChar = line[index + 1];

    if (char === '"' && inQuotes && nextChar === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === delimiter && !inQuotes) {
      cells.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  cells.push(current.trim());

  return cells;
}

export function parseCsv(text: string) {
  const normalizedText = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();

  if (!normalizedText) {
    return { errors: ["CSV je prázdné."], records: [] as CsvRecord[] };
  }

  if (new TextEncoder().encode(normalizedText).length > CSV_IMPORT_MAX_BYTES) {
    return { errors: ["CSV je příliš velké. Limit je 200 kB."], records: [] as CsvRecord[] };
  }

  const lines = normalizedText.split("\n").filter((line) => line.trim().length > 0);
  const delimiter = detectDelimiter(lines[0] ?? "");
  const headers = parseCsvLine(lines[0] ?? "", delimiter).map(normalizeHeader);

  if (headers.length === 0 || headers.every((header) => header.length === 0)) {
    return { errors: ["CSV nemá hlavičku."], records: [] as CsvRecord[] };
  }

  if (lines.length - 1 > CSV_IMPORT_MAX_ROWS) {
    return { errors: [`CSV má příliš mnoho řádků. Limit je ${CSV_IMPORT_MAX_ROWS}.`], records: [] as CsvRecord[] };
  }

  const records = lines.slice(1).map((line, index) => {
    const values = parseCsvLine(line, delimiter);

    return {
      rowNumber: index + 2,
      values: Object.fromEntries(headers.map((header, headerIndex) => [header, values[headerIndex]?.trim() ?? ""])),
    };
  });

  return { errors: [], records };
}

function pickValue(record: CsvRecord, aliases: string[]) {
  for (const alias of aliases.map(normalizeHeader)) {
    const value = record.values[alias];

    if (value) {
      return value;
    }
  }

  return "";
}

function normalizeMoneyInput(value: string) {
  return value.replace(/\s+/g, "").replace(/[^\d,.]/g, "");
}

function normalizeIntegerInput(value: string) {
  return value.replace(/[^\d]/g, "");
}

function normalizeDepositType(value: string) {
  const normalized = normalizeHeader(value);

  if (!normalized || ["none", "bez", "bezzalohy", "0"].includes(normalized)) {
    return "none";
  }

  if (["fixed", "fixni", "castka", "amount"].includes(normalized)) {
    return "fixed";
  }

  if (["percent", "procento", "procenta", "percentage"].includes(normalized)) {
    return "percent";
  }

  return value;
}

function clientDuplicateKey(client: { email?: string | null; phone?: string | null }) {
  return [
    client.email ? `email:${client.email.trim().toLowerCase()}` : "",
    client.phone ? `phone:${normalizePhoneInput(client.phone)}` : "",
  ].filter(Boolean);
}

function serviceDuplicateKey(service: Pick<ServiceImportRow, "name">) {
  return normalizeCompare(service.name);
}

function findClientId(
  existingClients: Array<ExistingClient & { id?: string; full_name?: string | null }>,
  email: string | null,
  phone: string | null,
) {
  const normalizedEmail = email?.trim().toLowerCase() || null;
  const normalizedPhone = phone ? normalizePhoneInput(phone) : null;

  if (!normalizedEmail && !normalizedPhone) {
    return null;
  }

  return existingClients.find((client) => {
    const clientEmail = client.email?.trim().toLowerCase() || null;
    const clientPhone = client.phone ? normalizePhoneInput(client.phone) : null;

    return Boolean((normalizedEmail && clientEmail === normalizedEmail) || (normalizedPhone && clientPhone === normalizedPhone));
  })?.id ?? null;
}

function findServiceId(existingServices: ExistingService[], name: string) {
  const normalizedName = normalizeCompare(name);

  return existingServices.find((service) => normalizeCompare(service.name) === normalizedName)?.id ?? null;
}

function findStaff(existingStaff: ExistingStaff[], name: string) {
  const normalizedName = normalizeCompare(name);

  return existingStaff.find((staff) => normalizeCompare(staff.name) === normalizedName) ?? null;
}

function getBookingLocalDateTime(record: CsvRecord) {
  const startsAt = pickValue(record, ["starts_at", "startsat", "start", "termin", "datetime", "datumcas"]);

  if (startsAt) {
    return startsAt.includes("T") ? startsAt : startsAt.replace(" ", "T");
  }

  const date = pickValue(record, ["date", "datum"]);
  const time = pickValue(record, ["time", "cas"]);

  if (!date || !time) {
    return "";
  }

  return `${date}T${time}`;
}

export function analyzeClientCsv(text: string, existingClients: ExistingClient[] = []): ClientImportAnalysis {
  const parsedCsv = parseCsv(text);
  const existingKeys = new Set(existingClients.flatMap(clientDuplicateKey));
  const currentKeys = new Set<string>();
  const rows: ClientImportRow[] = [];
  const preview: ImportPreviewRow[] = [];

  if (parsedCsv.errors.length > 0) {
    return { errors: parsedCsv.errors, preview, rows };
  }

  for (const record of parsedCsv.records) {
    const parsed = createClientSchema.safeParse({
      email: pickValue(record, ["email", "e-mail", "mail"]),
      fullName: pickValue(record, ["full_name", "fullname", "name", "jmeno", "klient", "client"]),
      notes: pickValue(record, ["notes", "note", "poznamky"]),
      phone: pickValue(record, ["phone", "telefon", "tel", "mobile", "mobil"]),
      preferredStaffId: "",
    });

    if (!parsed.success) {
      preview.push({
        errors: parsed.error.issues.map((issue) => issue.message),
        label: pickValue(record, ["full_name", "fullname", "name", "jmeno", "klient", "client"]) || "Bez jména",
        rowNumber: record.rowNumber,
        status: "invalid",
      });
      continue;
    }

    const keys = clientDuplicateKey(parsed.data);
    const duplicate = keys.some((key) => existingKeys.has(key) || currentKeys.has(key));

    preview.push({
      errors: duplicate ? ["Klient se stejným e-mailem nebo telefonem už existuje."] : [],
      label: parsed.data.fullName,
      rowNumber: record.rowNumber,
      status: duplicate ? "duplicate" : "valid",
    });

    if (!duplicate) {
      rows.push(parsed.data);
      keys.forEach((key) => currentKeys.add(key));
    }
  }

  return { errors: [], preview, rows };
}

export function analyzeServiceCsv(text: string, existingServices: ExistingService[] = []): ServiceImportAnalysis {
  const parsedCsv = parseCsv(text);
  const existingKeys = new Set(existingServices.map(serviceDuplicateKey));
  const currentKeys = new Set<string>();
  const rows: ServiceImportRow[] = [];
  const preview: ImportPreviewRow[] = [];

  if (parsedCsv.errors.length > 0) {
    return { errors: parsedCsv.errors, preview, rows };
  }

  for (const record of parsedCsv.records) {
    const parsed = createServiceSchema.safeParse({
      bufferMinutes: normalizeIntegerInput(pickValue(record, ["buffer_minutes", "bufferminutes", "buffer", "pauza"])) || "0",
      currency: pickValue(record, ["currency", "mena"]) || "CZK",
      depositType: normalizeDepositType(pickValue(record, ["deposit_type", "deposittype", "typzalohy", "zaloha_typ"])) || "none",
      depositValue: normalizeMoneyInput(pickValue(record, ["deposit_value", "depositvalue", "zaloha", "hodnotazalohy"])),
      description: pickValue(record, ["description", "popis"]) || undefined,
      durationMinutes: normalizeIntegerInput(pickValue(record, ["duration_minutes", "durationminutes", "duration", "delka", "minuty"])),
      name: pickValue(record, ["name", "nazev", "service", "sluzba"]),
      price: normalizeMoneyInput(pickValue(record, ["price", "cena"])),
    });

    if (!parsed.success) {
      preview.push({
        errors: parsed.error.issues.map((issue) => issue.message),
        label: pickValue(record, ["name", "nazev", "service", "sluzba"]) || "Bez názvu",
        rowNumber: record.rowNumber,
        status: "invalid",
      });
      continue;
    }

    const key = serviceDuplicateKey(parsed.data);
    const duplicate = existingKeys.has(key) || currentKeys.has(key);

    preview.push({
      errors: duplicate ? ["Služba se stejným názvem už existuje."] : [],
      label: parsed.data.name,
      rowNumber: record.rowNumber,
      status: duplicate ? "duplicate" : "valid",
    });

    if (!duplicate) {
      rows.push(parsed.data);
      currentKeys.add(key);
    }
  }

  return { errors: [], preview, rows };
}

export function analyzeBookingCsv({
  existingClients = [],
  existingServices = [],
  existingStaff = [],
  text,
  timeZone,
}: {
  existingClients?: Array<ExistingClient & { id?: string; full_name?: string | null }>;
  existingServices?: ExistingService[];
  existingStaff?: ExistingStaff[];
  text: string;
  timeZone: string;
}): BookingImportAnalysis {
  const parsedCsv = parseCsv(text);
  const rows: BookingImportRow[] = [];
  const preview: ImportPreviewRow[] = [];

  if (parsedCsv.errors.length > 0) {
    return { errors: parsedCsv.errors, preview, rows };
  }

  for (const record of parsedCsv.records) {
    const clientEmail = pickValue(record, ["client_email", "clientemail", "email", "e-mail", "mail"]) || null;
    const clientFullName = pickValue(record, ["client_name", "clientname", "jmeno", "klient", "client"]) || null;
    const clientPhone = pickValue(record, ["client_phone", "clientphone", "phone", "telefon", "tel", "mobil"]) || null;
    const serviceName = pickValue(record, ["service", "service_name", "servicename", "sluzba", "nazevsluzby"]);
    const staffName = pickValue(record, ["staff", "staff_name", "staffname", "zamestnanec", "pracovnik"]);
    const serviceId = findServiceId(existingServices, serviceName);
    const staff = findStaff(existingStaff, staffName);
    const clientId = findClientId(existingClients, clientEmail, clientPhone);
    const startsAt = localDatetimeToUtcIso(getBookingLocalDateTime(record), timeZone);
    const notes = pickValue(record, ["notes", "note", "poznamky"]) || "";
    const errors: string[] = [];

    if (!serviceName || !serviceId) {
      errors.push("Služba z CSV neexistuje v tomto tenantu.");
    }

    if (!staffName || !staff) {
      errors.push("Zaměstnanec z CSV neexistuje v tomto tenantu.");
    }

    if (serviceId && staff && !staff.staff_services?.some((item) => item.service_id === serviceId)) {
      errors.push("Zaměstnanec nemá přiřazenou vybranou službu.");
    }

    const parsed = createBookingSchema.safeParse({
      clientEmail,
      clientFullName,
      clientId: clientId ?? "",
      clientPhone,
      notes,
      sendNotification: false,
      serviceId: serviceId ?? "",
      staffId: staff?.id ?? "",
      startsAt,
    });

    if (!parsed.success) {
      errors.push(...parsed.error.issues.map((issue) => issue.message));
    }

    const label = `${clientFullName || clientEmail || clientPhone || "Bez klienta"} · ${serviceName || "bez služby"} · ${staffName || "bez zaměstnance"}`;

    if (errors.length > 0 || !parsed.success) {
      preview.push({
        errors,
        label,
        rowNumber: record.rowNumber,
        status: "invalid",
      });
      continue;
    }

    preview.push({
      errors: [],
      label,
      rowNumber: record.rowNumber,
      status: "valid",
    });
    rows.push({
      ...parsed.data,
      clientEmail: parsed.data.clientEmail ?? null,
      clientFullName: parsed.data.clientFullName ?? null,
      clientPhone: parsed.data.clientPhone ?? null,
    });
  }

  return { errors: [], preview, rows };
}
