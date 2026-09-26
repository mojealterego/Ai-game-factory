# AI GAME FACTORY — Factory Core

This layer is the authoritative control plane for a game project.

## Scope implemented

1. Project Manager — project identity, templates, creation and listing.
2. Game DNA — canonical genre/platform/engine/style/gameplay/narrative constraints with versioning.
3. Project templates — reusable template contract with engine and default configuration.
4. Pipeline orchestration — FactoryOrchestrator coordinates work submitted by agents.
5. Task queue — priority, dependencies, status, retry, pause, resume and cancellation.
6. Agent orchestration — tasks carry agent identity and correlation IDs.
7. Memory / canon — CanonEntry and ProjectStateStore provide the authoritative project memory boundary.
8. Project state — explicit lifecycle states instead of UI-only flags.
9. Versioning — versioned checkpoints capture DNA, canon, state and project data.
10. Checkpoints — named/reasoned snapshots before risky operations.
11. Rollback — restore a checkpoint through the state-store abstraction.
12. Evidence / logs — append-only evidence events with source, action and correlation ID.
13. Permissions — per-agent allow/deny policies and approval requirements.
14. Approvals — explicit pending/approved/rejected action records.
15. Retry / pause / resume — queue controls exposed by the orchestrator.
16. Multi-agent handoff — explicit transfer records containing context, artifacts and acceptance criteria.

## Architecture rule

Factory Orchestrator is a core service, not another numbered agent. The canonical registry is A00–A61.

The implementation is storage-agnostic. ProjectStateStore is the persistence boundary for a future durable cloud/event-store implementation and the Android control plane.

## Governance

High-impact operations can be gated by permissions and approvals. Every orchestration action can carry evidence and correlation identifiers so a project can reconstruct what happened, which agent acted, and why.

## Next runtime integration

Bind these services to the existing cloud database, event log, provider router, build farm and Android UI. The business contracts should remain in Factory Core so cloud and Android clients do not duplicate orchestration logic.
