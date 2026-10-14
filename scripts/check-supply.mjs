import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const allowed = new Set([
  "MIT",
  "Apache-2.0",
  "BSD-3-Clause",
  "BSD-2-Clause",
  "ISC",
  "0BSD",
  "MIT OR Apache-2.0",
  "(MIT OR Apache-2.0)",
]);
const lock = JSON.parse(readFileSync("package-lock.json", "utf8"));
let dependencies = 0;
for (const [path, pkg] of Object.entries(lock.packages)) {
  if (path === "") continue;
  const resolved = new URL(pkg.resolved);
  if (
    resolved.protocol !== "https:" ||
    resolved.hostname !== "registry.npmjs.org" ||
    resolved.username ||
    resolved.password ||
    !/^sha512-[A-Za-z0-9+/]+={0,2}$/.test(pkg.integrity) ||
    !allowed.has(pkg.license) ||
    pkg.hasInstallScript
  )
    throw Error(`Unapproved dependency record: ${path}`);
  dependencies++;
}
let sources = 0;
function scan(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if ([".git", "node_modules", "dist", "coverage"].includes(entry.name))
      continue;
    const path = join(dir, entry.name);
    if (entry.isSymbolicLink()) throw Error("Symlinks are not expected");
    if (entry.isDirectory()) {
      scan(path);
      continue;
    }
    if (entry.name.startsWith(".env") && entry.name !== ".env.example")
      throw Error("Local credentials must be absent during checks");
    const text = readFileSync(path, "utf8");
    const patterns = [
      /(?:mfa\.[A-Za-z0-9_-]{40,}|[A-Za-z0-9_-]{23,30}\.[A-Za-z0-9_-]{6}\.[A-Za-z0-9_-]{25,110})/,
      /gh[pousr]_[A-Za-z0-9]{30,}/,
      /github_pat_[A-Za-z0-9_]{40,}/,
      /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
      /^DISCORD_TOKEN[ \t]*=[ \t]*[^\s\r\n]+/m,
    ];
    if (patterns.some((pattern) => pattern.test(text)))
      throw Error(`Credential pattern found in ${path}`);
    sources++;
  }
}
scan(".");
console.log(
  `Supply check passed: ${dependencies} dependency license/registry/SHA-512/no-install-script records; ${sources} source credential-pattern scans.`,
);
