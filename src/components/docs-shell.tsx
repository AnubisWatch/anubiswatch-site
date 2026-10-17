"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, ArrowUpRight, BookOpen, ChevronDown, Menu, X } from "lucide-react";
import { docCatalog, docGroups, docHref } from "@/lib/docs-catalog";
import { DocsSearch } from "./docs-search";

export function DocsShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => { setMobileOpen(false); }, [pathname]);
  function navigation(mobile = false) {
    return <nav aria-label={mobile ? "Mobile documentation" : "Documentation sidebar"}>{docGroups.map((group) => <div className="docs-nav-group" key={group}><h2>{group}</h2>{docCatalog.filter((doc) => doc.group === group).map((doc) => <Link key={doc.slug} href={docHref(doc.slug)} aria-current={pathname.replace(/\/$/, "") === docHref(doc.slug).replace(/\/$/, "") ? "page" : undefined} onClick={() => setMobileOpen(false)}>{doc.title}</Link>)}</div>)}</nav>;
  }
  return <div className="docs-site">
    <a className="skip-link" href="#docs-main">Skip to documentation</a>
    <header className="docs-header"><div className="docs-container docs-header-inner"><Link href="/" className="brand" aria-label="AnubisWatch home"><img src="/images/anubis-logo.svg" width="44" height="44" alt="" /><span>Anubis<span className="brand-light">Watch</span></span></Link><span className="docs-header-label"><BookOpen size={16} />DOCUMENTATION</span><DocsSearch /><a className="docs-source-link" href="https://github.com/AnubisWatch/AnubisWatch">GitHub <ArrowUpRight size={15} /></a><button className="docs-mobile-toggle" aria-label={mobileOpen ? "Close documentation menu" : "Open documentation menu"} aria-controls="docs-mobile-menu" aria-expanded={mobileOpen} onClick={() => setMobileOpen(!mobileOpen)}>{mobileOpen ? <X size={22} /> : <Menu size={22} />}</button></div></header>
    <div className="docs-mobile-bar"><span><BookOpen size={15} /> Documentation</span><button onClick={() => setMobileOpen(!mobileOpen)} aria-expanded={mobileOpen} aria-controls="docs-mobile-menu">Browse guides <ChevronDown size={15} /></button></div>
    {mobileOpen && <div id="docs-mobile-menu" className="docs-mobile-menu">{navigation(true)}</div>}
    <div className="docs-container docs-workspace"><aside className="docs-sidebar"><Link className="docs-back-home" href="/"><ArrowLeft size={15} /> Back to the watch</Link>{navigation()}<span className="docs-sidebar-footnote">THE JUDGMENT NEVER SLEEPS.</span></aside><main id="docs-main" className="docs-reading">{children}</main></div>
    <footer className="docs-container docs-footer"><Link href="/">AnubisWatch</Link><span>Open source · Apache 2.0</span><a href="https://github.com/AnubisWatch/AnubisWatch/issues">Questions? Open an issue <ArrowUpRight size={14} /></a></footer>
  </div>;
}
