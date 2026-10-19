"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";

export function OxogStudio() {
  const ref = useRef<HTMLAnchorElement>(null);
  const [visible, setVisible] = useState(false);
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setVisible(entry.isIntersecting);
    });
    const visibility = () => setHidden(document.hidden);
    visibility();
    document.addEventListener("visibilitychange", visibility);
    if (ref.current) observer.observe(ref.current);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", visibility); };
  }, []);
  return <section id="studio" aria-label="The studio behind AnubisWatch">
    <a ref={ref} href="https://oxog.net" className="oxog-studio" aria-label="Meet oxog.net" data-visible={visible} data-page-hidden={hidden}>
      <svg className="oxog-mark" viewBox="0 0 200 130" fill="none" aria-hidden="true">
        <path d="M93 56 72 35C49 13 14 24 9 53 3 84 23 104 46 103" stroke="#ed0878" strokeWidth="12" />
        <path d="M146 25c24-7 45 10 47 34 3 26-16 46-39 44-14-1-24-11-41-27" stroke="#ed0878" strokeWidth="12" />
        <path d="M76 18c30-20 75 1 77 40 1 12-1 24-6 33M53 36c-19 41 14 84 50 79 9-1 16-3 22-7" stroke="var(--oxog-purple)" strokeWidth="15" strokeLinecap="round" />
        <path d="m74 87 54-51" stroke="#ed0878" strokeWidth="12" strokeLinecap="square" />
      </svg>
      <div className="oxog-copy"><span className="oxog-eyebrow">PART OF A BIGGER PICTURE</span><h2>Small studio. <span>Big ideas.</span></h2><p>Explore the tools and infrastructure from Oxog.</p></div>
      <span className="oxog-studio-link">Meet oxog.net <ArrowUpRight size={18} /></span>
    </a>
  </section>;
}
