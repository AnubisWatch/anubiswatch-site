# Monitoring protocols

Define each monitored target as a Soul. The protocol selects the checker; the target, interval, timeout and assertions decide what a healthy result means.

## Souls (Monitored Targets)

### Root `souls` Array

Each soul represents a monitored target.

| Field | Type | Default | Required | Description |
|-------|------|---------|----------|-------------|
| `name` | string | - | **Yes** | Human-readable name |
| `type` | string | - | **Yes** | Check type (see below) |
| `target` | string | - | **Yes** | Target URL/host |
| `weight` | duration | `60s` | No | Check interval |
| `timeout` | duration | `10s` | No | Check timeout |
| `enabled` | boolean | `true` | No | Enable/disable check |
| `tags` | array | - | No | Tags for filtering/alerting |
| `regions` | array | - | No | Regions to run checks from |
| `<type>` | object | - | Conditional | Protocol-specific config |

### Supported Types

| Type | Protocol | Config Block |
|------|----------|--------------|
| `http` | HTTP/HTTPS | `http` |
| `tcp` | TCP | `tcp` |
| `udp` | UDP | `udp` |
| `dns` | DNS | `dns` |
| `smtp` | SMTP | `smtp` |
| `imap` | IMAP | `imap` |
| `icmp` | ICMP Ping | `icmp` |
| `grpc` | gRPC | `grpc` |
| `websocket` | WebSocket | `websocket` |
| `tls` | TLS Cert | `tls` |

### `http` Block

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `method` | string | `GET` | HTTP method |
| `headers` | object | - | Custom headers |
| `body` | string | - | Request body |
| `valid_status` | array | `[200-299]` | Accepted status codes |
| `body_contains` | string | - | Required body substring |
| `body_regex` | string | - | Body regex pattern |
| `json_path` | object | - | JSON path assertions |
| `json_schema` | string | - | JSON Schema (draft 2020-12) |
| `feather` | duration | - | Max response time budget |
| `follow_redirects` | boolean | `true` | Follow redirects |
| `max_redirects` | integer | `5` | Max redirect count |

#### HTTP Example

```yaml
souls:
  - name: "Production API"
    type: http
    target: "https://api.example.com/health"
    weight: 30s
    timeout: 10s
    tags: ["production", "api", "critical"]
    http:
      method: GET
      headers:
        Authorization: "Bearer ${API_TOKEN}"
      valid_status: [200, 201]
      body_contains: '"status":"ok"'
      json_path:
        "$.status": "ok"
        "$.services.db": "connected"
      feather: 500ms
```

### `tcp` Block

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `banner_match` | string | - | Expected banner regex |
| `send` | string | - | Data to send (hex or text) |
| `expect` | string | - | Expected response |

#### TCP Example

```yaml
souls:
  - name: "PostgreSQL Primary"
    type: tcp
    target: "db-primary.example.com:5432"
    weight: 15s
    timeout: 5s
    tags: ["database", "critical"]
    tcp:
      banner_match: "PostgreSQL"
```

### `dns` Block

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `record_type` | string | `A` | DNS record type |
| `expected` | array | - | Expected values |
| `nameservers` | array | System DNS | Nameservers to query |
| `propagation_check` | boolean | `false` | Check propagation |
| `propagation_threshold` | integer | `100` | Required agreement % |
| `dnssec_validate` | boolean | `false` | Validate DNSSEC |

#### DNS Example

```yaml
souls:
  - name: "Primary DNS"
    type: dns
    target: "example.com"
    weight: 60s
    timeout: 10s
    tags: ["dns", "critical"]
    dns:
      record_type: A
      expected: ["93.184.216.34"]
      nameservers:
        - "8.8.8.8:53"
        - "1.1.1.1:53"
      propagation_check: true
      propagation_threshold: 100
```

### `tls` Block

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `expiry_warn_days` | integer | `30` | Days until warning |
| `expiry_critical_days` | integer | `7` | Days until critical |
| `min_protocol` | string | `TLS1.2` | Minimum TLS version |
| `expected_issuer` | string | - | Expected CA issuer |
| `check_ocsp` | boolean | `false` | Check OCSP stapling |
| `min_key_bits` | integer | `2048` | Minimum key size |

#### TLS Example

```yaml
souls:
  - name: "API Certificate"
    type: tls
    target: "api.example.com:443"
    weight: 3600s
    timeout: 10s
    tags: ["security", "certificate"]
    tls:
      expiry_warn_days: 30
      expiry_critical_days: 7
      min_protocol: "TLS1.2"
      expected_issuer: "Let's Encrypt"
      check_ocsp: true
      min_key_bits: 2048
```

### `grpc` Block

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `service` | string | - | gRPC service name |
| `tls` | boolean | `false` | Use TLS |
| `metadata` | object | - | Request metadata |
| `feather` | duration | - | Response time budget |

#### gRPC Example

```yaml
souls:
  - name: "Payment Service gRPC"
    type: grpc
    target: "grpc.example.com:9090"
    weight: 30s
    timeout: 5s
    tags: ["production", "grpc", "payments"]
    grpc:
      service: "payment.PaymentService"
      tls: true
      metadata:
        x-api-key: "${GRPC_API_KEY}"
      feather: 200ms
```

### `websocket` Block

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `headers` | object | - | Upgrade headers |
| `subprotocols` | array | - | WebSocket subprotocols |
| `send` | string | - | Message to send |
| `expect_contains` | string | - | Expected response substring |
| `ping_check` | boolean | `false` | Validate ping/pong |

#### WebSocket Example

```yaml
souls:
  - name: "Realtime Feed"
    type: websocket
    target: "wss://ws.example.com/feed"
    weight: 60s
    timeout: 10s
    tags: ["websocket", "realtime"]
    websocket:
      headers:
        Authorization: "Bearer ${WS_TOKEN}"
      subprotocols: ["graphql-ws"]
      send: '{"type":"connection_init"}'
      expect_contains: "connection_ack"
      ping_check: true
```

### `icmp` Block

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `count` | integer | `4` | Number of pings |
| `interval` | duration | `200ms` | Between pings |
| `max_loss_percent` | integer | `0` | Max packet loss % |
| `feather` | duration | - | Latency budget |
| `privileged` | boolean | `true` | Use raw sockets |

#### ICMP Example

```yaml
souls:
  - name: "Gateway Router"
    type: icmp
    target: "10.0.0.1"
    weight: 15s
    timeout: 5s
    tags: ["network", "infrastructure"]
    icmp:
      count: 5
      interval: 200ms
      max_loss_percent: 20
      feather: 100ms
      privileged: true
```

---
