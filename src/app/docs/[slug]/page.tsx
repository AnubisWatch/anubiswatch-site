import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DocsArticle } from "@/components/docs-article";
import { docCatalog, docHref, getDocMeta } from "@/lib/docs-catalog";
import { socialImage, socialTwitter } from "@/lib/social-image";

export const dynamicParams = false;
export function generateStaticParams() { return docCatalog.filter((doc) => doc.slug !== "overview").map((doc) => ({ slug: doc.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const doc = getDocMeta(slug);
  if (!doc) return {};
  return { title: doc.title + " — AnubisWatch Docs", description: doc.description, alternates: { canonical: docHref(slug) }, openGraph: { type: "website", siteName: "AnubisWatch", title: doc.title + " — AnubisWatch Docs", url: docHref(slug), description: doc.description, images: [socialImage] }, twitter: { ...socialTwitter, title: doc.title + " — AnubisWatch Docs", description: doc.description } };
}
export default async function DocumentationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = getDocMeta(slug);
  if (!doc || slug === "overview") notFound();
  return <DocsArticle doc={doc} />;
}
