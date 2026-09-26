# AI GAME FACTORY

Premium Android-first command center for an engine-agnostic AI game production factory.

## Product scope

- Game Research Lab / Game Ideator
- Game DNA / GDD / AI Game Compiler
- A00-A61 Agent OS
- Cinematic Narrative Engine
- Gameplay Systems / Simulation
- Rosebud-style prompt-to-playable workflow
- Fable-style living characters, memory and relationships
- Ludo-style research/ideation and API/MCP adapter
- Quantic Dream-inspired public narrative patterns: branching choices, consequences, character fate and cinematic flow
- Asset Factory (10-stage Concept → Reference → Generation → Variation → Selection → Editing → Optimization → Metadata → Import → Engine Asset pipeline for concept art, characters, environments, props, weapons, vehicles, UI, icons, textures, materials, sprites, backgrounds, VFX, thumbnails and promotional graphics)
- Tripo-style 3D generation/processing pipeline
- Unity AI adapter
- Audio / Dubbing Factory (music, soundtrack, ambient, SFX, footsteps, UI sounds, cinematic sound, voice generation, dubbing, lip-sync, dialogue timing, multilingual voice and capability-based provider routing)
- AI Model Factory (cloud providers, generative-media providers, Hugging Face and local GGUF lifecycle/routing)
- Local Models / GGUF
- Hugging Face
- Provider Router / model cascade
- Game Knowledge Hub
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
- [AI Game Compiler](docs/AI-GAME-COMPILER.md)
- [Asset Factory](docs/ASSET-FACTORY.md)
- [3D Asset Factory](docs/3D-ASSET-FACTORY.md)
- [AI Model Factory](docs/AI-MODEL-FACTORY.md)
- [Unity AI Adapter](docs/UNITY-AI-ADAPTER.md)
- [Game Research Lab](docs/GAME-RESEARCH-LAB.md)
- [Native Android architecture](docs/ANDROID-NATIVE.md)
- [Maximum improvements](docs/MAXIMUM-IMPROVEMENTS.md)

## Status

The repository is the source-control home for the project. The live mobile control center is hosted through Floot. Native Android source is being developed as a first-class project in this repository.

Provider connections, cloud builds and native APK/AAB generation require their respective connected services. The project must never mark an external operation complete without evidence.