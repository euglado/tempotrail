import { REST, Routes } from "discord.js";
import { command } from "./command.js";
import { readConfig } from "./config.js";

async function register() {
  const config = readConfig();
  const rest = new REST({
    version: "10",
    timeout: 10_000,
    retries: 0,
  }).setToken(config.token);
  // POST upserts only this named command; never bulk overwrite unrelated commands.
  await rest.post(
    Routes.applicationGuildCommands(config.application, config.guild),
    { body: command.toJSON() },
  );
  console.log(
    "/tempotrail registered in your server. / Komut sunucunuza kaydedildi.",
  );
}
register().catch(() => {
  console.error(
    "Command registration failed. Run setup; check bot membership, application/server IDs and network. / Kurulum ve sunucu kimliklerini kontrol edin.",
  );
  process.exitCode = 1;
});
