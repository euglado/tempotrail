import assert from "node:assert/strict";
import test from "node:test";
import { createPlan, InputError, renderPlan } from "../dist/plan.js";

const defaults = { start: 60, target: 80, levels: 5, bars: 4, beats: 4 };
test("ascending plan includes both endpoints and known duration", () => {
  const plan = createPlan(defaults);
  assert.deepEqual(plan.tempos, [60, 65, 70, 75, 80]);
  assert.equal(
    plan.seconds,
    Math.ceil(960 / 60 + 960 / 65 + 960 / 70 + 960 / 75 + 960 / 80),
  );
});
test("descending practice uses descending integer tempos", () => {
  assert.deepEqual(
    createPlan({ ...defaults, start: 80, target: 60 }).tempos,
    [80, 75, 70, 65, 60],
  );
});
test("non-divisible intervals round each position instead of accumulating error", () => {
  assert.deepEqual(
    createPlan({ ...defaults, start: 60, target: 71, levels: 4 }).tempos,
    [60, 64, 67, 71],
  );
});
test("minimum gap keeps all steps distinct", () => {
  assert.deepEqual(
    createPlan({ ...defaults, start: 60, target: 64 }).tempos,
    [60, 61, 62, 63, 64],
  );
});
for (const [key, min, max] of [
  ["start", 20, 300],
  ["target", 20, 300],
  ["levels", 2, 10],
  ["bars", 1, 32],
  ["beats", 1, 12],
]) {
  for (const value of [min - 1, max + 1, 1.5, NaN, Infinity, "60", undefined]) {
    test(`rejects ${key} outside valid integer range: ${String(value)}`, () => {
      assert.throws(
        () => createPlan({ ...defaults, [key]: value }),
        InputError,
      );
    });
  }
}
test("equal and insufficient BPM differences are rejected", () => {
  for (const target of [60, 61, 59])
    assert.throws(() => createPlan({ ...defaults, target }), InputError);
});
test("duration scales with bars and counted beats", () => {
  const plan = createPlan({
    ...defaults,
    start: 60,
    target: 120,
    levels: 2,
    bars: 1,
    beats: 1,
  });
  assert.equal(plan.seconds, 2);
  assert.equal(
    createPlan({
      ...defaults,
      start: 60,
      target: 120,
      levels: 2,
      bars: 10,
      beats: 6,
    }).seconds,
    90,
  );
});
test("extreme valid plans stay bounded with distinct monotonic integer steps", () => {
  for (const start of [20, 60, 200, 300]) {
    for (const target of [20, 60, 200, 300]) {
      if (start === target) continue;
      for (let levels = 2; levels <= 10; levels++) {
        const plan = createPlan({ start, target, levels, bars: 32, beats: 12 });
        assert.equal(plan.tempos.length, levels);
        assert.equal(new Set(plan.tempos).size, levels);
        assert.equal(plan.tempos[0], start);
        assert.equal(plan.tempos.at(-1), target);
        assert.ok(plan.seconds > 0 && plan.seconds <= 11520);
        for (let i = 1; i < levels; i++)
          assert.ok(
            (plan.tempos[i] - plan.tempos[i - 1]) * (target - start) > 0,
          );
        for (const language of ["en", "tr"])
          assert.ok(renderPlan(plan, language).length < 1600);
      }
    }
  }
});
test("bilingual output explains counted beat and excludes breaks", () => {
  const plan = createPlan(defaults);
  assert.match(renderPlan(plan, "en"), /excluding breaks/);
  assert.match(renderPlan(plan, "en"), /6\/8/);
  assert.match(renderPlan(plan, "tr"), /mola hariç/);
  assert.match(renderPlan(plan, "tr"), /60 BPM/);
});
