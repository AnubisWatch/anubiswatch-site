"use client";

import { useEffect, type Dispatch, type SetStateAction } from "react";

/** Non-modal navigation: focus enters the links and leaving the disclosure closes it. */
export function useNavigationMenu(open: boolean, setOpen: Dispatch<SetStateAction<boolean>>, id: string, desktopQuery: string) {
  useEffect(() => {
    if (!open) return;
    const panel = document.getElementById(id);
    if (!panel) return;
    const invoker = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const controls = `[aria-controls="${id}"]`;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const close = (restore = false) => {
      setOpen(false);
      if (restore && invoker?.getClientRects().length) invoker.focus({ preventScroll: true });
    };
    const outside = (event: Event) => {
      const target = event.target;
      if (target instanceof Element && !panel.contains(target) && !target.closest(controls)) close();
    };
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); close(true); }
    };
    const desktop = matchMedia(desktopQuery);
    const resize = () => { if (desktop.matches) close(); };
    document.addEventListener("keydown", keyboard);
    document.addEventListener("pointerdown", outside);
    document.addEventListener("focusin", outside);
    desktop.addEventListener("change", resize);
    panel.querySelector<HTMLElement>("a[href], button")?.focus({ preventScroll: true });
    resize();
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", keyboard);
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("focusin", outside);
      desktop.removeEventListener("change", resize);
    };
  }, [open, setOpen, id, desktopQuery]);
}
