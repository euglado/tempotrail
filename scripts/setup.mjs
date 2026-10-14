import { existsSync, writeFileSync } from "node:fs";
import { emitKeypressEvents } from "node:readline";
import { createInterface } from "node:readline/promises";

async function hiddenToken() {
  process.stdout.write("Bot token (hidden / gizli): ");
  emitKeypressEvents(process.stdin);
  process.stdin.setRawMode(true);
  process.stdin.resume();
  try {
    return await new Promise((resolve, reject) => {
      let text = "";
      const onKey = (value, key) => {
        if (key?.ctrl && key.name === "c") {
          process.stdin.off("keypress", onKey);
          reject(Error("Cancelled"));
        } else if (key?.name === "return" || key?.name === "enter") {
          process.stdin.off("keypress", onKey);
          resolve(text);
        } else if (key?.name === "backspace") text = text.slice(0, -1);
        else if (
          value &&
          /^[A-Za-z0-9._-]+$/.test(value) &&
          text.length + value.length <= 200
        )
          text += value;
      };
      process.stdin.on("keypress", onKey);
    });
  } finally {
    process.stdin.setRawMode(false);
    process.stdin.pause();
    process.stdout.write("\n");
  }
}

async function main() {
  if (!process.stdin.isTTY || !process.stdout.isTTY)
    throw Error("Interactive terminal required");
  if (existsSync(".env")) throw Error("Existing configuration");
  console.log(
    "TempoTrail setup / kurulum. Never share the token. Tokenı kimseyle paylaşmayın.",
  );
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  let application;
  let guild;
  try {
    application = (
      await rl.question("Application ID / Uygulama kimliği: ")
    ).trim();
    guild = (await rl.question("Server ID / Sunucu kimliği: ")).trim();
  } finally {
    rl.close();
  }
  if (!/^\d{17,20}$/.test(application) || !/^\d{17,20}$/.test(guild))
    throw Error("Invalid IDs");
  const token = await hiddenToken();
  if (!/^[A-Za-z0-9._-]{20,200}$/.test(token))
    throw Error("Invalid token shape");
  writeFileSync(
    ".env",
    `DISCORD_TOKEN=${token}\nDISCORD_APPLICATION_ID=${application}\nDISCORD_GUILD_ID=${guild}\n`,
    { flag: "wx", mode: 0o600 },
  );
  const invite = new URL("https://discord.com/oauth2/authorize");
  invite.search = new URLSearchParams({
    client_id: application,
    scope: "bot applications.commands",
    permissions: "3072",
    guild_id: guild,
    disable_guild_select: "true",
  }).toString();
  console.log(
    "Configuration saved locally. On Windows, keep your user folder private. / Ayarlar yerel kaydedildi; Windows klasör erişimini sınırlandırın.",
  );
  console.log(
    `Open this link to install the bot, then continue: / Botu kurmak için bağlantıyı açın:\n${invite}`,
  );
  const finish = createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  try {
    await finish.question(
      "After installing, press Enter / Kurulumdan sonra Enter: ",
    );
  } finally {
    finish.close();
  }
}
main().catch(() => {
  console.error(
    "Setup stopped. Use an interactive terminal, valid IDs and token. Existing .env is never overwritten; to change it, securely remove it first. / Kurulum durdu. Etkileşimli terminal ve geçerli kimlikler kullanın; .env üzerine yazılmaz.",
  );
  process.exitCode = 1;
});
