# 3D ASSET FACTORY

## Cel

3D Asset Factory jest game-ready warstwą produkcji 3D nad istniejącym ThreeD Pipeline. Przyjmuje wymagania projektu, wybiera pipeline zależny od typu assetu, prowadzi generację i post-processing, następnie optymalizuje asset pod docelowy runtime i dopiero wtedy eksportuje go do silnika.

## Input

- Text → 3D
- Image → 3D
- Multi-view → 3D
- Concept → 3D

## Processing

~~~text
INPUT
 ↓
GENERATION
 ↓
SMART MESH
 ↓
HIGH DETAIL
 ↓
SEGMENTATION
 ↓
RETOPOLOGY
 ↓
POLYGON OPTIMIZATION
 ↓
UV
 ↓
AI TEXTURE
 ↓
PBR MATERIALS
 ↓
MATERIAL OPTIMIZATION
 ↓
AUTO RIG
 ↓
ANIMATION
 ↓
LOD
 ↓
COLLISION
 ↓
ASSET OPTIMIZATION
 ↓
QUALITY CHECK
 ↓
PERFORMANCE CHECK
 ↓
LICENSE / PROVENANCE
 ↓
EXPORT
~~~

## Asset-specific factories

- Character Pipeline: topology → UV → PBR → rig → animation → LOD → collision → optimization → validation → export.
- NPC Variant Factory: controlled variants preserving source identity, skeleton and provenance.
- Prop Pipeline: segmentation → topology → materials → LOD → collision → optimization.
- Environment Pipeline: segmentation → topology → material optimization → LOD → collision → runtime budget.
- Vehicle Pipeline: topology → materials → LOD → collision → optimization.
- Weapon Pipeline: topology → materials → LOD → collision → optimization.

## Asset Optimization Agent

The Factory selects an optimization profile before engine import:

- polygon budget,
- texture resolution,
- LOD0,
- LOD1,
- LOD2,
- LOD3,
- collision policy,
- material complexity,
- draw-call budget,
- target memory.

Profiles:
- mobile,
- web,
- PC,
- console,
- VR,
- custom.

For Android/iOS the default mobile policy caps geometry and texture complexity and creates four LOD levels. These are Factory defaults, not universal engine limits.

## Export

The Factory contract supports GLB, FBX, OBJ, USD, Unity, Unreal, Godot and Cocos.

An export is not release-ready until its URI, checksum, license and provenance are present.

## Tripo Adapter

The Tripo adapter maps Factory operations to the documented Tripo API v3 task model.

Generation:
- text → text_to_model
- image → image_to_model
- multiview → multiview_to_model
- concept → text-driven generation

Processing:
- smart mesh → mesh completion
- segmentation → mesh segmentation
- retopology → decimation/retopology
- AI texture → texture
- auto rig → rig
- animation → retarget

The adapter uses an injected transport. It does not contain an API key and does not claim success before the provider reports task completion.

Tripo's current public API documents asynchronous tasks, text/image/multiview generation, texture, segmentation, retopology, rigging and retargeting, plus game-oriented low-poly and face-count controls. The Factory consumes these through an adapter rather than coupling its core to Tripo internals.

## Quality / performance / provenance

Three separate gates are intentional:

1. Quality — geometry, UV, materials, rig, animation and export integrity.
2. Performance — polygons, texture memory, material complexity, draw calls, LOD and collision.
3. License / Provenance — provider, model, source references, license, task IDs and checksum.

## Runtime boundary

Implemented:
- complete 3D Asset Factory contract,
- asset-category pipelines,
- optimization planner,
- four-level LOD planning,
- collision/material/draw-call/memory policy,
- export validation,
- Tripo API v3 adapter contract.

Still requires execution infrastructure:
- live Tripo API credentials,
- HTTP/MCP worker,
- actual file download/storage,
- engine import workers,
- device profiling,
- production collision baking,
- real performance measurement.

These are runtime responsibilities and must be evidenced by actual worker results.
