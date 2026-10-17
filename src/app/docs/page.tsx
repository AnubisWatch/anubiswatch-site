import type { Metadata } from "next";
import { DocsArticle } from "@/components/docs-article";
import { docCatalog } from "@/lib/docs-catalog";

export const metadata: Metadata = {
  title: "Documentation — AnubisWatch",
  description: "Install, configure and operate AnubisWatch. Read the guides for monitoring, alerts, Raft, REST, MCP and realtime events.",
  alternates: { canonical: "/docs/" },
  openGraph: { title: "AnubisWatch Documentation", url: "/docs/" },
};
export default function Documentation() { return <DocsArticle doc={docCatalog[0]} />; }
