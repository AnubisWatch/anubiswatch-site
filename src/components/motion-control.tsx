"use client";

import { useSyncExternalStore } from "react";
import { Mouse, MouseOff } from "lucide-react";
import { useMotionPreference } from "./use-motion-preference";

const key = "anubiswatch-background-motion";
const changed = "anubiswatch:background-motion-change";
let sessionChoice: "on" | "off" | null = null;
let sessionOverride = false;
function snapshot() {
  if (sessionOverride) return sessionChoice;
  try { const value = localStorage.getItem(key); sessionChoice = value === "on" || value === "off" ? value : null; } catch { /* Keep the session choice. */ }
  return sessionChoice;
}
function subscribe(notify: () => void) {
  const storage = (event: StorageEvent) => { if (event.key === key || event.key === null) { sessionOverride = false; notify(); } };
  window.addEventListener(changed, notify);
  window.addEventListener("storage", storage);
  return () => { window.removeEventListener(changed, notify); window.removeEventListener("storage", storage); };
}
function select(paused: boolean) {
  sessionChoice = paused ? "off" : "on";
  sessionOverride = true;
  try { localStorage.setItem(key, sessionChoice); sessionOverride = false; } catch { /* Keep the session override when writes fail. */ }
  window.dispatchEvent(new Event(changed));
}
/** The device supplies the default; an explicit choice affects only mouse effects. */
export function useMotionControl(): readonly [boolean, (paused: boolean) => void, boolean] {
  const choice = useSyncExternalStore(subscribe, snapshot, () => null);
  const reduced = useMotionPreference();
  return [choice === null ? reduced : choice === "off", select, choice === null];
}
export function MotionToggle() {
  const [paused, setPaused] = useMotionControl();
  const label = paused ? "Enable mouse effects" : "Disable mouse effects";
  return <button type="button" className="motion-toggle background-toggle" onClick={() => setPaused(!paused)} aria-pressed={!paused} aria-label={label} title={label}>{paused ? <MouseOff size={20} aria-hidden="true" /> : <Mouse size={20} aria-hidden="true" />}</button>;
}
