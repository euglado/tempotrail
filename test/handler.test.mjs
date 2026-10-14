import assert from "node:assert/strict";
import test from "node:test";
import { ChannelType, MessageFlags } from "discord.js";
import { makeHandler } from "../dist/handler.js";
import { Store } from "../dist/store.js";

const app = "11111111111111111";
const guildId = "22222222222222222";
function fixture() {
  let now = 0;
  const store = new Store(() => now);
  const sent = [];
  const fetches = [];
  const state = {
    allowed: true,
    channelType: ChannelType.GuildText,
    fail: false,
  };
  const channel = {
    guildId,
    get type() {
      return state.channelType;
    },
    permissionsFor() {
      return {
        has() {
          return state.allowed;
        },
      };
    },
    async send(payload) {
      sent.push(payload);
      if (state.fail) throw Error("private SDK details");
      return { id: "public" };
    },
  };
  const guild = {
    channels: {
      async fetch(id, options) {
        fetches.push({ kind: "channel", id, options });
        return channel;
      },
    },
    members: {
      async fetch(options) {
        fetches.push({ kind: "member", options });
        return {};
      },
      async fetchMe(options) {
        fetches.push({ kind: "bot", options });
        return {};
      },
    },
  };
  function interaction(button = null, owner = "user") {
    const replies = [];
    const edits = [];
    const options = {
      start: 60,
      target: 80,
      levels: null,
      bars: null,
      beats: null,
      language: null,
    };
    return {
      replies,
      edits,
      values: options,
      commandName: "tempotrail",
      customId: button,
      applicationId: app,
      guildId,
      guild,
      channelId: "channel",
      channel: { type: ChannelType.GuildText },
      user: { id: owner },
      client: { user: { id: app } },
      locale: "en-US",
      deferred: false,
      replied: false,
      message: {
        id: "preview",
        flags: { has: (flag) => flag === MessageFlags.Ephemeral },
        author: { id: app },
        webhookId: app,
      },
      options: {
        getInteger: (name) => options[name],
        getString: (name) => options[name],
      },
      isChatInputCommand: () => button === null,
      isButton: () => button !== null,
      inGuild: () => true,
      async reply(payload) {
        this.replied = true;
        replies.push(payload);
      },
      async deferReply(payload) {
        this.deferred = true;
        replies.push(payload);
      },
      async editReply(payload) {
        edits.push(payload);
        return { id: "preview" };
      },
      async deferUpdate() {
        this.deferred = true;
      },
    };
  }
  const handle = makeHandler(guildId, app, store);
  async function preview() {
    const i = interaction();
    await handle(i);
    const id = i.edits[0].components[0].components[0].data.custom_id;
    return { i, id };
  }
  return {
    store,
    sent,
    fetches,
    state,
    interaction,
    handle,
    preview,
    advance: (ms) => {
      now += ms;
    },
  };
}
test("command creates only private preview with two explicit buttons", async () => {
  const f = fixture();
  const { i } = await f.preview();
  assert.equal(i.replies[0].flags, MessageFlags.Ephemeral);
  assert.equal(i.edits[0].components[0].components.length, 2);
  assert.match(i.edits[0].content, /60 BPM/);
  assert.deepEqual(i.edits[0].allowedMentions.parse, []);
  assert.equal(f.sent.length, 0);
});
test("sharing consumes preview, fetches current permissions and suppresses mentions", async () => {
  const f = fixture();
  const { id } = await f.preview();
  const button = f.interaction(id);
  await f.handle(button);
  assert.equal(f.sent.length, 1);
  assert.match(f.sent[0].content, /Practice plan/);
  assert.doesNotMatch(f.sent[0].content, /Only you/);
  assert.deepEqual(f.sent[0].allowedMentions.parse, []);
  assert.equal(f.fetches.length, 3);
  for (const fetch of f.fetches) {
    assert.equal(fetch.options.force, true);
    assert.equal(fetch.options.cache, false);
  }
  assert.equal(f.store.drafts.size, 0);
  assert.equal(button.edits.at(-1).content, "Plan shared in this channel.");
});
test("concurrent double share can send at most once", async () => {
  const f = fixture();
  const { id } = await f.preview();
  await Promise.all([f.handle(f.interaction(id)), f.handle(f.interaction(id))]);
  assert.equal(f.sent.length, 1);
});
test("discard never fetches permissions or sends", async () => {
  const f = fixture();
  const { id } = await f.preview();
  await f.handle(f.interaction(id.replace(":share:", ":discard:")));
  assert.equal(f.sent.length, 0);
  assert.equal(f.fetches.length, 0);
  assert.equal(f.store.drafts.size, 0);
});
for (const [label, mutate] of [
  [
    "owner",
    (i) => {
      i.user.id = "other";
    },
  ],
  [
    "guild",
    (i) => {
      i.guildId = "other";
    },
  ],
  [
    "channel",
    (i) => {
      i.channelId = "other";
    },
  ],
  [
    "message",
    (i) => {
      i.message.id = "other";
    },
  ],
  [
    "author",
    (i) => {
      i.message.author.id = "other";
    },
  ],
  [
    "webhook",
    (i) => {
      i.message.webhookId = "other";
    },
  ],
  [
    "application",
    (i) => {
      i.applicationId = "other";
    },
  ],
  [
    "non-private message",
    (i) => {
      i.message.flags.has = () => false;
    },
  ],
])
  test(`rejects mismatched ${label}`, async () => {
    const f = fixture();
    const { id } = await f.preview();
    const i = f.interaction(id);
    mutate(i);
    await f.handle(i);
    assert.equal(f.sent.length, 0);
    assert.equal(f.store.drafts.size, 1);
  });
test("expired share does not send", async () => {
  const f = fixture();
  const { id } = await f.preview();
  f.advance(300_000);
  await f.handle(f.interaction(id));
  assert.equal(f.sent.length, 0);
});
test("revoked permissions between preview and share block publication", async () => {
  const f = fixture();
  const { id } = await f.preview();
  f.state.allowed = false;
  const button = f.interaction(id);
  await f.handle(button);
  assert.equal(f.sent.length, 0);
  assert.match(button.edits.at(-1).content, /View Channel/);
});
test("channel type changes block publication", async () => {
  const f = fixture();
  const { id } = await f.preview();
  f.state.channelType = ChannelType.PublicThread;
  await f.handle(f.interaction(id));
  assert.equal(f.sent.length, 0);
});
test("announcement channels send a normal message without crossposting", async () => {
  const f = fixture();
  const { id } = await f.preview();
  f.state.channelType = ChannelType.GuildAnnouncement;
  await f.handle(f.interaction(id));
  assert.equal(f.sent.length, 1);
});
test("channel cooldown blocks another member's share", async () => {
  const f = fixture();
  const { id } = await f.preview();
  await f.handle(f.interaction(id));
  const other = f.interaction(null, "other");
  await f.handle(other);
  const nextId = other.edits[0].components[0].components[0].data.custom_id;
  const next = f.interaction(nextId, "other");
  await f.handle(next);
  assert.equal(f.sent.length, 1);
  assert.match(next.edits.at(-1).content, /60-second/);
});
test("ambiguous send failure is sanitized and never automatically resent", async () => {
  const f = fixture();
  const { id } = await f.preview();
  f.state.fail = true;
  const button = f.interaction(id);
  await f.handle(button);
  await f.handle(f.interaction(id));
  assert.equal(f.sent.length, 1);
  assert.match(button.edits.at(-1).content, /Check the channel/);
  assert.doesNotMatch(JSON.stringify(button.edits), /SDK details/);
});
test("failed preview response removes the draft", async () => {
  const f = fixture();
  const i = f.interaction();
  i.editReply = async () => {
    throw Error("no connection");
  };
  await f.handle(i);
  assert.equal(f.store.drafts.size, 0);
  assert.equal(f.sent.length, 0);
});
test("invalid ranges get helpful private guidance", async () => {
  const f = fixture();
  const i = f.interaction();
  i.values.target = 61;
  await f.handle(i);
  assert.match(i.replies[0].content, /difference/);
  assert.equal(f.store.drafts.size, 0);
});
test("Turkish choice overrides locale and survives sharing", async () => {
  const f = fixture();
  const i = f.interaction();
  i.values.language = "tr";
  await f.handle(i);
  assert.match(i.edits[0].content, /Pratik planı/);
  const id = i.edits[0].components[0].components[0].data.custom_id;
  await f.handle(f.interaction(id));
  assert.match(f.sent[0].content, /mola hariç/);
});
test("Turkish locale chooses Turkish without an option", async () => {
  const f = fixture();
  const i = f.interaction();
  i.locale = "tr";
  await f.handle(i);
  assert.match(i.edits[0].content, /Pratik planı/);
});
test("unsupported language and malformed button are rejected safely", async () => {
  const f = fixture();
  const i = f.interaction();
  i.values.language = "xx";
  await f.handle(i);
  assert.equal(f.store.drafts.size, 0);
  await f.handle(f.interaction("tt:share:bad"));
  assert.equal(f.sent.length, 0);
});
test("DMs, threads, missing channels and wrong server cannot create drafts", async () => {
  for (const mutate of [
    (i) => {
      i.guildId = null;
    },
    (i) => {
      i.channel.type = ChannelType.PublicThread;
    },
    (i) => {
      i.channel = null;
    },
    (i) => {
      i.guildId = "other";
    },
  ]) {
    const f = fixture();
    const i = f.interaction();
    mutate(i);
    await f.handle(i);
    assert.equal(f.store.drafts.size, 0);
  }
});
test("unrelated interactions are ignored", async () => {
  const f = fixture();
  const i = f.interaction();
  i.commandName = "other";
  await f.handle(i);
  await f.handle(f.interaction("other:button"));
  assert.equal(i.replies.length, 0);
  assert.equal(f.store.drafts.size, 0);
});
