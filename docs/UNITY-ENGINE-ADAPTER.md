# Unity Engine Adapter

AI GAME FACTORY uses a dedicated Unity adapter rather than copying Unity AI or emulating the Unity Editor.

## Boundary

The adapter delegates real Unity work to a user-owned Unity 6+ project/Editor worker when one is available. The Factory owns orchestration contracts, context modeling, routing, provenance and evidence; Unity owns the actual Editor/runtime.

Unity's current public AI tooling includes a project-aware in-editor Assistant, Generators, AI Gateway and official MCP Server. Unity documents project context including scene hierarchy/GameObjects/components/packages and target platform, and requires Unity 6+ for the current AI tooling.

Official references:
- https://unity.com/features/ai
- https://unity.com/blog/unity-ai-how-to-get-started
- https://docs.unity.com/en-us/engine/6000.7/manual/unity-ai/ai-menu-access

## Adapter surface

- UnityProjectContext: scene graph, GameObjects, components, packages, scripts, prefabs, materials, animations, terrain and serialized settings.
- UnityEngineAdapter: bootstrap, scene/code/asset/build delegation, Assistant, Code Agent, Scene Agent, Asset Generator, MCP Bridge, AI Gateway and Sentis runtime boundary.
- UnityGeneratorAdapter: Sprite, Texture, Material, Sound, Animation, Terrain, VFX/UI/reference routing contracts.
- AssetRouter: Unity, Tripo, OpenAI, Gemini, Stability, Replicate, Fal, Hugging Face, Local GGUF and Custom Provider.

## Runtime boundary

The repository does not contain Unity Editor, Unity AI models, Unity proprietary code, or a fabricated MCP implementation. A live operation requires a real Unity project and an attached Unity worker/Editor with the appropriate Unity version, packages, project-cloud linkage and applicable licensing/access.

The adapter returns queued/delegated results when no live bridge exists. This is intentional: the Factory must not report that an Editor action, asset generation or build actually happened when no worker executed it.

## Asset provenance

Generated Unity assets carry explicit AI-generated metadata in the Factory contract. Production import/storage workers should preserve Unity-side generated-asset metadata together with Factory provenance.

## Runtime ML

Sentis is represented as a runtime boundary. It is not treated as an asset generator and the Factory does not claim to implement Sentis itself.
