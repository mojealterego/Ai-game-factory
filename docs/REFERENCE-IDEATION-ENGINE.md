# REFERENCE & IDEATION ENGINE

AI GAME FACTORY includes a dedicated research and pre-production layer. It is not a game engine.

## Pipeline

```
RESEARCH
   ↓
REFERENCE INGESTION
   ↓
CONSTRAINT MODELING
   ↓
IDEA BATCH
   ↓
SELECT
   ↓
VARIATION
   ↓
GDD
   ↓
GAME DNA
```

## Inputs

The engine accepts:

- themes
- genres and sub-genres
- mechanics
- existing reference games
- previously generated concepts
- existing GDDs
- platform
- player perspective
- art direction
- hard or soft constraints
- research signals
- mechanic database references

References remain first-class data. Every generated concept records source reference IDs and generation provenance.

## Research Lab

The research contract supports:

- genre analysis
- mechanic analysis
- trend signals
- competitive/reference games
- platform signals
- mechanic database
- confidence and evidence
- source tracking

Research is represented by `GameResearchRecord` and `ResearchSignal`. External web/research providers can populate these records without coupling Factory Core to one vendor.

## Game Ideator

`generateIdeaBatch()` produces multiple concepts from the same structured input.

Each concept contains:

- title
- concept
- genres
- mechanics
- theme
- platform
- perspective
- art style
- constraints
- concept-art prompt
- references
- provenance
- parent/variation lineage

`selectIdea()` marks a concept as selected.

`createVariation()` creates a child concept while retaining lineage and reference provenance.

`createGDD()` converts the selected concept into a structured GDD.

`convertGDDToGameDNA()` bridges the pre-production layer into the existing AI GAME FACTORY compiler.

## Reference blending

Existing games and mechanics can be used as inputs without treating their proprietary assets, code or confidential implementation as source material. The engine stores references as research/design inputs and produces original concepts.

## Ludo capability mapping

Public Ludo documentation describes a Game Ideator that accepts themes, mechanics, existing games, previous ideas and GDDs, with platform, genre, art-style and perspective filters; concepts can be varied or developed into projects/GDDs. Ludo's Project tool provides an AI-assisted GDD workspace with mechanics, story, characters and embedded generated media. citeturn0search5turn0search1turn0search3

Ludo's current API/MCP documentation separately describes programmatic asset generation for sprites, animation, images, 3D, video and audio. The Factory therefore keeps research/ideation as its own layer while allowing the existing Asset Factory/provider adapters to consume the resulting specifications. citeturn0search0turn0search4

## Architecture

```
GAME RESEARCH LAB
       │
       ├── Reference Database
       ├── Mechanic Database
       ├── Trend Signals
       └── Competition Signals
              │
              ▼
      REFERENCE & IDEATION
              │
       ┌──────┼──────┐
       ▼      ▼      ▼
    Concept Concept Concept
       └──────┼──────┘
              ▼
           SELECT
              ▼
          VARIATION
              ▼
             GDD
              ▼
          GAME DNA
              ▼
       AI GAME BUILDER
```

## Runtime boundary

The current implementation is a deterministic Factory Core contract. It does not claim to have live Ludo research access or live Ludo generation credentials. External research sources and Ludo API/MCP can be connected through provider adapters; evidence must be recorded before an external operation is considered complete.
