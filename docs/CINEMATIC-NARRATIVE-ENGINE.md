# Cinematic Narrative Studio

The AI GAME FACTORY narrative layer is a structured authoring and runtime system, not a text-only generator.

## Pipeline

Story Bible -> World -> Characters -> Chapters -> Scenes -> Dialogue -> Choices -> Consequences -> Endings -> Story-to-Game

## Persistent state

The project model supports:

- persistent story memory
- character-specific memory
- relationship history and scores
- world state, knowledge, inventory and flags
- unresolved story threads
- delayed and hidden consequences
- versioned canon

The Story Bible is authoritative. Generated content must be validated against canon before it is accepted.

## Cinematic interaction

Scene authoring supports:

- cinematic camera cues
- actor blocking
- scene beats and timing
- branching choices
- QTE
- timed choices
- investigation and clue deduction
- multiple endings
- character fate and relationship changes

These are general, publicly documented interactive-narrative design patterns. The implementation does not reproduce proprietary source code, assets or unpublished technology.

## Narrative QA

narrativeQA() checks structural integrity and produces evidence:

- unknown character references
- invalid timing
- unreachable nodes
- unreachable endings
- continuity issues

The QA model is intentionally extensible for later simulation, contradiction detection, pacing analysis and branch-explosion analysis. Synthetic simulation evidence must not be represented as equivalent to human playtesting.

## Selective regeneration

selectiveRegenerationScope() lets the factory regenerate a targeted story object while preserving canon and dependencies by default.

This prevents a local dialogue or scene revision from silently rewriting the entire story.

## Media pipeline

The narrative model can produce generation specifications for:

- multilingual voice
- music
- cinematic/video

Provider selection remains delegated to the Factory provider router.

## Story -> Game

compileStoryToGame() produces a deterministic manifest connecting narrative content to runtime capabilities such as narrative runtime, gameplay logic, code, audio, voice, video and QA.


## Cinematic Interactive Drama Framework

The factory exposes a dedicated engine-agnostic interactive-drama runtime contract in `narrative.ts`.

### Runtime subsystems

| Subsystem | Factory responsibility |
|---|---|
| Story State | Persistent scene, decision, visit and replay state |
| World State | Mutable variables and flags representing the wider world |
| Character State | Alive/dead state and character variables |
| Relationship Graph | Directed relationships with bounded scores and history |
| Decision Graph | Branching scene targets and decision history |
| Consequence Engine | Immediate and queued delayed consequences |
| Scene Graph | Scene-to-scene and scene-to-ending topology |
| QTE System | Deterministic success/failure timing |
| Timed Decisions | Existing timed-choice contracts and timeout targets |
| Investigation System | Clue collection and deduction resolution |
| Camera Director | Existing camera cues and actor blocking |
| Cinematic Sequencer | Existing beat timing, camera cues and blocking |
| Continuity Doctor | Structural target/character continuity diagnostics |
| Ending Resolver | State-based ending resolution |
| Replay / Alternative Paths | Flowchart generation and persisted visited/decision paths |

### Character fate

A playable character can become unavailable without forcing a global game-over. The runtime retains the story state and selects another living playable character when the active character dies.

### Evidence boundary

The framework is an original implementation based on publicly documented interactive-drama patterns. Quantic Dream's public materials describe branching narratives, consequential choices, multiple playable characters, character death without necessarily ending the story, replay/alternative paths and flowcharts. The Factory does not reproduce proprietary Quantic Dream source code, assets or unpublished implementation details.

### References

- Quantic Dream — Detroit: Become Human official page: https://www.quanticdream.com/en/detroit-become-human
- Quantic Dream — studio history / Detroit production overview: https://www.quanticdream.com/en/our-story
- PlayStation Blog — Detroit branching/flowchart discussion: https://blog.playstation.com/archive/2018/04/23/7-things-youll-notice-in-your-first-30-minutes-of-detroit-become-human/
