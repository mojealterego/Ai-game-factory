# AI GAME BUILDER ENGINE

AI GAME FACTORY now has a dedicated prompt-to-playable compilation layer.

## Production loop

```
PROMPT
  ↓
GAME SPEC
  ↓
GAME DNA
  ↓
SYSTEM DESIGN
  ↓
CODE GENERATION
  ↓
ASSET GENERATION
  ↓
WORLD GENERATION
  ↓
PLAYABLE BUILD
  ↓
PLAYTEST
  ↓
AI ANALYSIS
  ↓
ITERATION
```

The engine is intentionally separate from individual game-builder profiles. Existing `GameBuilder`, `Game DNA`, asset, narrative, audio, 3D and engine-adapter modules remain reusable downstream workers.

## Prompt-to-project behavior

A user can provide a single natural-language description. The compiler extracts deterministic requirements where they are explicitly expressed:

- platform
- genre
- dimensionality
- engine
- number of protagonists
- number of endings
- decisions
- procedural events
- procedural quests
- adaptive difficulty
- AI NPCs
- NPC memory
- dynamic dialogue
- progression
- multiplayer
- browser-native target

It then creates a project structure containing:

- `factory/game-spec.json`
- `factory/game-dna.json`
- `factory/system-design.json`
- `factory/iteration-policy.json`
- engine-specific scaffold files
- a playable-build manifest when the pipeline reaches the playable-build stage

This is deliberately a **compiler/planner contract**, not a claim that AI providers or engine workers have already generated the final production game.

## Example

Input:

> Stwórz mi mobilną grę survival horror w opuszczonym szpitalu, z trzema bohaterami, systemem decyzji, proceduralnymi wydarzeniami i pięcioma zakończeniami.

The compiler produces a normalized specification with:

- Android target
- horror + survival genres
- abandoned-hospital world requirements
- 3 playable heroes
- decision system
- procedural events
- 5 endings
- branching narrative DNA
- generated system dependencies
- default Godot engine when no engine is specified

An explicit engine in the prompt or request overrides the default.

## Iteration

Playtest evidence is fed into `analyzePlaytest()`. Findings are converted by `planIteration()` into:

- priority findings
- code changes
- asset changes
- world changes
- regression checks

The loop can therefore return to implementation instead of treating a first build as final.

## Rosebud capability mapping

Public Rosebud materials describe natural-language game creation, generated code, assets, live preview/playtesting, browser-native 2D/3D games, multiplayer workflows and AI NPCs. The Factory translates those publicly documented patterns into its own engine-agnostic contracts rather than copying Rosebud's proprietary implementation.

Sources:

- https://rosebud.ai/vibe-coding-tool
- https://rosebud.ai/ai-game-creator
- https://rosebud.ai/online-game-maker
- https://lab.rosebud.ai/ai-game-builder

## Runtime boundary

The compiler can create the specification and scaffold locally in Factory Core. Actual code/model/asset generation, engine compilation, playtest execution, cloud workers and publishing require connected provider and worker adapters.

No generated artifact should be represented as playable, tested or production-ready without corresponding worker evidence.
