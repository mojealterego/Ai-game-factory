# No-Code Agent Builder

AI GAME FACTORY exposes a portable, versioned graph contract for building agents without hand-written orchestration.

## Canonical flow

```text
TRIGGER
   ↓
AGENT
   ↓
MODEL
   ↓
TOOL
   ↓
CONDITION
   ↓
AGENT
   ↓
OUTPUT
```

The graph is extensible: branches, joins, memory and approval nodes can be inserted while preserving explicit edges.

## Implemented contract

`packages/factory-core/src/no-code-agent-builder.ts` provides:

- **Graph editor model** — typed nodes, edges, entry node and output nodes.
- **Node types** — trigger, agent, model, tool, condition, output, memory, approval.
- **Inputs / outputs** — typed names, required flags, descriptions and defaults.
- **Permissions** — agent-level and node-level permission declarations.
- **Tools / models** — explicit allowlists plus node-specific configuration.
- **Memory** — run, agent, project or global scope with read/write policy.
- **Conditions** — explicit edge conditions/labels for inspectable branching.
- **Retries** — none, fixed delay or exponential backoff, bounded to 1–5 attempts.
- **Approvals** — none, before deployment, before node, or on failure.
- **Deployment** — draft → validated → deployed → paused → retired, with environment/version/endpoint.
- **Pause / resume** — explicit run states with checkpoint support.
- **Logs** — structured run/node log entries.
- **Evidence** — input, output, model call, tool call, approval, condition, error and artifact evidence.
- **Versions** — immutable snapshots containing graph, I/O, memory, retry, approval, permissions, tools and models.

## Validation and runtime boundary

Validation rejects empty graphs, invalid entry/output IDs, invalid edges, missing trigger/output nodes, empty node names and invalid retry limits. Tool nodes without explicit permissions produce a warning.

The module is a **portable contract**, not a fake executor. Actual model/tool execution, durable checkpoints, secret storage, graph UI rendering and production deployment require runtime workers/adapters. Secrets must never be embedded in graph definitions, logs or evidence.

## Test coverage

The contract test verifies:
1. canonical graph validation;
2. exponential retry delay calculation;
3. pause/resume state transitions;
4. rejection of an invalid entry node.

## Scope checklist

- [x] graph editor contract
- [x] inputs
- [x] outputs
- [x] permissions
- [x] tools
- [x] models
- [x] memory
- [x] conditions
- [x] retries
- [x] approvals
- [x] deployment
- [x] pause/resume
- [x] logs
- [x] evidence
- [x] versions
