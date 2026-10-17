"use client";

import { createContext, useContext, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Check, ChevronDown, Monitor, Moon, Sun } from "lucide-react";

type Theme = "dark" | "light";
type ThemePreference = Theme | "system";
const ThemeContext = createContext<{ preference: ThemePreference; select: (next: ThemePreference) => void } | null>(null);
const storageKey = "anubiswatch-theme";
function storedTheme(): ThemePreference {
  try { const value = localStorage.getItem(storageKey); return value === "dark" || value === "light" ? value : "system"; }
  catch { return "system"; }
}
function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme === "light" ? "#faf8f1" : "#0b0d0c");
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreference] = useState<ThemePreference>("system");
  const explicit = useRef<ThemePreference>("system");
  useEffect(() => {
    const device = window.matchMedia("(prefers-color-scheme: light)");
    const update = (value: ThemePreference) => { applyTheme(value === "system" ? (device.matches ? "light" : "dark") : value); setPreference(value); };
    explicit.current = storedTheme();
    update(explicit.current);
    const onDevice = () => { if (explicit.current === "system") update("system"); };
    const onStorage = (event: StorageEvent) => {
      if (event.key !== storageKey && event.key !== null) return;
      explicit.current = storedTheme();
      update(explicit.current);
    };
    device.addEventListener("change", onDevice);
    window.addEventListener("storage", onStorage);
    return () => { device.removeEventListener("change", onDevice); window.removeEventListener("storage", onStorage); };
  }, []);
  function select(next: ThemePreference) {
    explicit.current = next;
    applyTheme(next === "system" ? (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark") : next);
    setPreference(next);
    try { localStorage.setItem(storageKey, next); } catch { /* The current session still supports switching. */ }
  }
  return <ThemeContext.Provider value={{ preference, select }}>{children}</ThemeContext.Provider>;
}

const choices = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

export function ThemeToggle() {
  const context = useContext(ThemeContext);
  const [open, setOpen] = useState(false);
  const picker = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const id = useId();
  useEffect(() => {
    if (!open) return;
    picker.current?.querySelector<HTMLInputElement>("input:checked")?.focus();
    function dismiss(event: PointerEvent | FocusEvent) {
      if (event.target instanceof Node && !picker.current?.contains(event.target)) setOpen(false);
    }
    function escape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setOpen(false);
      trigger.current?.focus();
    }
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("focusin", dismiss);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("focusin", dismiss);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);
  if (!context) throw new Error("ThemeToggle requires ThemeProvider");
  const current = choices.find((choice) => choice.value === context.preference)!;
  const Icon = current.icon;
  return <div className="theme-picker" ref={picker}>
    <button type="button" className="theme-trigger" ref={trigger} aria-label={"Color theme: " + current.label} aria-expanded={open} aria-haspopup="dialog" aria-controls={id} onClick={() => setOpen(!open)}><Icon aria-hidden="true" /><span>{current.label}</span><ChevronDown className="theme-chevron" aria-hidden="true" /></button>
    {open && <div id={id} className="theme-panel" role="dialog" aria-label="Appearance">
      <div className="theme-panel-heading"><strong>Appearance</strong><span>Your space, your style.</span></div>
      <fieldset className="theme-options"><legend className="sr-only">Color theme</legend>{choices.map(({ value, label, icon: ChoiceIcon }) => <label className="theme-option" key={value}>
        <input type="radio" name={id + "-theme"} value={value} checked={context.preference === value} onChange={() => context.select(value)} />
        <span className={"theme-preview theme-preview-" + value} aria-hidden="true"><span className="theme-preview-window"><span className="theme-preview-sidebar" /><span className="theme-preview-content"><i /><i /><i /></span></span><span className="theme-choice-icon"><ChoiceIcon /></span><span className="theme-choice-check"><Check /></span></span>
        <span className="theme-option-label">{label}</span>
      </label>)}</fieldset>
      <p className="theme-panel-status" aria-live="polite"><Icon aria-hidden="true" />{context.preference === "system" ? "Matches your device’s appearance." : current.label + " mode, just how you like it."}</p>
    </div>}
  </div>;
}
