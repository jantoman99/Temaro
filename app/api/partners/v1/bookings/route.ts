import { NextResponse, type NextRequest } from "next/server";

import { hashTenantApiKey, isTenantApiKeyFormat } from "@/lib/api-keys/keys";
import { createAdminClient } from "@/lib/supabase/admin";
import { partnerBookingsQuerySchema } from "@/lib/validations/integrations";

export const dynamic = "force-dynamic";

type TenantApiKey = {
  id: string;
  tenant_id: string;
  scopes: string[];
  revoked_at: string | null;
};

function getBearerToken(request: NextRequest) {
  const authorization = request.headers.get("authorization") ?? "";
  const [scheme, token] = authorization.split(" ");

  if (scheme !== "Bearer" || !token || !isTenantApiKeyFormat(token)) {
    return null;
  }

  return token;
}

function getDefaultWindow() {
  const from = new Date();
  const to = new Date(from);
  to.setDate(to.getDate() + 30);

  return {
    from: from.toISOString(),
    to: to.toISOString(),
  };
}

export async function GET(request: NextRequest) {
  const token = getBearerToken(request);

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsedQuery = partnerBookingsQuerySchema.safeParse({
    from: request.nextUrl.searchParams.get("from") ?? undefined,
    limit: request.nextUrl.searchParams.get("limit") ?? undefined,
    to: request.nextUrl.searchParams.get("to") ?? undefined,
  });

  if (!parsedQuery.success) {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }

  const { data: apiKey, error: keyError } = await admin
    .from("tenant_api_keys")
    .select("id, tenant_id, scopes, revoked_at")
    .eq("token_hash", hashTenantApiKey(token))
    .maybeSingle();

  if (keyError || !apiKey || (apiKey as TenantApiKey).revoked_at) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const key = apiKey as TenantApiKey;

  if (!key.scopes.includes("bookings:read")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const defaults = getDefaultWindow();
  const from = parsedQuery.data.from ?? defaults.from;
  const to = parsedQuery.data.to ?? defaults.to;

  const [{ data: bookings, error: bookingsError }] = await Promise.all([
    admin
      .from("bookings")
      .select("id, starts_at, ends_at, status, source, clients!bookings_client_tenant_fkey(full_name, email, phone), services(name), staff(name)")
      .eq("tenant_id", key.tenant_id)
      .gte("starts_at", from)
      .lte("starts_at", to)
      .order("starts_at", { ascending: true })
      .limit(parsedQuery.data.limit),
    admin
      .from("tenant_api_keys")
      .update({ last_used_at: new Date().toISOString() })
      .eq("id", key.id)
      .eq("tenant_id", key.tenant_id),
  ]);

  if (bookingsError) {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }

  return NextResponse.json(
    {
      data: bookings ?? [],
      meta: {
        from,
        limit: parsedQuery.data.limit,
        to,
      },
    },
    {
      headers: {
        "Cache-Control": "private, no-store",
      },
    },
  );
}
