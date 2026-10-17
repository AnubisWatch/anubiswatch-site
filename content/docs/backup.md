# Backup & restore

Use the backup commands with the configuration and data directory of the instance to protect. The CLI reads local configured storage; running it on an unrelated machine does not back up your remote server.

## Create a compressed backup

~~~bash
anubis backup create \
  --include-history \
  --output ./anubis-backup.json.gz
~~~

Compression is enabled by default. `--include-history` includes judgment history. Use `--no-compress` for an uncompressed output.

## List and inspect

~~~bash
anubis backup list
anubis backup info ./anubis-backup.json.gz
~~~

Inspect the backup before a restore. Store copies separately from the machine and volume they protect.

## Restore during maintenance

Plan a maintenance window and preserve the current data before replacing it:

~~~bash
anubis restore ./anubis-backup.json.gz --force
~~~

`--force` permits replacing existing data. Confirm the file is the backup you intend to restore and use the matching instance configuration.

## Verify recovery

After restarting:

~~~bash
anubis health
anubis status
anubis judge --all
~~~

Check the dashboard, targets and alert channels. Rehearse recovery rather than treating a backup file's existence as proof of a successful restore.

See the [production runbook](/docs/production/) for smoke tests and [storage configuration](/docs/configuration/#storage-configuration) for retention.
