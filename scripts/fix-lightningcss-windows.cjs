/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");
const path = require("node:path");

if (process.platform !== "win32" || process.arch !== "x64") {
  process.exit(0);
}

const projectRoot = path.join(__dirname, "..");
const source = path.join(
  projectRoot,
  "node_modules",
  "lightningcss-win32-x64-msvc",
  "lightningcss.win32-x64-msvc.node",
);
const target = path.join(
  projectRoot,
  "node_modules",
  "lightningcss",
  "lightningcss.win32-x64-msvc.node",
);

if (!fs.existsSync(source)) {
  console.warn("Windows lightningcss helper was not found.");
  process.exit(0);
}

fs.copyFileSync(source, target);
console.log("Windows lightningcss helper is ready.");
