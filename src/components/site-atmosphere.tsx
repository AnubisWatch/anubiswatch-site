"use client";

import { useEffect, useId, useRef } from "react";
import { useMotionControl } from "./motion-control";
import { siteAtmosphere as config } from "@/lib/site-atmosphere";
import { PulseNetwork, stepFlow, type Cascade, type FlowBody } from "@/lib/atmosphere-dynamics";

type Point = { x: number; y: number };
type Unit = Point & FlowBody & { el: SVGGElement; response: SVGGElement; resonance: SVGCircleElement; pulse: number; phase: number; depth: number; px: number; py: number; alpha: number; visible: boolean };
type Ripple = Point & { age: number; variant: number; energy: number; cascade: Cascade };
type Spark = Point & { age: number; vx: number; vy: number };
type Trail = Point & { age: number };
type Zone = { left: number; right: number; top: number; bottom: number; floor: number };
const clamp = (n: number, min = 0, max = 1) => Math.max(min, Math.min(max, n));
const wrap = (n: number, range: number) => ((n % range) + range) % range;
const tau = Math.PI * 2;
function attr(element: Element, name: string, value: string | number) {
  const next = String(value);
  if (element.getAttribute(name) !== next) element.setAttribute(name, next);
}

/** Two root-level viewport layers share one bounded simulation, outside section clips. */
export function SiteAtmosphere() {
  const id = useId().replace(/:/g, "");
  const svgRef = useRef<SVGSVGElement>(null);
  const interactionRef = useRef<SVGSVGElement>(null);
  const [paused, , automatic] = useMotionControl();

  useEffect(() => {
    const svg = svgRef.current, overlay = interactionRef.current;
    if (!svg || !overlay) return;
    attr(overlay, "visibility", "hidden");
    const abort = new AbortController(), passive = { passive: true, signal: abort.signal };
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const unitElements = [...svg.querySelectorAll<SVGGElement>("[data-unit]")];
    const responses = [...overlay.querySelectorAll<SVGGElement>("[data-response]")];
    const aura = overlay.querySelector<SVGGElement>("[data-aura]")!;
    const orbitElements = [...aura.querySelectorAll<SVGGElement>("[data-orbit]")];
    const contours = [...aura.querySelectorAll<SVGPathElement>("[data-contour]")];
    const relayElements = [...overlay.querySelectorAll<SVGGElement>("[data-relay]")].map(el => ({ el, path: el.querySelector("path")!, dot: el.querySelector("circle")! }));
    const orbits = orbitElements.map((_, i) => ({ angle: i * tau / config.orbitProbes, x: 0, y: 0, ready: false }));
    const waveElements = [...overlay.querySelectorAll<SVGGElement>("[data-wave]")];
    const sparkElements = [...overlay.querySelectorAll<SVGPathElement>("[data-spark]")];
    const trailElements = [...overlay.querySelectorAll<SVGPathElement>("[data-trail]")];
    const wireElements = [...svg.querySelectorAll<SVGPathElement>("[data-wire]")];
    const routes = [...svg.querySelectorAll<SVGPathElement>("[data-route]")];
    const packets = [...svg.querySelectorAll<SVGCircleElement>("[data-packet]")];
    let width = 1, height = 1, mobile = false, visible = false, hidden = document.hidden;
    const reduced = automatic && media.matches;
    let frame = 0, previous = 0, time = 0, ambient = 0, lastActivity = -10, lastTrail = -10;
    let entrance: number = paused ? config.entrance : 0, activity: number = config.idleStrength;
    let scroll = window.scrollY, sceneScroll = scroll, measured = false, scrollDirty = true;
    let units: Unit[] = [], waves: Ripple[] = [], sparks: Spark[] = [], trails: Trail[] = [];
    let network = new PulseNetwork({ ...config.chain, max: config.chain.max });
    let zones: Zone[] = [], floating: Element[] = [], activeZones: Zone[] = [];
    let down: (Point & { id: number; at: number; scroll: number; moved: boolean }) | null = null;
    const pointer = { x: 0, y: 0, strength: 0, active: false, vx: 0, vy: 0, movedAt: -10 };
    const state = () => reduced ? "reduced" : paused ? "paused" : hidden ? "hidden" : !visible ? "offscreen" : time - lastActivity > config.idleAfter ? "idle" : "running";
    const counts = () => { attr(svg, "data-ripples", waves.length); attr(svg, "data-sparks", sparks.length); attr(svg, "data-trails", trails.length); };
    const stop = () => { if (frame) cancelAnimationFrame(frame); frame = 0; previous = 0; };
    function measure() {
      zones = [...document.querySelectorAll(config.quietSelector)].map(element => {
        const r = element.getBoundingClientRect();
        return { left: r.left - 16, right: r.right + 16, top: r.top + scroll - 16, bottom: r.bottom + scroll + 16, floor: element.matches(".docs-reading") ? 0.1 : 0.06 };
      }).filter(r => r.right - r.left > 32 && r.bottom - r.top > 32);
      floating = [...document.querySelectorAll(config.floatingSelector)];
      measured = true; scrollDirty = true;
    }
    function viewportZones() {
      if (!measured) measure();
      if (!scrollDirty) return;
      activeZones = zones.filter(r => r.bottom > scroll - config.quietFade && r.top < scroll + height + config.quietFade).map(r => ({ ...r, top: r.top - scroll, bottom: r.bottom - scroll }));
      for (const element of floating) {
        const r = element.getBoundingClientRect();
        if (r.width && r.height && r.bottom > 0 && r.top < height) activeZones.push({ left: r.left - 12, right: r.right + 12, top: r.top - 12, bottom: r.bottom + 12, floor: 0.006 });
      }
      scrollDirty = false;
    }
    function quiet(x: number, y: number) {
      let factor = 1;
      for (const r of activeZones) {
        const distance = Math.hypot(Math.max(r.left - x, 0, x - r.right), Math.max(r.top - y, 0, y - r.bottom));
        const t = clamp(distance / config.quietFade);
        factor = Math.min(factor, r.floor + (1 - r.floor) * t * t * (3 - 2 * t));
      }
      return factor;
    }
    function draw(dt = 0) {
      viewportZones();
      const intro = reduced ? 1 : clamp(entrance / config.entrance);
      const smooth = dt ? 1 - Math.exp(-dt * 9) : 1;
      const span = height + config.overscan * 2;
      const reacting = !reduced && !paused;
      attr(overlay!, "visibility", reacting ? "visible" : "hidden");
      let showing = 0;
      for (const unit of units) {
        const x = unit.x * width + Math.sin(ambient * (0.12 + unit.depth * 0.1) + unit.phase) * config.drift * unit.depth;
        const y = wrap(unit.y * span - sceneScroll * config.parallax * unit.depth, span) - config.overscan + Math.cos(ambient * 0.15 + unit.phase) * config.drift;
        const dx = x - pointer.x, dy = y - pointer.y, distance = Math.hypot(dx, dy);
        const proximity = (1 - clamp(distance / config.pointerRadius)) ** 2;
        let tx = 0, ty = 0;
        let waveLight = 0;
        for (const wave of waves) {
          const wx = x - wave.x, wy = y - wave.y, d = Math.hypot(wx, wy), p = wave.age / config.ripples.life;
          const radius = (mobile ? config.ripples.mobileRadius : config.ripples.radius) * (1 - (1 - p) ** 2);
          const envelope = (1 - clamp(Math.abs(d - radius) / 85)) ** 2 * (1 - p) * wave.energy;
          const force = envelope * config.ripples.force;
          waveLight = Math.max(waveLight, envelope);
          tx += wx / Math.max(1, d) * force; ty += wy / Math.max(1, d) * force;
        }
        stepFlow(unit, x, y, unit.phase, unit.depth, pointer, dt, config.pointerRadius, config.displacement * (0.65 + unit.depth * 0.35), tx, ty);
        if (dt) unit.pulse *= Math.exp(-dt * 4.8);
        unit.px = x + unit.dx; unit.py = y + unit.dy;
        const edge = clamp(Math.min(unit.px, width - unit.px, unit.py, height - unit.py) / config.edgeFade);
        const target = (0.19 + unit.depth * 0.27) * edge * quiet(unit.px, unit.py) * intro * (0.7 + activity * 0.3);
        unit.alpha += (target - unit.alpha) * smooth;
        const show = unit.py > -25 && unit.py < height + 25 && unit.alpha > 0.008;
        if (show !== unit.visible) { attr(unit.el, "visibility", show ? "visible" : "hidden"); attr(unit.el, "data-visible", String(show)); unit.visible = show; }
        const transform = `translate(${unit.px.toFixed(2)} ${unit.py.toFixed(2)}) rotate(${(Math.sin(ambient * 0.12 + unit.phase) * 12 + unit.phase * 12 + unit.turn * 30 + unit.pulse * 12).toFixed(2)})`;
        if (show) {
          showing++;
          attr(unit.el, "transform", transform);
          attr(unit.el, "opacity", unit.alpha.toFixed(3));
        }
        // Foreground echoes use radial distance only: no card/text rectangle masks.
        const response = Math.min(1, proximity * pointer.strength * 1.8 + waveLight + unit.pulse) * config.responseOpacity * edge * intro;
        const showResponse = reacting && response > 0.008;
        attr(unit.response, "visibility", showResponse ? "visible" : "hidden");
        if (showResponse) {
          attr(unit.response, "transform", transform); attr(unit.response, "opacity", response.toFixed(3));
          attr(unit.resonance, "r", (9 + (1 - unit.pulse) * 21).toFixed(2));
          attr(unit.resonance, "opacity", (unit.pulse * 0.65).toFixed(3));
        }
      }
      if (dt && reacting) {
        network.step(dt, units, (index, energy, from) => {
          const unit = units[index], source = units[from];
          unit.pulse = Math.max(unit.pulse, energy);
          const dx = unit.px - source.px, dy = unit.py - source.py, distance = Math.max(1, Math.hypot(dx, dy));
          unit.vx += (dx - dy * 0.2) / distance * energy * config.chain.kick;
          unit.vy += (dy + dx * 0.2) / distance * energy * config.chain.kick;
        });
        for (const wave of waves) {
          if (wave.cascade.seeds >= config.chain.seeds) continue;
          const radius = (mobile ? config.ripples.mobileRadius : config.ripples.radius) * (1 - (1 - wave.age / config.ripples.life) ** 2);
          for (let i = 0; i < units.length; i++) {
            const unit = units[i], distance = Math.hypot(unit.px - wave.x, unit.py - wave.y);
            if (unit.py < 20 || unit.py > height - 20 || Math.abs(distance - radius) > 22) continue;
            if (network.seed(wave.cascade, i, units)) unit.pulse = Math.max(unit.pulse, 0.9);
          }
        }
      }
      relayElements.forEach(({ el, path, dot }, i) => {
        const relay = network.relays[i], a = relay && units[relay.from], b = relay && units[relay.to];
        const show = !!(reacting && relay && a && b && Math.hypot(a.px - b.px, a.py - b.py) < config.chain.radius * 1.5);
        attr(el, "visibility", show ? "visible" : "hidden"); if (!show) return;
        const t = clamp(relay.age / relay.delay), u = 1 - t;
        const cx = (a.px + b.px) / 2 + (b.py - a.py) * 0.13, cy = (a.py + b.py) / 2 - (b.px - a.px) * 0.13;
        attr(path, "d", `M${a.px.toFixed(1)} ${a.py.toFixed(1)}Q${cx.toFixed(1)} ${cy.toFixed(1)} ${b.px.toFixed(1)} ${b.py.toFixed(1)}`);
        attr(el, "opacity", (relay.energy * Math.min(1, relay.age * 20) * (1 - clamp((relay.age - relay.delay) / config.chain.life)) * 0.38 * intro).toFixed(3));
        attr(dot, "cx", (u * u * a.px + 2 * u * t * cx + t * t * b.px).toFixed(1));
        attr(dot, "cy", (u * u * a.py + 2 * u * t * cy + t * t * b.py).toFixed(1));
      });
      attr(svg!, "data-visible", showing);
      let wires = 0;
      const linkLimit = mobile ? config.links.mobile : config.links.max;
      for (let i = 0; i < units.length - 1 && wires < linkLimit; i += 2) {
        const a = units[i], b = units[i + 1], distance = Math.hypot(a.px - b.px, a.py - b.py);
        if (!a.visible || !b.visible || distance > config.links.radius) continue;
        const path = wireElements[wires++];
        attr(path, "d", `M${a.px.toFixed(1)} ${a.py.toFixed(1)}L${b.px.toFixed(1)} ${b.py.toFixed(1)}`);
        attr(path, "opacity", ((1 - distance / config.links.radius) * Math.min(a.alpha, b.alpha) * 0.5).toFixed(3));
      }
      wireElements.slice(wires).forEach(path => attr(path, "opacity", 0));
      // Continuous, extremely fine routes stay coherent across section boundaries.
      routes.forEach((path, lane) => {
        const y = height * (0.22 + lane * 0.3) + Math.sin(sceneScroll * 0.0006 + lane) * 70;
        const bend = Math.sin(ambient * 0.09 + lane) * 28;
        attr(path, "d", `M-30 ${y + 45}C${width * 0.32} ${y - 90 + bend} ${width * 0.68} ${y + 100 - bend} ${width + 30} ${y - 30}`);
        attr(path, "opacity", (intro * 0.055).toFixed(3));
        const t = (ambient * (0.023 + lane * 0.005) + lane * 0.29) % 1, u = 1 - t;
        const x = u ** 3 * -30 + 3 * u ** 2 * t * width * 0.32 + 3 * u * t ** 2 * width * 0.68 + t ** 3 * (width + 30);
        const py = u ** 3 * (y + 45) + 3 * u ** 2 * t * (y - 90 + bend) + 3 * u * t ** 2 * (y + 100 - bend) + t ** 3 * (y - 30);
        attr(packets[lane], "cx", x.toFixed(2)); attr(packets[lane], "cy", py.toFixed(2)); attr(packets[lane], "opacity", (quiet(x, py) * intro * 0.42).toFixed(3));
      });
      const auraVisible = reacting && pointer.strength > 0.015;
      attr(aura, "visibility", auraVisible ? "visible" : "hidden");
      if (auraVisible) {
        attr(aura, "transform", `translate(${pointer.x.toFixed(2)} ${pointer.y.toFixed(2)})`);
        attr(aura, "opacity", (pointer.strength * intro * 0.52).toFixed(3));
        contours.forEach((path, lane) => {
          const radius = lane ? 106 : 42;
          const points = Array.from({ length: 6 }, (_, i) => {
            const angle = i * tau / 6 + ambient * 0.1;
            const r = radius * (1 + Math.sin(ambient * 0.7 + i * 1.7 + lane) * 0.12);
            return { x: Math.cos(angle) * r, y: Math.sin(angle) * r * (0.86 + Math.sin(ambient * 0.3 + lane) * 0.06) };
          });
          const mid = (a: Point, b: Point) => `${((a.x + b.x) / 2).toFixed(1)} ${((a.y + b.y) / 2).toFixed(1)}`;
          attr(path, "d", `M${mid(points[5], points[0])}${points.map((p, i) => `Q${p.x.toFixed(1)} ${p.y.toFixed(1)} ${mid(p, points[(i + 1) % 6])}`).join("")}Z`);
        });
        orbitElements.forEach((el, i) => {
          const show = !mobile || i < 3;
          attr(el, "visibility", show ? "visible" : "hidden");
          if (!show) return;
          const orbit = orbits[i];
          orbit.angle += dt * (0.3 + Math.sin(ambient * 0.65 + i) * 0.12);
          const radius = 65 + i % 3 * 31 + Math.sin(ambient * 0.85 + i * 1.7) * 17;
          const x = Math.cos(orbit.angle) * radius * (1 + Math.sin(ambient * 0.4 + i) * 0.12) - pointer.vx * (0.012 + i * 0.002);
          const y = Math.sin(orbit.angle) * radius * (0.8 + Math.cos(ambient * 0.35 + i) * 0.12) - pointer.vy * (0.012 + i * 0.002);
          const lag = !orbit.ready ? 1 : 1 - Math.exp(-dt * (5 + i % 3));
          orbit.x += (x - orbit.x) * lag; orbit.y += (y - orbit.y) * lag; orbit.ready = true;
          attr(el, "transform", `translate(${orbit.x.toFixed(2)} ${orbit.y.toFixed(2)}) rotate(${(orbit.angle * 180 / Math.PI + 90).toFixed(1)})`);
        });
      }
      waveElements.forEach((group, i) => {
        const wave = waves[i];
        attr(group, "visibility", wave ? "visible" : "hidden");
        if (!wave) return;
        const p = clamp(wave.age / config.ripples.life), radius = (mobile ? config.ripples.mobileRadius : config.ripples.radius) * (1 - (1 - p) ** 2);
        attr(group, "transform", `translate(${wave.x} ${wave.y})`);
        attr(group, "opacity", (Math.sin(Math.min(1, p * 9) * Math.PI / 2) * (1 - p) ** 1.6 * Math.min(1.4, wave.energy) * intro * 0.58).toFixed(3));
        attr(group, "data-variant", wave.variant);
        const circles = group.querySelectorAll("circle");
        attr(circles[0], "r", radius.toFixed(2)); attr(circles[0], "stroke-dasharray", wave.variant === 2 ? "3 11" : "none");
        attr(circles[1], "r", (radius * 0.75).toFixed(2));
        const marks = group.querySelector("path")!;
        attr(marks, "transform", `rotate(${wave.variant * 45}) scale(${radius.toFixed(2)})`); attr(marks, "opacity", wave.variant ? 0.7 : 0);
      });
      sparkElements.forEach((path, i) => {
        const s = sparks[i]; attr(path, "visibility", s ? "visible" : "hidden"); if (!s) return;
        attr(path, "d", `M${s.x.toFixed(2)} ${s.y.toFixed(2)}l${(-s.vx * 0.045).toFixed(2)} ${(-s.vy * 0.045).toFixed(2)}`);
        attr(path, "opacity", ((1 - s.age / config.sparks.life) ** 2 * 0.7 * intro).toFixed(3));
      });
      trailElements.forEach((path, i) => {
        const a = trails[i], b = trails[i + 1];
        const show = a && b && Math.hypot(a.x - b.x, a.y - b.y) <= config.trails.maxSegment;
        attr(path, "visibility", show ? "visible" : "hidden"); if (!show) return;
        const proximity = (1 - clamp(Math.hypot(b.x - pointer.x, b.y - pointer.y) / config.pointerRadius)) ** 2;
        attr(path, "d", `M${a.x} ${a.y}L${b.x} ${b.y}`); attr(path, "opacity", ((1 - b.age / config.trails.life) ** 2 * proximity * 0.48 * intro).toFixed(3));
      });
    }
    function tick(timestamp: number) {
      frame = 0;
      const fps = mobile ? config.fps.mobile : time - lastActivity > config.idleAfter ? config.fps.idle : config.fps.active;
      const elapsed = previous ? (timestamp - previous) / 1000 : 1 / fps;
      if (elapsed + 0.0001 < 1 / fps) { frame = requestAnimationFrame(tick); return; }
      const dt = Math.min(elapsed, 0.05); previous = timestamp; time += dt; entrance += dt;
      pointer.vx *= Math.exp(-dt * 7); pointer.vy *= Math.exp(-dt * 7);
      const smooth = 1 - Math.exp(-dt * 6);
      activity += ((time - lastActivity > config.idleAfter ? config.idleStrength : 1) - activity) * smooth;
      pointer.strength += ((pointer.active && time - lastActivity < config.idleAfter ? 1 : 0) - pointer.strength) * smooth;
      ambient += dt * (0.5 + activity * 0.5); sceneScroll += (scroll - sceneScroll) * smooth;
      const before = waves.length + sparks.length + trails.length;
      for (const wave of waves) wave.age += dt;
      for (const trail of trails) trail.age += dt;
      for (const s of sparks) { s.age += dt; s.x += s.vx * dt; s.y += s.vy * dt; s.vx *= Math.exp(-dt * 2.4); s.vy *= Math.exp(-dt * 2.4); }
      waves = waves.filter(wave => wave.age < config.ripples.life); sparks = sparks.filter(s => s.age < config.sparks.life); trails = trails.filter(trail => trail.age < config.trails.life);
      if (before !== waves.length + sparks.length + trails.length) counts();
      attr(svg!, "data-state", state()); draw(dt); frame = requestAnimationFrame(tick);
    }
    function sync() {
      stop(); if (paused && entrance < 0.1) entrance = config.entrance;
      attr(svg!, "data-state", state());
      if (!visible || hidden) return;
      if (reduced || paused) { draw(); return; }
      frame = requestAnimationFrame(tick);
    }
    function invalidate() {
      if (!visible || hidden || frame) return;
      // Static compositions redraw only for layout/scroll changes, never on a loop.
      frame = requestAnimationFrame(() => { frame = 0; draw(); });
    }
    function resize() {
      // SVG coordinates follow its CSS viewport, including mobile visual zoom.
      const box = svg!.getBoundingClientRect();
      const w = Math.round(box.width), h = Math.round(box.height);
      if (w !== width || h !== height) {
        width = w; height = h; mobile = width < config.mobileWidth;
        attr(svg!, "viewBox", `0 0 ${width} ${height}`);
        attr(overlay!, "viewBox", `0 0 ${width} ${height}`);
        network = new PulseNetwork({ ...config.chain, max: mobile ? config.chain.mobile : config.chain.max, budget: mobile ? config.chain.mobileBudget : config.chain.budget, radius: mobile ? config.chain.mobileRadius : config.chain.radius });
        waves = []; sparks = []; trails = []; counts();
        let seed: number = config.seed;
        const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
        const count = mobile ? config.units.mobile : clamp(Math.round(width * height / config.densityArea), config.units.min, config.units.max);
        const columns = Math.max(3, Math.round(Math.sqrt(count * width / height))), rows = Math.ceil(count / columns);
        units = unitElements.slice(0, count).map((el, i) => ({ el, response: responses[i], resonance: responses[i].querySelector("circle")!, pulse: 0, x: ((i % columns) + 0.12 + random() * 0.76) / columns, y: (Math.floor(i / columns) + 0.1 + random() * 0.8) / rows, phase: random() * tau, depth: 0.3 + random() * 0.7, dx: 0, dy: 0, vx: 0, vy: 0, turn: 0, px: 0, py: 0, alpha: 0, visible: false }));
        unitElements.forEach((el, i) => { attr(el, "visibility", "hidden"); attr(el, "data-visible", "false"); attr(el, "data-active", String(i < count)); });
        responses.forEach(el => attr(el, "visibility", "hidden"));
        attr(svg!, "data-probes", count);
      }
      measured = false; sync();
    }
    const interactive = () => !reduced && !paused && visible && !hidden;
    const excluded = (target: EventTarget | null) => target instanceof Element && !!target.closest(config.controlSelector);
    function move(event: PointerEvent) {
      if (down && down.id === event.pointerId && Math.hypot(event.clientX - down.x, event.clientY - down.y) > config.tap.distance) down.moved = true;
      if (event.pointerType === "touch" || !interactive()) return;
      // Hit testing only gates bursts. Hover follows the document, including text/cards.
      const elapsed = Math.max(1 / 60, time - pointer.movedAt);
      if (pointer.active) { pointer.vx = clamp((event.clientX - pointer.x) / elapsed, -650, 650); pointer.vy = clamp((event.clientY - pointer.y) / elapsed, -650, 650); }
      pointer.movedAt = time;
      pointer.x = event.clientX; pointer.y = event.clientY; pointer.active = true; lastActivity = time;
      const last = trails.at(-1);
      if (pointer.active && time - lastTrail > 0.035 && (!last || Math.hypot(pointer.x - last.x, pointer.y - last.y) > config.trails.spacing)) {
        trails.push({ x: pointer.x, y: pointer.y, age: 0 }); trails = trails.slice(-(mobile ? config.trails.mobile : config.trails.max)); lastTrail = time; counts();
      }
    }
    function press(event: PointerEvent) {
      if (!interactive() || !event.isPrimary || event.button !== 0 || excluded(event.target)) return;
      down = { x: event.clientX, y: event.clientY, id: event.pointerId, at: performance.now(), scroll, moved: false };
    }
    function release(event: PointerEvent) {
      if (down && down.id !== event.pointerId) return;
      const start = down; down = null;
      if (!start || !interactive() || event.button !== 0 || excluded(event.target) || start.moved || window.getSelection()?.isCollapsed === false || Math.abs(scroll - start.scroll) > config.tap.distance || performance.now() - start.at > config.tap.duration) return;
      const x = event.clientX, y = event.clientY; if (Math.hypot(x - start.x, y - start.y) > config.tap.distance) return;
      const oldActivity = lastActivity; lastActivity = time;
      const nearby = waves.find(wave => wave.age < 0.22 && Math.hypot(wave.x - x, wave.y - y) < 45);
      if (nearby) nearby.energy = Math.min(1.4, nearby.energy + 0.15);
      else waves.push({ x, y, age: 0, energy: 1, cascade: network.create(), variant: (Math.floor(x / 180) + Math.floor(y / 180) + (time - oldActivity < 0.4 ? 1 : 0)) % 3 });
      waves = waves.slice(-(mobile ? config.ripples.mobile : config.ripples.max));
      for (let i = 0; i < config.sparks.perTap; i++) { const angle = tau * i / config.sparks.perTap + time; sparks.push({ x, y, age: 0, vx: Math.cos(angle) * (110 + i * 8), vy: Math.sin(angle) * (110 + i * 8) }); }
      sparks = sparks.slice(-(mobile ? config.sparks.mobile : config.sparks.max)); counts();
    }
    // Only an enabled field owns input/scroll/visibility listeners. Toggling the
    // preference tears down this effect, aborts them and starts with empty pools.
    if (!paused && !reduced) {
      document.addEventListener("pointermove", move, { ...passive, capture: true }); document.addEventListener("pointerdown", press, passive); document.addEventListener("pointerup", release, passive);
      document.addEventListener("pointercancel", () => { down = null; pointer.active = false; }, passive);
      document.addEventListener("pointerout", event => { if (!event.relatedTarget) { pointer.active = false; down = null; } }, passive);
      window.addEventListener("blur", () => { pointer.active = false; down = null; }, passive);
      window.addEventListener("scroll", () => { scroll = window.scrollY; scrollDirty = true; if (pointer.active) lastActivity = time; invalidate(); }, passive);
      window.addEventListener("resize", resize, passive);
      document.addEventListener("visibilitychange", () => { hidden = document.hidden; down = null; pointer.active = false; sync(); }, { signal: abort.signal });
    }
    const theme = () => { attr(svg, "data-theme", document.documentElement.dataset.theme ?? "dark"); invalidate(); };
    const themeObserver = new MutationObserver(theme); themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    const contentObserver = new MutationObserver(() => { measured = false; invalidate(); }); contentObserver.observe(document.body, { childList: true, subtree: true });
    // Static artwork may still adapt to layout/theme changes without input
    // listeners or a continuous animation loop.
    const sizeObserver = new ResizeObserver(() => {
      const box = svg.getBoundingClientRect();
      if (Math.round(box.width) !== width || Math.round(box.height) !== height) resize();
      else { measured = false; invalidate(); }
    }); sizeObserver.observe(document.body); sizeObserver.observe(svg);
    const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }); intersection.observe(svg);
    void document.fonts.ready.then(() => { if (!abort.signal.aborted) { measured = false; invalidate(); } });
    theme(); resize(); counts();
    return () => { stop(); abort.abort(); themeObserver.disconnect(); contentObserver.disconnect(); sizeObserver.disconnect(); intersection.disconnect(); network.clear(); };
  }, [paused, automatic]);

  return <><svg ref={svgRef} className="site-atmosphere" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 900" aria-hidden="true" focusable="false" fill="none">
    <defs>
      <symbol id={id + "-soul"} viewBox="-16 -16 32 32"><circle r="8" /><path d="M-16 0H-5L-1-7 4 7 8 0H16" /></symbol>
      <symbol id={id + "-feather"} viewBox="-16 -16 32 32"><path d="M-10 10Q-14-4 12-14Q15 6-10 10ZM-14 14 9-11M-6 4-10-1M-1-1-7-5M4-6-1-9" /></symbol>
      <symbol id={id + "-pyramid"} viewBox="-16 -16 32 32"><path d="M0-13 13 10H-13ZM0-13 4 10" /></symbol>
      <symbol id={id + "-scales"} viewBox="-16 -16 32 32"><path d="M0-13V13M-13-6H13M-6 13H6M-10-6-15 5Q-10 11-5 5ZM10-6 5 5Q10 11 15 5Z" /></symbol>
    </defs>
    <g className="field-routes">{Array.from({ length: 3 }, (_, i) => <path key={i} data-route="" opacity="0" />)}</g>
    <g className="field-signal">{Array.from({ length: 3 }, (_, i) => <circle key={i} data-packet="" r="2" opacity="0" />)}</g>
    <g className="field-wires">{Array.from({ length: config.links.max }, (_, i) => <path key={i} data-wire="" opacity="0" />)}</g>
    <g>{Array.from({ length: config.units.max }, (_, i) => <g key={i} data-unit={i} visibility="hidden" className={i % 4 === 0 ? "field-soul" : "field-glyph"}><use href={"#" + id + "-" + ["soul", "feather", "pyramid", "scales"][i % 4]} x={-(7 + i % 7)} y={-(7 + i % 7)} width={14 + i % 7 * 2} height={14 + i % 7 * 2} /></g>)}</g>
  </svg><svg ref={interactionRef} className="site-interaction-layer" data-enabled={!paused} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 900" aria-hidden="true" focusable="false" fill="none" visibility="hidden">
    <g>{Array.from({ length: config.units.max }, (_, i) => <g key={i} data-response={i} visibility="hidden" className={i % 4 === 0 ? "field-soul" : "field-glyph"}><circle data-resonance="" opacity="0" /><use href={"#" + id + "-" + ["soul", "feather", "pyramid", "scales"][i % 4]} x={-12} y={-12} width={24} height={24} /></g>)}</g>
    <g className="field-relays">{Array.from({ length: config.chain.max }, (_, i) => <g key={i} data-relay="" visibility="hidden"><path /><circle r="1.8" /></g>)}</g>
    <g data-aura="" className="field-aura" visibility="hidden">
      <path data-contour="" opacity=".18" /><path data-contour="" opacity=".08" />
      <path d="M-58-17A61 61 0 0 1-18-58M58 17A61 61 0 0 1 18 58" opacity=".65" />
      {Array.from({ length: config.orbitProbes }, (_, i) => <g key={i} data-orbit="" className={i % 2 ? "field-soul" : "field-glyph"}><use href={"#" + id + "-" + ["soul", "feather", "pyramid", "scales"][i % 4]} x="-7" y="-7" width="14" height="14" /></g>)}
    </g>
    <g className="field-trails">{Array.from({ length: config.trails.max }, (_, i) => <path key={i} data-trail="" visibility="hidden" />)}</g>
    <g className="field-waves">{Array.from({ length: config.ripples.max }, (_, i) => <g key={i} data-wave="" visibility="hidden"><circle /><circle className="field-wave-inner" /><path d="M-1-.025V.025M1-.025V.025M-.025-1H.025M-.025 1H.025" vectorEffect="non-scaling-stroke" /></g>)}</g>
    <g className="field-sparks">{Array.from({ length: config.sparks.max }, (_, i) => <path key={i} data-spark="" visibility="hidden" />)}</g>
  </svg></>;
}
