import { test, expect } from "@playwright/test";
import { PulseNetwork, stepFlow, type FlowBody } from "../src/lib/atmosphere-dynamics";
import { siteAtmosphere as config } from "../src/lib/site-atmosphere";

const body = (): FlowBody => ({ dx: 0, dy: 0, vx: 0, vy: 0, turn: 0 });
const pointer = { x: 0, y: 0, vx: 0, vy: 0, strength: 1 };
function simulate(hz: number) {
  const state = body();
  for (let i = 0; i < hz * 2; i++) stepFlow(state, 100, 0, 1, 0.8, pointer, 1 / hz, config.pointerRadius, config.displacement);
  return state;
}

test("flow has orbital inertia, stays local and settles without a frame-rate-dependent jump", () => {
  const state = body();
  stepFlow(state, 100, 0, 1, 0.8, pointer, 1 / 60, config.pointerRadius, config.displacement);
  expect(Math.hypot(state.dx, state.dy)).toBeLessThan(1);
  const desktop = simulate(60), mobile = simulate(30);
  expect(desktop.dy).toBeGreaterThan(25);
  expect(Math.hypot(desktop.dx, desktop.dy)).toBeLessThan(75);
  expect(Math.hypot(desktop.dx - mobile.dx, desktop.dy - mobile.dy)).toBeLessThan(2);
  for (let i = 0; i < 300; i++) stepFlow(desktop, 100, 0, 1, 0.8, { ...pointer, strength: 0 }, 1 / 60, config.pointerRadius, config.displacement);
  expect(Math.hypot(desktop.dx, desktop.dy, desktop.vx, desktop.vy)).toBeLessThan(0.01);
  const far = body();
  for (let i = 0; i < 120; i++) stepFlow(far, 600, 0, 1, 0.8, pointer, 1 / 60, config.pointerRadius, config.displacement);
  expect(far).toEqual(body());
});

test("a verdict reaches neighbours in delayed, weaker generations, never revisits and expires", () => {
  const network = new PulseNetwork(config.chain);
  const nodes = Array.from({ length: 10 }, (_, i) => ({ px: i * 110, py: 200 }));
  const cascade = network.create();
  expect(network.seed(cascade, 0, nodes)).toBe(true);
  const hits: { index: number; energy: number; at: number }[] = [];
  let time = 0;
  for (let i = 0; i < 100; i++) {
    time += 1 / 60;
    network.step(1 / 60, nodes, (index, energy) => hits.push({ index, energy, at: time }));
  }
  expect(hits.length).toBeGreaterThan(1);
  expect(hits[0].at).toBeGreaterThan(0.1);
  expect(hits.some(hit => hit.at > hits[0].at + 0.15 && hit.energy < hits[0].energy)).toBe(true);
  expect(hits.every(hit => hit.energy < 1 && hit.index !== 0)).toBe(true);
  expect(new Set(hits.map(hit => hit.index)).size).toBe(hits.length);
  expect(cascade.visited.size).toBeLessThanOrEqual(config.chain.budget);
  expect(network.seed(cascade, 0, nodes)).toBe(false);
  expect(network.relays).toHaveLength(0);
});

test("rapid cascades respect desktop and mobile budgets and clearing prevents delayed hits", () => {
  for (const mobile of [false, true]) {
    const max = mobile ? config.chain.mobile : config.chain.max;
    const budget = mobile ? config.chain.mobileBudget : config.chain.budget;
    const network = new PulseNetwork({ ...config.chain, max, budget });
    const nodes = Array.from({ length: 112 }, (_, i) => ({ px: i % 14 * 60, py: Math.floor(i / 14) * 60 }));
    const cascades = Array.from({ length: 30 }, (_, i) => {
      const cascade = network.create(); network.seed(cascade, i, nodes); return cascade;
    });
    for (let i = 0; i < 120; i++) {
      network.step(1 / 60, nodes, () => {});
      expect(network.relays.length).toBeLessThanOrEqual(max);
      expect(cascades.every(cascade => cascade.visited.size <= budget)).toBe(true);
    }
    network.seed(network.create(), 0, nodes);
    expect(network.relays.length).toBeGreaterThan(0);
    network.clear(); let hits = 0;
    network.step(10, nodes, () => hits++);
    expect(hits).toBe(0); expect(network.relays).toHaveLength(0);
  }
});
