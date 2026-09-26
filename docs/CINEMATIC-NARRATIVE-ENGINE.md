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
