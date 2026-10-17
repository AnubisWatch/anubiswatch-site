import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import { visit } from "unist-util-visit";
import { toString } from "hast-util-to-string";
import { docCatalog, docHref, docsSource } from "./docs-catalog";

export type DocHeading = { id: string; title: string; level: number };
export const readDoc = cache((slug: string) => fs.readFileSync(path.join(process.cwd(), "content", "docs", slug + ".md"), "utf8"));
export const docHeadings = cache((slug: string) => {
  const markdown = readDoc(slug).replace(/^# .+\r?\n/, "");
  const processor = unified().use(remarkParse).use(remarkGfm).use(remarkRehype).use(rehypeSlug);
  const tree = processor.runSync(processor.parse(markdown));
  const headings: DocHeading[] = [];
  visit(tree, "element", (node) => {
    if (node.tagName === "h2" || node.tagName === "h3") {
      headings.push({ id: String(node.properties.id), title: toString(node), level: Number(node.tagName.slice(1)) });
    }
  });
  return headings;
});

export function resolveDocLink(href: string | undefined, sourcePath: string) {
  if (!href) return "#";
  if (href.startsWith("#") || href.startsWith("/docs/") || href === "/") return href;
  if (/^https:\/\/docs\.anubis\.watch\/?$/.test(href)) return "/docs/";
  if (/^(https?:|mailto:)/i.test(href)) return href;
  const [target, fragment] = href.split("#");
  const normalized = path.posix.normalize(path.posix.join(path.posix.dirname(sourcePath), target));
  const match = docCatalog.find((doc) => doc.sourcePath === normalized);
  const suffix = fragment ? "#" + fragment : "";
  return match ? docHref(match.slug) + suffix : "https://github.com/AnubisWatch/AnubisWatch/blob/" + docsSource.commit + "/" + normalized + suffix;
}
