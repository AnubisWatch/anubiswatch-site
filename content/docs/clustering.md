# Clustering & Raft

A cluster is optional. Choose the deployment mode that matches your needs.

## Three deployment modes

| Mode | Behavior | Typical use |
| --- | --- | --- |
| Standalone | One process with embedded storage; no Raft cluster | Development and simple self-hosting |
| Single-node Raft | A node uses Raft and elects itself | Replicated-state foundation without remote peers |
| Multi-node cluster | Jackals use Raft consensus and region-aware probes | Multiple nodes and regions |

The Pharaoh is the Raft leader. Jackals participate in the monitoring and control plane; their cluster is the Necropolis.

## Standalone

~~~bash
anubis serve
~~~

No cluster configuration is required.

## Single-node Raft

~~~bash
anubis serve --cluster
~~~

Configuration also supports `necropolis.single_node`. Review [cluster configuration](/docs/configuration/#cluster-configuration-necropolis) for the available settings.

## Bootstrap a cluster

Set a shared cluster secret on the nodes that join your cluster:

~~~bash
export ANUBIS_CLUSTER_SECRET="replace-with-a-strong-shared-secret"
anubis serve --cluster --bootstrap \
  --node-name jackal-01 \
  --region eu-west \
  --bind 0.0.0.0:7946
~~~

Keep the secret private and provide it through your deployment's secret mechanism.

## Join a Jackal

On another node, set the matching secret and use a reachable existing node:

~~~bash
export ANUBIS_CLUSTER_SECRET="replace-with-the-same-shared-secret"
anubis serve --cluster \
  --join jackal-01:7946 \
  --node-name jackal-02 \
  --region us-east
~~~

Names and regions above are examples. Nodes need network reachability between their configured cluster addresses.

## Inspect the Necropolis

~~~bash
anubis necropolis
anubis status
~~~

Use the dashboard's Cluster view for topology and node state. Continue with [deployment](/docs/deployment/) and the [production runbook](/docs/production/) for rollout and operational checks.
