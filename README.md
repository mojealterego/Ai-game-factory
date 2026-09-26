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
- Asset Factory
- Tripo-style 3D generation/processing pipeline
- Unity AI adapter
- Audio, music, speech and dubbing
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

`apps/android-native/` contains the Kotlin/Compose foundation for the native Control Center. The production release pipeline is designed to generate and verify signed APK/AAB artifacts from real build evidence.

## Documentation

- [Master specification](docs/MASTER-SPEC.md)
- [Reference capability matrix](docs/REFERENCE-MATRIX.md)
- [Cinematic Narrative Engine](docs/CINEMATIC-NARRATIVE-ENGINE.md)
- [AI Game Compiler](docs/AI-GAME-COMPILER.md)
- [3D Asset Factory](docs/3D-ASSET-FACTORY.md)
- [Unity AI Adapter](docs/UNITY-AI-ADAPTER.md)
- [Game Research Lab](docs/GAME-RESEARCH-LAB.md)
- [Native Android architecture](docs/ANDROID-NATIVE.md)
- [Maximum improvements](docs/MAXIMUM-IMPROVEMENTS.md)

## Status

The repository is the source-control home for the project. The live mobile control center is hosted through Floot. Native Android source is being developed as a first-class project in this repository.

Provider connections, cloud builds and native APK/AAB generation require their respective connected services. The project must never mark an external operation complete without evidence.