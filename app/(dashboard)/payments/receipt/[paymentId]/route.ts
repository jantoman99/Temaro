import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { getActiveAuthContextError } from "@/lib/auth/active-context";
import { getAuthContextError } from "@/lib/auth/session-context";
import { buildPaymentReceiptHtml, type PaymentReceiptData, type TenantReceiptData } from "@/lib/payments/receipt";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type ReceiptRouteProps = {
  params: Promise<{ paymentId: string }>;
};

const paymentIdSchema = z.string().uuid();

export async function GET(_request: NextRequest, { params }: ReceiptRouteProps) {
  const { paymentId: rawPaymentId } = await params;
  const parsedPaymentId = paymentIdSchema.safeParse(rawPaymentId);

  if (!parsedPaymentId.success) {
    return new NextResponse("Not Found", { status: 404 });
  }

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

  const tenantId = user.app_metadata.tenant_id.trim();
  const [{ data: tenant, error: tenantError }, { data: payment, error: paymentError }] = await Promise.all([
    supabase
      .from("tenants")
      .select("name, timezone, locale, default_currency, public_address, public_city, public_country_code, public_postal_code")
      .eq("id", tenantId)
      .is("deleted_at", null)
      .maybeSingle(),
    supabase
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
      .eq("id", parsedPaymentId.data)
      .maybeSingle(),
  ]);

  if (tenantError || paymentError) {
    return new NextResponse("Doklad se nepodařilo připravit", { status: 500 });
  }

  if (!tenant || !payment) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const html = buildPaymentReceiptHtml(payment as PaymentReceiptData, tenant as TenantReceiptData);

  return new NextResponse(html, {
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}
