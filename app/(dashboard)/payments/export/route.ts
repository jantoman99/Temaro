import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { getActiveAuthContextError } from "@/lib/auth/active-context";
import { getAuthContextError } from "@/lib/auth/session-context";
import { buildPaymentsCsv, getPaymentsExportFilename, type PaymentExportRow } from "@/lib/payments/export";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const exportSearchParamsSchema = z.object({
  from: z.string().date().optional(),
  status: z.enum(["all", "paid", "pending", "refunded", "failed"]).default("paid"),
  to: z.string().date().optional(),
});

function getDayStart(value: string) {
  return `${value}T00:00:00.000Z`;
}

function getDayEnd(value: string) {
  return `${value}T23:59:59.999Z`;
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (!user || authError) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const authContextError = getAuthContextError(user);

  if (authContextError || user.app_metadata.role !== "owner") {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const activeContextError = await getActiveAuthContextError(supabase, user);

  if (activeContextError) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const parsed = exportSearchParamsSchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));

  if (!parsed.success) {
    return new NextResponse("Bad Request", { status: 400 });
  }

  const tenantId = user.app_metadata.tenant_id.trim();

  let query = supabase
    .from("booking_payments")
    .select(
      `
        id,
        amount,
        currency,
        payment_scope,
        method,
        status,
        note,
        paid_at,
        created_at,
        bookings!booking_payments_booking_tenant_fkey (
          starts_at,
          clients!bookings_client_tenant_fkey (full_name, email, phone),
          services!bookings_service_tenant_fkey (name),
          staff!bookings_staff_tenant_fkey (name)
        )
      `,
    )
    .eq("tenant_id", tenantId)
    .order("paid_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (parsed.data.status !== "all") {
    query = query.eq("status", parsed.data.status);
  }

  if (parsed.data.from) {
    query = query.gte("paid_at", getDayStart(parsed.data.from));
  }

  if (parsed.data.to) {
    query = query.lte("paid_at", getDayEnd(parsed.data.to));
  }

  const { data, error } = await query;

  if (error) {
    return new NextResponse("Export se nepodařilo připravit", { status: 500 });
  }

  const csv = buildPaymentsCsv((data ?? []) as PaymentExportRow[]);

  return new NextResponse(csv, {
    headers: {
      "Content-Disposition": `attachment; filename="${getPaymentsExportFilename()}"`,
      "Content-Type": "text/csv; charset=utf-8",
    },
  });
}
