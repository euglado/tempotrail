import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

process.chdir(fileURLToPath(new URL("..", import.meta.url)));
function run(executable, args, shell = false) {
  const result = spawnSync(executable, args, { stdio: "inherit", shell });
  if (result.error || result.status !== 0) throw Error("Step failed");
}
function npm(args) {
  // Arguments are fixed below, never user input; Windows needs npm.cmd dispatch.
  run(
    process.platform === "win32" ? "npm.cmd" : "npm",
    args,
    process.platform === "win32",
  );
}
try {
  if (Number(process.versions.node.split(".")[0]) !== 24)
    throw Error("Node 24 required");
  const mode = process.argv[2];
  if (mode === "setup") {
    npm(["ci", "--ignore-scripts"]);
    npm(["run", "build"]);
    run(process.execPath, ["scripts/setup.mjs"]);
    run(process.execPath, ["dist/register.js"]);
    console.log(
      "Ready. Use start.cmd / start.sh to keep the bot running. / Hazır; start dosyasını çalıştırın.",
    );
  } else if (mode === "start" && existsSync("dist/main.js")) {
    run(process.execPath, ["dist/main.js"]);
  } else if (mode === "register" && existsSync("dist/register.js")) {
    run(process.execPath, ["dist/register.js"]);
  } else throw Error("Run setup first");
} catch {
  console.error(
    "Step stopped. Install Node.js 24 and run setup first; see README troubleshooting. / Node.js 24 kurun, önce setup çalıştırın; README sorun giderme bölümüne bakın.",
  );
  process.exitCode = 1;
}
