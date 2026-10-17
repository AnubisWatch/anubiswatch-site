import type { Metadata, Viewport } from "next";
import "@fontsource-variable/manrope";
import "@fontsource/cormorant-garamond/500-italic.css";
import "@fontsource/ibm-plex-mono/400.css";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://anubis.watch"),
  title: "AnubisWatch — The Judgment Never Sleeps",
  description: "Your infrastructure has a guardian. Open-source, self-hosted uptime and synthetic monitoring in a single Go binary. 10 protocols, Raft clustering, embedded dashboard and alerts.",
  alternates: { canonical: "/" },
  openGraph: { type: "website", url: "https://anubis.watch", siteName: "AnubisWatch", title: "AnubisWatch — The Judgment Never Sleeps", description: "Your infrastructure has a guardian. Self-hosted monitoring. One Go binary. Ten protocols.", images: [{ url: "/images/anubis-presentation.png", width: 1376, height: 768, alt: "AnubisWatch monitoring platform overview" }] },
  twitter: { card: "summary_large_image", title: "AnubisWatch — The Judgment Never Sleeps", images: ["/images/anubis-presentation.png"] },
  icons: { icon: "/icon.svg", apple: "/images/anubis-logo.png" },
};

export const viewport: Viewport = { themeColor: "#0b0d0c", colorScheme: "dark" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
