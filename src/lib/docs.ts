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
import type { Root } from "hast";
import { docCatalog, docHref, docsSource } from "./docs-catalog";

export type DocHeading = { id: string; title: string; level: number };
/** Associate read-only GFM checkboxes with their visible prose using native labels. */
export function rehypeTaskLabels() {
  return (tree: Root) => {
    const phrasing = new Set(["a", "span", "strong", "em", "code", "del", "img", "input", "br", "small"]);
    visit(tree, "element", node => {
      if (node.tagName !== "li" && node.tagName !== "p") return;
      const start = node.children.findIndex(child => child.type === "element" && child.tagName === "input" && child.properties.type === "checkbox");
      if (start < 0) return;
      let end = start + 1;
      while (end < node.children.length) { const child = node.children[end]; if (child.type === "element" && !phrasing.has(child.tagName)) break; end++; }
      const children = node.children.slice(start, end);
      node.children.splice(start, end - start, { type: "element", tagName: "label", properties: { className: ["docs-task-label"] }, children });
    });
  };
}
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
