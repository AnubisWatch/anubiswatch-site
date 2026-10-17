# Synthetic journeys

Monitor a complete sequence of HTTP requests, extract variables and verify assertions at each step.

## Synthetic Monitoring (Journeys)

### Root `journeys` Array

| Field | Type | Default | Required | Description |
|-------|------|---------|----------|-------------|
| `name` | string | - | **Yes** | Journey name |
| `weight` | duration | `300s` | No | Run interval |
| `timeout` | duration | `30s` | No | Total timeout |
| `continue_on_failure` | boolean | `false` | No | Continue on step failure |
| `variables` | object | - | No | Journey variables |
| `steps` | array | - | **Yes** | Journey steps |

### `steps[]` Block

| Field | Type | Default | Required | Description |
|-------|------|---------|----------|-------------|
| `name` | string | - | **Yes** | Step name |
| `type` | string | `http` | No | Step type |
| `target` | string | - | **Yes** | Target URL |
| `http` | object | - | No | HTTP config |
| `extract` | object | - | No | Variable extraction |

### `extract` Block

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `<var_name>` | object | - | Extraction rule |

### Extraction Rule

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `from` | string | - | `body`, `header`, `cookie` |
| `json_path` | string | - | JSON path (for body) |
| `header_name` | string | - | Header name |
| `cookie_name` | string | - | Cookie name |
| `regex` | string | - | Regex pattern |

### Journey Example

```yaml
journeys:
  - name: "User Login Flow"
    weight: 300s
    timeout: 30s
    continue_on_failure: false
    variables:
      base_url: "https://app.example.com"
      test_email: "${TEST_EMAIL}"
      test_password: "${TEST_PASSWORD}"
    steps:
      - name: "Get CSRF Token"
        type: http
        target: "${base_url}/login"
        http:
          method: GET
          valid_status: [200]
        extract:
          csrf_token:
            from: body
            json_path: "$.csrf_token"

      - name: "Perform Login"
        type: http
        target: "${base_url}/api/auth/login"
        http:
          method: POST
          headers:
            Content-Type: "application/json"
            X-CSRF-Token: "${csrf_token}"
          body: |
            {"email": "${test_email}", "password": "${test_password}"}
          valid_status: [200]
        extract:
          auth_token:
            from: body
            json_path: "$.token"

      - name: "Fetch Dashboard"
        type: http
        target: "${base_url}/api/dashboard"
        http:
          method: GET
          headers:
            Authorization: "Bearer ${auth_token}"
          valid_status: [200]
          feather: 2s
```

---
