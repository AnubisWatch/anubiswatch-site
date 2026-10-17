import { Children, isValidElement, type ComponentProps, type ReactElement } from "react";
import Link from "next/link";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { createHighlighter, type BundledLanguage } from "shiki";
import { ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, Terminal } from "lucide-react";
import { docCatalog, docHref, docsSource, type DocMeta } from "@/lib/docs-catalog";
import { docHeadings, readDoc, resolveDocLink } from "@/lib/docs";
import { DocsCode } from "./docs-code";
import { DocsToc } from "./docs-toc";

const highlighter = createHighlighter({
  themes: ["github-dark"],
  langs: ["bash", "json", "yaml", "powershell", "javascript", "typescript", "go", "http", "ini", "dockerfile", "sql", "nginx"],
});

export async function DocsArticle({ doc }: { doc: DocMeta }) {
  const syntax = await highlighter;
  const markdown = readDoc(doc.slug).replace(/^# .+\r?\n/, "");
  const headings = docHeadings(doc.slug);
  const index = docCatalog.findIndex((entry) => entry.slug === doc.slug);
  const previous = docCatalog[index - 1], next = docCatalog[index + 1];
  let tables = 0;
  return <div className="docs-article-layout"><article className="docs-article">
    <div className="docs-breadcrumb"><Link href="/docs/">Documentation</Link><span>/</span><span>{doc.group}</span></div>
    <header className="docs-article-header"><span className="eyebrow"><span className="tiny-diamond" />THE FIELD GUIDE</span><h1>{doc.title}</h1><p>{doc.description}</p><div className="docs-page-meta"><span><BookOpen size={14} />Project source · {docsSource.commit.slice(0, 7)}</span><span>Updated {docsSource.capturedDate}</span></div></header>
    {doc.slug === "overview" && <div className="docs-start-cards"><Link href="/docs/installation/"><Terminal size={23} /><strong>Summon your guardian</strong><span>Choose your platform and install.</span><ArrowRight size={18} /></Link><Link href="/docs/first-monitor/"><BookOpen size={23} /><strong>Watch your first soul</strong><span>From target to judgment.</span><ArrowRight size={18} /></Link></div>}
    <div className="docs-prose"><Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSlug]} skipHtml components={{
      a: ({ href, children }) => <a href={resolveDocLink(href, doc.sourcePath)}>{children}</a>,
      table: ({ children }) => <div className="docs-table-wrap" role="region" aria-label={"Reference table " + ++tables} tabIndex={0}><table>{children}</table></div>,
      pre: ({ children }) => {
        const child = Children.only(children);
        if (!isValidElement(child)) return <pre>{children}</pre>;
        const codeElement = child as ReactElement<ComponentProps<"code">>;
        const code = String(codeElement.props.children ?? "").replace(/\n$/, "");
        const rawLanguage = /language-(\S+)/.exec(codeElement.props.className ?? "")?.[1] ?? "text";
        const alias: Record<string, string> = { sh: "bash", shell: "bash", js: "javascript", ts: "typescript", yml: "yaml", plaintext: "text" };
        const language = alias[rawLanguage] ?? rawLanguage;
        const loaded = syntax.getLoadedLanguages().includes(language as BundledLanguage);
        const tokens = syntax.codeToTokens(code, { lang: loaded ? language as BundledLanguage : "text", theme: "github-dark" }).tokens;
        return <DocsCode code={code} language={rawLanguage}><code>{tokens.map((line, lineIndex) => <span className="docs-code-line" key={lineIndex}>{line.map((token, tokenIndex) => <span style={{ color: token.color }} key={tokenIndex}>{token.content}</span>)}{lineIndex < tokens.length - 1 ? "\n" : null}</span>)}</code></DocsCode>;
      },
    }}>{markdown}</Markdown></div>
    <div className="docs-source-note"><span>Adapted from the AnubisWatch project. Examples use placeholder services and credentials.</span><a href={"https://github.com/AnubisWatch/AnubisWatch/blob/" + docsSource.commit + "/" + doc.sourcePath}>View project source <ArrowUpRight size={14} /></a><a href={"https://github.com/AnubisWatch/anubiswatch-site/edit/main/content/docs/" + doc.slug + ".md"}>Suggest a correction <ArrowUpRight size={14} /></a></div>
    <nav className="docs-pagination" aria-label="Documentation pagination">{previous ? <Link href={docHref(previous.slug)}><span><ArrowLeft size={14} />PREVIOUS</span><strong>{previous.title}</strong></Link> : <div />}{next && <Link href={docHref(next.slug)}><span>NEXT<ArrowRight size={14} /></span><strong>{next.title}</strong></Link>}</nav>
  </article><DocsToc headings={headings} /></div>;
}
