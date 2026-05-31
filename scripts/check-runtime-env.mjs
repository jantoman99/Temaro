import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const envPath = process.env.ENV_FILE_PATH
  ? path.resolve(process.env.ENV_FILE_PATH)
  : path.join(rootDir, ".env.local");

const requiredKeys = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_APP_URL",
];

const optionalRuntimeKeys = [
  "RESEND_API_KEY",
  "RESEND_FROM_EMAIL",
  "SMS_REMINDERS_ENABLED",
  "SMS_WEBHOOK_SECRET",
  "SMS_WEBHOOK_URL",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
  "CRON_SECRET",
];

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
const missingRequired = requiredKeys.filter((key) => !getValue(key));
const missingOptional = optionalRuntimeKeys.filter((key) => !getValue(key));
const invalidValues = [];

function isValidHttpUrl(value) {
  try {
    const url = new URL(value);

    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

if (getValue("NEXT_PUBLIC_SUPABASE_URL") && !isValidHttpUrl(getValue("NEXT_PUBLIC_SUPABASE_URL"))) {
  invalidValues.push("NEXT_PUBLIC_SUPABASE_URL musi byt platna http/https URL.");
}

if (getValue("NEXT_PUBLIC_APP_URL") && !isValidHttpUrl(getValue("NEXT_PUBLIC_APP_URL"))) {
  invalidValues.push("NEXT_PUBLIC_APP_URL musi byt platna http/https URL.");
}

if (getValue("UPSTASH_REDIS_REST_URL") && !isValidHttpUrl(getValue("UPSTASH_REDIS_REST_URL"))) {
  invalidValues.push("UPSTASH_REDIS_REST_URL musi byt platna http/https URL.");
}

if (getValue("SMS_WEBHOOK_URL") && !isValidHttpUrl(getValue("SMS_WEBHOOK_URL"))) {
  invalidValues.push("SMS_WEBHOOK_URL musi byt platna http/https URL.");
}

if (getValue("SMS_REMINDERS_ENABLED") && !["true", "false"].includes(getValue("SMS_REMINDERS_ENABLED"))) {
  invalidValues.push("SMS_REMINDERS_ENABLED musi byt bud true nebo false.");
}

if (getValue("SMS_REMINDERS_ENABLED") === "true" && !getValue("SMS_WEBHOOK_URL")) {
  invalidValues.push("SMS_WEBHOOK_URL musi byt vyplnena, kdyz je SMS_REMINDERS_ENABLED=true.");
}

if (getValue("RESEND_FROM_EMAIL") && !isValidEmail(getValue("RESEND_FROM_EMAIL"))) {
  invalidValues.push("RESEND_FROM_EMAIL musi byt platny email.");
}

if (getValue("RESEND_API_KEY") && !getValue("RESEND_FROM_EMAIL")) {
  invalidValues.push("RESEND_FROM_EMAIL musi byt vyplneny, kdyz je vyplneny RESEND_API_KEY.");
}

if (getValue("RESEND_FROM_EMAIL") && !getValue("RESEND_API_KEY")) {
  invalidValues.push("RESEND_API_KEY musi byt vyplneny, kdyz je vyplneny RESEND_FROM_EMAIL.");
}

if (getValue("UPSTASH_REDIS_REST_URL") && !getValue("UPSTASH_REDIS_REST_TOKEN")) {
  invalidValues.push(
    "UPSTASH_REDIS_REST_TOKEN musi byt vyplneny, kdyz je vyplneny UPSTASH_REDIS_REST_URL.",
  );
}

if (getValue("UPSTASH_REDIS_REST_TOKEN") && !getValue("UPSTASH_REDIS_REST_URL")) {
  invalidValues.push(
    "UPSTASH_REDIS_REST_URL musi byt vyplnena, kdyz je vyplneny UPSTASH_REDIS_REST_TOKEN.",
  );
}

if (getValue("CRON_SECRET") && getValue("CRON_SECRET").length < 24) {
  invalidValues.push("CRON_SECRET musi mit alespon 24 znaku.");
}

if (getValue("CRON_SECRET") && /\s/.test(getValue("CRON_SECRET"))) {
  invalidValues.push("CRON_SECRET nesmi obsahovat mezery ani jine whitespace znaky.");
}

if (getValue("STRIPE_SECRET_KEY") && !getValue("STRIPE_SECRET_KEY").startsWith("sk_")) {
  invalidValues.push("STRIPE_SECRET_KEY musi zacinat na sk_.");
}

if (getValue("STRIPE_WEBHOOK_SECRET") && !getValue("STRIPE_WEBHOOK_SECRET").startsWith("whsec_")) {
  invalidValues.push("STRIPE_WEBHOOK_SECRET musi zacinat na whsec_.");
}

if (getValue("STRIPE_SECRET_KEY") && !getValue("STRIPE_WEBHOOK_SECRET")) {
  invalidValues.push("STRIPE_WEBHOOK_SECRET musi byt vyplneny, kdyz je vyplneny STRIPE_SECRET_KEY.");
}

if (getValue("STRIPE_WEBHOOK_SECRET") && !getValue("STRIPE_SECRET_KEY")) {
  invalidValues.push("STRIPE_SECRET_KEY musi byt vyplneny, kdyz je vyplneny STRIPE_WEBHOOK_SECRET.");
}

if (missingRequired.length > 0) {
  console.error("Chybi povinne env promenne pro realny beh:");
  for (const key of missingRequired) {
    console.error(`- ${key}`);
  }
  process.exitCode = 1;
} else {
  console.log("Povinne env promenne pro realny beh jsou vyplnene.");
}

if (invalidValues.length > 0) {
  console.error("Nektere env promenne maji neplatny format:");
  for (const issue of invalidValues) {
    console.error(`- ${issue}`);
  }
  process.exitCode = 1;
}

if (missingOptional.length > 0) {
  console.log("Volitelne runtime env promenne zatim nejsou vyplnene:");
  for (const key of missingOptional) {
    console.log(`- ${key}`);
  }
  console.log("Bez nich muzou byt vypnute emaily, rate limit nebo cron.");
} else {
  console.log("Volitelne runtime env promenne jsou vyplnene.");
}
