"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getBaseAppUrl } from "@/lib/app-url";
import { requireOwner } from "@/lib/auth/require-owner";
import { hasSupabaseAdminEnv, hasSupabaseEnv } from "@/lib/env";
import { findMatchingStaff } from "@/lib/staff/find-matching-staff";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSafeTimeZone, localDatetimeToUtcIso } from "@/lib/time-zone";
import {
  createStaffSchema,
  inviteStaffSchema,
  staffExceptionSchema,
  staffIdSchema,
  staffServiceSchema,
  updateStaffColorSchema,
  updateStaffSchema,
} from "@/lib/validations/staff";

type StaffActionState = {
  error?: string;
  success?: string;
};

async function hasActiveFutureBookingsForStaff(
  supabase: Exclude<Awaited<ReturnType<typeof requireOwner>>, { error: "Unauthorized" | "Forbidden" }>["supabase"],
  tenantId: string,
  staffId: string,
) {
  const { count, error } = await supabase
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .eq("tenant_id", tenantId)
    .eq("staff_id", staffId)
    .in("status", ["pending", "confirmed"])
    .gt("starts_at", new Date().toISOString());

  if (error) {
    return null;
  }

  return (count ?? 0) > 0;
}

async function hasActiveFutureBookingsForStaffService(
  supabase: Exclude<Awaited<ReturnType<typeof requireOwner>>, { error: "Unauthorized" | "Forbidden" }>["supabase"],
  tenantId: string,
  staffId: string,
  serviceId: string,
) {
  const { count, error } = await supabase
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .eq("tenant_id", tenantId)
    .eq("staff_id", staffId)
    .eq("service_id", serviceId)
    .in("status", ["pending", "confirmed"])
    .gt("starts_at", new Date().toISOString());

  if (error) {
    return null;
  }

  return (count ?? 0) > 0;
}

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

function ignoreRevalidateError(action: () => void) {
  try {
    action();
  } catch {
    // Zmena uz je ulozena; chyba obnoveni cache nesmi vratit falesny neuspech.
  }
}

function addDaysToDateKey(dateKey: string, days: number) {
  const [year = "1970", month = "01", day = "01"] = dateKey.split("-");
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day) + days, 12, 0, 0));

  return date.toISOString().slice(0, 10);
}

function getLocalBookingParts(value: string, timeZone: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const parts = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
    minute: "2-digit",
    month: "2-digit",
    timeZone,
    year: "numeric",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const dayOfWeekDate = new Date(Date.UTC(
    Number(values.year),
    Number(values.month) - 1,
    Number(values.day),
    12,
    0,
    0,
  ));

  return {
    dateKey: `${values.year}-${values.month}-${values.day}`,
    dayOfWeek: (dayOfWeekDate.getUTCDay() + 6) % 7,
    time: `${values.hour}:${values.minute}`,
  };
}

async function getTenantTimeZone(
  auth: Exclude<Awaited<ReturnType<typeof requireOwner>>, { error: "Unauthorized" | "Forbidden" }>,
) {
  const { data: tenant, error } = await auth.supabase
    .from("tenants")
    .select("timezone")
    .eq("id", auth.tenantId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error || !tenant) {
    return null;
  }

  return getSafeTimeZone(tenant.timezone);
}

async function getStaffExceptionBookingConflict(
  auth: Exclude<Awaited<ReturnType<typeof requireOwner>>, { error: "Unauthorized" | "Forbidden" }>,
  input: {
    date: string;
    endTime: string | null;
    isWorking: boolean;
    staffId: string;
    startTime: string | null;
  },
) {
  const timeZone = await getTenantTimeZone(auth);

  if (!timeZone) {
    return "Timezone podniku se nepodařilo ověřit.";
  }

  const dayStart = localDatetimeToUtcIso(`${input.date}T00:00`, timeZone);
  const dayEnd = localDatetimeToUtcIso(`${addDaysToDateKey(input.date, 1)}T00:00`, timeZone);
  const { data: bookings, error } = await auth.supabase
    .from("bookings")
    .select("starts_at, ends_at")
    .eq("tenant_id", auth.tenantId)
    .eq("staff_id", input.staffId)
    .in("status", ["pending", "confirmed"])
    .gt("starts_at", new Date().toISOString())
    .gt("ends_at", dayStart)
    .lt("starts_at", dayEnd);

  if (error) {
    return "Rezervace v den výjimky se nepodařilo ověřit.";
  }

  if (!bookings?.length) {
    return null;
  }

  if (!input.isWorking) {
    return "Volno nejde uložit, protože zaměstnanec má v tento den budoucí rezervace.";
  }

  if (!input.startTime || !input.endTime) {
    return null;
  }

  const exceptionStart = localDatetimeToUtcIso(`${input.date}T${input.startTime}`, timeZone);
  const exceptionEnd = localDatetimeToUtcIso(`${input.date}T${input.endTime}`, timeZone);
  const hasBookingOutsideExceptionHours = bookings.some((booking) => (
    booking.starts_at < exceptionStart || booking.ends_at > exceptionEnd
  ));

  return hasBookingOutsideExceptionHours
    ? "Výjimku nejde uložit, protože některá budoucí rezervace je mimo zadanou pracovní dobu."
    : null;
}

async function getStaffHoursBookingConflict(
  auth: Exclude<Awaited<ReturnType<typeof requireOwner>>, { error: "Unauthorized" | "Forbidden" }>,
  input: {
    endTime: string;
    staffId: string;
    startTime: string;
    workingDays: number[];
  },
) {
  const { data: bookings, error } = await auth.supabase
    .from("bookings")
    .select("starts_at, ends_at")
    .eq("tenant_id", auth.tenantId)
    .eq("staff_id", input.staffId)
    .in("status", ["pending", "confirmed"])
    .gt("starts_at", new Date().toISOString());

  if (error) {
    return "Budoucí rezervace zaměstnance se nepodařilo ověřit.";
  }

  if (!bookings?.length) {
    return null;
  }

  const timeZone = await getTenantTimeZone(auth);

  if (!timeZone) {
    return "Timezone podniku se nepodařilo ověřit.";
  }

  const todayKey = getLocalBookingParts(new Date().toISOString(), timeZone)?.dateKey ?? new Date().toISOString().slice(0, 10);
  const { data: exceptions, error: exceptionsError } = await auth.supabase
    .from("staff_exceptions")
    .select("date, is_working, start_time, end_time")
    .eq("tenant_id", auth.tenantId)
    .eq("staff_id", input.staffId)
    .gte("date", todayKey);

  if (exceptionsError) {
    return "Výjimky pracovní doby se nepodařilo ověřit.";
  }

  const exceptionsByDate = new Map((exceptions ?? []).map((exception) => [exception.date, exception]));
  const workingDays = new Set(input.workingDays);
  const hasBookingOutsideHours = bookings.some((booking) => {
    const startsAt = getLocalBookingParts(booking.starts_at, timeZone);
    const endsAt = getLocalBookingParts(booking.ends_at, timeZone);

    if (!startsAt || !endsAt || startsAt.dateKey !== endsAt.dateKey) {
      return true;
    }

    const exception = exceptionsByDate.get(startsAt.dateKey);

    if (exception) {
      if (!exception.is_working || !exception.start_time || !exception.end_time) {
        return true;
      }

      return startsAt.time < exception.start_time || endsAt.time > exception.end_time;
    }

    return (
      !workingDays.has(startsAt.dayOfWeek)
      || startsAt.time < input.startTime
      || endsAt.time > input.endTime
    );
  });

  return hasBookingOutsideHours
    ? "Pracovní dobu nejde uložit, protože některá budoucí rezervace je mimo nové hodiny."
    : null;
}

export async function createStaffAction(
  _previousState: StaffActionState,
  formData: FormData,
): Promise<StaffActionState> {
  const auth = await requireOwner();

  if ("error" in auth) {
    return { error: auth.error === "Unauthorized" ? "Přihlaste se znovu." : "Nemáte oprávnění." };
  }

  const parsed = createStaffSchema.safeParse({
    name: getStringValue(formData, "name"),
    bio: getStringValue(formData, "bio") || undefined,
    color: getStringValue(formData, "color") || "#111827",
    workingDays: formData.getAll("workingDays"),
    startTime: getStringValue(formData, "startTime"),
    endTime: getStringValue(formData, "endTime"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Neplatný zaměstnanec." };
  }

  if (!hasSupabaseEnv()) {
    return { success: "Demo režim: zaměstnanec by se tady uložil do databáze." };
  }

  let existingStaff: Awaited<ReturnType<typeof findMatchingStaff>>;

  try {
    existingStaff = await findMatchingStaff(auth.supabase, auth.tenantId, parsed.data.name);
  } catch {
    return { error: "Existujícího zaměstnance se nepodařilo ověřit." };
  }

  if (existingStaff) {
    return { error: "Zaměstnanec s tímto jménem už existuje." };
  }

  const { data: staff, error: staffError } = await auth.supabase
    .from("staff")
    .insert({
      tenant_id: auth.tenantId,
      name: parsed.data.name,
      bio: parsed.data.bio || null,
      color: parsed.data.color,
    })
    .select("id")
    .single();

  if (staffError || !staff) {
    return { error: "Zaměstnance se nepodařilo vytvořit." };
  }

  const staffHours = parsed.data.workingDays.map((day) => ({
    tenant_id: auth.tenantId,
    staff_id: staff.id,
    day_of_week: day,
    start_time: parsed.data.startTime,
    end_time: parsed.data.endTime,
  }));

  const { error: hoursError } = await auth.supabase.from("staff_hours").insert(staffHours);

  if (hoursError) {
    const { data: hiddenStaff, error: cleanupError } = await auth.supabase
      .from("staff")
      .update({
        is_active: false,
        deleted_at: new Date().toISOString(),
      })
      .eq("tenant_id", auth.tenantId)
      .eq("id", staff.id)
      .eq("is_active", true)
      .is("deleted_at", null)
      .select("id")
      .maybeSingle();

    if (cleanupError || !hiddenStaff) {
      return {
        error: "Pracovní dobu se nepodařilo uložit a rozpracovaného zaměstnance se nepodařilo uklidit.",
      };
    }

    return { error: "Pracovní dobu se nepodařilo uložit." };
  }

  ignoreRevalidateError(() => {
    revalidatePath("/staff");
  });

  redirect("/staff");
}

async function cleanupInvitedStaffUser(
  admin: ReturnType<typeof createAdminClient>,
  tenantId: string,
  userId: string,
) {
  let cleanupFailed = false;

  try {
    const { error: tenantUserError } = await admin
      .from("tenant_users")
      .delete()
      .eq("tenant_id", tenantId)
      .eq("user_id", userId);
    cleanupFailed = cleanupFailed || Boolean(tenantUserError);

    const { error: userProfileError } = await admin
      .from("users")
      .delete()
      .eq("id", userId);
    cleanupFailed = cleanupFailed || Boolean(userProfileError);

    const { error: authUserError } = await admin.auth.admin.deleteUser(userId);
    cleanupFailed = cleanupFailed || Boolean(authUserError);

    return !cleanupFailed;
  } catch {
    return false;
  }
}

export async function inviteStaffUserAction(
  _previousState: StaffActionState,
  formData: FormData,
): Promise<StaffActionState> {
  const auth = await requireOwner();

  if ("error" in auth) {
    return { error: auth.error === "Unauthorized" ? "Přihlaste se znovu." : "Nemáte oprávnění." };
  }

  const parsed = inviteStaffSchema.safeParse({
    fullName: getStringValue(formData, "fullName"),
    email: getStringValue(formData, "email"),
    staffId: getStringValue(formData, "staffId"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Neplatná pozvánka." };
  }

  if (!hasSupabaseEnv()) {
    return { success: "Demo režim: pozvánka by se tady odeslala emailem." };
  }

  if (!hasSupabaseAdminEnv()) {
    return { error: "Pozvánky vyžadují Supabase service role klíč." };
  }

  const { data: staffProfile, error: staffProfileError } = await auth.supabase
    .from("staff")
    .select("id, user_id")
    .eq("tenant_id", auth.tenantId)
    .eq("id", parsed.data.staffId)
    .eq("is_active", true)
    .is("deleted_at", null)
    .maybeSingle();

  if (staffProfileError) {
    return { error: "Vybraného zaměstnance se nepodařilo ověřit." };
  }

  if (!staffProfile) {
    return { error: "Vybraný zaměstnanec neexistuje." };
  }

  if (staffProfile.user_id) {
    return { error: "Vybraný zaměstnanec už má připojený účet." };
  }

  const admin = createAdminClient();
  const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(
    parsed.data.email,
    {
      data: {
        full_name: parsed.data.fullName,
      },
      redirectTo: `${getBaseAppUrl()}/auth/callback?next=/dashboard`,
    },
  );

  if (inviteError || !invited.user) {
    return { error: "Pozvánku se nepodařilo odeslat." };
  }

  const { error: metadataError } = await admin.auth.admin.updateUserById(invited.user.id, {
    app_metadata: {
      role: "staff",
      staff_id: parsed.data.staffId,
      tenant_id: auth.tenantId,
    },
    user_metadata: {
      full_name: parsed.data.fullName,
    },
  });

  if (metadataError) {
    const cleanupSucceeded = await cleanupInvitedStaffUser(admin, auth.tenantId, invited.user.id);

    if (!cleanupSucceeded) {
      return { error: "Pozvánka byla vytvořena, ale rozpracovaný účet se nepodařilo uklidit." };
    }

    return { error: "Pozvánka byla vytvořena, ale účet se nepodařilo přiřadit k podniku." };
  }

  const { error: userProfileError } = await admin.from("users").insert({
    id: invited.user.id,
    email: parsed.data.email,
    full_name: parsed.data.fullName,
  });

  if (userProfileError) {
    const cleanupSucceeded = await cleanupInvitedStaffUser(admin, auth.tenantId, invited.user.id);

    if (!cleanupSucceeded) {
      return { error: "Pozvánka byla vytvořena, ale rozpracovaný účet se nepodařilo uklidit." };
    }

    return { error: "Pozvánka byla vytvořena, ale profil uživatele se nepodařilo uložit." };
  }

  const { error: tenantUserError } = await admin.from("tenant_users").insert({
    tenant_id: auth.tenantId,
    user_id: invited.user.id,
    role: "staff",
  });

  if (tenantUserError) {
    const cleanupSucceeded = await cleanupInvitedStaffUser(admin, auth.tenantId, invited.user.id);

    if (!cleanupSucceeded) {
      return { error: "Pozvánka byla vytvořena, ale rozpracovaný účet se nepodařilo uklidit." };
    }

    return { error: "Pozvánka byla vytvořena, ale přístup do podniku se nepodařilo uložit." };
  }

  const { data: linkedStaff, error: staffLinkError } = await auth.supabase
    .from("staff")
    .update({
      user_id: invited.user.id,
    })
    .eq("tenant_id", auth.tenantId)
    .eq("id", parsed.data.staffId)
    .eq("is_active", true)
    .is("deleted_at", null)
    .is("user_id", null)
    .select("id")
    .maybeSingle();

  if (staffLinkError || !linkedStaff) {
    const cleanupSucceeded = await cleanupInvitedStaffUser(admin, auth.tenantId, invited.user.id);

    if (!cleanupSucceeded) {
      return { error: "Pozvánka byla vytvořena, ale rozpracovaný účet se nepodařilo uklidit." };
    }

    return { error: "Pozvánka byla vytvořena, ale zaměstnance se nepodařilo propojit s účtem." };
  }

  ignoreRevalidateError(() => {
    revalidatePath("/staff");
  });

  return { success: "Pozvánka byla odeslána." };
}

export async function hideStaffAction(
  _previousState: StaffActionState,
  formData: FormData,
): Promise<StaffActionState> {
  const auth = await requireOwner();

  if ("error" in auth) {
    return { error: auth.error === "Unauthorized" ? "Přihlaste se znovu." : "Nemáte oprávnění." };
  }

  const parsed = staffIdSchema.safeParse({
    staffId: getStringValue(formData, "staffId"),
  });

  if (!parsed.success) {
    return { error: "Zaměstnance se nepodařilo ověřit." };
  }

  if (!hasSupabaseEnv()) {
    return { success: "Demo režim: zaměstnanec by se tady skryl." };
  }

  const hasFutureBookings = await hasActiveFutureBookingsForStaff(
    auth.supabase,
    auth.tenantId,
    parsed.data.staffId,
  );

  if (hasFutureBookings) {
    return { error: "Zaměstnance nejde skrýt, protože má ještě budoucí rezervace." };
  }

  if (hasFutureBookings === null) {
    return { error: "Budoucí rezervace zaměstnance se nepodařilo ověřit." };
  }

  const { data: hiddenStaff, error } = await auth.supabase
    .from("staff")
    .update({
      is_active: false,
      deleted_at: new Date().toISOString(),
    })
    .eq("tenant_id", auth.tenantId)
    .eq("id", parsed.data.staffId)
    .eq("is_active", true)
    .is("deleted_at", null)
    .select("id")
    .maybeSingle();

  if (error || !hiddenStaff) {
    return { error: "Zaměstnance se nepodařilo skrýt." };
  }

  ignoreRevalidateError(() => {
    revalidatePath("/staff");
  });

  return { success: "Zaměstnanec byl skryt." };
}

export async function assignStaffServiceAction(
  _previousState: StaffActionState,
  formData: FormData,
): Promise<StaffActionState> {
  const auth = await requireOwner();

  if ("error" in auth) {
    return { error: auth.error === "Unauthorized" ? "Přihlaste se znovu." : "Nemáte oprávnění." };
  }

  const parsed = staffServiceSchema.safeParse({
    staffId: getStringValue(formData, "staffId"),
    serviceId: getStringValue(formData, "serviceId"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Neplatné přiřazení služby." };
  }

  if (!hasSupabaseEnv()) {
    return { success: "Demo režim: služba by se tady přiřadila." };
  }

  const [{ data: staff, error: staffError }, { data: service, error: serviceError }] = await Promise.all([
    auth.supabase
      .from("staff")
      .select("id")
      .eq("tenant_id", auth.tenantId)
      .eq("id", parsed.data.staffId)
      .eq("is_active", true)
      .is("deleted_at", null)
      .maybeSingle(),
    auth.supabase
      .from("services")
      .select("id")
      .eq("tenant_id", auth.tenantId)
      .eq("id", parsed.data.serviceId)
      .eq("is_active", true)
      .is("deleted_at", null)
      .maybeSingle(),
  ]);

  if (staffError || serviceError) {
    return { error: "Dostupnost zaměstnance nebo služby se nepodařilo ověřit." };
  }

  if (!staff || !service) {
    return { error: "Zaměstnanec nebo služba už nejsou dostupní." };
  }

  const { error } = await auth.supabase.from("staff_services").insert({
    tenant_id: auth.tenantId,
    staff_id: parsed.data.staffId,
    service_id: parsed.data.serviceId,
  });

  if (error) {
    return { error: "Službu se nepodařilo přiřadit." };
  }

  ignoreRevalidateError(() => {
    revalidatePath("/staff");
  });

  return { success: "Služba byla přiřazena." };
}

export async function removeStaffServiceAction(
  _previousState: StaffActionState,
  formData: FormData,
): Promise<StaffActionState> {
  const auth = await requireOwner();

  if ("error" in auth) {
    return { error: auth.error === "Unauthorized" ? "Přihlaste se znovu." : "Nemáte oprávnění." };
  }

  const parsed = staffServiceSchema.safeParse({
    staffId: getStringValue(formData, "staffId"),
    serviceId: getStringValue(formData, "serviceId"),
  });

  if (!parsed.success) {
    return { error: "Přiřazení služby se nepodařilo ověřit." };
  }

  if (!hasSupabaseEnv()) {
    return { success: "Demo režim: služba by se tady odebrala." };
  }

  const hasFutureBookings = await hasActiveFutureBookingsForStaffService(
    auth.supabase,
    auth.tenantId,
    parsed.data.staffId,
    parsed.data.serviceId,
  );

  if (hasFutureBookings) {
    return { error: "Službu nejde odebrat, protože na ni už existují budoucí rezervace." };
  }

  if (hasFutureBookings === null) {
    return { error: "Budoucí rezervace zaměstnance se nepodařilo ověřit." };
  }

  const { data: removedStaffService, error } = await auth.supabase
    .from("staff_services")
    .delete()
    .eq("tenant_id", auth.tenantId)
    .eq("staff_id", parsed.data.staffId)
    .eq("service_id", parsed.data.serviceId)
    .select("staff_id")
    .maybeSingle();

  if (error || !removedStaffService) {
    return { error: "Službu se nepodařilo odebrat." };
  }

  ignoreRevalidateError(() => {
    revalidatePath("/staff");
  });

  return { success: "Služba byla odebrána." };
}

export async function createStaffExceptionAction(
  _previousState: StaffActionState,
  formData: FormData,
): Promise<StaffActionState> {
  const auth = await requireOwner();

  if ("error" in auth) {
    return { error: auth.error === "Unauthorized" ? "Přihlaste se znovu." : "Nemáte oprávnění." };
  }

  const parsed = staffExceptionSchema.safeParse({
    staffId: getStringValue(formData, "staffId"),
    date: getStringValue(formData, "date"),
    isWorking: getStringValue(formData, "isWorking"),
    startTime: getStringValue(formData, "startTime"),
    endTime: getStringValue(formData, "endTime"),
    note: getStringValue(formData, "note"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Neplatná výjimka pracovní doby." };
  }

  if (!hasSupabaseEnv()) {
    return { success: "Demo režim: výjimka by se tady uložila." };
  }

  const { data: staff, error: staffError } = await auth.supabase
    .from("staff")
    .select("id")
    .eq("tenant_id", auth.tenantId)
    .eq("id", parsed.data.staffId)
    .eq("is_active", true)
    .is("deleted_at", null)
    .maybeSingle();

  if (staffError) {
    return { error: "Zaměstnance se nepodařilo ověřit." };
  }

  if (!staff) {
    return { error: "Zaměstnanec už není dostupný." };
  }

  const bookingConflict = await getStaffExceptionBookingConflict(auth, {
    date: parsed.data.date,
    endTime: parsed.data.endTime,
    isWorking: parsed.data.isWorking,
    staffId: parsed.data.staffId,
    startTime: parsed.data.startTime,
  });

  if (bookingConflict) {
    return { error: bookingConflict };
  }

  const { error } = await auth.supabase.from("staff_exceptions").upsert(
    {
      tenant_id: auth.tenantId,
      staff_id: parsed.data.staffId,
      date: parsed.data.date,
      is_working: parsed.data.isWorking,
      start_time: parsed.data.startTime,
      end_time: parsed.data.endTime,
      note: parsed.data.note ?? null,
    },
    { onConflict: "staff_id,date" },
  );

  if (error) {
    return { error: "Výjimku se nepodařilo uložit." };
  }

  ignoreRevalidateError(() => {
    revalidatePath("/staff");
  });

  return { success: "Výjimka byla uložena." };
}

export async function updateStaffAction(
  _previousState: StaffActionState,
  formData: FormData,
): Promise<StaffActionState> {
  const auth = await requireOwner();

  if ("error" in auth) {
    return { error: auth.error === "Unauthorized" ? "Přihlaste se znovu." : "Nemáte oprávnění." };
  }

  const parsed = updateStaffSchema.safeParse({
    staffId: getStringValue(formData, "staffId"),
    name: getStringValue(formData, "name"),
    bio: getStringValue(formData, "bio") || undefined,
    color: getStringValue(formData, "color") || "#111827",
    workingDays: formData.getAll("workingDays"),
    startTime: getStringValue(formData, "startTime"),
    endTime: getStringValue(formData, "endTime"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Neplatná úprava zaměstnance." };
  }

  if (!hasSupabaseEnv()) {
    return { success: "Demo režim: zaměstnanec by se tady upravil." };
  }

  let existingStaff: Awaited<ReturnType<typeof findMatchingStaff>>;

  try {
    existingStaff = await findMatchingStaff(auth.supabase, auth.tenantId, parsed.data.name);
  } catch {
    return { error: "Existujícího zaměstnance se nepodařilo ověřit." };
  }

  if (existingStaff && existingStaff.id !== parsed.data.staffId) {
    return { error: "Jiný zaměstnanec už používá toto jméno." };
  }

  const bookingConflict = await getStaffHoursBookingConflict(auth, {
    endTime: parsed.data.endTime,
    staffId: parsed.data.staffId,
    startTime: parsed.data.startTime,
    workingDays: parsed.data.workingDays,
  });

  if (bookingConflict) {
    return { error: bookingConflict };
  }

  const { data: updatedStaff, error } = await auth.supabase
    .from("staff")
    .update({
      name: parsed.data.name,
      bio: parsed.data.bio || null,
      color: parsed.data.color,
    })
    .eq("tenant_id", auth.tenantId)
    .eq("id", parsed.data.staffId)
    .eq("is_active", true)
    .is("deleted_at", null)
    .select("id")
    .maybeSingle();

  if (error) {
    return { error: "Zaměstnance se nepodařilo upravit." };
  }

  if (!updatedStaff) {
    return { error: "Zaměstnanec už není dostupný." };
  }

  const { error: hoursError } = await auth.supabase.from("staff_hours").upsert(
    parsed.data.workingDays.map((day) => ({
      tenant_id: auth.tenantId,
      staff_id: parsed.data.staffId,
      day_of_week: day,
      start_time: parsed.data.startTime,
      end_time: parsed.data.endTime,
      is_working: true,
    })),
    { onConflict: "staff_id,day_of_week" },
  );

  if (hoursError) {
    return { error: "Zaměstnanec se upravil, ale pracovní dobu se nepodařilo uložit." };
  }

  const { error: deleteHoursError } = await auth.supabase
    .from("staff_hours")
    .delete()
    .eq("tenant_id", auth.tenantId)
    .eq("staff_id", parsed.data.staffId)
    .not("day_of_week", "in", `(${parsed.data.workingDays.join(",")})`);

  if (deleteHoursError) {
    return { error: "Zaměstnanec se upravil, ale starou pracovní dobu se nepodařilo odstranit." };
  }

  ignoreRevalidateError(() => {
    revalidatePath("/staff");
  });

  return { success: "Zaměstnanec byl upraven." };
}

export async function updateStaffColorAction(formData: FormData): Promise<void> {
  const auth = await requireOwner();

  if ("error" in auth) {
    return;
  }

  const parsed = updateStaffColorSchema.safeParse({
    color: getStringValue(formData, "color"),
    staffId: getStringValue(formData, "staffId"),
  });

  if (!parsed.success || !hasSupabaseEnv()) {
    return;
  }

  const { error } = await auth.supabase
    .from("staff")
    .update({ color: parsed.data.color })
    .eq("tenant_id", auth.tenantId)
    .eq("id", parsed.data.staffId)
    .eq("is_active", true)
    .is("deleted_at", null);

  if (error) {
    return;
  }

  ignoreRevalidateError(() => {
    revalidatePath("/calendar");
    revalidatePath("/staff");
  });
}
