"use client";

import { useEffect, useState } from "react";
import type { DocHeading } from "@/lib/docs";

export function DocsToc({ headings }: { headings: DocHeading[] }) {
  const items = headings.length > 24 ? headings.filter((heading) => heading.level === 2) : headings;
  const [active, setActive] = useState(items[0]?.id ?? "");
  useEffect(() => {
    setActive(items[0]?.id ?? "");
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id);
    }, { rootMargin: "-15% 0px -65% 0px" });
    for (const item of items) {
      const element = document.getElementById(item.id);
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, [headings]);
  return <aside className="docs-toc"><nav aria-label="On this page"><span>ON THIS PAGE</span>{items.map((heading) => <a key={heading.id} href={"#" + heading.id} className={heading.level === 3 ? "docs-toc-nested" : ""} aria-current={active === heading.id ? "location" : undefined}>{heading.title}</a>)}</nav><a className="docs-toc-top" href="#docs-main">Back to top ↑</a></aside>;
}
