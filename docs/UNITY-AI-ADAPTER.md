# Unity AI Adapter

Unity is one engine adapter, not the Factory itself.

## Current capability mapping

- Ask -> read-only explanation/inspection
- Plan -> task decomposition
- Agent -> approved project actions
- Generators -> asset generation
- MCP -> external Factory/IDE control bridge
- AI Gateway -> provider/agent interoperability
- Sentis -> runtime/local ML integration

## Factory bridge

Factory -> Unity Adapter -> Unity Editor/CLI -> project artifacts.

The adapter exposes normalized operations such as:

- inspect_project
- inspect_scene
- create_game_object
- modify_component
- create_asset
- update_script
- run_editor_test
- build_target
- collect_diagnostics

Every mutating operation is permission checked and recorded.
