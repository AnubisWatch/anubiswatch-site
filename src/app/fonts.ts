import localFont from "next/font/local";

export const spaceGrotesk = localFont({
  src: "./fonts/space-grotesk.woff2",
  variable: "--font-space-grotesk",
  weight: "300 700",
  style: "normal",
  display: "swap",
  adjustFontFallback: "Arial",
  fallback: ["Arial", "sans-serif"],
});

export const jetBrainsMono = localFont({
  src: [
    { path: "./fonts/jetbrains-mono.woff2", weight: "100 800", style: "normal" },
    { path: "./fonts/jetbrains-mono-italic.woff2", weight: "100 800", style: "italic" },
  ],
  variable: "--font-jetbrains",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
  fallback: ["JetBrains Mono Fallback", "monospace"],
});
