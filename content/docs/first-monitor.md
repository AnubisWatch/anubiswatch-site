# Your first monitor

A Soul is a monitored target. Start with one HTTP endpoint, inspect its Judgments and choose the conditions that should notify your team.

## Start the guardian

In one terminal, run the initialized binary:

~~~bash
./anubis serve
~~~

Open the dashboard URL printed during initialization. In another terminal, use the same configuration and data location. Windows users can invoke `.\anubis.exe` in place of `./anubis`.

## Define an HTTP soul

~~~bash
./anubis watch https://example.com/health \
  --name "Example API" \
  --interval 30s \
  --type http
~~~

Replace the example endpoint with your own health endpoint. The command creates a monitor with a 30-second interval.

## Read the judgment

~~~bash
./anubis judge "Example API"
./anubis judge --all
~~~

Look at status, response time and assertions. Use **Souls** in the dashboard to inspect the target and **Judgments** to see its check history.

## Define it in configuration

Add a Soul to your JSON or YAML configuration:

~~~yaml
souls:
  - name: "Example API"
    type: http
    target: "https://example.com/health"
    weight: "30s"
    timeout: "10s"
    enabled: true
    http:
      method: GET
      valid_status: [200]
~~~

`weight` is the check interval in the configuration schema. Validate your selected configuration and start the server with it:

~~~bash
./anubis config validate
./anubis serve --config ./anubis.yaml
~~~

## Choose what comes next

- [Protocol checks](/docs/protocols/) for ports, records and certificates.
- [Synthetic journeys](/docs/journeys/) for complete flows.
- [Alerts and verdicts](/docs/alerts/) for notifications.
- [Configuration](/docs/configuration/) for authentication and server settings.
