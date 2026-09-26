# Factory Core

Provider-neutral domain layer for AI GAME FACTORY.

## Core domains

- projects
- game DNA
- narrative state
- gameplay systems
- agents
- jobs
- providers
- models
- assets
- knowledge
- builds
- QA
- provenance

## Contract

The core never depends directly on a vendor SDK. Vendor integrations implement adapters.

```text
Domain Request
  -> Capability Policy
  -> Adapter
  -> Async Job
  -> Artifact
  -> Validation
  -> Registry
```

This keeps Unreal, Unity, Godot and other engine integrations interchangeable.
