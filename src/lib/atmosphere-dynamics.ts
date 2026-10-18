/** Small, deterministic physics shared by SVG probes; no DOM or React state. */
export type FlowBody = { dx: number; dy: number; vx: number; vy: number; turn: number };
type FlowPointer = { x: number; y: number; strength: number; vx: number; vy: number };
const clamp = (n: number, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, n));

export function stepFlow(body: FlowBody, x: number, y: number, phase: number, depth: number, pointer: FlowPointer, dt: number, radius: number, displacement: number, kickX = 0, kickY = 0) {
  if (!dt) return;
  const rx = x - pointer.x, ry = y - pointer.y, distance = Math.hypot(rx, ry);
  const falloff = (1 - clamp(distance / radius)) ** 2 * pointer.strength;
  const targetSpin = falloff * (0.8 + depth * 0.75);
  // A lingering eddy relaxes continuously when the cursor leaves; no orbit reset.
  body.turn += (targetSpin - body.turn * (1 - clamp(falloff * 3)) * 1.8) * dt;
  const angle = body.turn, c = Math.cos(angle), s = Math.sin(angle);
  const radial = Math.sin(phase) * displacement * falloff * 0.32;
  const locality = clamp(falloff * 4);
  let tx = (rx * c - ry * s - rx) * 0.9 * locality + rx / Math.max(1, distance) * radial + pointer.vx * falloff * 0.018;
  let ty = (ry * c + rx * s - ry) * 0.9 * locality + ry / Math.max(1, distance) * radial + pointer.vy * falloff * 0.018;
  const scale = Math.min(1, displacement / Math.max(1, Math.hypot(tx, ty)));
  tx = tx * scale + kickX; ty = ty * scale + kickY;
  // Substeps keep the spring stable and comparable at desktop/mobile frame rates.
  const steps = Math.ceil(dt / (1 / 120)), h = dt / steps;
  for (let i = 0; i < steps; i++) {
    body.vx += ((tx - body.dx) * 48 - body.vx * 12) * h;
    body.vy += ((ty - body.dy) * 48 - body.vy * 12) * h;
    body.dx += body.vx * h; body.dy += body.vy * h;
  }
}

export type NetworkNode = { px: number; py: number };
export type Cascade = { remaining: number; seeds: number; visited: Set<number> };
export type Relay = { from: number; to: number; age: number; delay: number; energy: number; generation: number; delivered: boolean; cascade: Cascade };
type NetworkBudget = { max: number; budget: number; seeds: number; radius: number; generations: number; fanout: number; attenuation: number; life: number };

/** Neighbours are searched only on a hit, never with an all-pairs frame loop. */
export class PulseNetwork {
  relays: Relay[] = [];
  constructor(readonly config: NetworkBudget) {}
  create(): Cascade { return { remaining: this.config.budget, seeds: 0, visited: new Set() }; }
  seed(cascade: Cascade, index: number, nodes: readonly NetworkNode[]) {
    if (cascade.seeds >= this.config.seeds || !cascade.remaining || cascade.visited.has(index)) return false;
    cascade.seeds++; cascade.remaining--; cascade.visited.add(index);
    this.spread(cascade, index, nodes, 1, 1);
    return true;
  }
  private spread(cascade: Cascade, from: number, nodes: readonly NetworkNode[], generation: number, energy: number) {
    if (generation > this.config.generations || !cascade.remaining) return;
    const origin = nodes[from];
    const neighbours = nodes.map((node, to) => ({ to, distance: Math.hypot(node.px - origin.px, node.py - origin.py) }))
      .filter(n => n.to !== from && !cascade.visited.has(n.to) && n.distance > 12 && n.distance < this.config.radius)
      .sort((a, b) => a.distance - b.distance).slice(0, this.config.fanout);
    for (const neighbour of neighbours) {
      if (!cascade.remaining || this.relays.length >= this.config.max) break;
      cascade.visited.add(neighbour.to); cascade.remaining--;
      this.relays.push({ from, to: neighbour.to, age: 0, delay: 0.09 + neighbour.distance / 650, energy: energy * this.config.attenuation, generation, delivered: false, cascade });
    }
  }
  step(dt: number, nodes: readonly NetworkNode[], hit: (index: number, energy: number, from: number) => void) {
    const count = this.relays.length;
    for (let i = 0; i < count; i++) {
      const relay = this.relays[i]; relay.age += dt;
      if (!relay.delivered && relay.age >= relay.delay) {
        relay.delivered = true; hit(relay.to, relay.energy, relay.from);
        this.spread(relay.cascade, relay.to, nodes, relay.generation + 1, relay.energy);
      }
    }
    this.relays = this.relays.filter(relay => relay.age < relay.delay + this.config.life);
  }
  clear() { this.relays = []; }
}
