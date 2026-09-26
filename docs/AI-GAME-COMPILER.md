# AI Game Compiler

The compiler turns natural-language intent into a reproducible game project.

## Pipeline

Prompt
-> Intent Spec
-> Game DNA
-> System Graph
-> Narrative/World Spec
-> Engine Plan
-> Task Graph
-> Source
-> Assets
-> Tests
-> Build Manifest

## Incremental iteration

A user request such as "make the jump higher" becomes a constrained patch against the existing Game DNA and implementation. The compiler must prefer minimal validated changes over full regeneration.

## Diff-aware generation

Every generation records:

- requested intent
- affected systems
- files/assets touched
- tests added/changed
- generated artifacts
- rollback point
- provider/model
- token/cost metadata
- validation result

## Self-healing loop

Detect -> Diagnose -> Propose Patch -> Test -> Verify -> Apply.

No automatic repair may bypass security, licensing or approval policies.
