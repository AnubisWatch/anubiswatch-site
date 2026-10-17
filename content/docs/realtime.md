# Realtime events

Duat delivers changes from your running instance. The embedded dashboard uses realtime updates; external clients can connect through WebSocket or server-sent events.

## Available endpoints

| Endpoint | Transport |
| --- | --- |
| `/ws` | WebSocket |
| `/api/v1/events` | Authenticated server-sent events |

Use your deployment's server URL and scheme. HTTPS instances use `wss://` for WebSocket.

## Listen with server-sent events

~~~bash
curl -N http://localhost:8080/api/v1/events \
  -H "Authorization: Bearer $ANUBIS_API_TOKEN"
~~~

`-N` disables curl output buffering so events can arrive as they are sent.

## Connect with WebSocket

Connect to `ws://localhost:8080/ws` or your instance's `wss://` URL. Authentication and allowed origins apply to the configured deployment.

Native browser WebSocket clients cannot add an arbitrary Authorization header. Use the authentication mechanism supported by your instance and ensure the client origin is allowed.

## Configure allowed origins

~~~yaml
server:
  allowed_origins:
    - "https://monitoring.example.com"
~~~

Allow the origin of the actual client. See [server configuration](/docs/configuration/#server-configuration) for origin and proxy settings.

## Handle reconnects

Reconnect with bounded backoff when the network changes or a service restarts. Reconcile state through the [REST API](/docs/api/) after reconnecting. Check your installed version's event definitions before building a payload parser.
