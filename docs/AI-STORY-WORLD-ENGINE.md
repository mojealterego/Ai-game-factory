# AI STORY WORLD ENGINE

This layer turns story design into an executable state system. It is separate from the text-oriented Story Generator and complements the Cinematic Interactive Drama Engine.

## Model

```
STORY
│
├── WORLD
│   ├── Geography
│   ├── History
│   ├── Politics
│   ├── Culture
│   ├── Factions
│   └── Rules
│
├── CHARACTERS
│   ├── Identity
│   ├── Personality
│   ├── Memory
│   ├── Goals
│   ├── Relationships
│   ├── Secrets
│   └── Arc
│
├── EVENTS
│   ├── Main
│   ├── Side
│   ├── Dynamic
│   └── Emergent
│
└── NARRATIVE STATE
    ├── Canon
    ├── Timeline
    ├── Consequences
    ├── Relationships
    └── Player Choices
```

## Runtime

The executable state is represented by `StoryWorldState`.

Key operations:

- `createStoryWorld()` — initializes a runtime world from a Story World specification.
- `applyStoryEvent()` — executes an event and records its consequence.
- `recordPlayerChoice()` — persists a player decision and mutates state.
- `addMemory()` — updates character memory.
- `resolveDynamicEvents()` — finds currently eligible events from state.
- `advanceTimeline()` — advances the canonical timeline and executes scheduled events.
- `registerCanon()` — protects immutable canon from accidental rewriting.
- `registerEmergentEvent()` — adds runtime-generated events without modifying existing event definitions.
- `evaluateCanon()` — queries canonical facts.
- `getRelationship()` — exposes relationship state for downstream narrative systems.

## State-driven narrative

The story is not treated as a static document. Events have conditions and effects. Player choices produce persisted consequences. Character memory is updated as events affect characters. Dynamic and emergent events can be resolved against the current state.

This creates the foundation for:

```
PLAYER CHOICE
      ↓
NARRATIVE STATE
      ↓
WORLD / CHARACTER MUTATION
      ↓
MEMORY + RELATIONSHIPS
      ↓
EVENT ELIGIBILITY
      ↓
NEW SCENE / EVENT
      ↓
NEW STATE
```

## Canon and timeline

Canon entries can be immutable. Attempts to rewrite an immutable entry fail closed.

Timeline entries provide deterministic ordering and can reference events that execute when the timeline advances.

## Character intelligence

The runtime stores identity, personality, memory, goals, relationships, secrets and arc as structured state. It does not pretend that an LLM call itself constitutes character memory: persistent memory must exist in the runtime state and be available as evidence to any future model invocation.

## Relationship to other Factory modules

```
REFERENCE & IDEATION ENGINE
          ↓
         GDD
          ↓
       GAME DNA
          ↓
AI STORY WORLD ENGINE
          ↓
CINEMATIC NARRATIVE ENGINE
          ↓
AI GAME BUILDER
          ↓
ENGINE ADAPTER
```

The Story World Engine owns persistent world/narrative state; the Cinematic Narrative Engine owns interactive-drama flow, decisions, QTE, investigation and cinematic scene logic.

## Fable capability boundary

Public Fable materials describe AI-assisted interactive storytelling and character/world experiences. The Factory implementation is an original engine-agnostic state model inspired by publicly described capabilities, not a reproduction of proprietary Fable code, models or unpublished architecture.

The current implementation is a deterministic runtime contract. AI inference, persistent external memory stores, model routing and cloud workers remain provider/runtime adapters around this core.
