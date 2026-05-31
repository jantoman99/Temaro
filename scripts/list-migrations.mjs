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

const migrations = fs
  .readdirSync(migrationsDir)
  .filter((file) => file.endsWith(".sql"))
  .sort((first, second) => first.localeCompare(second));

if (migrations.length === 0) {
  console.error("Nebyla nalezena zadna SQL migrace.");
  process.exit(1);
}

console.log("Migrace aplikuj v tomto poradi:");
for (const migration of migrations) {
  console.log(`- ${displayMigrationsDir}/${migration}`);
}
