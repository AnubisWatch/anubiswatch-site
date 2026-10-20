"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, LoaderCircle, Search, X } from "lucide-react";


type SearchEntry = { slug: string; title: string; headings: string; text: string; href: string };

export function DocsSearch() {

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [entries, setEntries] = useState<SearchEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [active, setActive] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const cached = useRef<SearchEntry[] | null>(null);

  useEffect(() => {
    const keyboard = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const editable = target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName);
      if (((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") || (event.key === "/" && !editable)) {
        event.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener("keydown", keyboard);
    return () => document.removeEventListener("keydown", keyboard);
  }, []);

  useEffect(() => {
    if (open) {
      if (!dialog.current?.open) dialog.current?.showModal();
      input.current?.focus();
    } else if (dialog.current?.open) dialog.current.close();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (cached.current) { setEntries(cached.current); return; }
    const controller = new AbortController();
    setLoading(true);
    setError(false);
    fetch("/docs-search.json", { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Search index unavailable");
        const data: unknown = await response.json();
        if (!Array.isArray(data) || !data.length || !data.every((entry) => typeof entry.title === "string" && typeof entry.text === "string" && typeof entry.headings === "string" && typeof entry.href === "string" && entry.href.startsWith("/docs/"))) throw new Error("Invalid search index");
        if (!controller.signal.aborted) { cached.current = data; setEntries(data); setLoading(false); }
      })
      .catch(() => { if (!controller.signal.aborted) { setError(true); setLoading(false); } });
    return () => controller.abort();
  }, [open, attempt]);

  const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const results = entries
    .map((entry) => {
      const title = entry.title.toLowerCase();
      const headings = entry.headings.toLowerCase();
      const haystack = title + " " + headings + " " + entry.text.toLowerCase();
      return { ...entry, score: words.reduce((sum, word) => sum + (title.includes(word) ? 20 : headings.includes(word) ? 5 : 1), 0), match: words.every((word) => haystack.includes(word)) };
    })
    .filter((entry) => entry.match)
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
    .slice(0, 8);

  function navigate(href: string) { setOpen(false); window.location.assign(href); }
  useEffect(() => {
    if (open && !loading && !error) dialog.current?.querySelector<HTMLElement>('[aria-selected="true"]')?.scrollIntoView({ block: "nearest" });
  }, [open, active, query, loading, error]);
  return <>
    <button className="docs-search-trigger" onClick={() => setOpen(true)} aria-label="Search documentation"><Search size={18} /><span>Search documentation</span><kbd>Ctrl K</kbd></button>
    <dialog ref={dialog} className="docs-search-dialog" aria-labelledby="docs-search-title" onClose={() => setOpen(false)} onCancel={() => setOpen(false)} onClick={(event) => { if (event.target === dialog.current) setOpen(false); }}>
      <div className="docs-search-content">
        <div className="docs-search-heading"><h2 id="docs-search-title">Search the hall</h2><button aria-label="Close search" onClick={() => setOpen(false)}><X size={20} /></button></div>
        <div className="docs-search-input"><Search size={20} /><label htmlFor="docs-search-query" className="sr-only">Search documentation</label><input id="docs-search-query" ref={input} role="combobox" aria-autocomplete="list" aria-expanded={open} aria-controls="docs-search-results" aria-activedescendant={results[active] ? "docs-result-" + active : undefined} value={query} placeholder="Try “TLS”, “cluster secret” or “MCP”…" onChange={(event) => { setQuery(event.target.value); setActive(0); }} onKeyDown={(event) => {
          if (event.key === "ArrowDown" && results.length) { event.preventDefault(); setActive((index) => (index + 1) % results.length); }
          if (event.key === "ArrowUp" && results.length) { event.preventDefault(); setActive((index) => (index - 1 + results.length) % results.length); }
          if (event.key === "Enter" && results[active]) { event.preventDefault(); navigate(results[active].href); }
        }} /></div>
        <div role="status" className="docs-search-status">{loading ? <><LoaderCircle className="docs-loading-icon" size={16} />Loading documentation…</> : error ? <><span>Search could not load. Your documentation pages are still available.</span><button onClick={() => setAttempt((value) => value + 1)}>Retry search</button></> : query && !results.length ? "No pages match your search. Try another term." : query ? results.length + " matching pages" : "Search guides, configuration fields and command examples."}</div>
        <div id="docs-search-results" role="listbox" aria-label="Documentation results" className="docs-search-results">{!loading && !error && results.map((entry, index) => {
          const position = words.length ? entry.text.toLowerCase().indexOf(words[0]) : 0;
          const start = Math.max(0, position - 35);
          const excerpt = entry.text.slice(start, start + 155);
          return <a key={entry.slug} id={"docs-result-" + index} role="option" aria-selected={index === active} tabIndex={-1} href={entry.href} onMouseEnter={() => setActive(index)} onClick={(event) => { event.preventDefault(); navigate(entry.href); }}><span><strong>{entry.title}</strong><small>{start ? "…" : ""}{excerpt}…</small></span><ArrowRight size={18} /></a>;
        })}</div>
        <div className="docs-search-help"><span><kbd>↑</kbd><kbd>↓</kbd> select · <kbd>Enter</kbd> open</span><span><kbd>Esc</kbd> close</span></div>
      </div>
    </dialog>
  </>;
}
