"use client";

import { useEffect, useRef } from "react";
import { atmosphere as config } from "@/lib/hero-atmosphere";

type Point = { x: number; y: number };
type Probe = Point & { phase: number; depth: number; kind: number; size: number; dx: number; dy: number };
type Ripple = Point & { age: number; variant: number; energy: number };
type Spark = Point & { age: number; vx: number; vy: number };
type Trail = Point & { age: number };
type Props = { paused?: boolean; quietSelector?: string; anchorSelector?: string };
const tau = Math.PI * 2;
const clamp = (n: number, min = 0, max = 1) => Math.max(min, Math.min(max, n));
const rgba = (rgb: string, alpha: number) => `rgba(${rgb},${clamp(alpha)})`;
const controls = "a,button,input,textarea,select,summary,[role='button'],[contenteditable]";

/** Decorative drawing only; passive input listeners belong to its parent. */
export function HeroAtmosphere({ paused = false, quietSelector, anchorSelector }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pauseRef = useRef(paused);
  const syncRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    const ctx = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !host || !ctx) return;
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const abort = new AbortController();
    const options = { passive: true, signal: abort.signal };
    let width = 1, height = 1, ratio = 1, mobile = false;
    let visible = false, hidden = document.hidden, reduced = media.matches;
    let raf = 0, previous = 0, time = 0, ambientTime = 0, lastActivity = -10, lastTrail = -10;
    let entrance: number = pauseRef.current ? config.entrance : 0;
    let activity: number = config.idleStrength;
    let palette: (typeof config.palettes)[keyof typeof config.palettes] = config.palettes.dark;
    let focus: Point = { x: 0, y: 0 };
    let quiet: { x: number; y: number; width: number; height: number } | null = null;
    let down: (Point & { id: number; at: number; moved: boolean }) | null = null;
    const pointer = { x: 0, y: 0, strength: 0, active: false };
    let probes: Probe[] = [], ripples: Ripple[] = [], sparks: Spark[] = [], trails: Trail[] = [];
    const counts = () => { canvas.dataset.ripples = String(ripples.length); canvas.dataset.sparks = String(sparks.length); canvas.dataset.trails = String(trails.length); };
    const stop = () => { if (raf) cancelAnimationFrame(raf); raf = 0; previous = 0; };
    const state = () => reduced ? "reduced" : pauseRef.current ? "paused" : hidden ? "hidden" : !visible ? "offscreen" : time - lastActivity > config.idleAfter ? "idle" : "running";

    function glyph(probe: Probe, x: number, y: number, alpha: number) {
      ctx!.save(); ctx!.translate(x, y);
      ctx!.rotate(probe.phase * 0.3 + Math.sin(ambientTime * 0.13 + probe.phase) * 0.15);
      ctx!.strokeStyle = rgba(probe.kind === 0 ? palette.green : palette.gold, alpha);
      ctx!.lineWidth = 0.8 + probe.depth * 0.3;
      const s = probe.size;
      ctx!.beginPath();
      if (probe.kind === 0) {
        // A soul / probe, with the heartbeat of the Anubis emblem.
        ctx!.arc(0, 0, s * 0.7, 0, tau); ctx!.stroke(); ctx!.beginPath();
        ctx!.moveTo(-s * 1.5, 0); ctx!.lineTo(-s * 0.4, 0); ctx!.lineTo(0, -s * 0.7); ctx!.lineTo(s * 0.4, s * 0.6); ctx!.lineTo(s * 0.8, 0); ctx!.lineTo(s * 1.5, 0);
      } else if (probe.kind === 1) {
        // Ma'at's feather: a tapered vane and central shaft.
        ctx!.moveTo(-s, s); ctx!.quadraticCurveTo(-s * 1.2, -s * 0.5, s, -s * 1.6); ctx!.quadraticCurveTo(s * 1.4, s * 0.5, -s, s);
        ctx!.moveTo(-s * 1.4, s * 1.4); ctx!.lineTo(s * 0.7, -s * 1.1);
        for (let k = 0; k < 3; k++) { const y = -s * 0.6 + k * s * 0.5; ctx!.moveTo(-y * 0.7, y); ctx!.lineTo(-s * 0.7, y - s * 0.15); }
      } else if (probe.kind === 2) {
        ctx!.moveTo(0, -s); ctx!.lineTo(s, s * 0.7); ctx!.lineTo(-s, s * 0.7); ctx!.closePath(); ctx!.moveTo(0, -s); ctx!.lineTo(s * 0.25, s * 0.7);
      } else {
        // A pair of balanced pans.
        ctx!.moveTo(0, -s); ctx!.lineTo(0, s); ctx!.moveTo(-s, -s * 0.5); ctx!.lineTo(s, -s * 0.5);
        for (const side of [-1, 1]) { const x = side * s * 0.8; ctx!.moveTo(x, -s * 0.5); ctx!.lineTo(x - s * 0.35, s * 0.35); ctx!.quadraticCurveTo(x, s * 0.8, x + s * 0.35, s * 0.35); ctx!.closePath(); }
        ctx!.moveTo(-s * 0.45, s); ctx!.lineTo(s * 0.45, s);
      }
      ctx!.stroke(); ctx!.restore();
    }
    function draw() {
      ctx!.setTransform(ratio, 0, 0, ratio, 0, 0); ctx!.clearRect(0, 0, width, height);
      const strength = palette.strength * (reduced ? 1 : clamp(entrance / config.entrance));
      const wash = ctx!.createRadialGradient(focus.x, focus.y, 10, focus.x, focus.y, Math.max(width * 0.48, height * 0.7));
      wash.addColorStop(0, rgba(palette.gold, palette.wash * strength)); wash.addColorStop(0.55, rgba(palette.green, palette.wash * 0.35 * strength)); wash.addColorStop(1, rgba(palette.gold, 0));
      ctx!.fillStyle = wash; ctx!.fillRect(0, 0, width, height); ctx!.lineWidth = 1;
      // Wide orbital routes connect the entire field to its guardian.
      for (let i = 0; i < 4; i++) {
        const radius = Math.max(height * (0.4 + i * 0.24), width * (0.14 + i * 0.12));
        ctx!.strokeStyle = rgba(i % 2 ? palette.green : palette.gold, (i === 0 ? 0.14 : 0.085) * strength); ctx!.setLineDash(i % 2 ? [2, 16] : []);
        ctx!.beginPath(); ctx!.ellipse(focus.x, focus.y, radius, radius * 0.65, -0.2, 0, tau); ctx!.stroke();
      }
      ctx!.setLineDash([]);
      for (let lane = 0; lane < (mobile ? 3 : 5); lane++) {
        const y = height * (0.13 + lane * 0.18), bend = Math.sin(ambientTime * 0.09 + lane) * 24;
        const start = { x: -40, y: y + 55 }, c1 = { x: width * 0.35, y: y - 100 + bend }, c2 = { x: width * 0.64, y: y + 120 - bend }, end = { x: width + 40, y: y - 35 };
        ctx!.strokeStyle = rgba(lane % 2 ? palette.green : palette.gold, 0.1 * strength);
        ctx!.beginPath(); ctx!.moveTo(start.x, start.y); ctx!.bezierCurveTo(c1.x, c1.y, c2.x, c2.y, end.x, end.y); ctx!.stroke();
        const t = (ambientTime * (0.022 + lane * 0.004) + lane * 0.213) % 1, u = 1 - t;
        const x = u ** 3 * start.x + 3 * u ** 2 * t * c1.x + 3 * u * t ** 2 * c2.x + t ** 3 * end.x;
        const py = u ** 3 * start.y + 3 * u ** 2 * t * c1.y + 3 * u * t ** 2 * c2.y + t ** 3 * end.y;
        ctx!.fillStyle = rgba(palette.green, 0.65 * strength); ctx!.beginPath(); ctx!.arc(x, py, 2.2, 0, tau); ctx!.fill();
      }
      const positions = probes.map((p) => ({ x: p.x * width + Math.sin(ambientTime * (0.13 + p.depth * 0.12) + p.phase) * config.drift * p.depth + p.dx, y: p.y * height + Math.cos(ambientTime * (0.09 + p.depth * 0.1) + p.phase) * config.drift * p.depth + p.dy }));
      for (let i = 0; i < probes.length; i++) {
        const probe = probes[i], point = positions[i];
        const near = Math.max(0, 1 - Math.hypot(point.x - pointer.x, point.y - pointer.y) / config.pointerRadius) * pointer.strength;
        glyph(probe, point.x, point.y, (0.16 + probe.depth * 0.25 + near * 0.42) * strength * (0.72 + activity * 0.28));
        // At most two local links per node; no all-to-all particle web.
        if (!mobile && i % 3 === 0) for (let j = i + 1; j < Math.min(i + 3, positions.length); j++) {
          const other = positions[j], distance = Math.hypot(point.x - other.x, point.y - other.y);
          if (distance > 160) continue;
          ctx!.strokeStyle = rgba(palette.gold, (1 - distance / 160) * 0.19 * strength); ctx!.beginPath(); ctx!.moveTo(point.x, point.y); ctx!.lineTo(other.x, other.y); ctx!.stroke();
        }
        if (near > 0.55 && i % 3 === 0) {
          ctx!.strokeStyle = rgba(palette.green, near * 0.2 * strength); ctx!.beginPath(); ctx!.moveTo(point.x, point.y); ctx!.quadraticCurveTo(point.x + 20, pointer.y, pointer.x, pointer.y); ctx!.stroke();
        }
      }
      for (let i = 1; i < trails.length; i++) {
        const a = trails[i - 1], b = trails[i];
        ctx!.strokeStyle = rgba(palette.green, (1 - b.age / config.trails.life) ** 2 * 0.25 * strength); ctx!.lineWidth = 1.2 * (1 - b.age / config.trails.life);
        ctx!.beginPath(); ctx!.moveTo(a.x, a.y); ctx!.lineTo(b.x, b.y); ctx!.stroke();
      }
      ctx!.lineWidth = 1;
      for (const r of ripples) {
        const p = clamp(r.age / config.ripples.life), radius = (mobile ? config.ripples.mobileRadius : config.ripples.radius) * (1 - (1 - p) ** 2);
        const opacity = Math.sin(Math.min(1, p * 7) * Math.PI / 2) * (1 - p) ** 1.6 * r.energy * strength;
        ctx!.strokeStyle = rgba(r.variant === 1 ? palette.green : palette.gold, opacity * 0.75); ctx!.setLineDash(r.variant === 2 ? [3, 12] : []);
        ctx!.beginPath(); ctx!.arc(r.x, r.y, radius, 0, tau); ctx!.stroke(); ctx!.setLineDash([]);
        ctx!.strokeStyle = rgba(palette.green, opacity * 0.3); ctx!.beginPath(); ctx!.arc(r.x, r.y, radius * 0.76, 0, tau); ctx!.stroke();
        if (r.variant !== 0) for (let k = 0; k < 4; k++) {
          const angle = k * Math.PI / 2 + r.variant * Math.PI / 4;
          ctx!.fillStyle = rgba(palette.gold, opacity * 0.7); ctx!.fillRect(r.x + Math.cos(angle) * radius - 1.5, r.y + Math.sin(angle) * radius - 1.5, 3, 3);
        }
      }
      for (const s of sparks) { ctx!.strokeStyle = rgba(palette.green, (1 - s.age / config.sparks.life) ** 2 * 0.75 * strength); ctx!.beginPath(); ctx!.moveTo(s.x, s.y); ctx!.lineTo(s.x - s.vx * 0.045, s.y - s.vy * 0.045); ctx!.stroke(); }
      // Fade everything behind copy and at the edges, including user waves.
      ctx!.save(); ctx!.globalCompositeOperation = "destination-out";
      if (quiet) {
        ctx!.save(); ctx!.translate(quiet.x + quiet.width / 2, quiet.y + quiet.height / 2); ctx!.scale(quiet.width * 0.8, quiet.height * 0.85);
        const mask = ctx!.createRadialGradient(0, 0, 0.2, 0, 0, 1); mask.addColorStop(0, "rgba(0,0,0,.96)"); mask.addColorStop(0.65, "rgba(0,0,0,.88)"); mask.addColorStop(1, "rgba(0,0,0,0)"); ctx!.fillStyle = mask; ctx!.fillRect(-1, -1, 2, 2); ctx!.restore();
      }
      const edge = Math.min(config.edgeFade, width * 0.09);
      for (const [x0, y0, x1, y1, x, y, w, h] of [[0, 0, edge, 0, 0, 0, edge, height], [width, 0, width - edge, 0, width - edge, 0, edge, height], [0, 0, 0, edge, 0, 0, width, edge], [0, height, 0, height - edge, 0, height - edge, width, edge]]) {
        const mask = ctx!.createLinearGradient(x0, y0, x1, y1); mask.addColorStop(0, "black"); mask.addColorStop(1, "transparent"); ctx!.fillStyle = mask; ctx!.fillRect(x, y, w, h);
      }
      ctx!.restore();
    }
    function tick(timestamp: number) {
      raf = 0;
      const fps = mobile ? config.fps.mobile : time - lastActivity > config.idleAfter ? config.fps.idle : config.fps.active;
      const elapsed = previous ? (timestamp - previous) / 1000 : 1 / fps;
      if (elapsed + 0.0001 < 1 / fps) { raf = requestAnimationFrame(tick); return; }
      const dt = Math.min(elapsed, 0.05); previous = timestamp; time += dt; entrance += dt;
      const smooth = 1 - Math.exp(-dt * 6);
      activity += ((time - lastActivity > config.idleAfter ? config.idleStrength : 1) - activity) * smooth;
      ambientTime += dt * (0.5 + activity * 0.5);
      pointer.strength += ((pointer.active ? activity : 0) - pointer.strength) * smooth;
      for (const probe of probes) {
        const x = probe.x * width, y = probe.y * height, dx = x - pointer.x, dy = y - pointer.y, distance = Math.hypot(dx, dy);
        const force = (1 - clamp(distance / config.pointerRadius)) ** 2 * config.displacement * pointer.strength;
        let tx = dx / Math.max(1, distance) * force * probe.depth, ty = dy / Math.max(1, distance) * force * probe.depth;
        for (const r of ripples) {
          const rx = x - r.x, ry = y - r.y, d = Math.hypot(rx, ry), p = r.age / config.ripples.life;
          const radius = (mobile ? config.ripples.mobileRadius : config.ripples.radius) * (1 - (1 - p) ** 2);
          const wave = (1 - clamp(Math.abs(d - radius) / 45)) * (1 - p) * 15 * r.energy;
          tx += rx / Math.max(1, d) * wave; ty += ry / Math.max(1, d) * wave;
        }
        probe.dx += (tx - probe.dx) * smooth; probe.dy += (ty - probe.dy) * smooth;
      }
      const before = ripples.length + sparks.length + trails.length;
      for (const r of ripples) r.age += dt;
      for (const t of trails) t.age += dt;
      for (const s of sparks) { s.age += dt; s.x += s.vx * dt; s.y += s.vy * dt; const damping = Math.exp(-dt * 2.4); s.vx *= damping; s.vy *= damping; }
      ripples = ripples.filter((r) => r.age < config.ripples.life); sparks = sparks.filter((s) => s.age < config.sparks.life); trails = trails.filter((t) => t.age < config.trails.life);
      if (before !== ripples.length + sparks.length + trails.length) counts();
      const nextState = state();
      if (canvas!.dataset.state !== nextState) canvas!.dataset.state = nextState;
      draw(); raf = requestAnimationFrame(tick);
    }
    function sync() {
      // A persisted pause can arrive before the entrance has painted a frame.
      if (pauseRef.current && entrance < 0.1) entrance = config.entrance;
      stop(); canvas!.dataset.state = state();
      if (!visible || hidden || reduced || pauseRef.current) { draw(); return; }
      raf = requestAnimationFrame(tick);
    }
    syncRef.current = sync;
    function resize() {
      const box = host!.getBoundingClientRect(); width = Math.max(1, box.width); height = Math.max(1, box.height); mobile = width < config.mobileWidth;
      ratio = Math.min(window.devicePixelRatio || 1, config.pixelRatio, Math.sqrt(config.pixelBudget / (width * height)));
      canvas!.width = Math.round(width * ratio); canvas!.height = Math.round(height * ratio); canvas!.dataset.dpr = ratio.toFixed(3);
      const anchor = anchorSelector ? host!.querySelector(anchorSelector)?.getBoundingClientRect() : null;
      focus = anchor ? { x: anchor.left - box.left + anchor.width / 2, y: anchor.top - box.top + anchor.height / 2 } : { x: width * 0.72, y: height * 0.5 };
      const copy = quietSelector ? host!.querySelector(quietSelector)?.getBoundingClientRect() : null;
      quiet = copy ? { x: copy.left - box.left, y: copy.top - box.top, width: copy.width, height: copy.height } : null;
      let seed: number = config.seed;
      const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
      const count = mobile ? config.particles.mobile : clamp(Math.round(width * height / config.densityArea), config.particles.min, config.particles.max);
      const columns = Math.max(3, Math.round(Math.sqrt(count * width / height))), rows = Math.ceil(count / columns);
      probes = Array.from({ length: count }, (_, i) => ({ x: ((i % columns) + 0.18 + random() * 0.64) / columns, y: (Math.floor(i / columns) + 0.18 + random() * 0.64) / rows, phase: random() * tau, depth: 0.3 + random() * 0.7, kind: i % 4, size: 4 + random() * (mobile ? 5 : 8), dx: 0, dy: 0 }));
      canvas!.dataset.probes = String(count); sync();
    }
    const point = (e: PointerEvent) => { const box = host!.getBoundingClientRect(); return { x: e.clientX - box.left, y: e.clientY - box.top }; };
    const excluded = (target: EventTarget | null) => target instanceof Element && (!!target.closest(controls) || !!(quietSelector && target.closest(quietSelector)));
    const interactive = () => !reduced && !pauseRef.current && visible && !hidden;
    function move(e: PointerEvent) {
      const p = point(e);
      if (down && e.pointerId === down.id && Math.hypot(p.x - down.x, p.y - down.y) > config.tap.distance) down.moved = true;
      if (e.pointerType === "touch" || !interactive()) return;
      pointer.x = p.x; pointer.y = p.y; pointer.active = !excluded(e.target); lastActivity = time;
      const last = trails.at(-1);
      if (pointer.active && time - lastTrail > 0.035 && (!last || Math.hypot(p.x - last.x, p.y - last.y) > config.trails.spacing)) {
        trails.push({ ...p, age: 0 }); trails = trails.slice(-(mobile ? config.trails.mobile : config.trails.max)); lastTrail = time; counts();
      }
    }
    function press(e: PointerEvent) {
      if (e.button !== 0 || !e.isPrimary || !interactive() || excluded(e.target)) return;
      down = { ...point(e), id: e.pointerId, at: performance.now(), moved: false };
    }
    function release(e: PointerEvent) {
      const start = down; down = null;
      if (!start || start.id !== e.pointerId || start.moved || !interactive() || excluded(e.target) || performance.now() - start.at > config.tap.duration) return;
      const p = point(e); if (Math.hypot(p.x - start.x, p.y - start.y) > config.tap.distance) return;
      const previousActivity = lastActivity; lastActivity = time;
      const nearby = ripples.find((r) => r.age < 0.22 && Math.hypot(r.x - p.x, r.y - p.y) < 45);
      if (nearby) nearby.energy = Math.min(1.4, nearby.energy + 0.15);
      else ripples.push({ ...p, age: 0, energy: 1, variant: (Math.floor(p.x / 180) + Math.floor(p.y / 180) + (time - previousActivity < 0.4 ? 1 : 0)) % 3 });
      ripples = ripples.slice(-(mobile ? config.ripples.mobile : config.ripples.max));
      for (let i = 0; i < config.sparks.perTap; i++) { const angle = tau * i / config.sparks.perTap + time; sparks.push({ ...p, age: 0, vx: Math.cos(angle) * (35 + i * 3), vy: Math.sin(angle) * (35 + i * 3) }); }
      sparks = sparks.slice(-(mobile ? config.sparks.mobile : config.sparks.max)); counts();
    }
    host.addEventListener("pointermove", move, options); host.addEventListener("pointerdown", press, options); host.addEventListener("pointerup", release, options);
    host.addEventListener("pointerleave", () => { pointer.active = false; down = null; }, options); host.addEventListener("pointercancel", () => { down = null; pointer.active = false; }, options);
    document.addEventListener("visibilitychange", () => { hidden = document.hidden; down = null; pointer.active = false; sync(); }, { signal: abort.signal });
    media.addEventListener("change", () => { reduced = media.matches; ripples = []; sparks = []; trails = []; pointer.strength = 0; pointer.active = false; counts(); sync(); }, { signal: abort.signal });
    const theme = () => { palette = config.palettes[document.documentElement.dataset.theme === "light" ? "light" : "dark"]; canvas.dataset.theme = document.documentElement.dataset.theme === "light" ? "light" : "dark"; draw(); };
    const themeObserver = new MutationObserver(theme); themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (!visible) { pointer.active = false; down = null; } sync(); }, { threshold: 0 });
    const observer = new ResizeObserver(resize); observer.observe(host);
    window.addEventListener("resize", resize, options);
    void document.fonts.ready.then(() => { if (!abort.signal.aborted) resize(); });
    intersection.observe(host); theme(); resize(); counts();
    return () => { stop(); abort.abort(); observer.disconnect(); intersection.disconnect(); themeObserver.disconnect(); syncRef.current = null; };
  }, [quietSelector, anchorSelector]);

  useEffect(() => { pauseRef.current = paused; syncRef.current?.(); }, [paused]);
  return <canvas ref={canvasRef} className="hero-atmosphere" aria-hidden="true" />;
}
