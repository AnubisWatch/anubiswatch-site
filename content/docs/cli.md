# CLI reference

Use the command-line interface with the same configuration and data directory as your AnubisWatch instance. Run `anubis help` for the installed binary’s command help.

## CLI

```bash
anubis help
anubis version

anubis init
anubis init --interactive
anubis init --location user
anubis init --output ./anubis-prod.json

anubis serve
anubis serve --single --config ./configs/anubis.yaml
anubis serve --cluster --bootstrap --node-name jackal-01 --region eu-west
anubis serve --cluster --join jackal-01:7946 --node-name jackal-02

anubis watch https://example.com/health --name "Example API" --interval 30s --type http
anubis judge
anubis judge --all
anubis judge "Example API"

anubis souls export --format yaml --output souls.yaml
anubis souls import --replace souls.yaml
anubis souls add monitors.yaml
anubis souls remove example-api

anubis backup create --include-history --output ./backup.json.gz
anubis backup list
anubis backup info anubis_backup_20260115_143022.json.gz
anubis restore ./backup.json.gz --force

anubis config validate
anubis config show
anubis config path
anubis config set server.port 9443

anubis status
anubis health
anubis logs --follow
anubis export souls
anubis export config

anubis necropolis
anubis summon 10.0.0.2:7946 --name jackal-02 --region us-east
anubis banish jackal-02
```

Useful environment variables:

| Variable | Purpose |
|----------|---------|
| `ANUBIS_CONFIG` | Config file path |
| `ANUBIS_HOST` / `ANUBIS_PORT` | HTTP bind host and port |
| `ANUBIS_HTTP_PORT` | Server port override used by `serve` |
| `ANUBIS_DATA_DIR` | Data directory |
| `ANUBIS_ENCRYPTION_KEY` | Enables storage encryption and sets the key |
| `ANUBIS_ADMIN_PASSWORD` | Initial local admin password |
| `ANUBIS_LOG_LEVEL` | `debug`, `info`, `warn`, or `error` |
| `ANUBIS_API_TOKEN` | Token used by CLI commands that call the running API |
| `ANUBIS_NODE_ID` | Cluster node name override |
| `ANUBIS_BIND_ADDR` / `ANUBIS_RAFT_PORT` | Raft bind address/port |
| `ANUBIS_CLUSTER_SECRET` | Cluster shared secret |
| `ANUBIS_CORS_ORIGINS` | Comma-separated CORS allowlist |
