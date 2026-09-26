# Security / IP

Security and IP are first-class Factory Core contracts. This module governs access, secrets, project isolation, licensing, provenance, generated-content metadata and approval gates.

## Security architecture

### Secret manager / backend-only API keys
API keys are represented only by `SecretReference`. The value itself is never part of a graph, model spec, client payload, audit event or repository file.

Supported storage boundary:
- backend secret manager;
- cloud secret manager;
- Android Keystore for device-local secrets.

The canonical policy is **server-only, never logged, never persisted as plaintext**. Client applications receive references/status, never secret values.

### Permissions and agent capabilities
Authorization combines:
1. project scope;
2. resource;
3. action;
4. agent capability;
5. tool/model allowlist;
6. approval policy.

A capability is not permission by itself: a capability must still be authorized for the current project/resource.

### Audit log
Security decisions and approval decisions generate structured audit events containing actor, project, action, resource, outcome, timestamp and optional correlation metadata. Production persistence must use an append-only durable store.

### Project isolation
Every security-sensitive object carries `projectId`. Cross-project reads/writes/exports are denied unless an explicit future sharing mechanism exists. The in-memory contract intentionally fails closed.

### License tracking
Assets, models, sources, providers and packages can carry a `LicenseRecord`. Model licenses additionally retain model ID, version/revision and model-card reference.

Unreviewed or blocked licenses cannot be treated as production-usable by `assertLicenseUsable`.

### Asset provenance
Provenance captures human/generated/imported/derived/provider origin, provider/model/version, source URIs, input assets, prompt hash, generation-parameter hash and license record.

### Generated-content metadata
Generated artifacts carry content hash, generation timestamp, provenance reference and optional provider/model/version, prompt and input hashes.

### Approval gates
Approval gates cover secret use, external network access, publishing, production deployment, license exceptions, restricted assets and destructive actions. The gate must be approved before the consequential operation is released to its worker.

## Required invariants

- [x] secret values never enter client-side contracts;
- [x] API keys are backend-only;
- [x] permissions are project-scoped;
- [x] agent capabilities are explicit;
- [x] audit events include outcome;
- [x] project isolation is fail-closed;
- [x] asset licenses are tracked;
- [x] model licenses are tracked;
- [x] asset provenance is tracked;
- [x] generated-content metadata is tracked;
- [x] consequential operations can require approval.

## Runtime boundary

These are portable contracts and fail-closed policy helpers. They do not claim a production secret manager, durable audit database, sandbox or IAM system exists until an actual backend adapter is connected and verified.
