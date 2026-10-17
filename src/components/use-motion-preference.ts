"use client";

import { useSyncExternalStore } from "react";

const query = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const preference = window.matchMedia(query);
  preference.addEventListener("change", onChange);
  return () => preference.removeEventListener("change", onChange);
}

function snapshot() {
  return window.matchMedia(query).matches;
}

function serverSnapshot() {
  return false;
}

/** Stable server/hydration snapshot, then reactive device preference updates. */
export function useMotionPreference() {
  return useSyncExternalStore(subscribe, snapshot, serverSnapshot);
}
