"use client";

/** Decorative vector scenes. All motion is CSS-controlled, including pause and reduced motion. */
export function CelestialField() {
  return <svg className="celestial-field" viewBox="0 0 560 560" fill="none" aria-hidden="true">
    <g className="celestial-grid" stroke="currentColor" strokeWidth=".6">
      <path d="M92 124 159 79 218 104M342 88 406 123 471 96M72 358 111 417 86 473M382 464 438 423 493 451" />
      <path d="M280 21V40M280 520V539M21 280H40M520 280H539" />
    </g>
    <g className="celestial-stars">{Array.from({ length: 22 }, (_, i) => {
      const angle = i * 2.39996;
      const radius = 207 + (i % 4) * 15;
      return <circle key={i} cx={Number((280 + Math.cos(angle) * radius).toFixed(3))} cy={Number((280 + Math.sin(angle) * radius).toFixed(3))} r={i % 5 === 0 ? 1.9 : .8} style={{ animationDelay: -(i * .7) + "s" }} />;
    })}</g>
    <g className="celestial-arcs" stroke="currentColor">
      <path d="M280 47A233 233 0 0 1 513 280" strokeWidth="1.2" strokeDasharray="3 7" />
      <path d="M280 513A233 233 0 0 1 47 280" strokeWidth=".7" />
      <path d="M280 83A197 197 0 0 1 477 280" strokeWidth="2" strokeDasharray="1 24" />
    </g>
    <g className="celestial-glyphs" stroke="currentColor" strokeWidth="1.2">
      <path d="M126 112h14m-7-7v14m-7 3h14M414 112l7-12 7 12h-14m7 0v9M73 273h14m-7-9v18m-5-14h10M473 282l7-17 7 17m-12-6h10M124 443l8-13 8 13m-16 0h16M414 444h15m-12-6 5-8 5 8m-5 0v12" />
    </g>
    <circle className="celestial-sweep" cx="280" cy="280" r="174" stroke="currentColor" strokeWidth="1.5" strokeDasharray="45 1050" />
  </svg>;
}

export function ClusterGlobe() {
  return <svg className="cluster-globe" viewBox="0 0 480 290" fill="none" aria-hidden="true">
    <g className="globe-wire" stroke="currentColor" strokeWidth=".6">
      <circle cx="240" cy="126" r="92" />
      <ellipse cx="240" cy="126" rx="43" ry="92" />
      <ellipse cx="240" cy="126" rx="74" ry="92" />
      <ellipse cx="240" cy="126" rx="92" ry="31" />
      <path d="M156 91Q240 126 324 91M156 161Q240 126 324 161M148 126H332M240 34V218" />
      <path d="M169 79 185 66 202 71 210 89 203 102 218 111 211 126 197 121 189 104 172 98ZM213 133 224 138 226 150 219 171 207 192 201 176 198 153ZM251 67 269 59 288 68 299 80 290 91 307 102 313 123 299 129 286 112 275 109 270 121 260 119 251 99 256 86ZM251 127 268 126 279 143 271 165 258 176 247 154ZM293 167 309 168 316 180 303 191 286 184Z" />
    </g>
    <circle className="globe-echo echo-one" cx="240" cy="126" r="92" stroke="currentColor" strokeWidth=".8" />
    <circle className="globe-echo echo-two" cx="240" cy="126" r="92" stroke="currentColor" strokeWidth=".8" />
  </svg>;
}

export function DispatchSignal() {
  return <svg className="dispatch-signal" viewBox="0 0 320 108" fill="none" aria-hidden="true">
    <g className="dispatch-lines" stroke="currentColor" strokeWidth=".8">
      <path d="M160 47 26 26M160 47 61 74M160 47 112 17M160 47 209 17M160 47 263 74M160 47 294 26" />
    </g>
    <g className="dispatch-packets" stroke="currentColor" strokeWidth="2" strokeDasharray="7 150">
      <path d="M160 47 26 26M160 47 61 74M160 47 112 17M160 47 209 17M160 47 263 74M160 47 294 26" />
    </g>
    <g className="dispatch-endpoints" stroke="currentColor">
      {[[26, 26], [61, 74], [112, 17], [209, 17], [263, 74], [294, 26]].map(([x, y], i) => <g key={i} className="dispatch-endpoint" style={{ animationDelay: i * .3 + "s" }}><circle cx={x} cy={y} r="7" /><circle cx={x} cy={y} r="2" fill="currentColor" stroke="none" /></g>)}
    </g>
    <circle cx="160" cy="47" r="23" fill="var(--bg)" stroke="var(--gold)" strokeOpacity=".4" />
    <g className="dispatch-bell" stroke="var(--gold)" strokeWidth="1.3"><path d="M149 52c4-3 2-6 3-11a8 8 0 0 1 16 0c1 5-1 8 3 11h-22Zm8 4q3 5 6 0M160 30v3" /></g>
    <text x="160" y="96" textAnchor="middle" className="svg-caption">A VERDICT. EVERY DESTINATION.</text>
  </svg>;
}

export function BinaryCore() {
  return <svg className="binary-core" viewBox="0 0 320 110" fill="none" aria-hidden="true">
    <path d="M36 69H83M237 69H284M45 60H73M247 60H275" stroke="var(--green)" strokeOpacity=".35" />
    <g className="binary-plane plane-bottom"><path d="m87 68 73-32 73 32-73 32Z" fill="var(--bg)" stroke="var(--gold)" strokeOpacity=".35" /><path d="m87 68 73 32 73-32" stroke="var(--green)" strokeOpacity=".55" /></g>
    <g className="binary-plane plane-middle"><path d="m87 51 73-32 73 32-73 32Z" fill="var(--bg)" stroke="var(--gold)" strokeOpacity=".55" /></g>
    <g className="binary-plane plane-top"><path d="m87 34 73-32 73 32-73 32Z" fill="var(--bg)" stroke="var(--gold)" strokeOpacity=".85" /><path d="m147 35 13-17 13 17-13 14Z" stroke="var(--green)" strokeWidth="1.2" /><path d="M160 18v31" stroke="var(--green)" strokeOpacity=".5" /></g>
    <g className="core-packets" fill="var(--green)"><circle cx="51" cy="69" r="2" /><circle cx="264" cy="69" r="2" /></g>
  </svg>;
}

export function DataRail() {
  return <svg className="data-rail" viewBox="0 0 190 24" fill="none" aria-hidden="true">
    <path d="M0 12h190" stroke="var(--gold)" strokeOpacity=".14" />
    <path className="rail-packet" d="M0 12h190" stroke="var(--green)" strokeWidth="1.5" strokeDasharray="15 175" />
    <path d="m84 6 6 6-6 6m17-12 6 6-6 6" stroke="var(--gold)" strokeOpacity=".5" />
  </svg>;
}

export function ProtocolSignal({ protocol }: { protocol: string }) {
  return <svg key={protocol} className="protocol-signal" viewBox="0 0 380 84" fill="none" aria-hidden="true">
    <path d="M27 42H353" stroke="var(--green)" strokeOpacity=".15" />
    <path className="protocol-packet packet-outbound" d="M27 42H353" stroke="var(--green)" strokeWidth="2" strokeDasharray="16 310" />
    <path className="protocol-packet packet-inbound" d="M353 42H27" stroke="var(--gold)" strokeWidth="1.5" strokeDasharray="12 314" />
    <g stroke="var(--gold)" strokeOpacity=".4"><path d="M18 28h31v28H18ZM331 28h31v28h-31Z" fill="var(--bg)" /><path d="M24 34h19M24 39h13M337 34h19M337 39h13" /></g>
    <circle className="protocol-ring" cx="190" cy="42" r="32" stroke="var(--green)" strokeOpacity=".2" />
    <circle cx="190" cy="42" r="25" fill="var(--bg)" stroke="var(--gold)" strokeOpacity=".5" />
    <text x="190" y="46" textAnchor="middle" className="svg-protocol-name">{protocol}</text>
    <g fill="var(--green)" className="protocol-witnesses"><circle cx="110" cy="42" r="2" /><circle cx="270" cy="42" r="2" /></g>
  </svg>;
}

export function JudgmentScales() {
  return <svg className="judgment-scales" viewBox="0 0 360 300" fill="none" aria-hidden="true">
    <g className="scales-inscription" stroke="var(--gold)" strokeWidth=".8" strokeOpacity=".28">
      <path d="M49 53h13m-7-8v16M45 82l10-12 10 12h-20m10 0v13M47 116h16m-8-9v18M298 47h14m-7-7v15M300 77l5-10 5 10m-5 0v13M297 118l8-13 8 13Z" />
    </g>
    <path d="M180 46V255M135 257H225M155 266H205" stroke="var(--gold)" strokeWidth="2" />
    <circle cx="180" cy="70" r="9" stroke="var(--gold)" strokeWidth="2" />
    <g className="balance-beam" stroke="var(--gold)" strokeWidth="1.6">
      <path d="M78 90H282M80 86v8M280 86v8" />
      <g className="balance-pan pan-left">
        <path d="M105 90 75 170H135L105 90M75 170C78 196 130 196 135 170" fill="var(--gold)" fillOpacity=".05" />
        <path className="scales-heart" d="M105 158C84 145 90 131 99 132C103 132 105 136 105 136C105 136 108 132 112 132C124 132 125 146 105 158Z" fill="var(--green)" fillOpacity=".75" stroke="var(--green)" />
      </g>
      <g className="balance-pan pan-right">
        <path d="M255 90 225 170H285L255 90M225 170C228 196 280 196 285 170" fill="var(--gold)" fillOpacity=".05" />
        <g className="scales-feather"><path d="M245 157C242 128 260 119 267 119C269 137 258 149 245 157ZM244 161L262 127M249 146L260 143M253 137L253 129" strokeWidth="1.8" /></g>
      </g>
    </g>
    <circle cx="180" cy="90" r="4" fill="var(--bg)" stroke="var(--green)" strokeWidth="1.5" />
    <path d="M45 270H315" stroke="var(--gold)" strokeOpacity=".2" />
    <circle className="scales-spark" cx="180" cy="46" r="3" fill="var(--green)" />
    <g className="scales-dust" fill="var(--gold)">{[68, 130, 222, 293].map((x, i) => <circle key={x} cx={x} cy={215 - i * 9} r="1" style={{ animationDelay: -(i * 1.7) + "s" }} />)}</g>
  </svg>;
}

export function WingedDisc() {
  return <svg className="winged-disc" viewBox="0 0 1100 270" fill="none" aria-hidden="true">
    <circle cx="550" cy="115" r="35" stroke="var(--gold)" strokeOpacity=".45" />
    <circle className="solar-ripple" cx="550" cy="115" r="47" stroke="var(--gold)" strokeOpacity=".17" />
    <circle className="solar-ripple ripple-delayed" cx="550" cy="115" r="47" stroke="var(--gold)" strokeOpacity=".17" />
    <g className="disc-wing wing-left" stroke="var(--gold)" strokeOpacity=".23">
      <path d="M509 112Q374 55 129 93L171 116Q350 85 509 127M496 132Q344 106 176 130L218 147Q345 128 491 143M483 149Q359 137 220 159L263 175Q365 149 478 159M473 166Q372 160 275 185L311 197Q389 172 469 176" />
      <path d="M130 93Q288 174 459 183" strokeOpacity=".13" />
    </g>
    <g className="disc-wing wing-right" stroke="var(--gold)" strokeOpacity=".23">
      <path d="M591 112Q726 55 971 93L929 116Q750 85 591 127M604 132Q756 106 924 130L882 147Q755 128 609 143M617 149Q741 137 880 159L837 175Q735 149 622 159M627 166Q728 160 825 185L789 197Q711 172 631 176" />
      <path d="M970 93Q812 174 641 183" strokeOpacity=".13" />
    </g>
    <path d="M550 87v56m-18-27 18-21 18 21-18 20Z" stroke="var(--green)" strokeOpacity=".4" />
  </svg>;
}
