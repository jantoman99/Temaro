import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createClient } from "@supabase/supabase-js";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const envPath = process.env.ENV_FILE_PATH
  ? path.resolve(process.env.ENV_FILE_PATH)
  : path.join(rootDir, ".env.local");

function normalizeEnvValue(value = "") {
  return value.trim().replace(/^['"]|['"]$/g, "").trim();
}

function readLocalEnv() {
  if (!fs.existsSync(envPath)) {
    return {};
  }

  return Object.fromEntries(
    fs
      .readFileSync(envPath, "utf8")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const separatorIndex = line.indexOf("=");
        const key = line.slice(0, separatorIndex).trim();
        const value = normalizeEnvValue(line.slice(separatorIndex + 1));

        return [key, value];
      }),
  );
}

const localEnv = readLocalEnv();
const getValue = (key) => normalizeEnvValue(process.env[key]) || localEnv[key] || "";
const supabaseUrl = getValue("NEXT_PUBLIC_SUPABASE_URL");
const serviceRoleKey = getValue("SUPABASE_SERVICE_ROLE_KEY");

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Chybi NEXT_PUBLIC_SUPABASE_URL nebo SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const checks = [
  {
    description: "sluzby maji nastaveni zaloh",
    hint: "Aplikuj supabase/migrations/20260503113000_add_service_deposit_policy.sql.",
    name: "service_deposit_policy",
    query: () => supabase.from("services").select("id, deposit_type, deposit_value").limit(1),
  },
  {
    description: "existuje tenant izolovana evidence plateb",
    hint: "Aplikuj supabase/migrations/20260503115000_create_booking_payments.sql.",
    name: "booking_payments",
    query: () => supabase.from("booking_payments").select("id, tenant_id, booking_id, amount, method").limit(1),
  },
  {
    description: "existuji hashovane tokeny pro iCal feed",
    hint: "Aplikuj supabase/migrations/20260503123000_create_calendar_feed_tokens.sql.",
    name: "calendar_feed_tokens",
    query: () => supabase.from("calendar_feed_tokens").select("id, tenant_id, token_hash, revoked_at").limit(1),
  },
  {
    description: "staff metriky view je dostupna pro presne razeni tymu",
    hint: "Aplikuj supabase/migrations/20260502223000_create_staff_directory_metrics_view.sql.",
    name: "staff_directory_metrics",
    query: () => supabase.from("staff_directory_metrics").select("id, tenant_id, service_count").limit(1),
  },
];

let hasFailure = false;

for (const check of checks) {
  const { error } = await check.query();

  if (error) {
    hasFailure = true;
    console.error(`ERR ${check.name}: ${check.description}`);
    console.error(`- ${check.hint}`);
    continue;
  }

  console.log(`OK  ${check.name}: ${check.description}`);
}

if (hasFailure) {
  console.error("Runtime schema smoke selhal. Vypis neobsahuje zadne citlive env hodnoty.");
  process.exit(1);
}

console.log("Runtime schema smoke prosel.");
