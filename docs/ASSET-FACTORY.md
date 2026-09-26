# Asset Factory

The Asset Factory is the engine-neutral asset production system for AI GAME FACTORY. It converts a creative asset request into a validated, optimized, provenance-aware engine asset.

## Canonical pipeline

```text
Concept
  ↓
Reference
  ↓
Generation
  ↓
Variation
  ↓
Selection
  ↓
Editing
  ↓
Optimization
  ↓
Metadata
  ↓
Import
  ↓
Engine Asset
```

The ten stages are represented as typed contracts in `packages/factory-core/src/assets.ts` and executed by `packages/factory-core/src/asset-factory-pipeline.ts`.

## Asset coverage

The same lifecycle applies to:

- concept art
- characters
- environments
- props
- weapons
- vehicles
- UI
- icons
- textures
- materials
- sprites
- backgrounds
- VFX
- thumbnails
- promotional graphics

The domain also permits mesh, animation, audio and voice artifacts when a provider/engine adapter needs them as intermediate or dependent assets.

## Stage contract

| Stage | Factory responsibility | Evidence |
|---|---|---|
| Concept | Define visual intent, constraints and deliverable | normalized asset spec |
| Reference | Gather/attach approved references and identity constraints | reference IDs + provenance |
| Generation | Produce one or more candidates through a provider adapter | job/model/provider + artifacts |
| Variation | Create controlled alternatives without losing asset identity | parent/variant linkage |
| Selection | Choose the approved candidate using explicit criteria | selected artifact ID + rationale |
| Editing | Apply targeted changes while preserving locked properties | edit history + output hash |
| Optimization | Fit engine/platform budgets: geometry, texture, memory, draw calls, dimensions | validation metrics |
| Metadata | Attach semantic, technical, licensing and provenance data | metadata manifest |
| Import | Convert/copy into the target engine's asset format/location | import report |
| Engine Asset | Register the final engine-native asset and dependencies | engine asset ID + validation |

## Invariants

1. No asset is considered engine-ready merely because generation succeeded.
2. Every external generation operation records provider/model/job provenance when available.
3. Selection is explicit; the last generated variation is not implicitly the winner.
4. Optimization is target-aware and must not silently violate the requested visual constraints.
5. Metadata and license/provenance travel with the asset.
6. Engine adapters own engine-specific import/export details; Factory Core remains engine-neutral.
7. Every stage can emit artifacts and evidence for audit, rollback and reproducibility.
8. Failed validation blocks release when the execution policy uses `stopOnFailure`.

## Target profiles

The existing 3D pipeline remains a specialization of this general Asset Factory. Its Android Low, Android High, Web, PC, high-end cinematic and Custom profiles become optimization profiles for the generic pipeline.

## Provider architecture

Generation/editing/optimization are provider-neutral. Provider adapters can expose image, 3D, texture/material, VFX or other capabilities. The Factory routes jobs according to capability, policy, cost, latency, quality and license constraints.

## Reference identity and continuity

For characters, environments and recurring props, references are first-class inputs. The pipeline should preserve locked identity attributes across variations and targeted edits. A continuity system may reject outputs that drift from approved references.

## Security and provenance

Source URLs, provider/model, generation job IDs, licenses, hashes and validation evidence are part of the asset record. Secrets belong in the provider/worker layer and never in client-side asset metadata.
