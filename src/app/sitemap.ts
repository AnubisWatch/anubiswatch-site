import type { MetadataRoute } from "next";
import { docCatalog, docHref } from "@/lib/docs-catalog";
export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://anubis.watch", changeFrequency: "monthly", priority: 1 },
    ...docCatalog.map((doc) => ({ url: "https://anubis.watch" + docHref(doc.slug), changeFrequency: "monthly" as const, priority: .7 })),
  ];
}
