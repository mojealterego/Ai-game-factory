# AI GAME FACTORY — Architecture

## Control plane
Android-first mobile command center. The mobile client orchestrates projects, agents, providers, models, assets, builds and QA; heavy compute remains backend/cloud.

## Core layers
1. Factory UI
2. Provider Router
3. Agent Runtime
4. Game DNA / engine-neutral schema
5. Asset / Audio / 3D pipelines
6. GGUF Model Registry
7. Hugging Face Import Queue
8. Cloud Workspace / Build Center
9. GitHub source control
10. QA / Evidence / Release gates

## Provider-neutral contract
Every provider adapter exposes normalized capabilities: chat, structured output, tool calling, vision, embeddings, image, video, speech and music where supported. Routing can be manual, automatic or fallback-based.

## Security
API credentials never belong in frontend code or database rows. Floot-managed/external credentials are server-side resources. Provider permissions are scoped per adapter.

## Agent Builder
No-code graph: Trigger → Intent → Planner → Provider Router → Tools → Memory → Approval → Executor → QA → Evidence → Output.

## Game engines
Unreal, Unity, Godot, Cocos Creator, Defold, Stride, MonoGame, Bevy, O3DE, Ren'Py, HTML5/Web and future adapters. The Game DNA is engine-neutral; adapters map it to a target runtime.

## Engine-neutral generation

AI GAME FACTORY is engine-agnostic. The production boundary is:

`Factory Core → Engine Adapter → Generated Project`

The canonical engine catalog is: Unreal Engine, Unity, Godot, Cocos Creator, Defold, Stride, MonoGame, Bevy, O3DE, HTML5/WebGL, Ren'Py, and Custom Runtime. Factory Core owns Game DNA, orchestration, provenance and validation; an Engine Adapter translates that state into an engine-specific generated project contract; a build worker then invokes the actual engine/toolchain. This keeps the core independent of any single engine.
