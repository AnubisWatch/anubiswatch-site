"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { motion, MotionConfig, useReducedMotion } from "motion/react";
import { Activity, ArrowDown, ArrowRight, ArrowUpRight, Bell, Check, CheckCheck, ChevronDown, Code2, Copy, Crown, Feather, Gavel, Globe2, HeartPulse, Layers3, Mail, Menu, Network, Radio, Scale, ScrollText, Server, ShieldCheck, Terminal, TriangleAlert, X, Zap, type LucideIcon } from "lucide-react";
import { channels, DOCS, installCommands, protocols, questions, RELEASES, REPO, steps } from "@/lib/content";

const icons: Record<string, LucideIcon> = { globe: Globe2, server: Server, radio: Radio, activity: Activity, mail: Mail, layers: Layers3, shield: ShieldCheck, scroll: ScrollText, scale: Scale, gavel: Gavel, bell: Bell };
const sampleServices = [
  { name: "Production API", target: "api.example.com/health", type: "HTTP", latency: "42 ms" },
  { name: "Primary database", target: "db.internal:5432", type: "TCP", latency: "8 ms" },
  { name: "Realtime gateway", target: "wss://stream.example.com", type: "WS", latency: "27 ms" },
  { name: "Domain certificate", target: "example.com:443", type: "TLS", latency: "16 ms" },
];

function Github({ size = 16 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.55.1.76-.24.76-.54v-2.07c-3.1.68-3.75-1.31-3.75-1.31-.51-1.29-1.23-1.64-1.23-1.64-1.01-.69.08-.68.08-.68 1.11.08 1.69 1.14 1.69 1.14.99 1.69 2.59 1.2 3.23.92.1-.72.39-1.2.7-1.48-2.48-.28-5.08-1.24-5.08-5.52 0-1.22.43-2.21 1.14-2.99-.12-.28-.5-1.42.11-2.96 0 0 .94-.3 3.05 1.14a10.62 10.62 0 0 1 5.54 0c2.11-1.44 3.05-1.14 3.05-1.14.61 1.54.23 2.68.11 2.96.71.78 1.14 1.77 1.14 2.99 0 4.29-2.61 5.23-5.1 5.51.4.35.75 1.02.75 2.06v3.07c0 .3.2.65.77.54A11.1 11.1 0 0 0 12 .9Z" /></svg>;
}

function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const reduced = useReducedMotion();
  return <motion.div className={className} initial={false} whileInView={reduced ? {} : { y: [16, 0] }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>{children}</motion.div>;
}

function Label({ children, number }: { children: ReactNode; number?: string }) {
  return <div className="eyebrow">{number && <span className="section-number">{number}</span>}<span className="tiny-diamond" />{children}</div>;
}

function Brand({ compact = false }: { compact?: boolean }) {
  return <a className="brand" href="#top" aria-label="AnubisWatch home"><img src="/images/anubis-logo.png" width="44" height="44" alt="" /><span>Anubis<span className="brand-light">Watch</span></span>{!compact && <span className="brand-separator" />}</a>;
}

function CopyButton({ value, label = "Copy command" }: { value: string; label?: string }) {
  const [state, setState] = useState<"idle" | "copied" | "error">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  async function copy() {
    if (timer.current) clearTimeout(timer.current);
    try {
      await navigator.clipboard.writeText(value);
      setState("copied");
    } catch {
      setState("error");
    }
    timer.current = setTimeout(() => setState("idle"), 3000);
  }
  return <span className="copy-wrapper"><button className={"copy-button " + (state === "copied" ? "copied" : "")} onClick={copy} aria-label={label} title={label}>{state === "copied" ? <Check size={16} /> : <Copy size={16} />}<span>{state === "copied" ? "Copied" : "Copy"}</span></button><span role="status" className={state === "error" ? "copy-error" : "sr-only"}>{state === "error" ? "Clipboard unavailable. Select and copy the command below." : state === "copied" ? "Command copied to clipboard" : ""}</span></span>;
}

function Tabs({ items, active, onChange, label, id }: { items: { id: string; label: string }[]; active: string; onChange: (id: string) => void; label: string; id: string }) {
  function onKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % items.length;
    else if (event.key === "ArrowLeft") next = (index - 1 + items.length) % items.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = items.length - 1;
    else return;
    event.preventDefault();
    onChange(items[next].id);
    document.getElementById(id + "-tab-" + items[next].id)?.focus();
  }
  return <div role="tablist" aria-label={label} className="tabs">{items.map((item, index) => <button key={item.id} id={id + "-tab-" + item.id} role="tab" aria-selected={item.id === active} aria-controls={id + "-panel"} tabIndex={item.id === active ? 0 : -1} onKeyDown={(e) => onKey(e, index)} onClick={() => onChange(item.id)} className={item.id === active ? "active" : ""}>{item.label}</button>)}</div>;
}

function Guardian() {
  return <div className="guardian" aria-hidden="true">
    <div className="guardian-aura" />
    <div className="orbit orbit-outer"><span className="orbit-mark">TRUTH · ORDER · BALANCE ·</span><span className="orbit-dot" /></div>
    <div className="orbit orbit-middle" /><div className="orbit orbit-inner" />
    <div className="guardian-axis axis-horizontal" /><div className="guardian-axis axis-vertical" />
    <span className="guardian-coordinate coordinate-top">ANUBIS / THE GUARDIAN</span>
    <span className="guardian-coordinate coordinate-left">30° N</span>
    <span className="guardian-coordinate coordinate-right">31° E</span>
    <img className="guardian-logo" src="/images/anubis-logo.png" width="400" height="400" alt="" fetchPriority="high" />
    <svg className="guardian-pulse" viewBox="0 0 600 90" fill="none"><path d="M0 46H163L178 46L190 30L200 63L214 10L229 80L246 27L258 46H600" stroke="currentColor" strokeWidth="1.5" /><path className="pulse-trace" d="M0 46H163L178 46L190 30L200 63L214 10L229 80L246 27L258 46H600" stroke="currentColor" strokeWidth="3" /></svg>
    <div className="guardian-caption"><span className="status-dot" />EVER VIGILANT<span className="caption-line" />EST. 2026</div>
    <span className="guardian-star star-one">✦</span><span className="guardian-star star-two">✧</span>
  </div>;
}

function Dashboard() {
  const [tab, setTab] = useState("overview");
  const [incident, setIncident] = useState(false);
  return <div className="dashboard-frame">
    <div className="window-bar"><div className="window-dots"><i /><i /><i /></div><span><ShieldCheck size={11} /> localhost:8443</span><span className="window-sample">INTERACTIVE PREVIEW</span></div>
    <div className="dashboard-body">
      <aside className="dashboard-sidebar"><img src="/images/anubis-logo.png" width="40" height="40" alt="" /><span className="sidebar-line" /><Activity size={18} /><Layers3 size={18} /><Bell size={18} /><Network size={18} /><span className="sidebar-spacer" /><ShieldCheck size={18} /></aside>
      <div className="dashboard-main">
        <div className="dashboard-top"><div><span className="mono dim">HALL OF MA’AT</span><h3>Your services, in balance.</h3></div><span className={"health-pill " + (incident ? "warning" : "")}><span className="status-dot" />{incident ? "Attention required" : "All systems operational"}</span></div>
        <Tabs id="dashboard" label="Dashboard preview" active={tab} onChange={setTab} items={[{ id: "overview", label: "Overview" }, { id: "souls", label: "Souls" }, { id: "incidents", label: "Incidents" }]} />
        <div id="dashboard-panel" role="tabpanel" aria-labelledby={"dashboard-tab-" + tab} tabIndex={0}>
          {tab === "overview" && <>
            <div className="dashboard-stats"><div><span>Healthy souls</span><strong>{incident ? "3" : "4"}<small> / 4</small></strong></div><div><span>Sample uptime</span><strong>{incident ? "99.91" : "99.99"}<small>%</small></strong></div><div><span>Avg. latency</span><strong>{incident ? "78" : "23"}<small> ms</small></strong></div><div><span>Active incidents</span><strong className={incident ? "text-warning" : "text-green"}>{incident ? "1" : "0"}</strong></div></div>
            <div className="chart-heading"><span>Response time <small> / last 24 hours</small></span><span className="chart-key"><i /> LATENCY</span></div>
            <div className="latency-chart"><div className="chart-grid"><span>100 ms</span><span>50 ms</span><span>0 ms</span></div><svg viewBox="0 0 900 120" preserveAspectRatio="none" role="img" aria-label={incident ? "Sample latency with a spike during an incident" : "Illustrative response time chart"}><defs><linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#52c78e" stopOpacity=".24" /><stop offset="1" stopColor="#52c78e" stopOpacity="0" /></linearGradient></defs><path d={incident ? "M0 92L45 90L85 85L130 90L175 81L225 88L275 78L320 85L365 88L410 74L455 84L505 86L550 82L590 80L620 15L655 9L690 26L720 20L755 45L800 52L850 48L900 50L900 120H0Z" : "M0 92L45 90L85 85L130 90L175 81L225 88L275 78L320 85L365 88L410 74L455 84L505 86L550 82L590 80L620 89L655 74L690 80L720 67L755 76L800 73L850 79L900 65L900 120H0Z"} fill="url(#chartFill)" /><path d={incident ? "M0 92L45 90L85 85L130 90L175 81L225 88L275 78L320 85L365 88L410 74L455 84L505 86L550 82L590 80L620 15L655 9L690 26L720 20L755 45L800 52L850 48L900 50" : "M0 92L45 90L85 85L130 90L175 81L225 88L275 78L320 85L365 88L410 74L455 84L505 86L550 82L590 80L620 89L655 74L690 80L720 67L755 76L800 73L850 79L900 65"} fill="none" stroke={incident ? "#d4af59" : "#52c78e"} strokeWidth="2" vectorEffect="non-scaling-stroke" /></svg><div className="chart-times"><span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>Now</span></div></div>
          </>}
          {tab !== "incidents" ? <div className="services-list">{sampleServices.map((s, index) => <div className="service-row" key={s.name}><span className={"service-icon " + (incident && index === 0 ? "warning" : "")}>{incident && index === 0 ? <TriangleAlert size={15} /> : <HeartPulse size={15} />}</span><div className="service-name"><strong>{s.name}</strong>{tab === "souls" && <small>{s.target}</small>}</div><span className="protocol-badge">{s.type}</span><div className="heatmap" role="img" aria-label={incident && index === 0 ? "Sample history includes a failure" : "Sample history is healthy"}>{Array.from({ length: 32 }, (_, i) => <i key={i} className={incident && index === 0 && i > 28 ? "failed" : (i + index * 3) % 13 === 0 ? "faint" : ""} />)}</div><span className="service-latency">{incident && index === 0 ? "241 ms" : s.latency}</span><span className={incident && index === 0 ? "service-state text-warning" : "service-state text-green"}>{incident && index === 0 ? "Degraded" : "Healthy"}</span></div>)}</div> : <div className="incident-panel">{incident ? <><TriangleAlert size={30} className="text-warning" /><h4>Production API is degraded</h4><p>Sample incident · Latency threshold exceeded</p><div className="incident-timeline"><span>Judgment recorded</span><ArrowRight size={14} /><span>Verdict reached</span><ArrowRight size={14} /><span>Slack notified</span></div></> : <><CheckCheck size={32} className="text-green" /><h4>Nothing disturbs the balance.</h4><p>No active sample incidents. Try simulating a failure below.</p></>}</div>}
        </div>
        <div className="dashboard-demo-footer"><span><span className="status-dot" /> Sample data · not a live monitor</span><button onClick={() => setIncident(!incident)} className={incident ? "restore-button" : ""}>{incident ? <Check size={13} /> : <Zap size={13} />}{incident ? "Restore service" : "Simulate an incident"}</button></div>
      </div>
    </div>
  </div>;
}

function Cluster() {
  const [active, setActive] = useState(0);
  const nodes = [{ name: "jackal-01", region: "EU WEST", role: "Pharaoh / Raft leader", location: "left" }, { name: "jackal-02", region: "US EAST", role: "Jackal / probe + controller", location: "right" }, { name: "jackal-03", region: "AP SOUTH", role: "Jackal / probe + controller", location: "bottom" }];
  return <div className="cluster-visual">
    <svg viewBox="0 0 480 240" className="cluster-links" aria-hidden="true"><path d="M105 75L365 75L240 205Z" fill="none" stroke="#5b5643" strokeWidth="1" strokeDasharray="4 6" /><path d="M105 75L365 75L240 205Z" className="cluster-flow" fill="none" stroke="#61c397" strokeWidth="1.5" strokeDasharray="3 65" /></svg>
    {nodes.map((node, index) => <button key={node.name} className={"cluster-node node-" + node.location + (active === index ? " selected" : "")} onClick={() => setActive(index)} aria-pressed={active === index} aria-label={node.name + ", " + node.region}><span className="node-core">{index === 0 ? <Crown size={23} /> : <Server size={23} />}</span><strong>{node.name}</strong><small>{node.region}</small></button>)}
    <span className="cluster-center"><Network size={22} /><span>RAFT<br />CONSENSUS</span></span>
    <div className="cluster-node-detail" role="status"><span className="status-dot" /><span>{nodes[active].name}</span><span>{nodes[active].role}</span></div>
  </div>;
}

function Install() {
  const [tab, setTab] = useState("binary");
  const [os, setOs] = useState<"linux" | "mac" | "windows">("linux");
  const command = tab === "binary" ? installCommands.binary[os] : tab === "docker" ? installCommands.docker : installCommands.source;
  return <section id="get-started" className="install-section section-shell">
    <Reveal className="install-copy"><Label number="06">SUMMON YOUR GUARDIAN</Label><h2>One binary.<br /><em>Endless vigilance.</em></h2><p>A dashboard, a storage engine and your monitoring stack. All in one place. Start small. Build your Necropolis when you’re ready.</p><a href={RELEASES} className="text-link">All release downloads <ArrowUpRight size={16} /></a><div className="install-note"><ShieldCheck size={18} /><span>Your infrastructure. Your data.<br /><strong>Always under your control.</strong></span></div></Reveal>
    <Reveal className="install-terminal"><div className="install-tabs-row"><Tabs id="install" label="Installation method" active={tab} onChange={setTab} items={[{ id: "binary", label: "Binary" }, { id: "docker", label: "Docker" }, { id: "source", label: "From source" }]} /><Terminal size={16} /></div>
      <div id="install-panel" role="tabpanel" aria-labelledby={"install-tab-" + tab} tabIndex={0}>
        <div className="terminal-controls">{tab === "binary" ? <div className="os-select" role="group" aria-label="Operating system">{([{ id: "linux", label: "Linux x64" }, { id: "mac", label: "macOS ARM64" }, { id: "windows", label: "Windows x64" }] as const).map((o) => <button key={o.id} aria-pressed={os === o.id} onClick={() => setOs(o.id)}>{o.label}</button>)}</div> : <span className="mono dim">{tab === "docker" ? "DOCKER / PERSISTENT VOLUME" : "LINUX / macOS · GO + NODE.JS"}</span>}<CopyButton value={command} label="Copy installation command" /></div>
        <pre className="install-code"><code>{command}</code></pre>
        <div className="terminal-result"><span className="text-green">✓</span><span>{tab === "docker" ? "Open localhost:8080 after the container starts." : "Open the dashboard URL printed in your terminal."}</span></div>
        <p className="terminal-help">{tab === "source" ? "The run script builds the binary and creates your initial configuration." : tab === "docker" ? "Replace the password before running. The data volume survives container restarts." : "init generates your local admin password. Check the release checksums before running."}</p>
      </div>
    </Reveal>
  </section>;
}

export function Landing() {
  const [menu, setMenu] = useState(false);
  const [protocol, setProtocol] = useState(0);
  const [step, setStep] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const reduced = useReducedMotion();
  const selectedProtocol = protocols[protocol];
  const ProtocolIcon = icons[selectedProtocol.icon];
  const selectedStep = steps[step];
  const StepIcon = icons[selectedStep.icon];
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 24);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  useEffect(() => {
    if (!menu) return;
    const key = (e: globalThis.KeyboardEvent) => { if (e.key === "Escape") { setMenu(false); document.getElementById("menu-toggle")?.focus(); } };
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, [menu]);
  return <MotionConfig reducedMotion="user"><div id="top" className={reduced ? "site reduce-motion" : "site"}>
    <a href="#main" className="skip-link">Skip to content</a>
    <header className={"site-header " + (scrolled ? "scrolled" : "")}><div className="header-inner"><Brand /><span className="header-caption">THE GUARDIAN OF UPTIME</span><nav className="desktop-nav" aria-label="Main navigation"><a href="#platform">Platform</a><a href="#how-it-works">How it works</a><a href={DOCS + "/INDEX.md"}>Docs <ArrowUpRight size={12} /></a></nav><a className="header-github" href={REPO}><Github size={16} /><span>GitHub</span><ArrowUpRight size={13} /></a><a className="button button-small header-start" href="#get-started">Get started <ArrowRight size={14} /></a><button id="menu-toggle" className="menu-toggle" aria-expanded={menu} aria-controls="mobile-nav" aria-label={menu ? "Close navigation" : "Open navigation"} onClick={() => setMenu(!menu)}>{menu ? <X /> : <Menu />}</button></div>{menu && <nav id="mobile-nav" className="mobile-nav" aria-label="Mobile navigation"><a onClick={() => setMenu(false)} href="#platform">Platform</a><a onClick={() => setMenu(false)} href="#how-it-works">How it works</a><a href={DOCS + "/INDEX.md"}>Documentation <ArrowUpRight size={16} /></a><a href="#get-started" onClick={() => setMenu(false)}>Get started <ArrowRight size={16} /></a></nav>}</header>
    <main id="main">
      <section className="hero section-shell" aria-labelledby="hero-title">
        <div className="hero-copy"><div className="hero-badge"><span className="status-dot" /> OPEN SOURCE. EVER VIGILANT.<span className="badge-line" /><span>APACHE 2.0</span></div><h1 id="hero-title">The Judgment<br />Never <em>Sleeps.</em></h1><p className="hero-description">Your infrastructure has a guardian.<br />Self-hosted monitoring that weighs every heartbeat.<br className="desktop-break" /> All the power. One Go binary.</p><div className="hero-actions"><a className="button" href="#get-started">Summon your guardian <ArrowRight size={17} /></a><a className="button button-secondary" href={REPO}><Github size={17} /> Explore on GitHub <ArrowUpRight size={14} /></a></div><div className="hero-command"><span className="command-dollar">$</span><code>anubis init &amp;&amp; anubis serve</code><CopyButton value="anubis init && anubis serve" label="Copy quick-start command" /></div><div className="hero-footnote"><span>Self-hosted by design</span><span className="footnote-dot">·</span><span>Built in pure Go</span><span className="footnote-dot">·</span><span>Yours to run</span></div></div>
        <Guardian />
        <a className="hero-scroll" href="#platform"><ArrowDown size={14} /> DESCEND INTO THE HALL</a><span className="hero-edition">ANUBISWATCH / VOL. 01</span>
      </section>
      <div className="credentials-strip"><div className="section-shell credentials-inner"><span><Code2 />Pure Go</span><span><Terminal />Single binary</span><span><Activity />10 protocols</span><span><Network />Raft clustering</span><span><Layers3 />Embedded dashboard</span><span><Feather />Apache 2.0</span></div></div>
      <section id="platform" className="platform section-shell">
        <Reveal className="section-heading"><div><Label number="01">THE HALL OF MA’AT</Label><h2>See the whole picture.<br /><em>Keep the balance.</em></h2></div><p>From the first heartbeat to the final verdict.<br />Your services, their history and the signals that<br className="desktop-break" /> matter — together in one embedded dashboard.</p></Reveal>
        <Reveal><Dashboard /></Reveal>
        <div className="dashboard-caption"><span><span className="tiny-diamond" /> DASHBOARD CONCEPT · ILLUSTRATIVE DATA</span><a href={DOCS + "/INDEX.md"}>Explore the real platform <ArrowUpRight size={13} /></a></div>
      </section>
      <section className="features section-shell">
        <Reveal className="section-heading"><div><Label number="02">BUILT FOR THE WATCH</Label><h2>Small footprint.<br /><em>Divine attention to detail.</em></h2></div><p>The tools to understand what’s happening.<br />The independence to run them your way.</p></Reveal>
        <div className="feature-grid">
          <Reveal className="feature-card feature-cluster"><div className="card-label"><Network size={18} /><span>THE NECROPOLIS</span><span className="card-index">01</span></div><h3>One guardian.<br />Or a whole pack.</h3><p>Start with a single node. Expand into a Raft cluster with distributed Jackals and region-aware probes.</p><Cluster /><a href={DOCS + "/deployment/guide.md"} className="text-link">Explore deployment <ArrowUpRight size={15} /></a></Reveal>
          <Reveal className="feature-card feature-journey"><div className="card-label"><ScrollText size={18} /><span>SYNTHETIC JOURNEYS</span><span className="card-index">02</span></div><h3>A heartbeat is good.<br />A full journey is better.</h3><p>Multi-step HTTP checks, assertions and persisted run history. Follow the path your users depend on.</p><div className="journey-path"><div><span>01</span><strong>Authenticate</strong><small>POST /auth</small><Check size={15} /></div><i /><div><span>02</span><strong>Fetch resource</strong><small>GET /account</small><Check size={15} /></div><i /><div><span>03</span><strong>Assert response</strong><small>$.status = active</small><Check size={15} /></div></div><span className="card-bottom mono text-green">A JOURNEY. NOT JUST A PING.</span></Reveal>
          <Reveal className="feature-card feature-alerts"><div className="card-label"><Bell size={18} /><span>THE VERDICT REACHES YOU</span><span className="card-index">03</span></div><h3>Right signal.<br />Right destination.</h3><p>Route alerts to the tools your team already uses. Nine dispatch channels, one clear verdict.</p><div className="channel-list">{channels.map((channel) => <span key={channel}>{channel === "Slack" ? <span className="channel-symbol">#</span> : channel === "Email" ? <Mail size={14} /> : channel === "Webhook" ? <Code2 size={14} /> : <span className="channel-dot" />}{channel}</span>)}</div></Reveal>
          <Reveal className="feature-card feature-storage"><div className="card-label"><Feather size={18} /><span>LIGHT AS A FEATHER</span><span className="card-index">04</span></div><h3>Everything it needs.<br />Nothing to babysit.</h3><p>Embedded CobaltDB storage and a React dashboard, served by the same binary. No separate database service to provision.</p><div className="binary-stack"><span><Layers3 size={16} />Dashboard</span><span><Activity size={16} />Monitoring</span><span><Server size={16} />Storage</span><span className="binary-result"><Terminal size={15} />anubis</span></div></Reveal>
          <Reveal className="feature-card feature-api"><div className="card-label"><Code2 size={18} /><span>OPEN BY NATURE</span><span className="card-index">05</span></div><div className="api-card-copy"><div><h3>A guardian that speaks<br />your language.</h3><p>REST, gRPC, WebSocket, SSE and Prometheus metrics. An authenticated MCP endpoint for tools and AI agents.</p></div><div className="api-routes mono"><span><i>GET</i> /api/v1/souls</span><span><i>GET</i> /metrics</span><span><i>RPC</i> /api/v1/mcp</span></div></div><a href={DOCS + "/MCP.md"} className="text-link">Connect your tools <ArrowUpRight size={15} /></a></Reveal>
        </div>
      </section>
      <section id="protocols" className="protocols-section section-shell"><Reveal className="section-heading"><div><Label number="03">EVERY SIGNAL HAS A SOUL</Label><h2>Ten protocols.<br /><em>One watchful eye.</em></h2></div><p>From a public API to a quiet mail server.<br />Every layer of your infrastructure gets a guardian.</p></Reveal><div className="protocol-explorer"><div className="protocol-picker" role="tablist" aria-label="Monitoring protocols">{protocols.map((p, index) => { const Icon = icons[p.icon]; return <button role="tab" id={"protocol-tab-" + index} aria-controls="protocol-panel" aria-selected={index === protocol} tabIndex={index === protocol ? 0 : -1} className={index === protocol ? "selected" : ""} key={p.name} onClick={() => setProtocol(index)} onKeyDown={(e) => { let next: number; if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (index + 1) % protocols.length; else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (index + protocols.length - 1) % protocols.length; else if (e.key === "Home") next = 0; else if (e.key === "End") next = protocols.length - 1; else return; e.preventDefault(); setProtocol(next); document.getElementById("protocol-tab-" + next)?.focus(); }}><Icon size={18} /><span>{p.name}</span><ArrowUpRight size={12} /></button>; })}</div><div className="protocol-detail" role="tabpanel" id="protocol-panel" aria-labelledby={"protocol-tab-" + protocol} tabIndex={0}><div className="protocol-detail-title"><span className="protocol-emblem"><ProtocolIcon size={30} /></span><span className="mono">PROTOCOL / {selectedProtocol.short}</span><span className="text-green mono">SUPPORTED</span></div><h3>{selectedProtocol.detail}</h3><p>{selectedProtocol.description}</p><div className="protocol-snippet"><div><span className="mono dim">SOUL CONFIGURATION · YAML EXCERPT</span><Code2 size={14} /></div><pre><code>{selectedProtocol.code}</code></pre></div><a className="text-link" href={DOCS + "/CONFIGURATION.md"}>Full configuration reference <ArrowUpRight size={15} /></a></div></div></section>
      <section id="how-it-works" className="workflow-section"><div className="section-shell"><Reveal className="section-heading"><div><Label number="04">THE RITUAL, EXPLAINED</Label><h2>From soul to signal.<br /><em>Nothing escapes the scales.</em></h2></div><p>Ancient language. Practical engineering.<br />Five steps from a service to an actionable alert.</p></Reveal><div className="workflow-steps" role="tablist" aria-label="Monitoring workflow">{steps.map((s, index) => { const Icon = icons[s.icon]; return <button key={s.title} role="tab" id={"workflow-tab-" + index} aria-selected={index === step} aria-controls="workflow-panel" tabIndex={index === step ? 0 : -1} className={index === step ? "selected" : ""} onClick={() => setStep(index)} onKeyDown={(e) => { let next: number; if (e.key === "ArrowRight") next = (index + 1) % steps.length; else if (e.key === "ArrowLeft") next = (index + steps.length - 1) % steps.length; else if (e.key === "Home") next = 0; else if (e.key === "End") next = steps.length - 1; else return; e.preventDefault(); setStep(next); document.getElementById("workflow-tab-" + next)?.focus(); }}><span className="workflow-num">0{index + 1}</span><span className="workflow-icon"><Icon size={30} /></span><strong>{s.title}</strong><span className="workflow-label">{s.label.split(" / ")[1]}</span>{index < 4 && <ArrowRight className="workflow-arrow" size={19} />}</button>; })}</div><div id="workflow-panel" role="tabpanel" aria-labelledby={"workflow-tab-" + step} tabIndex={0} className="workflow-detail"><div><StepIcon size={22} /><p>{selectedStep.text}</p></div><pre><code>{selectedStep.command}</code></pre></div></div></section>
      <section className="myth-section section-shell"><Reveal className="myth-art"><div className="myth-orbit" /><svg viewBox="0 0 360 300" fill="none" aria-hidden="true"><path d="M180 46V255M135 257H225M155 266H205" stroke="#d6b765" strokeWidth="2" /><circle cx="180" cy="70" r="9" stroke="#d6b765" strokeWidth="2" /><path className="scale-beam" d="M80 90H280M105 90L75 170H135L105 90M255 90L225 170H285L255 90" stroke="#d6b765" strokeWidth="1.6" /><path d="M75 170C78 196 130 196 135 170M225 170C228 196 280 196 285 170" fill="#d6b765" fillOpacity=".1" stroke="#d6b765" strokeWidth="1.6" /><path d="M105 158C84 145 90 131 99 132C103 132 105 136 105 136C105 136 108 132 112 132C124 132 125 146 105 158Z" fill="#52c78e" fillOpacity=".6" /><path d="M245 157C242 128 260 119 267 119C269 137 258 149 245 157ZM244 161L262 127M249 146L260 143M253 137L253 129" stroke="#d6b765" strokeWidth="1.8" /><path d="M45 270H315" stroke="#d6b765" strokeOpacity=".2" /><circle cx="180" cy="46" r="3" fill="#52c78e" /></svg><span className="myth-art-caption mono">THE HEART / THE FEATHER / THE BALANCE</span></Reveal><Reveal className="myth-copy"><Label number="05">AN ANCIENT IDEA. A MODERN PURPOSE.</Label><h2>Some things deserve<br /><em>an eternal guardian.</em></h2><p>In the Hall of Ma’at, Anubis tended the scales. A heart was weighed against a feather — the measure of truth, order and balance.</p><p>We bring that same watchfulness to your infrastructure. Each service is a soul. Every check is a judgment. Every alert, a verdict.</p><blockquote>“The Judgment Never Sleeps.”</blockquote><a href="https://www.metmuseum.org/-/media/files/about-the-met/curatorial-departments/egyptian/facsimiles/2014_transformingthedead_web.pdf" className="myth-source">The story behind the scales <ArrowUpRight size={12} /></a></Reveal></section>
      <Install />
      <section id="faq" className="faq-section section-shell"><Reveal className="faq-heading"><Label number="07">BEFORE YOU ENTER</Label><h2>A little clarity.<br /><em>A lot of confidence.</em></h2><p>Still curious? The source is open.</p><a href={REPO + "/issues"} className="text-link">Ask the community <ArrowUpRight size={15} /></a></Reveal><div className="faq-list">{questions.map(([question, answer]) => <details key={question}><summary>{question}<ChevronDown size={18} /></summary><p>{answer}</p></details>)}</div></section>
      <section className="closing section-shell"><span className="closing-overline mono">THE WATCH BEGINS WITH YOU.</span><h2>Give your services<br /><em>a guardian.</em></h2><a href="#get-started" className="button">Summon AnubisWatch <ArrowRight size={18} /></a><span className="closing-note">Open source. Self-hosted. Ever vigilant.</span><div className="closing-lines" aria-hidden="true"><span /><span /><span /></div></section>
    </main>
    <footer className="site-footer section-shell"><div className="footer-main"><div><Brand compact /><p>The Judgment Never Sleeps.</p></div><div className="footer-links"><div><span>PLATFORM</span><a href="#platform">Dashboard</a><a href="#protocols">Protocols</a><a href="#get-started">Get started</a></div><div><span>EXPLORE</span><a href={DOCS + "/INDEX.md"}>Documentation <ArrowUpRight size={11} /></a><a href={RELEASES}>Releases <ArrowUpRight size={11} /></a><a href={REPO}>Source code <ArrowUpRight size={11} /></a></div><div><span>COMMUNITY</span><a href={REPO + "/issues"}>Report an issue <ArrowUpRight size={11} /></a><a href={REPO + "/issues"}>Community <ArrowUpRight size={11} /></a><a href={REPO + "/blob/main/LICENSE"}>Apache 2.0 <ArrowUpRight size={11} /></a></div></div></div><div className="footer-bottom"><span>© 2026 AnubisWatch · ECOSTACK TECHNOLOGY OÜ</span><span>Built with care. Watched with precision.<span className="tiny-diamond" /></span><a href="#top">BACK TO TOP <ArrowUpRight size={12} /></a></div></footer>
  </div></MotionConfig>;
}
