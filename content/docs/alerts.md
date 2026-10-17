# Alerts & verdicts

A Judgment is a check result. A Verdict evaluates your alert conditions and dispatches a message through the channels you configure.

## Alert Channels

### Root `channels` Array

| Field | Type | Default | Required | Description |
|-------|------|---------|----------|-------------|
| `name` | string | - | **Yes** | Channel name |
| `type` | string | - | **Yes** | Channel type |
| `<type>` | object | - | **Yes** | Type-specific config |

### Supported Channel Types

| Type | Description | Config Block |
|------|-------------|--------------|
| `slack` | Slack webhook | `slack` |
| `discord` | Discord webhook | `discord` |
| `telegram` | Telegram bot | `telegram` |
| `email` | SMTP email | `email` |
| `pagerduty` | PagerDuty | `pagerduty` |
| `opsgenie` | Atlassian Opsgenie | `opsgenie` |
| `sms` | Twilio SMS | `sms` |
| `ntfy` | Ntfy.sh push | `ntfy` |
| `webhook` | Generic webhook | `webhook` |

### `slack` Block

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `webhook_url` | string | - | Slack incoming webhook |
| `channel` | string | - | Override channel |
| `username` | string | `AnubisWatch` | Bot username |
| `icon_emoji` | string | `:anubis:` | Bot emoji icon |
| `mention_on_critical` | array | - | Users/roles to mention |

#### Slack Example

```yaml
channels:
  - name: "ops-slack"
    type: slack
    slack:
      webhook_url: "${SLACK_WEBHOOK_URL}"
      channel: "#ops-alerts"
      username: "AnubisWatch"
      icon_emoji: ":anubis:"
      mention_on_critical: ["@oncall-team"]
```

### `discord` Block

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `webhook_url` | string | - | Discord webhook URL |
| `username` | string | `AnubisWatch` | Bot username |
| `avatar_url` | string | - | Bot avatar URL |

#### Discord Example

```yaml
channels:
  - name: "dev-discord"
    type: discord
    discord:
      webhook_url: "${DISCORD_WEBHOOK_URL}"
      username: "AnubisWatch"
```

### `email` Block

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `smtp_host` | string | - | SMTP server |
| `smtp_port` | integer | `587` | SMTP port |
| `starttls` | boolean | `true` | Use STARTTLS |
| `username` | string | - | SMTP username |
| `password` | string | - | SMTP password |
| `from` | string | - | From address |
| `to` | array | - | Recipients |
| `subject_template` | string | - | Go template for subject |

#### Email Example

```yaml
channels:
  - name: "ops-email"
    type: email
    email:
      smtp_host: "smtp.example.com"
      smtp_port: 587
      starttls: true
      username: "${SMTP_USER}"
      password: "${SMTP_PASS}"
      from: "anubis@example.com"
      to:
        - "ops@example.com"
        - "cto@example.com"
      subject_template: "[{{ .Severity }}] {{ .Soul.Name }} — {{ .Judgment.Status }}"
```

### `pagerduty` Block

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `integration_key` | string | - | PagerDuty integration key |
| `severity_map` | object | - | Custom severity mapping |
| `auto_resolve` | boolean | `true` | Auto-resolve on recovery |

#### PagerDuty Example

```yaml
channels:
  - name: "pagerduty-oncall"
    type: pagerduty
    pagerduty:
      integration_key: "${PAGERDUTY_INTEGRATION_KEY}"
      severity_map:
        critical: "critical"
        warning: "warning"
        info: "info"
      auto_resolve: true
```

### `ntfy` Block

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `server` | string | `https://ntfy.sh` | Ntfy server URL |
| `topic` | string | - | Topic name |
| `priority_map` | object | - | Priority mapping |

#### Ntfy Example

```yaml
channels:
  - name: "ntfy-push"
    type: ntfy
    ntfy:
      server: "https://ntfy.sh"
      topic: "anubis-alerts"
      priority_map:
        critical: "urgent"
        warning: "high"
        info: "default"
```

### `webhook` Block

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `url` | string | - | Webhook URL |
| `method` | string | `POST` | HTTP method |
| `headers` | object | - | Custom headers |
| `body_template` | string | - | Go template for body |
| `timeout` | duration | `10s` | Request timeout |

#### Generic Webhook Example

```yaml
channels:
  - name: "custom-webhook"
    type: webhook
    webhook:
      url: "https://hooks.example.com/alerts"
      method: POST
      headers:
        Authorization: "Bearer ${WEBHOOK_TOKEN}"
        Content-Type: "application/json"
      body_template: |
        {
          "severity": "{{ .Severity }}",
          "soul": "{{ .Soul.Name }}",
          "status": "{{ .Judgment.Status }}",
          "timestamp": "{{ .Judgment.Timestamp }}"
        }
```

---

## Alert Rules (Verdicts)

### Root `verdicts` Block

| Field | Type | Default | Required | Description |
|-------|------|---------|----------|-------------|
| `rules` | array | - | No | Alert rules list |
| `escalation` | array | - | No | Escalation policies |

### `verdicts.rules[]` Block

| Field | Type | Default | Required | Description |
|-------|------|---------|----------|-------------|
| `name` | string | - | **Yes** | Rule name |
| `scope` | string | `"all"` | No | Target scope |
| `condition` | object | - | **Yes** | Trigger condition |
| `severity` | string | `"warning"` | No | Alert severity |
| `channels` | array | - | No | Channels to notify |
| `cooldown` | duration | `5m` | No | Min time between alerts |

### Scope Formats

| Format | Description |
|--------|-------------|
| `all` | All souls |
| `tag:<tag>` | Souls with specific tag |
| `type:<type>` | Souls of specific type |
| `soul:<name>` | Specific soul by name |
| `region:<region>` | Souls in specific region |

### Condition Types

#### `consecutive_failures`

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `type` | string | - | `consecutive_failures` |
| `threshold` | integer | - | Number of failures |

```yaml
condition:
  type: consecutive_failures
  threshold: 3
```

#### `threshold`

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `type` | string | - | `threshold` |
| `metric` | string | - | Metric name |
| `operator` | string | - | `>`, `<`, `>=`, `<=`, `==` |
| `value` | string | - | Threshold value |
| `window` | duration | - | Evaluation window |

```yaml
condition:
  type: threshold
  metric: latency_p95
  operator: ">"
  value: "500ms"
  window: 5m
```

#### `percentage`

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `type` | string | - | `percentage` |
| `metric` | string | - | Metric name |
| `operator` | string | - | Comparison operator |
| `threshold` | integer | - | Percentage threshold |
| `window` | duration | - | Evaluation window |

```yaml
condition:
  type: percentage
  metric: failure_rate
  operator: ">"
  threshold: 10
  window: 5m
```

### Available Metrics

| Metric | Description |
|--------|-------------|
| `latency_p50` | 50th percentile latency |
| `latency_p95` | 95th percentile latency |
| `latency_p99` | 99th percentile latency |
| `latency_max` | Maximum latency |
| `failure_rate` | Failure percentage |
| `uptime_percent` | Uptime percentage |
| `tls_days_until_expiry` | Days until cert expiry |
| `propagation_percent` | DNS propagation % |
| `packet_loss_percent` | ICMP packet loss % |

### Example Rules

```yaml
verdicts:
  rules:
    - name: "Service Down - Critical"
      scope: "all"
      condition:
        type: consecutive_failures
        threshold: 3
      severity: critical
      channels: ["ops-slack", "pagerduty-oncall"]
      cooldown: 5m

    - name: "High Latency"
      scope: "tag:production"
      condition:
        type: threshold
        metric: latency_p95
        operator: ">"
        value: "1s"
        window: 5m
      severity: warning
      channels: ["ops-slack"]
      cooldown: 15m

    - name: "Certificate Expiring Soon"
      scope: "tag:security"
      condition:
        type: threshold
        metric: tls_days_until_expiry
        operator: "<"
        value: 14
      severity: warning
      channels: ["ops-email"]
      cooldown: 24h
```

### Escalation Policies

```yaml
verdicts:
  escalation:
    - name: "production-escalation"
      stages:
        - wait: 0s
          channels: ["ops-slack", "ntfy-push"]
        - wait: 5m
          channels: ["pagerduty-oncall"]
          condition: "not_acknowledged"
        - wait: 15m
          channels: ["ops-email", "sms-oncall"]
          condition: "not_resolved"
```

---
