"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { hasSupabaseAdminEnv, hasSupabaseEnv } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const customerProfileSchema = z.object({
  fullName: z.string().trim().min(1, "Jméno je povinné.").max(120, "Jméno je příliš dlouhé."),
  phone: z
    .string()
    .trim()
    .max(30, "Telefon je příliš dlouhý.")
    .transform((value) => value || null),
});

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

function getProfileRedirect(status: "error" | "success" | "validation") {
  return `/account/profile?status=${status}`;
}

export async function updateCustomerProfileAction(formData: FormData) {
  const parsed = customerProfileSchema.safeParse({
    fullName: getStringValue(formData, "fullName"),
    phone: getStringValue(formData, "phone"),
  });

  if (!parsed.success) {
    redirect(getProfileRedirect("validation"));
  }

  if (!hasSupabaseEnv() || !hasSupabaseAdminEnv()) {
    redirect(getProfileRedirect("error"));
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/account/login");
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("clients")
    .update({
      full_name: parsed.data.fullName,
      phone: parsed.data.phone,
    })
    .ilike("email", user.email.trim().toLowerCase())
    .is("deleted_at", null);

  if (error) {
    redirect(getProfileRedirect("error"));
  }

  revalidatePath("/account");
  revalidatePath("/account/profile");
  redirect(getProfileRedirect("success"));
}
