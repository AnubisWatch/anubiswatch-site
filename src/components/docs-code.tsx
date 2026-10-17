"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Check, Copy } from "lucide-react";

export function DocsCode({ code, language, children }: { code: string; language: string; children: ReactNode }) {
  const [state, setState] = useState<"idle" | "copied" | "error">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  async function copy() {
    if (timer.current) clearTimeout(timer.current);
    try { await navigator.clipboard.writeText(code); setState("copied"); }
    catch { setState("error"); }
    timer.current = setTimeout(() => setState("idle"), 3000);
  }
  return <div className="docs-code"><div className="docs-code-bar"><span>{language === "text" ? "EXAMPLE" : language.toUpperCase()}</span><button onClick={copy} aria-label="Copy code example">{state === "copied" ? <Check size={15} /> : <Copy size={15} />}{state === "copied" ? "Copied" : "Copy"}</button></div><pre tabIndex={0} aria-label={language + " code example"}>{children}</pre><span role="status" className={state === "error" ? "docs-copy-error" : "sr-only"}>{state === "error" ? "Clipboard unavailable. Select and copy the code example." : state === "copied" ? "Code copied to clipboard" : ""}</span></div>;
}
