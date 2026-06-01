import { createClient } from "@supabase/supabase-js";
import { expect, type Page } from "@playwright/test";
import { randomUUID } from "node:crypto";

export function hasSupabaseAdminRuntime() {
  return Boolean(
    process.env.E2E_AUTHENTICATED_SMOKE === "true" &&
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase admin env for E2E cleanup.");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export function createE2ERun(prefix: string) {
  const runId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  return {
    businessName: `E2E ${prefix} ${runId}`,
    email: `e2e-${prefix.toLowerCase()}-${runId}@temaro.test`,
    password: "E2eOwnerPassword123!",
    runId,
  };
}

export async function registerE2EOwner(page: Page, setup: ReturnType<typeof createE2ERun>) {
  await page.goto("/register");
  await page.getByLabel("Název podniku").fill(setup.businessName);
  await page.getByLabel("Jméno vlastníka").fill("E2E Owner");
  await page.getByLabel("Email").fill(setup.email);
  await page.getByLabel("Heslo").fill(setup.password);
  await page.getByRole("button", { name: "Vytvořit podnik", exact: true }).click();

  await expect(page).toHaveURL(/\/start$/);
  await expect(page.getByRole("heading", { name: "Nastavení první rezervace" })).toBeVisible();
}

export async function cleanupE2EAccount(email: string, businessName: string) {
  if (!hasSupabaseAdminRuntime()) return;

  const admin = createAdminClient();

  await admin.from("tenants").delete().eq("name", businessName);

  const { data } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const user = data.users.find((item) => item.email?.toLowerCase() === email.toLowerCase());

  if (user) {
    await admin.auth.admin.deleteUser(user.id);
  }
}

export function getFutureLocalDateTime(daysFromNow = 3) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(10, 0, 0, 0);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return {
    dateKey: `${year}-${month}-${day}`,
    dateTime: `${year}-${month}-${day}T10:00`,
  };
}

export async function getTenantIdByName(businessName: string) {
  const admin = createAdminClient();
  const { data: tenant, error: tenantError } = await admin
    .from("tenants")
    .select("id")
    .eq("name", businessName)
    .single();

  if (tenantError || !tenant) {
    throw new Error("Unable to find E2E tenant.");
  }

  return tenant.id as string;
}

export async function seedManualBookingPrerequisites(businessName: string, runId: string) {
  const admin = createAdminClient();
  const tenantId = await getTenantIdByName(businessName);
  const serviceId = randomUUID();
  const staffId = randomUUID();

  const { error: serviceError } = await admin.from("services").insert({
    buffer_minutes: 0,
    currency: "CZK",
    duration_minutes: 45,
    id: serviceId,
    name: `E2E rezervace služba ${runId}`,
    price: 59000,
    tenant_id: tenantId,
  });

  if (serviceError) {
    throw new Error("Unable to seed E2E service.");
  }

  const { error: staffError } = await admin.from("staff").insert({
    color: "#0f766e",
    id: staffId,
    name: `E2E rezervace barber ${runId}`,
    tenant_id: tenantId,
  });

  if (staffError) {
    throw new Error("Unable to seed E2E staff.");
  }

  const { error: hoursError } = await admin.from("staff_hours").insert(
    [0, 1, 2, 3, 4, 5, 6].map((day) => ({
      day_of_week: day,
      end_time: "17:00",
      staff_id: staffId,
      start_time: "09:00",
      tenant_id: tenantId,
    })),
  );

  if (hoursError) {
    throw new Error("Unable to seed E2E staff hours.");
  }

  const { error: assignmentError } = await admin.from("staff_services").insert({
    service_id: serviceId,
    staff_id: staffId,
    tenant_id: tenantId,
  });

  if (assignmentError) {
    throw new Error("Unable to seed E2E staff service assignment.");
  }

  return { serviceId, staffId, tenantId };
}

export async function seedCalendarBooking({
  clientName,
  dateTime,
  runId,
  serviceId,
  staffId,
  tenantId,
}: {
  clientName: string;
  dateTime: string;
  runId: string;
  serviceId: string;
  staffId: string;
  tenantId: string;
}) {
  const admin = createAdminClient();
  const clientId = randomUUID();
  const bookingId = randomUUID();
  const startsAt = new Date(`${dateTime}:00+02:00`);
  const endsAt = new Date(startsAt.getTime() + 45 * 60 * 1000);

  const { error: clientError } = await admin.from("clients").insert({
    email: `booking-client-${runId}@temaro.test`,
    full_name: clientName,
    id: clientId,
    phone: "+420777222333",
    tenant_id: tenantId,
  });

  if (clientError) {
    throw new Error("Unable to seed E2E booking client.");
  }

  const { error: bookingError } = await admin.from("bookings").insert({
    client_id: clientId,
    ends_at: endsAt.toISOString(),
    id: bookingId,
    service_id: serviceId,
    source: "manual",
    staff_id: staffId,
    starts_at: startsAt.toISOString(),
    status: "pending",
    tenant_id: tenantId,
  });

  if (bookingError) {
    throw new Error("Unable to seed E2E booking.");
  }

  return bookingId;
}
