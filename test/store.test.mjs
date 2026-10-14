import assert from "node:assert/strict";
import test from "node:test";
import { createPlan } from "../dist/plan.js";
import { Store } from "../dist/store.js";

const binding = { owner: "user", guild: "guild", channel: "channel" };
const plan = createPlan({
  start: 60,
  target: 80,
  levels: 5,
  bars: 4,
  beats: 4,
});
function fixture() {
  let now = 0;
  let n = 0;
  const store = new Store(
    () => now,
    () => (++n).toString(16).padStart(36, "0"),
  );
  return {
    store,
    advance: (ms) => {
      now += ms;
    },
  };
}
test("binding requires message assignment and consumption is single use", () => {
  const { store } = fixture();
  const key = store.create(binding, plan, "en");
  assert.equal(store.take(key, binding, "message"), null);
  assert.equal(store.bind(key, "message"), true);
  assert.equal(store.bind(key, "other"), false);
  assert.ok(store.take(key, binding, "message"));
  assert.equal(store.take(key, binding, "message"), null);
});
for (const field of ["owner", "guild", "channel"])
  test(`rejects wrong ${field} without consuming draft`, () => {
    const { store } = fixture();
    const key = store.create(binding, plan, "tr");
    store.bind(key, "m");
    assert.equal(
      store.take(key, { ...binding, [field]: "different" }, "m"),
      null,
    );
    assert.ok(store.take(key, binding, "m"));
  });
test("wrong message cannot consume preview", () => {
  const { store } = fixture();
  const key = store.create(binding, plan, "en");
  store.bind(key, "m");
  assert.equal(store.take(key, binding, "wrong"), null);
  assert.ok(store.take(key, binding, "m"));
});
test("TTL boundary expires exactly at five minutes", () => {
  const { store, advance } = fixture();
  const key = store.create(binding, plan, "en");
  store.bind(key, "m");
  advance(300_000);
  assert.equal(store.take(key, binding, "m"), null);
  assert.equal(store.drafts.size, 0);
});
test("unbound drafts cannot be bound after expiry", () => {
  const { store, advance } = fixture();
  const key = store.create(binding, plan, "en");
  advance(300_000);
  assert.equal(store.bind(key, "m"), false);
});
test("user cooldown expires at five seconds", () => {
  const { store, advance } = fixture();
  assert.ok(store.create(binding, plan, "en"));
  assert.equal(store.create(binding, plan, "en"), null);
  advance(4999);
  assert.equal(store.create(binding, plan, "en"), null);
  advance(1);
  assert.ok(store.create(binding, plan, "en"));
});
test("channel reservation lasts sixty seconds", () => {
  const { store, advance } = fixture();
  assert.ok(store.reserveChannel("c"));
  assert.equal(store.reserveChannel("c"), false);
  advance(59_999);
  assert.equal(store.reserveChannel("c"), false);
  advance(1);
  assert.ok(store.reserveChannel("c"));
});
test("draft cap is bounded and pruning frees capacity", () => {
  const { store, advance } = fixture();
  for (let n = 0; n < 100; n++)
    assert.ok(store.create({ ...binding, owner: String(n) }, plan, "en"));
  assert.equal(
    store.create({ ...binding, owner: "overflow" }, plan, "en"),
    null,
  );
  advance(300_000);
  assert.ok(store.create(binding, plan, "en"));
  assert.equal(store.drafts.size, 1);
});
test("cooldown maps have fixed capacity without bypassing active cooldowns", () => {
  const { store, advance } = fixture();
  for (let n = 0; n < 500; n++) assert.ok(store.reserveChannel(String(n)));
  assert.equal(store.reserveChannel("overflow"), false);
  for (let n = 0; n < 500; n++) store.users.set(String(n), 5_000);
  assert.equal(store.create(binding, plan, "en"), null);
  advance(60_000);
  store.prune();
  assert.equal(store.users.size, 0);
  assert.equal(store.channels.size, 0);
});
test("rejects malformed and colliding nonces", () => {
  assert.throws(() =>
    new Store(Date.now, () => "bad").create(binding, plan, "en"),
  );
  const store = new Store(Date.now, () => "a".repeat(36));
  store.create(binding, plan, "en");
  assert.throws(() => store.create({ ...binding, owner: "other" }, plan, "en"));
});
test("shutdown clears all retained state", () => {
  const { store } = fixture();
  store.create(binding, plan, "en");
  store.reserveChannel("c");
  store.clear();
  assert.equal(store.drafts.size + store.users.size + store.channels.size, 0);
});
