import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const migrationsDir = process.env.MIGRATIONS_DIR
  ? path.resolve(process.env.MIGRATIONS_DIR)
  : path.join(rootDir, "supabase", "migrations");
const displayMigrationsDir = process.env.MIGRATIONS_DIR
  ? migrationsDir
  : "supabase/migrations";

if (!fs.existsSync(migrationsDir)) {
  console.error(`Slozka ${displayMigrationsDir} neexistuje.`);
  process.exit(1);
}

const migrationFiles = fs
  .readdirSync(migrationsDir)
  .filter((file) => file.endsWith(".sql"))
  .sort((first, second) => first.localeCompare(second));

const issues = [];
const seenTimestamps = new Set();

if (migrationFiles.length === 0) {
  issues.push("Nebyla nalezena zadna SQL migrace.");
}

for (const file of migrationFiles) {
  const content = fs.readFileSync(path.join(migrationsDir, file), "utf8");
  const timestamp = file.slice(0, 14);

  if (!/^\d{14}_[a-z0-9_]+\.sql$/.test(file)) {
    issues.push(`${file}: nazev migrace musi byt ve formatu YYYYMMDDHHMMSS_popis.sql`);
  }

  if (seenTimestamps.has(timestamp)) {
    issues.push(`${file}: duplicitni timestamp migrace`);
  }

  seenTimestamps.add(timestamp);

  if (!/^\s*begin;/i.test(content)) {
    issues.push(`${file}: migrace by mela zacinat transakci begin;`);
  }

  if (!/commit;\s*$/i.test(content)) {
    issues.push(`${file}: migrace by mela koncit commit;`);
  }

  const functionBlocks = content.match(/create or replace function[\s\S]*?\$\$/gi) ?? [];

  for (const block of functionBlocks) {
    if (/security\s+definer/i.test(block) && !/set\s+search_path\s*=/i.test(block)) {
      issues.push(`${file}: security definer funkce nema set search_path`);
    }
  }

  const normalizedLines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("--"));

  for (let index = 1; index < normalizedLines.length; index += 1) {
    const previous = normalizedLines[index - 1]?.toLowerCase();
    const current = normalizedLines[index]?.toLowerCase();

    if (!previous || previous !== current) {
      continue;
    }

    if (/^if\b.*\bthen\b/.test(current)) {
      issues.push(`${file}: podezrely duplicitni PL/pgSQL if radek: "${normalizedLines[index]}"`);
    }
  }
}

if (issues.length > 0) {
  console.error("Nalezene problemy v migracich:");
  for (const issue of issues) {
    console.error(`- ${issue}`);
  }
  process.exit(1);
}

console.log("Migrace prosly zakladni kontrolou.");
