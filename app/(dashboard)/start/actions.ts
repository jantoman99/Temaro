"use server";

import { revalidatePath } from "next/cache";

import { requireOwner } from "@/lib/auth/require-owner";
import { hasSupabaseEnv } from "@/lib/env";
import { tenantIndustrySchema } from "@/lib/validations/settings";

type OnboardingIndustryActionState = {
  error?: string;
  success?: string;
};

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

function ignoreRevalidateError(action: () => void) {
  try {
    action();
  } catch {
    // Obor je ulozeny; chyba obnoveni cache nesmi vratit falesny neuspech.
  }
}

export async function updateOnboardingIndustryAction(
  _previousState: OnboardingIndustryActionState,
  formData: FormData,
): Promise<OnboardingIndustryActionState> {
  const auth = await requireOwner();

  if ("error" in auth) {
    return { error: auth.error === "Unauthorized" ? "Přihlaste se znovu." : "Nemáte oprávnění." };
  }

  if (!hasSupabaseEnv()) {
    return { success: "Demo režim: obor by se tady uložil do databáze." };
  }

  const parsed = tenantIndustrySchema.safeParse(getStringValue(formData, "industry"));

  if (!parsed.success) {
    return { error: "Vyberte platný obor podniku." };
  }

  const { data: updatedTenant, error } = await auth.supabase
    .from("tenants")
    .update({ industry: parsed.data })
    .eq("id", auth.tenantId)
    .is("deleted_at", null)
    .select("id")
    .maybeSingle();

  if (error || !updatedTenant) {
    return { error: "Obor se nepodařilo uložit." };
  }

  ignoreRevalidateError(() => {
    revalidatePath("/start");
    revalidatePath("/services");
    revalidatePath("/settings");
    revalidatePath("/podniky");
  });

  return { success: "Obor byl uložen. Šablony služeb jsou připravené podle vybraného segmentu." };
}
