"use server";

import { revalidatePath } from "next/cache";

import { requireOwner } from "@/lib/auth/require-owner";
import { hasSupabaseEnv } from "@/lib/env";
import {
  analyzeBookingCsv,
  analyzeClientCsv,
  analyzeServiceCsv,
  CSV_IMPORT_MAX_BYTES,
  type ImportEntityType,
  type ImportPreviewRow,
} from "@/lib/import/csv";
import { getSafeTimeZone } from "@/lib/time-zone";

export type ImportActionState = {
  error?: string;
  preview?: ImportPreviewRow[];
  success?: string;
  summary?: {
    duplicateRows: number;
    importedRows: number;
    invalidRows: number;
    validRows: number;
  };
};

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

function getImportType(value: string): ImportEntityType | null {
  return value === "bookings" || value === "clients" || value === "services" ? value : null;
}

async function getCsvText(formData: FormData) {
  const file = formData.get("csvFile");
  const text = getStringValue(formData, "csvText");

  if (file instanceof File && file.size > 0) {
    if (file.size > CSV_IMPORT_MAX_BYTES) {
      return { error: "CSV soubor je příliš velký. Limit je 200 kB." };
    }

    return { text: await file.text() };
  }

  return { text };
}

function summarize(preview: ImportPreviewRow[], importedRows: number) {
  return {
    duplicateRows: preview.filter((row) => row.status === "duplicate").length,
    importedRows,
    invalidRows: preview.filter((row) => row.status === "invalid").length,
    validRows: preview.filter((row) => row.status === "valid").length,
  };
}

function getSuccessMessage(importType: ImportEntityType, importedRows: number, dryRun: boolean) {
  const entityLabel = importType === "clients" ? "klientů" : importType === "services" ? "služeb" : "rezervací";

  return dryRun
    ? `Dry-run hotový. Připraveno k importu: ${importedRows} ${entityLabel}.`
    : `Import hotový. Vytvořeno: ${importedRows} ${entityLabel}.`;
}

export async function importCsvAction(
  _previousState: ImportActionState,
  formData: FormData,
): Promise<ImportActionState> {
  const auth = await requireOwner();

  if ("error" in auth) {
    return { error: auth.error === "Unauthorized" ? "Přihlaste se znovu." : "Nemáte oprávnění." };
  }

  const importType = getImportType(getStringValue(formData, "importType"));
  const dryRun = getStringValue(formData, "dryRun") !== "false";
  const csvText = await getCsvText(formData);

  if (!importType) {
    return { error: "Vyberte typ importu." };
  }

  if ("error" in csvText) {
    return { error: csvText.error };
  }

  if (!csvText.text.trim()) {
    return { error: "Vložte CSV text nebo nahrajte CSV soubor." };
  }

  if (!hasSupabaseEnv()) {
    const analysis = importType === "clients"
      ? analyzeClientCsv(csvText.text)
      : importType === "services"
        ? analyzeServiceCsv(csvText.text)
        : analyzeBookingCsv({ text: csvText.text, timeZone: "Europe/Prague" });

    if (analysis.errors.length > 0) {
      return { error: analysis.errors[0], preview: analysis.preview };
    }

    return {
      preview: analysis.preview,
      success: getSuccessMessage(importType, analysis.rows.length, true),
      summary: summarize(analysis.preview, 0),
    };
  }

  if (importType === "bookings") {
    const [
      { data: tenant, error: tenantError },
      { data: existingClients, error: existingClientsError },
      { data: existingServices, error: existingServicesError },
      { data: existingStaff, error: existingStaffError },
    ] = await Promise.all([
      auth.supabase
        .from("tenants")
        .select("timezone")
        .eq("id", auth.tenantId)
        .is("deleted_at", null)
        .maybeSingle(),
      auth.supabase
        .from("clients")
        .select("id, full_name, email, phone")
        .eq("tenant_id", auth.tenantId)
        .is("deleted_at", null)
        .limit(1000),
      auth.supabase
        .from("services")
        .select("id, name")
        .eq("tenant_id", auth.tenantId)
        .eq("is_active", true)
        .is("deleted_at", null)
        .limit(1000),
      auth.supabase
        .from("staff")
        .select("id, name, staff_services(service_id)")
        .eq("tenant_id", auth.tenantId)
        .eq("is_active", true)
        .is("deleted_at", null)
        .limit(1000),
    ]);

    if (tenantError || !tenant) {
      return { error: "Timezone podniku se nepodařilo ověřit." };
    }

    if (existingClientsError || existingServicesError || existingStaffError) {
      return { error: "Data pro párování rezervací se nepodařilo načíst." };
    }

    const analysis = analyzeBookingCsv({
      existingClients: existingClients ?? [],
      existingServices: existingServices ?? [],
      existingStaff: existingStaff ?? [],
      text: csvText.text,
      timeZone: getSafeTimeZone(tenant.timezone),
    });

    if (analysis.errors.length > 0) {
      return { error: analysis.errors[0], preview: analysis.preview };
    }

    if (dryRun) {
      return {
        preview: analysis.preview,
        success: getSuccessMessage(importType, analysis.rows.length, true),
        summary: summarize(analysis.preview, 0),
      };
    }

    if (analysis.rows.length === 0) {
      return {
        error: "CSV neobsahuje žádné validní nové rezervace.",
        preview: analysis.preview,
        summary: summarize(analysis.preview, 0),
      };
    }

    let importedRows = 0;
    const importPreview = [...analysis.preview];
    const validPreviewRows = importPreview.filter((item) => item.status === "valid");

    for (const [rowIndex, row] of analysis.rows.entries()) {
      const previewRow = validPreviewRows[rowIndex];
      let clientId = row.clientId;

      if (!clientId && row.clientFullName) {
        const { data: createdClient, error: clientError } = await auth.supabase
          .from("clients")
          .insert({
            email: row.clientEmail,
            full_name: row.clientFullName,
            phone: row.clientPhone,
            tenant_id: auth.tenantId,
          })
          .select("id")
          .single();

        if (clientError || !createdClient) {
          if (previewRow) {
            previewRow.status = "invalid";
            previewRow.errors = ["Klienta pro rezervaci se nepodařilo vytvořit."];
          }
          continue;
        }

        clientId = createdClient.id;
      }

      const { data: booking, error: bookingError } = await auth.supabase.rpc("create_booking", {
        p_client_id: clientId,
        p_notes: row.notes ?? null,
        p_service_id: row.serviceId,
        p_source: "manual",
        p_staff_id: row.staffId,
        p_starts_at: row.startsAt,
        p_tenant_id: auth.tenantId,
      });

      if (bookingError || !booking) {
        if (previewRow) {
          previewRow.status = "invalid";
          previewRow.errors = ["Rezervaci se nepodařilo vytvořit. Termín může být obsazený."];
        }
        continue;
      }

      importedRows += 1;
    }

    revalidatePath("/calendar");
    revalidatePath("/import");

    return {
      preview: importPreview,
      success: getSuccessMessage(importType, importedRows, false),
      summary: summarize(importPreview, importedRows),
    };
  }

  if (importType === "clients") {
    const { data: existingClients, error: existingClientsError } = await auth.supabase
      .from("clients")
      .select("email, phone")
      .eq("tenant_id", auth.tenantId)
      .is("deleted_at", null)
      .limit(1000);

    if (existingClientsError) {
      return { error: "Existující klienty se nepodařilo ověřit." };
    }

    const analysis = analyzeClientCsv(csvText.text, existingClients ?? []);

    if (analysis.errors.length > 0) {
      return { error: analysis.errors[0], preview: analysis.preview };
    }

    if (dryRun) {
      return {
        preview: analysis.preview,
        success: getSuccessMessage(importType, analysis.rows.length, true),
        summary: summarize(analysis.preview, 0),
      };
    }

    if (analysis.rows.length === 0) {
      return {
        error: "CSV neobsahuje žádné validní nové klienty.",
        preview: analysis.preview,
        summary: summarize(analysis.preview, 0),
      };
    }

    const { error } = await auth.supabase.from("clients").insert(
      analysis.rows.map((row) => ({
        email: row.email || null,
        full_name: row.fullName,
        notes: row.notes || null,
        phone: row.phone || null,
        preferred_staff_id: null,
        tenant_id: auth.tenantId,
      })),
    );

    if (error) {
      return { error: "Klienty se nepodařilo importovat.", preview: analysis.preview };
    }

    revalidatePath("/clients");
    revalidatePath("/import");

    return {
      preview: analysis.preview,
      success: getSuccessMessage(importType, analysis.rows.length, false),
      summary: summarize(analysis.preview, analysis.rows.length),
    };
  }

  const { data: existingServices, error: existingServicesError } = await auth.supabase
    .from("services")
    .select("name")
    .eq("tenant_id", auth.tenantId)
    .is("deleted_at", null)
    .limit(1000);

  if (existingServicesError) {
    return { error: "Existující služby se nepodařilo ověřit." };
  }

  const analysis = analyzeServiceCsv(csvText.text, existingServices ?? []);

  if (analysis.errors.length > 0) {
    return { error: analysis.errors[0], preview: analysis.preview };
  }

  if (dryRun) {
    return {
      preview: analysis.preview,
      success: getSuccessMessage(importType, analysis.rows.length, true),
      summary: summarize(analysis.preview, 0),
    };
  }

  if (analysis.rows.length === 0) {
    return {
      error: "CSV neobsahuje žádné validní nové služby.",
      preview: analysis.preview,
      summary: summarize(analysis.preview, 0),
    };
  }

  const { error } = await auth.supabase.from("services").insert(
    analysis.rows.map((row) => ({
      buffer_minutes: row.bufferMinutes,
      currency: row.currency,
      deposit_type: row.depositType,
      deposit_value: row.depositValue,
      description: row.description || null,
      duration_minutes: row.durationMinutes,
      name: row.name,
      price: row.price,
      tenant_id: auth.tenantId,
    })),
  );

  if (error) {
    return { error: "Služby se nepodařilo importovat.", preview: analysis.preview };
  }

  revalidatePath("/services");
  revalidatePath("/import");

  return {
    preview: analysis.preview,
    success: getSuccessMessage(importType, analysis.rows.length, false),
    summary: summarize(analysis.preview, analysis.rows.length),
  };
}
