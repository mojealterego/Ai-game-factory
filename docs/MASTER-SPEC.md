# AI GAME FACTORY — MASTER SPECIFICATION

## Mission

AI GAME FACTORY is an engine-agnostic, Android-first production operating system for creating, testing, optimizing and shipping games from natural-language intent.

## Product pillars

1. Game Research Lab
2. Game Ideation Engine
3. Game DNA
4. GDD / Pre-production
5. Agent OS A00-A61
6. Cinematic Narrative Engine
7. Game Builder Hub
8. Gameplay Systems Engine
9. Code Generation / Refactoring
10. Asset Factory
11. 3D Asset Factory
12. Audio / Music / Dubbing
13. Model Registry / GGUF
14. Provider Router
15. Game Knowledge Hub
16. Engine Adapter Layer
17. Cloud Workspace
18. Playtest / Simulation
19. QA / Security / Provenance
20. Build / Release Center
21. Native Android Control Center

## Game Builder Hub

Game Builder Hub is a family of specialized production paths rather than a single generic builder.

Supported builder paths:

- Mobile Game Builder
- 2D Game Builder
- 2.5D Builder
- 3D Builder
- Cinematic Game Builder
- RPG Builder
- Adventure Builder
- Visual Novel Builder
- Interactive Fiction Builder
- Racing Builder
- Sports Builder
- Strategy Builder
- Simulation Builder
- Tycoon Builder
- Puzzle Builder
- Horror Builder
- Survival Builder
- Action Builder
- Arcade Builder
- Platformer Builder
- Tower Defense Builder
- Idle Builder
- Social Builder
- Educational Builder
- Multiplayer Builder
- Party Games Builder
- Card Games Builder
- Board Games Builder
- Couples & Intimacy Builder
- Mature 18+ Builder
- Casino-Style Virtual Builder
- Custom Game Builder

Each profile declares compatible dimensions, engines, capabilities and constraints. A builder selection is compiled into the same vendor-neutral Factory Core contracts used by the rest of the production pipeline.

### Special policy constraints

- Couples & Intimacy is adult relationship/romance/intimacy design without explicit sexual content.
- Mature 18+ is age-gated and may cover mature themes such as horror, crime, violence and dark narratives.
- Casino-Style Virtual is strictly simulated entertainment: no real-money wagering, monetary staking or cash-out.

## Reference capability families

The implementation uses public, documented product capabilities as design references. It does not copy proprietary source code, private systems, protected assets, or confidential implementation details.

- Quantic Dream: branching interactive drama, consequential choices, persistent world state, character fate and replayable narrative graphs.
- Rosebud AI: prompt-to-playable loop, conversational iteration, real code, integrated assets, live preview and multiplayer-oriented browser workflows.
- Ludo.ai: game ideation, research, concepts, GDD-oriented workflows, asset generation and API/MCP integration.
- Fable: living AI characters, memory, relationships, scenes, worlds and emergent interactive storytelling.
- Tripo: text/image/multiview-to-3D, texture, segmentation, mesh processing, retopology, rigging, animation and asynchronous asset jobs.
- Unity AI: project-aware assistant, generators, MCP/AI Gateway and runtime ML patterns.
- Hugging Face / GGUF ecosystem: model discovery, metadata, licensing, quantization and local/cloud model lifecycle.

## Production loop

IDEA -> RESEARCH -> GAME DNA -> BUILDER SELECTION -> GDD -> WORLD -> CHARACTERS -> SYSTEMS -> CODE -> ASSETS -> AUDIO -> ENGINE PROJECT -> PLAYTEST -> QA -> OPTIMIZE -> BUILD -> RELEASE.

Every stage produces typed artifacts, evidence and versioned state.

## Hard architectural rules

- Domain contracts are vendor-neutral.
- Provider credentials remain server-side.
- Generated assets carry provenance and license metadata.
- Model licenses are validated before release.
- Agents operate through explicit capabilities and permissions.
- Destructive operations require approval gates.
- Every long-running operation is asynchronous and resumable.
- Every generated project is reproducible from a versioned manifest.
- Android is a control plane; heavy workloads are cloud/local-worker dependent.
- No provider integration is represented as successful without an actual evidence record.
- Native APK/AAB status is derived from a real build artifact, never a UI flag.
