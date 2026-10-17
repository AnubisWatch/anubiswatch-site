# MCP & AI agents

AnubisWatch exposes an authenticated Model Context Protocol JSON-RPC endpoint. Connect to your own instance; this marketing website does not expose a monitoring MCP server.

## Endpoint and authentication

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/api/v1/mcp` | MCP JSON-RPC requests |
| GET | `/api/v1/mcp/tools` | Authenticated tool listing |

Use a Bearer token. Examples use port 8080; substitute your instance URL.

## Initialize the connection

~~~bash
curl -X POST http://localhost:8080/api/v1/mcp \
  -H "Authorization: Bearer $ANUBIS_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"example-client","version":"1.0"}}}'
~~~

The implementation advertises protocol version `2024-11-05`. Client configuration formats vary; use your client's documented JSON-RPC transport and the endpoint above.

## Discover tools

~~~bash
curl -X POST http://localhost:8080/api/v1/mcp \
  -H "Authorization: Bearer $ANUBIS_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}'
~~~

The current source registers eight tools:

| Tool | Purpose |
| --- | --- |
| `list_souls` | List targets with optional workspace and status filters |
| `get_soul` | Get a target by `soul_id` |
| `force_check` | Trigger an immediate check for `soul_id` |
| `get_judgments` | Get results for `soul_id`, with an optional limit |
| `list_incidents` | List incidents, with an optional status filter |
| `get_stats` | Read monitoring statistics |
| `acknowledge_incident` | Acknowledge `incident_id` |
| `create_soul` | Create a monitor with name, type and target |

## Call a read-only tool

~~~bash
curl -X POST http://localhost:8080/api/v1/mcp \
  -H "Authorization: Bearer $ANUBIS_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"list_souls","arguments":{}}}'
~~~

Fetch the tool listing for your installed version's schema. These names come from the implementation; older project documentation used different prefixed names.

## Workspace and permissions

Operations use the authenticated caller's workspace scope. Write operations require the corresponding permissions: `souls:*` for creating a Soul or forcing a check, and `rules:*` for acknowledging an incident.

## Resources and prompts

The server also accepts `resources/list`, `resources/read`, `prompts/list` and `prompts/get`. Discover them from your instance before calling a resource or prompt.

See the [REST API](/docs/api/) for HTTP integrations and [Realtime events](/docs/realtime/) for streams.
