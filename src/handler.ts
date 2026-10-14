import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  type Interaction,
  MessageFlags,
  PermissionFlagsBits,
} from "discord.js";
import {
  createPlan,
  InputError,
  type Language,
  renderPlan,
  words,
} from "./plan.js";
import type { Store } from "./store.js";

const mentions = { parse: [] as never[], repliedUser: false };
const permissions = [
  PermissionFlagsBits.ViewChannel,
  PermissionFlagsBits.SendMessages,
];

export function makeHandler(
  guildId: string,
  applicationId: string,
  store: Store,
) {
  return async (i: Interaction): Promise<void> => {
    if (!i.isChatInputCommand() && !i.isButton()) return;
    if (i.isChatInputCommand() && i.commandName !== "tempotrail") return;
    if (i.isButton() && !i.customId.startsWith("tt:")) return;
    let language: Language = i.locale.startsWith("tr") ? "tr" : "en";
    const say = async (content: string) => {
      await i.reply({
        content,
        flags: MessageFlags.Ephemeral,
        allowedMentions: mentions,
      });
    };
    try {
      if (
        i.applicationId !== applicationId ||
        i.guildId !== guildId ||
        !i.inGuild() ||
        !i.channel ||
        ![ChannelType.GuildText, ChannelType.GuildAnnouncement].includes(
          i.channel.type,
        )
      ) {
        await say(words[language].context);
        return;
      }
      const binding = {
        owner: i.user.id,
        guild: guildId,
        channel: i.channelId,
      };
      if (i.isChatInputCommand()) {
        const chosen = i.options.getString("language");
        if (chosen !== null && chosen !== "en" && chosen !== "tr") {
          await say(words[language].invalid);
          return;
        }
        language = chosen ?? language;
        const plan = createPlan({
          start: i.options.getInteger("start", true),
          target: i.options.getInteger("target", true),
          levels: i.options.getInteger("levels") ?? 5,
          bars: i.options.getInteger("bars") ?? 4,
          beats: i.options.getInteger("beats") ?? 4,
        });
        const key = store.create(binding, plan, language);
        if (!key) {
          await say(words[language].busy);
          return;
        }
        try {
          await i.deferReply({ flags: MessageFlags.Ephemeral });
          const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
              .setCustomId(`tt:share:${key}`)
              .setLabel(words[language].share)
              .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
              .setCustomId(`tt:discard:${key}`)
              .setLabel(words[language].discard)
              .setStyle(ButtonStyle.Secondary),
          );
          const reply = await i.editReply({
            content: `${renderPlan(plan, language)}\n\n${words[language].preview}`,
            components: [row],
            allowedMentions: mentions,
          });
          if (!store.bind(key, reply.id)) {
            await i.editReply({
              content: words[language].unavailable,
              components: [],
              allowedMentions: mentions,
            });
          }
        } catch {
          store.drafts.delete(key);
          throw Error("Preview failed");
        }
        return;
      }
      if (!i.isButton()) return;
      const match = /^tt:(share|discard):([a-f0-9]{36})$/.exec(i.customId);
      if (
        !match ||
        !i.message.flags.has(MessageFlags.Ephemeral) ||
        i.message.author.id !== i.client.user?.id ||
        i.message.webhookId !== applicationId
      ) {
        await say(words[language].unavailable);
        return;
      }
      const draft = store.take(match[2] ?? "", binding, i.message.id);
      if (!draft) {
        await say(words[language].unavailable);
        return;
      }
      language = draft.language;
      // Consume synchronously before any await so parallel clicks cannot publish twice.
      await i.deferUpdate();
      if (match[1] === "discard") {
        await i.editReply({
          content: words[language].discarded,
          components: [],
          allowedMentions: mentions,
        });
        return;
      }
      if (!store.reserveChannel(i.channelId)) {
        await i.editReply({
          content: words[language].busy,
          components: [],
          allowedMentions: mentions,
        });
        return;
      }
      const guild = i.guild;
      if (!guild) throw Error("Guild unavailable");
      const channel = await guild.channels.fetch(i.channelId, {
        force: true,
        cache: false,
      });
      const member = await guild.members.fetch({
        user: i.user.id,
        force: true,
        cache: false,
      });
      const bot = await guild.members.fetchMe({ force: true, cache: false });
      if (
        !channel ||
        channel.guildId !== guildId ||
        (channel.type !== ChannelType.GuildText &&
          channel.type !== ChannelType.GuildAnnouncement) ||
        !channel.permissionsFor(member)?.has(permissions) ||
        !channel.permissionsFor(bot)?.has(permissions)
      ) {
        await i.editReply({
          content: words[language].denied,
          components: [],
          allowedMentions: mentions,
        });
        return;
      }
      await channel.send({
        content: renderPlan(draft.plan, language),
        allowedMentions: mentions,
      });
      await i.editReply({
        content: words[language].shared,
        components: [],
        allowedMentions: mentions,
      });
    } catch (error) {
      const content =
        error instanceof InputError
          ? words[language].invalid
          : words[language].failed;
      try {
        if (i.deferred || i.replied)
          await i.editReply({
            content,
            components: [],
            allowedMentions: mentions,
          });
        else await say(content);
      } catch {
        /* Do not log interaction tokens or raw SDK errors. */
      }
    }
  };
}
