"use client";

import { useSyncExternalStore } from "react";
import { Pause, Play } from "lucide-react";
import { useMotionPreference } from "./use-motion-preference";

const key = "anubiswatch-motion-paused";
const changed = "anubiswatch:motion-change";
let sessionPaused = false;
let sessionOverride = false;
function snapshot() {
  if (sessionOverride) return sessionPaused;
  try { sessionPaused = localStorage.getItem(key) === "true"; } catch { /* Keep the session choice. */ }
  return sessionPaused;
}
function subscribe(notify: () => void) {
  const storage = (event: StorageEvent) => { if (event.key === key || event.key === null) { sessionOverride = false; notify(); } };
  window.addEventListener(changed, notify);
  window.addEventListener("storage", storage);
  return () => { window.removeEventListener(changed, notify); window.removeEventListener("storage", storage); };
}
function select(paused: boolean) {
  sessionPaused = paused;
  sessionOverride = true;
  try { localStorage.setItem(key, String(paused)); sessionOverride = false; } catch { /* Keep the session override when writes fail. */ }
  window.dispatchEvent(new Event(changed));
}
export function useMotionControl(): readonly [boolean, (paused: boolean) => void] {
  return [useSyncExternalStore(subscribe, snapshot, () => false), select];
}
export function MotionToggle() {
  const [paused, setPaused] = useMotionControl();
  const reduced = useMotionPreference();
  const label = reduced ? "Motion reduced by device settings" : paused ? "Resume animations" : "Pause animations";
  return <button className="motion-toggle" onClick={() => setPaused(!paused)} aria-pressed={paused} disabled={reduced} aria-label={label} title={label}>{paused || reduced ? <Play size={13} /> : <Pause size={13} />}<span>Motion</span></button>;
}
