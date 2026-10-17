"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "dark" | "light";
const ThemeContext = createContext<{ theme: Theme; toggle: () => void } | null>(null);
const storageKey = "anubiswatch-theme";
function storedTheme(): Theme | null {
  try { const value = localStorage.getItem(storageKey); return value === "dark" || value === "light" ? value : null; }
  catch { return null; }
}
function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme === "light" ? "#faf8f1" : "#0b0d0c");
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const explicit = useRef<Theme | null>(null);
  useEffect(() => {
    const device = window.matchMedia("(prefers-color-scheme: light)");
    const update = (value: Theme) => { applyTheme(value); setTheme(value); };
    explicit.current = storedTheme();
    update(explicit.current ?? (device.matches ? "light" : "dark"));
    const onDevice = () => { if (!explicit.current) update(device.matches ? "light" : "dark"); };
    const onStorage = (event: StorageEvent) => {
      if (event.key !== storageKey && event.key !== null) return;
      explicit.current = storedTheme();
      update(explicit.current ?? (device.matches ? "light" : "dark"));
    };
    device.addEventListener("change", onDevice);
    window.addEventListener("storage", onStorage);
    return () => { device.removeEventListener("change", onDevice); window.removeEventListener("storage", onStorage); };
  }, []);
  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    explicit.current = next;
    applyTheme(next);
    setTheme(next);
    try { localStorage.setItem(storageKey, next); } catch { /* The current session still supports switching. */ }
  }
  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>;
}

export function ThemeToggle() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("ThemeToggle requires ThemeProvider");
  const label = context.theme === "dark" ? "Switch to light theme" : "Switch to dark theme";
  return <button className="theme-toggle" onClick={context.toggle} aria-label={label} title={label}>{context.theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}<span className="sr-only">{label}</span></button>;
}
