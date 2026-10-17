import { DocsShell } from "@/components/docs-shell";
import "./docs.css";

export default function DocumentationLayout({ children }: { children: React.ReactNode }) {
  return <DocsShell>{children}</DocsShell>;
}
