# Reference Capability Matrix

| Reference | Capability translated into Factory |
|---|---|
| Quantic Dream | Decision graph, consequence engine, character fate, world state, QTE/timed choices, cinematic scene flow, replay graph, ending resolver |
| Rosebud AI | Prompt-to-game compiler, conversational code iteration, live preview, integrated asset loop, remix/fork workflow, multiplayer-ready adapter |
| Ludo.ai | Game Ideator, reference-game research, mechanic mining, concept batches, GDD/project workspace, MCP/API adapter |
| Fable | Character memory, relationship state, free-form dialogue, emotional state, world simulation, emergent narrative |
| Tripo | Text/image/multiview 3D, texture, segmentation, retopology, rigging, animation, conversion, async task orchestration |
| Unity AI | Project-aware assistant, Ask/Plan/Agent separation, editor actions, generators, MCP bridge, AI gateway, runtime ML adapter |

## Integration policy

These references are capability inputs, not dependencies. AI GAME FACTORY remains functional with zero third-party providers by using mock/local adapters where possible.

## Adapter tiers

- Tier 0: local deterministic implementation
- Tier 1: open/public model or engine integration
- Tier 2: provider API adapter
- Tier 3: optional premium provider
- Tier 4: project-specific enterprise adapter

Every adapter declares capabilities, authentication requirements, cost model, latency class, data residency and licensing constraints.
