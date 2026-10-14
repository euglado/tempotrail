import { readFileSync } from "node:fs";
import { parseEnv } from "node:util";

export function readConfig(
  env: NodeJS.ProcessEnv = process.env,
  file = ".env",
) {
  let disk: Record<string, string | undefined> = {};
  try {
    disk = parseEnv(readFileSync(file, "utf8"));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT")
      throw Error("Setup required");
  }
  const get = (key: string) => env[key] ?? disk[key] ?? "";
  const token = get("DISCORD_TOKEN");
  const application = get("DISCORD_APPLICATION_ID");
  const guild = get("DISCORD_GUILD_ID");
  if (
    !/^[A-Za-z0-9._-]{20,200}$/.test(token) ||
    !/^\d{17,20}$/.test(application) ||
    !/^\d{17,20}$/.test(guild)
  )
    throw Error("Setup required");
  return { token, application, guild };
}
