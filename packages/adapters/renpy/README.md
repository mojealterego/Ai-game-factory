# Ren'Py integration

Ren'Py is now a first-class AI GAME FACTORY engine (`EngineId = renpy`). The Visual Novel Builder routes to Ren'Py by default, while Godot and Unity remain available alternatives.

## Integration

- `packages/factory-core/src/renpy-adapter.ts` — deterministic project scaffold and engine adapter contract.
- `packages/factory-core/src/contracts.ts` — registers `renpy` as an engine ID.
- `packages/factory-core/src/game-builder.ts` — Visual Novel Builder includes `renpy`.
- `packages/factory-core/src/index.ts` — exports the adapter.

## Project output

The adapter produces a standard Ren'Py project contract with `game/script.rpy`, `game/options.rpy`, and a Factory provenance file at `factory/ai-game-factory.json`.

## Engine source

The Factory does not vendor the full Ren'Py engine. The configured engine worker can use the user's `mojealterego/renpy` repository or the upstream Ren'Py source/toolchain.

Ren'Py supports visual-novel scripting, menus/branching, UI/screens, media, save/load and cross-platform builds. Build execution remains a worker concern rather than being hard-coded into Factory Core.
