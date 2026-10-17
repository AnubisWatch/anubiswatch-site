"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";

const projects = [
  { name: "AGEZT", description: "An agentic operating system" },
  { name: "WrongStack", description: "AI coding orchestration" },
  { name: "WrongTrace", description: "Agent observability" },
  { name: "UWAS", description: "Unified web app server" },
];

export function OxogStudio() {
  const ref = useRef<HTMLElement>(null);
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setRevealed(true); observer.disconnect(); }
    }, { threshold: .15 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return <section id="studio" ref={ref} className="oxog-studio motion-region" aria-label="The studio behind AnubisWatch">
    <a href="https://oxog.net" target="_blank" rel="noreferrer" className="oxog-symbol-link" aria-label="Visit OXOGNET">
      <svg className="oxog-mark" data-revealed={revealed} viewBox="0 0 200 130" fill="none" aria-hidden="true">
        <path pathLength="1" className="oxog-stroke oxog-pink" d="M93 56 72 35C49 13 14 24 9 53 3 84 23 104 46 103" strokeWidth="12" />
        <path pathLength="1" className="oxog-stroke oxog-pink" d="M146 25c24-7 45 10 47 34 3 26-16 46-39 44-14-1-24-11-41-27" strokeWidth="12" />
        <path pathLength="1" className="oxog-stroke oxog-purple" d="M76 18c30-20 75 1 77 40 1 12-1 24-6 33M53 36c-19 41 14 84 50 79 9-1 16-3 22-7" strokeWidth="15" strokeLinecap="round" />
        <path pathLength="1" className="oxog-stroke oxog-pink" d="m74 87 54-51" strokeWidth="12" strokeLinecap="square" />
      </svg>
    </a>
    <div className="oxog-copy"><p>AnubisWatch is built and maintained by</p><h2><a href="https://oxog.net" target="_blank" rel="noreferrer"><span className="oxog-wordmark">oxog<span>net</span><i>.</i></span><ArrowUpRight size={22} /></a></h2><p>A small studio in Estonia building AI agents, developer tools and the infrastructure behind them.</p><span className="oxog-origin">Made in Estonia. Shipped worldwide.</span></div>
    <nav className="oxog-projects" aria-label="More from OXOGNET">{projects.map((project) => <a key={project.name} href="https://oxog.net/projects" target="_blank" rel="noreferrer"><span><strong>{project.name}</strong><small>{project.description}</small></span><ArrowUpRight size={16} /></a>)}</nav>
  </section>;
}
