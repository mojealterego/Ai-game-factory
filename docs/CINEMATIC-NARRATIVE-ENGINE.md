# Cinematic Narrative Engine

## State model

Narrative state is a versioned graph:

- world state
- scene state
- character state
- relationship state
- knowledge state
- inventory/state variables
- reputation
- flags
- timeline
- unresolved threads
- player decisions
- consequence queue

## Runtime

A scene contains entry conditions, actors, objectives, beats, dialogue, camera cues, interactions, QTE/timed decisions, exits and state mutations.

Decision resolution supports:

1. immediate consequences
2. delayed consequences
3. hidden consequences
4. relationship changes
5. world-state mutations
6. character survival/fate changes
7. future scene availability
8. ending eligibility

## Authoring tools

- node graph
- flowchart
- scene editor
- character cards
- relationship graph
- timeline
- choice editor
- consequence preview
- branch diff
- continuity doctor
- canon validator
- ending simulator

## AI safeguards

The Story Bible is authoritative. Generated dialogue cannot silently mutate canon. Proposed mutations enter a validation queue.

## Simulation

The Narrative Simulator can execute thousands of synthetic playthroughs to discover:

- dead branches
- unreachable endings
- contradictory state
- missing variables
- pacing problems
- impossible choices
- relationship discontinuities
- excessive branch explosion

Outputs are evidence artifacts, not claims of human playtest equivalence.
