# 3D Asset Pipeline

## Full scope

The 3D Asset Pipeline is the production-grade specialization of the general Asset Factory.

```text
text → 3D
image → 3D
reference → 3D
       ↓
mesh processing
       ↓
topology
       ↓
UV
       ↓
textures
       ↓
PBR
       ↓
materials
       ↓
rigging
       ↓
animation
       ↓
LOD
       ↓
collision
       ↓
optimization
       ↓
engine export
       ↓
asset validation
```

## Typed pipeline

The canonical stages are represented by `ThreeDStage` and `THREE_D_ASSET_PIPELINE` in `packages/factory-core/src/assets.ts`.

The executable orchestration layer is `packages/factory-core/src/three-d-pipeline.ts`. External DCCs, generators and engine SDKs are injected as stage executors; Factory Core does not claim an external operation completed without an adapter result.

## Inputs

- **Text → 3D**: structured prompt/brief to a compatible 3D generator.
- **Image → 3D**: source image plus provenance and reconstruction constraints.
- **Reference → 3D**: approved project references, identity constraints and source lineage.

## Production stages

| Stage | Required responsibility |
|---|---|
| Mesh processing | clean, repair, merge/separate, normals and geometry preparation |
| Topology | inspect/retopologize and enforce topology constraints |
| UV | unwrap, pack and validate UV sets |
| Textures | generate/bake texture maps |
| PBR | validate physically based map sets and conventions |
| Materials | assemble engine-neutral material definitions |
| Rigging | skeleton, weights and constraints |
| Animation | create/retarget/validate animation clips |
| LOD | generate and validate LOD chain |
| Collision | generate and validate collision geometry |
| Optimization | enforce platform/engine budgets |
| Engine export | serialize to the selected engine adapter format |
| Asset validation | technical, visual, provenance and budget gates |

## Job requirements

The contract supports target engine/platform, polygon budget, texture resolution, LOD count, rigging/animation/collision/PBR requirements and export format.

## Validation gates

Release readiness can require:

- mesh integrity and topology checks
- UV validity
- texture dimensions/color-space checks
- PBR completeness
- material references
- scale/pivot checks
- rig and weight integrity
- animation integrity
- LOD coverage
- collision coverage
- memory/file-size/draw-call budgets
- engine import/export integrity
- provenance and license metadata.

## Engine adapters

The pipeline remains engine-neutral and can target Unreal, Unity, Godot, Cocos Creator, Defold, Stride, MonoGame, Bevy, O3DE, HTML/Web and future adapters.

## Relationship to Asset Factory

The general Asset Factory remains:

`Concept → Reference → Generation → Variation → Selection → Editing → Optimization → Metadata → Import → Engine Asset`

The 3D branch expands the production portion into:

`Text/Image/Reference → Generation → Mesh Processing → Topology → UV → Textures → PBR → Materials → Rigging → Animation → LOD → Collision → Optimization → Engine Export → Asset Validation`

Thus 3D assets retain the general Factory's provenance and creative lineage while gaining production-specific geometry, material, animation and engine validation.
