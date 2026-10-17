export const REPO = "https://github.com/AnubisWatch/AnubisWatch";
export const DOCS = "/docs";
export const RELEASES = `${REPO}/releases/latest`;

export const protocols = [
  { name: "HTTP / HTTPS", short: "HTTP", detail: "Go beyond a 200 OK.", description: "Validate status codes, response bodies and JSON paths. Set headers, follow redirects and enforce latency thresholds.", code: 'type: http\ntarget: https://api.example.com/health\nhttp:\n  method: GET\n  valid_status: [200]', icon: "globe" },
  { name: "TCP", short: "TCP", detail: "Make every connection count.", description: "Check connectivity to a port and optionally match the server banner. Watch databases, queues and internal services.", code: 'type: tcp\ntarget: db.example.com:5432', icon: "server" },
  { name: "UDP", short: "UDP", detail: "Send. Receive. Verify.", description: "Probe UDP services with send-and-receive checks, including services that never speak HTTP.", code: 'type: udp\ntarget: service.example.com:9000', icon: "radio" },
  { name: "DNS", short: "DNS", detail: "Know where your domain stands.", description: "Check DNS records with resolver lists and propagation options. Catch resolution problems before they become unreachable services.", code: 'type: dns\ntarget: example.com', icon: "globe" },
  { name: "ICMP", short: "ICMP", detail: "Listen to the network’s heartbeat.", description: "Measure ping latency and packet loss with configurable packet counts and intervals.", code: 'type: icmp\ntarget: 192.0.2.1', icon: "activity" },
  { name: "SMTP", short: "SMTP", detail: "Watch the way out.", description: "Verify mail servers with EHLO, STARTTLS, authentication and banner matching.", code: 'type: smtp\ntarget: mail.example.com:587', icon: "mail" },
  { name: "IMAP", short: "IMAP", detail: "Keep the inbox reachable.", description: "Monitor IMAP server availability alongside the rest of your infrastructure.", code: 'type: imap\ntarget: mail.example.com:993', icon: "mail" },
  { name: "gRPC", short: "gRPC", detail: "Health checks for your service mesh.", description: "Use gRPC health checks with TLS and metadata options for your internal and public services.", code: 'type: grpc\ntarget: grpc.example.com:443', icon: "layers" },
  { name: "WebSocket", short: "WS", detail: "Keep the conversation alive.", description: "Connect, send a message, verify a response and check ping behavior on persistent connections.", code: 'type: websocket\ntarget: wss://stream.example.com', icon: "radio" },
  { name: "TLS", short: "TLS", detail: "A certificate deserves a guardian.", description: "Inspect expiry, issuer, TLS protocol, OCSP and key strength. Make certificate health part of the daily judgment.", code: 'type: tls\ntarget: example.com:443', icon: "shield" },
] as const;

export const steps = [
  { title: "Define a soul", label: "01 / SOUL", text: "Give a service a name, a target and a check interval. This is the soul Anubis will watch.", command: 'anubis watch https://example.com/health \\\n  --name "Example API" --interval 30s --type http', icon: "scroll" },
  { title: "Send the jackals", label: "02 / PROBE", text: "A Jackal checks the target. In a Necropolis cluster, region-aware distribution brings your probes closer to your services.", command: 'anubis serve --cluster --bootstrap \\\n  --node-name jackal-01 --region eu-west', icon: "radio" },
  { title: "Weigh the heart", label: "03 / JUDGMENT", text: "Every result becomes a Judgment: status, latency and assertions measured against your service’s expectations.", command: 'anubis judge "Example API"', icon: "scale" },
  { title: "Reach a verdict", label: "04 / VERDICT", text: "Status changes and alert rules determine the verdict. Your configured conditions decide when a result needs attention.", command: '# Review judgments and alert conditions\nanubis judge --all', icon: "gavel" },
  { title: "Deliver the message", label: "05 / DISPATCH", text: "Send the verdict to the right place, from a Slack channel to PagerDuty or a plain webhook.", command: '# Watch events as they happen\nanubis logs --follow', icon: "bell" },
] as const;

export const channels = ["Slack", "Discord", "Telegram", "Email", "PagerDuty", "OpsGenie", "Twilio SMS", "ntfy", "Webhook"];

export const installCommands = {
  binary: {
    linux: 'curl -LO https://github.com/AnubisWatch/AnubisWatch/releases/latest/download/anubis-linux-amd64.tar.gz\ntar -xzf anubis-linux-amd64.tar.gz\nmv anubis-linux-amd64 anubis\n./anubis init\n./anubis serve',
    mac: 'curl -LO https://github.com/AnubisWatch/AnubisWatch/releases/latest/download/anubis-darwin-arm64.tar.gz\ntar -xzf anubis-darwin-arm64.tar.gz\nmv anubis-darwin-arm64 anubis\n./anubis init\n./anubis serve',
    windows: 'Invoke-WebRequest -Uri "https://github.com/AnubisWatch/AnubisWatch/releases/latest/download/anubis-windows-amd64.zip" -OutFile anubis.zip\nExpand-Archive anubis.zip -DestinationPath . -Force\nMove-Item .\\anubis-windows-amd64.exe .\\anubis.exe -Force\n.\\anubis.exe init\n.\\anubis.exe serve',
  },
  docker: 'docker run -d --name anubiswatch \\\n  -p 8080:8080 \\\n  -e ANUBIS_ADMIN_PASSWORD="replace-with-a-strong-password" \\\n  -v anubis-data:/data \\\n  ghcr.io/anubiswatch/anubiswatch:latest',
  source: 'git clone https://github.com/AnubisWatch/anubiswatch.git\ncd anubiswatch\n./run.sh',
};

export const questions = [
  ["What do I need to run AnubisWatch?", "The release binary contains the dashboard and storage engine. Download the build for your operating system, run anubis init, then anubis serve. Building from source requires Go and Node.js; the source quick-start script handles the build."],
  ["Is this a hosted monitoring service?", "AnubisWatch is self-hosted. Your monitors, check history and configuration live on infrastructure you control. This website introduces the project; its interactive preview uses sample data and does not monitor real services."],
  ["Do I need a cluster?", "No. Standalone mode runs a single process with embedded storage. Use single-node Raft or a multi-node Necropolis when you want replicated state and region-aware probe distribution."],
  ["Can it monitor a complete user journey?", "Yes. Multi-step synthetic Journeys support assertions and persisted run history. Use them to check a sequence of HTTP requests rather than just one endpoint."],
  ["How does the Egyptian mythology fit?", "In ancient Egyptian belief, Anubis tended the scales that weighed a person’s heart against the feather of Ma’at, the principle of truth and order. The project borrows that language: services are Souls, checks are Judgments, and alert decisions are Verdicts. The story is a metaphor for measuring service health."],
  ["Can my tools and AI agents connect?", "Yes. AnubisWatch exposes REST, gRPC, WebSocket and SSE APIs, Prometheus metrics and an authenticated MCP JSON-RPC endpoint. The repository documents the available APIs and MCP tools."],
  ["What license does it use?", "AnubisWatch is open source under Apache 2.0. Read the license in the project repository for the terms."],
] as const;
