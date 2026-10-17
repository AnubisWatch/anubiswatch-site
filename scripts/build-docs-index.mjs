import fs from "node:fs";
import path from "node:path";

const directory = path.join(process.cwd(), "content", "docs");
const documents = fs.readdirSync(directory).filter((file) => file.endsWith(".md") && file !== "README.md");
const entries = documents.map((file) => {
  const text = fs.readFileSync(path.join(directory, file), "utf8");
  const slug = file.slice(0, -3);
  const title = /^# (.+)$/m.exec(text)?.[1] ?? slug;
  const headings = [...text.matchAll(/^#{2,3} (.+)$/gm)].map((match) => match[1]).join(" · ");
  const searchable = text.replaceAll(String.fromCharCode(96), "").replace(/!\[[^\]]*\]\([^)]*\)/g, "").replace(/[#*>|]/g, "").replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").replace(/\s+/g, " ").trim();
  return { slug, title, headings, text: searchable, href: slug === "overview" ? "/docs/" : "/docs/" + slug + "/" };
});
if (entries.length < 10) throw new Error("Documentation content is missing.");
fs.writeFileSync(path.join(process.cwd(), "public", "docs-search.json"), JSON.stringify(entries));
console.log("Built local search index for " + entries.length + " documentation pages.");
