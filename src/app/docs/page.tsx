import type { Metadata } from "next";
import { DocsArticle } from "@/components/docs-article";
import { docCatalog } from "@/lib/docs-catalog";
import { socialImage, socialTwitter } from "@/lib/social-image";

export const metadata: Metadata = {
  title: "Documentation — AnubisWatch",
  description: "Install, configure and operate AnubisWatch. Read the guides for monitoring, alerts, Raft, REST, MCP and realtime events.",
  alternates: { canonical: "/docs/" },
  openGraph: { type: "website", siteName: "AnubisWatch", title: "AnubisWatch Documentation", description: "Install, configure and operate AnubisWatch. Monitoring, alerts, Raft, REST, MCP and realtime guides.", url: "/docs/", images: [socialImage] },
  twitter: { ...socialTwitter, title: "AnubisWatch Documentation", description: "Install, configure and operate AnubisWatch. Monitoring, alerts, Raft, REST, MCP and realtime guides." },
};
export default function Documentation() { return <DocsArticle doc={docCatalog[0]} />; }
