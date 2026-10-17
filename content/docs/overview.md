# Introduction

AnubisWatch is a self-hosted uptime, synthetic monitoring, alerting and status-page platform written in Go. Its single binary includes storage and a React dashboard; you can run it on one node or distribute the watch across a Raft cluster.

## Start your watch

1. [Install the binary or Docker image](/docs/installation/).
2. [Create your first monitor](/docs/first-monitor/).
3. [Configure alerts and dispatch channels](/docs/alerts/).

You control the instance and its data. This website and its illustrative dashboard introduce the project; your running AnubisWatch instance performs the actual monitoring.

## The language of the hall

| Name | What it means |
| --- | --- |
| Soul | A monitored service, endpoint, port, record or certificate |
| Judgment | One health-check execution result |
| Verdict | An alert decision based on status or rule conditions |
| Journey | A multi-step synthetic check |
| Jackal | A probe and controller node |
| Pharaoh | The Raft leader |
| Necropolis | The cluster |
| Feather | Embedded CobaltDB storage |
| Duat | The realtime event layer |

Anubis tended the scales that weighed the heart against the feather of Ma’at. Read [Architecture & mythology](/docs/architecture/) for how these names map to the implementation.

## Explore the platform

- **Monitor:** [10 protocols](/docs/protocols/), [synthetic journeys](/docs/journeys/) and [alerts](/docs/alerts/).
- **Operate:** [clustering](/docs/clustering/), [deployment](/docs/deployment/), [backups](/docs/backup/) and [troubleshooting](/docs/troubleshooting/).
- **Integrate:** [REST API](/docs/api/), [MCP](/docs/mcp/) and [realtime events](/docs/realtime/).

## Find the right port

Use the URL printed by `anubis init` or the port in your configuration. The current initializer tries port **8080** first and chooses an available port. Some older repository examples show 8443. Replace example ports with the value used by your instance.

## Source and releases

These guides combine adapted project documentation with curated instructions checked against the source snapshot linked on each page. Documentation on the main branch can include changes beyond a published release. Use [release downloads](https://github.com/AnubisWatch/AnubisWatch/releases/latest) and the [Apache 2.0 license](https://github.com/AnubisWatch/AnubisWatch/blob/main/LICENSE) from the project repository.
