import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, sep } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { command } from "../dist/command.js";
import { readConfig } from "../dist/config.js";

function temporary(fn) {
  const parent = resolve(tmpdir());
  const dir = mkdtempSync(join(parent, "tempotrail-test-"));
  try {
    fn(dir);
  } finally {
    const checked = resolve(dir);
    assert.ok(
      checked.startsWith(parent + sep) &&
        checked.slice(parent.length + 1).startsWith("tempotrail-test-"),
    );
    rmSync(checked, { recursive: true, force: true });
  }
}
const valid = {
  DISCORD_TOKEN: "x".repeat(24),
  DISCORD_APPLICATION_ID: "11111111111111111",
  DISCORD_GUILD_ID: "22222222222222222",
};
test("environment config does not require a disk file", () =>
  temporary((dir) => {
    assert.equal(
      readConfig(valid, join(dir, ".env")).guild,
      valid.DISCORD_GUILD_ID,
    );
  }));
test("disk configuration works with explicit environment precedence", () =>
  temporary((dir) => {
    const file = join(dir, ".env");
    writeFileSync(
      file,
      Object.entries(valid)
        .map(([k, v]) => `${k}=${v}`)
        .join("\n"),
    );
    assert.equal(readConfig({}, file).token, valid.DISCORD_TOKEN);
    assert.equal(
      readConfig({ DISCORD_GUILD_ID: "33333333333333333" }, file).guild,
      "33333333333333333",
    );
  }));
for (const key of Object.keys(valid))
  test(`rejects invalid ${key} without exposing input`, () =>
    temporary((dir) => {
      assert.throws(
        () =>
          readConfig({ ...valid, [key]: "invalid-value" }, join(dir, ".env")),
        { message: "Setup required" },
      );
    }));
test("command schema has integer constraints and required options first", () => {
  const json = command.toJSON();
  assert.equal(json.name, "tempotrail");
  assert.equal(json.options.length, 6);
  assert.equal(json.options[0].required, true);
  assert.equal(json.options[1].required, true);
  for (const option of json.options.slice(0, 5)) {
    assert.equal(option.type, 4);
    assert.ok(option.min_value < option.max_value);
  }
  assert.deepEqual(
    json.options[5].choices.map((c) => c.value),
    ["en", "tr"],
  );
  assert.equal(json.default_member_permissions, undefined);
});
for (const relative of [
  "../dist/main.js",
  "../dist/register.js",
  "../scripts/setup.mjs",
])
  test(`unconfigured ${relative} exits safely without writes`, () =>
    temporary((dir) => {
      const env = { ...process.env };
      for (const key of Object.keys(valid)) delete env[key];
      const result = spawnSync(
        process.execPath,
        [fileURLToPath(new URL(relative, import.meta.url))],
        { cwd: dir, env, encoding: "utf8", timeout: 15_000 },
      );
      assert.equal(result.status, 1);
      assert.equal(result.error, undefined);
      assert.equal(existsSync(join(dir, ".env")), false);
      assert.doesNotMatch(
        result.stdout + result.stderr,
        /Authorization:|Bot [A-Za-z0-9._-]+/,
      );
    }));
