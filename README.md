# AI GAME FACTORY

Premium Android-first command center for an engine-agnostic AI game production factory.

## Product scope

- Game Research Lab / Reference & Ideation Engine / Game Ideator
- Game DNA / GDD / AI Game Compiler
- A00-A61 Agent OS
- Cinematic Narrative Engine
- Gameplay Systems / Simulation
- AI Game Builder Engine: Prompt → Game Spec → Game DNA → System Design → Code → Assets → World → Playable Build → Playtest → AI Analysis → Iteration
- Fable-style living characters, memory and relationships
- Ludo-style research/ideation and API/MCP adapter
- Quantic Dream-inspired public narrative patterns: branching choices, consequences, character fate and cinematic flow
- Asset Factory (10-stage Concept → Reference → Generation → Variation → Selection → Editing → Optimization → Metadata → Import → Engine Asset pipeline for concept art, characters, environments, props, weapons, vehicles, UI, icons, textures, materials, sprites, backgrounds, VFX, thumbnails and promotional graphics)
- Tripo-style 3D generation/processing pipeline
- Unity AI adapter
- Audio / Dubbing Factory (music, soundtrack, ambient, SFX, footsteps, UI sounds, cinematic sound, voice generation, dubbing, lip-sync, dialogue timing, multilingual voice and capability-based provider routing)
- AI Model Factory (cloud providers, generative-media providers, Hugging Face and local GGUF lifecycle/routing)
- Hugging Face Hub pipeline (Search → Model Card → Files → Compatibility → License → Quantization → Download → Verify → Import → Register → Activate)
- Local Models / GGUF
- Hugging Face
- Provider Router / model cascade
- Game Knowledge Hub (source tracking, evidence, tags, notes and project-linked knowledge retrieval)
- GitHub integration
- Cloud Workspace
- Synthetic Playtest Farm
- QA / Security / Provenance
- Build / Release Center
- Native Android Control Center

## Architecture

The platform is engine-agnostic. Heavy generation, model execution and builds remain provider/cloud/worker dependent, while Android is the primary command and approval surface.

Core loop:

Intent -> Research -> Game DNA -> GDD -> Agents -> Systems -> Code -> Assets -> Engine -> Playtest -> QA -> Build -> Release

Engine adapters include Unreal, Unity, Godot, Cocos Creator, Defold, Stride, MonoGame, Bevy, O3DE, Ren'Py, HTML/Web and future runtimes.

## Reference capability families

The repository documents public capability patterns from Quantic Dream, Rosebud AI, Ludo.ai, Fable, Tripo and current Unity AI. These are architectural references; the project does not copy proprietary code, private implementation details or protected assets.

## Native Android

`apps/android-native/` contains the Kotlin/Compose Control Center. GitHub Actions now performs real Gradle builds for debug APK, release APK and AAB and uploads the resulting artifacts. The current CI artifacts are build outputs; production signing still requires a configured signing identity/secret and is intentionally not fabricated.

## Engine generation and build workers

The engine-neutral layer is now executable at the contract level:
- `engine-project-generator.ts` generates concrete starter files for Unreal, Unity, Godot, Cocos Creator, Defold, Stride, MonoGame, Bevy, O3DE, HTML5/Web, Ren'Py and Custom Runtime.
- `engine-build-worker.ts` resolves engine/target-specific CLI commands and exposes a process-runner interface for cloud workers.
- `engine-registry.ts` binds the concrete generators into `Factory Core → Engine Adapter → Generated Project`.
- External engine SDKs remain worker dependencies; Factory Core never pretends that an unavailable proprietary SDK was executed.

## Documentation

- [Master specification](docs/MASTER-SPEC.md)
- [Reference capability matrix](docs/REFERENCE-MATRIX.md)
- [Cinematic Narrative Engine](docs/CINEMATIC-NARRATIVE-ENGINE.md)
- [AI Game Builder Engine](docs/AI-GAME-BUILDER-ENGINE.md)
- [Reference & Ideation Engine](docs/REFERENCE-IDEATION-ENGINE.md)
- [AI Story World Engine](docs/AI-STORY-WORLD-ENGINE.md)
- [AI Game Compiler](docs/AI-GAME-COMPILER.md)
- [Asset Factory](docs/ASSET-FACTORY.md)
- [3D Asset Factory](docs/3D-ASSET-FACTORY.md)
- [AI Model Factory](docs/AI-MODEL-FACTORY.md)
- [Build Center](docs/BUILD-CENTER.md)
- [QA](docs/QA.md)
- [Game Knowledge Hub](docs/GAME-KNOWLEDGE-HUB.md)
- [Hugging Face Hub](docs/HUGGINGFACE-HUB.md)
- [Unity AI Adapter](docs/UNITY-AI-ADAPTER.md)
- [Game Research Lab](docs/GAME-RESEARCH-LAB.md)
- [Native Android architecture](docs/ANDROID-NATIVE.md)
- [Maximum improvements](docs/MAXIMUM-IMPROVEMENTS.md)

## Status

The repository is the source-control home for the project. The live mobile control center is hosted through Floot. Native Android source is being developed as a first-class project in this repository.

Provider connections, cloud builds and native APK/AAB generation require their respective connected services. The project must never mark an external operation complete without evidence.

## AI GAME FACTORY — Unified Production Core

The repository now exposes one canonical production lifecycle through AI_GAME_FACTORY_PIPELINE:

IDEA → RESEARCH → GAME IDEATION → GAME DNA → GDD → WORLD/CHARACTERS/STORY → MECHANICS → SYSTEMS → CODE → ASSETS → AUDIO → ANIMATION → CINEMATICS → PLAYABLE PROTOTYPE → AI PLAYTEST → QA → OPTIMIZATION → BUILD → APK/AAB → RELEASE.

The four intelligence domains are unified under Factory Core: Research, Creation, Story World, and Cinematic Drama. Ludo is connected through an explicit API/MCP adapter contract, while engine-specific execution remains behind EngineAdapter.

See docs/AI-GAME-FACTORY-ARCHITECTURE.md for the canonical architecture.


### 3D Asset Factory

Complete game-ready 3D pipeline: Text/Image/Multi-view/Concept → generation → Smart Mesh → high detail → segmentation → retopology → polygon optimization → UV → AI Texture → PBR → Auto Rig → Animation → LOD0-LOD3 → collision → optimization → QA/performance → provenance → GLB/FBX/OBJ/USD/Unity/Unreal/Godot/Cocos. Includes an Asset Optimization Agent with mobile/web/PC/console/VR profiles and a Tripo API v3 adapter contract.


## Unity Engine Adapter

AI GAME FACTORY now exposes a dedicated Unity Engine Adapter. It models Unity project context, scene/GameObject/component/package/script/prefab/material/animation/terrain context, project-aware Assistant/agent workflows, Unity asset generators, MCP, AI Gateway, Sentis runtime boundaries and delegated Unity builds.

The adapter is engine-owned: it does not bundle Unity Editor, Unity AI models or proprietary Unity implementation. A live Unity operation requires a real Unity 6+ project/worker with the applicable packages, cloud linkage and access.

The shared Asset Router can route AssetRequest workloads between Unity-native generation, Tripo, OpenAI, Gemini, Stability, Replicate, Fal, Hugging Face, Local GGUF and custom providers.

See docs/UNITY-ENGINE-ADAPTER.md.


## Executable Factory Runtime

Factory Core now includes an execution boundary connecting Agent OS, Cloud Workers, Provider/Ludo adapters, Engine Adapters and Build Farm. See docs/EXECUTION-RUNTIME.md. The GitHub Actions Build Farm workflow supports real Android APK/AAB compilation from apps/android-native.
