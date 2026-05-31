import { formatCurrencyForDisplay } from "@/lib/currency";
import { formatDateTimeForDisplay } from "@/lib/date-format";

export type PaymentReceiptData = {
  amount: number;
  currency: string;
  created_at: string;
  id: string;
  method: string;
  note: string | null;
  paid_at: string | null;
  payment_scope: string;
  status: string;
  bookings: {
    starts_at: string | null;
    clients: { email: string | null; full_name: string | null; phone: string | null } | null;
    services: { name: string | null } | null;
    staff: { name: string | null } | null;
  } | null;
};

export type TenantReceiptData = {
  default_currency: string | null;
  locale: string | null;
  name: string;
  public_address: string | null;
  public_city: string | null;
  public_country_code: string | null;
  public_postal_code: string | null;
  timezone: string | null;
};

const PAYMENT_SCOPE_LABELS: Record<string, string> = {
  deposit: "Záloha",
  full: "Celá platba",
  other: "Jiná platba",
  remaining: "Doplatek",
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  bank_transfer: "Bankovní převod",
  card_terminal: "Karta na místě",
  cash: "Hotově",
  online_card: "Online karta",
  other: "Jiné",
  voucher: "Voucher",
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  failed: "Selhalo",
  paid: "Zaplaceno",
  pending: "Čeká",
  refunded: "Vráceno",
};

export function escapeHtml(value: string | null | undefined) {
  return (value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getLabel(labels: Record<string, string>, value: string) {
  return labels[value] ?? value;
}

function getTenantAddress(tenant: TenantReceiptData) {
  return [tenant.public_address, tenant.public_postal_code, tenant.public_city, tenant.public_country_code]
    .filter(Boolean)
    .join(", ");
}

function row(label: string, value: string) {
  return `<tr><th>${escapeHtml(label)}</th><td>${escapeHtml(value)}</td></tr>`;
}

export function buildPaymentReceiptHtml(payment: PaymentReceiptData, tenant: TenantReceiptData) {
  const timeZone = tenant.timezone ?? "Europe/Prague";
  const client = payment.bookings?.clients;
  const service = payment.bookings?.services;
  const staff = payment.bookings?.staff;
  const paidAt = payment.paid_at ?? payment.created_at;
  const tenantAddress = getTenantAddress(tenant);

  const rows = [
    row("Doklad", `TEM-${payment.id.slice(0, 8).toUpperCase()}`),
    row("Vystaveno", formatDateTimeForDisplay(paidAt, timeZone)),
    row("Stav", getLabel(PAYMENT_STATUS_LABELS, payment.status)),
    row("Typ platby", getLabel(PAYMENT_SCOPE_LABELS, payment.payment_scope)),
    row("Metoda", getLabel(PAYMENT_METHOD_LABELS, payment.method)),
    row("Částka", formatCurrencyForDisplay(payment.amount, payment.currency, 2)),
    row("Služba", service?.name ?? "Bez služby"),
    row("Termín", payment.bookings?.starts_at ? formatDateTimeForDisplay(payment.bookings.starts_at, timeZone) : "Bez termínu"),
    row("Člen týmu", staff?.name ?? "Bez člena týmu"),
    row("Klient", client?.full_name ?? client?.email ?? client?.phone ?? "Bez klienta"),
  ];

  if (payment.note) {
    rows.push(row("Poznámka", payment.note));
  }

  return `<!doctype html>
<html lang="cs">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Doklad ${escapeHtml(payment.id.slice(0, 8))}</title>
  <style>
    body { margin: 0; background: #f6f3ec; color: #17130f; font-family: ui-serif, Georgia, serif; }
    main { max-width: 760px; margin: 32px auto; background: #fffaf1; border: 1px solid #ded4c3; border-radius: 22px; padding: 36px; }
    header { display: flex; justify-content: space-between; gap: 24px; border-bottom: 1px solid #ded4c3; padding-bottom: 24px; }
    h1 { margin: 0; font-size: 34px; letter-spacing: -0.04em; }
    p { margin: 0; line-height: 1.55; }
    .muted { color: #776c5f; font-size: 14px; }
    table { width: 100%; border-collapse: collapse; margin-top: 28px; font-family: ui-sans-serif, system-ui, sans-serif; }
    th, td { border-bottom: 1px solid #eadfce; padding: 13px 0; text-align: left; vertical-align: top; }
    th { width: 34%; color: #776c5f; font-size: 12px; text-transform: uppercase; letter-spacing: 0.12em; }
    td { font-weight: 650; }
    .total { margin-top: 28px; border-radius: 16px; background: #17130f; color: #fffaf1; padding: 18px 20px; font: 700 28px ui-sans-serif, system-ui, sans-serif; }
    .actions { margin-top: 24px; display: flex; justify-content: flex-end; }
    button { border: 0; border-radius: 10px; background: #17130f; color: #fffaf1; padding: 11px 16px; font-weight: 700; cursor: pointer; }
    @media print { body { background: white; } main { margin: 0; max-width: none; border: 0; border-radius: 0; } .actions { display: none; } }
  </style>
</head>
<body>
  <main>
    <header>
      <div>
        <p class="muted">Temaro doklad o platbě</p>
        <h1>${escapeHtml(tenant.name)}</h1>
        ${tenantAddress ? `<p class="muted">${escapeHtml(tenantAddress)}</p>` : ""}
      </div>
      <div>
        <p class="muted">Částka</p>
        <p class="total">${escapeHtml(formatCurrencyForDisplay(payment.amount, payment.currency, 2))}</p>
      </div>
    </header>
    <table>
      <tbody>${rows.join("")}</tbody>
    </table>
    <p class="muted" style="margin-top:24px">Tento doklad je provozní potvrzení platby z Temara. Daňové náležitosti a fiskální režim ověřte s účetní podle typu podnikání.</p>
    <div class="actions"><button onclick="window.print()">Vytisknout / uložit PDF</button></div>
  </main>
</body>
</html>`;
}
