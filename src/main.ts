import { Client, Events, GatewayIntentBits, Options } from "discord.js";
import { readConfig } from "./config.js";
import { makeHandler } from "./handler.js";
import { Store } from "./store.js";

async function main() {
  const config = readConfig();
  const client = new Client({
    intents: [GatewayIntentBits.Guilds],
    makeCache: Options.cacheWithLimits({
      ...Options.DefaultMakeCacheSettings,
      MessageManager: 0,
      UserManager: 0,
      GuildMemberManager: 0,
    }),
    allowedMentions: { parse: [], repliedUser: false },
    rest: { timeout: 10_000, retries: 0 },
  });
  const store = new Store();
  const timer = setInterval(() => store.prune(), 30_000);
  timer.unref();
  const stop = () => {
    clearInterval(timer);
    store.clear();
    client.destroy();
  };
  process.once("SIGINT", stop);
  process.once("SIGTERM", stop);
  client.once(Events.ClientReady, () => {
    if (client.user?.id !== config.application) {
      console.error("Application ID does not match the bot. Run setup again.");
      stop();
      process.exitCode = 1;
      return;
    }
    console.log(
      "TempoTrail connected. Use /tempotrail in the configured server. / Bot bağlı.",
    );
  });
  client.on(Events.Error, () =>
    console.error(
      "Discord connection error. Check permissions and connection. / Bağlantıyı ve izinleri kontrol edin.",
    ),
  );
  client.on(
    Events.InteractionCreate,
    makeHandler(config.guild, config.application, store),
  );
  try {
    await client.login(config.token);
  } catch {
    stop();
    throw Error("Connection failed");
  }
}
main().catch(() => {
  console.error(
    "TempoTrail could not start. Run setup and check the token, IDs and network. / Kurulumu, tokenı, kimlikleri ve ağı kontrol edin.",
  );
  process.exitCode = 1;
});
