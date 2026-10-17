import source from "../../content/docs/source.json";

export type DocMeta = {
  slug: string;
  title: string;
  description: string;
  group: "Start here" | "Monitor" | "Operate" | "Integrate" | "Understand";
  sourcePath: string;
};

export const docsSource = source;
export const docCatalog: DocMeta[] = [
  { slug: "overview", title: "Introduction", description: "Meet the guardian of your infrastructure and find your path through the documentation.", group: "Start here", sourcePath: "README.md" },
  { slug: "installation", title: "Installation", description: "Install on Linux, macOS or Windows, or run the persistent Docker image.", group: "Start here", sourcePath: "README.md" },
  { slug: "first-monitor", title: "Your first monitor", description: "Define a soul, inspect a judgment and find your service in the dashboard.", group: "Start here", sourcePath: "README.md" },
  { slug: "configuration", title: "Configuration", description: "The full JSON and YAML reference for your server, storage, authentication and monitors.", group: "Start here", sourcePath: "docs/CONFIGURATION.md" },
  { slug: "protocols", title: "Monitoring protocols", description: "HTTP, TCP, UDP, DNS, ICMP, SMTP, IMAP, gRPC, WebSocket and TLS check configuration.", group: "Monitor", sourcePath: "docs/CONFIGURATION.md" },
  { slug: "journeys", title: "Synthetic journeys", description: "Multi-step requests, assertions and variable extraction along a complete user journey.", group: "Monitor", sourcePath: "docs/CONFIGURATION.md" },
  { slug: "alerts", title: "Alerts & verdicts", description: "Configure dispatch channels, alert conditions and the rules that reach your team.", group: "Monitor", sourcePath: "docs/CONFIGURATION.md" },
  { slug: "clustering", title: "Clustering & Raft", description: "Standalone, single-node Raft and distributed Jackals across regions.", group: "Operate", sourcePath: "README.md" },
  { slug: "deployment", title: "Deployment", description: "Docker, Kubernetes and systemd deployment patterns.", group: "Operate", sourcePath: "docs/deployment/guide.md" },
  { slug: "production", title: "Production runbook", description: "Preflight, rollout, smoke tests, evidence and rollback.", group: "Operate", sourcePath: "docs/deployment/production-runbook.md" },
  { slug: "backup", title: "Backup & restore", description: "Create, inspect and restore a backup of your configured local storage.", group: "Operate", sourcePath: "cmd/anubis/backup.go" },
  { slug: "troubleshooting", title: "Troubleshooting", description: "Diagnose startup, network, cluster and alert delivery problems.", group: "Operate", sourcePath: "docs/TROUBLESHOOTING.md" },
  { slug: "api", title: "REST API", description: "Authentication, souls, judgments, incidents and workspace-aware endpoints.", group: "Integrate", sourcePath: "docs/API.md" },
  { slug: "mcp", title: "MCP & AI agents", description: "Connect through the authenticated JSON-RPC endpoint and discover eight built-in tools.", group: "Integrate", sourcePath: "internal/api/mcp.go" },
  { slug: "realtime", title: "Realtime events", description: "The Duat: WebSocket and authenticated server-sent events.", group: "Integrate", sourcePath: "internal/api/rest.go" },
  { slug: "cli", title: "CLI reference", description: "Daily commands for configuration, monitoring, clustering and backups.", group: "Integrate", sourcePath: "README.md" },
  { slug: "architecture", title: "Architecture & mythology", description: "How the binary, probes, storage and Raft work together, and what the names mean.", group: "Understand", sourcePath: "ARCHITECTURE.md" },
];

export const docGroups = ["Start here", "Monitor", "Operate", "Integrate", "Understand"] as const;
export function docHref(slug: string) { return slug === "overview" ? "/docs/" : "/docs/" + slug + "/"; }
export function getDocMeta(slug: string) { return docCatalog.find((doc) => doc.slug === slug); }
