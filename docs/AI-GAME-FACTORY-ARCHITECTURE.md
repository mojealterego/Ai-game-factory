# AI GAME FACTORY — Unified Architecture

AI GAME FACTORY jest jednym systemem produkcyjnym. Ludo, Rosebud, Fable i Quantic Dream są źródłami publicznie udokumentowanych wzorców oraz — tam, gdzie istnieją oficjalne interfejsy — adapterów zewnętrznych. Jedynym właścicielem lifecycle projektu jest Factory Core.

## Kanoniczny lifecycle

~~~text
IDEA
 ↓
RESEARCH
 ↓
GAME IDEATION
 ↓
GAME DNA
 ↓
GDD
 ↓
WORLD / CHARACTERS / STORY
 ↓
MECHANICS
 ↓
SYSTEMS
 ↓
CODE
 ↓
ASSETS
 ↓
AUDIO
 ↓
ANIMATION
 ↓
CINEMATICS
 ↓
PLAYABLE PROTOTYPE
 ↓
AI PLAYTEST
 ↓
QA
 ↓
OPTIMIZATION
 ↓
BUILD
 ↓
APK / AAB
 ↓
RELEASE
~~~

Ten lifecycle jest zapisany jako AI_GAME_FACTORY_PIPELINE.

## Cztery domeny inteligencji

1. Research Intelligence — badanie, referencje i ideacja.
2. Creation Intelligence — kompilacja gry, systemów, kodu i projektu.
3. Story World Intelligence — świat, postacie, pamięć, relacje, zdarzenia i stan narracyjny.
4. Cinematic Drama Intelligence — rozgałęzienia, konsekwencje, QTE, investigation, kamera, continuity i endings.

Nie są to cztery niezależne generatory. Wszystkie produkują i konsumują artefakty tego samego Factory Project.

## Artifact continuity

Każdy etap zachowuje ten sam projectId. Przepływ jest następujący:

~~~text
IDEA
 → RESEARCH
 → GAME IDEATION
 → SELECTED IDEA
 → GDD
 → GAME DNA
 → GAME BUILDER PLAN
 → STORY WORLD
 → MECHANICS / SYSTEMS
 → CODE / ASSETS / AUDIO / ANIMATION
 → CINEMATICS
 → PLAYABLE PROTOTYPE
 → AI PLAYTEST
 → QA
 → OPTIMIZATION
 → BUILD
 → RELEASE
~~~

Factory nie uznaje wygenerowania pojedynczego pliku za ukończenie projektu.

## Ludo API / MCP

ludo-api-mcp-adapter.ts definiuje oficjalny punkt integracji dla dwóch transportów: API oraz MCP.

Adapter jest transport-agnostyczny. Klucz API, sekret MCP i sesja dostawcy nie trafiają do klienta Android ani do kodu domenowego.

Obsługiwane publicznie udokumentowane kategorie obejmują m.in. game research, game ideation, project workflows, sprites, animation, icons, UI, textures, music, sound/SFX, 3D, video i concept art.

Rzeczywiste wywołanie sieciowe jest odpowiedzialnością LudoTransportAdapter. Dzięki temu Factory może użyć REST API albo MCP bez zmiany pipeline.

## Engine Adapter System

Factory Core nie jest zależny od jednego silnika. Projekt przechodzi przez EngineAdapter.

Obsługiwane identyfikatory:
- Unreal
- Unity
- Godot
- Cocos
- Defold
- Stride
- MonoGame
- Bevy
- O3DE
- HTML5
- Ren'Py
- custom

Integracja Unity MCP może zostać podłączona jako adapter/editor bridge. Nie staje się częścią Factory Core.

## Wspólne warstwy

Jeden lifecycle wykorzystuje wspólne usługi:
- Game DNA
- AI Agent OS A00–A61
- Engine Adapter System
- Asset Factory
- 3D Pipeline
- Audio/Dubbing
- GGUF / Local Models
- Hugging Face
- Provider Router
- Game Knowledge Hub
- GitHub
- Cloud Workspace
- Build Center
- QA
- Security/IP
- No-Code Agent Builder
- Story Generator
- Cinematic Narrative Studio
- Android Control Center

## Release gate

Release zależy od Build i QA.

QA pozostaje evidence-driven. Aktualny kontrakt zawiera 16 rodzin kontroli:
- static analysis
- code validation
- asset validation
- dependency checks
- performance
- memory
- crashes
- gameplay tests
- narrative consistency
- continuity
- localization
- accessibility
- security
- license/IP
- device testing
- regression tests

Kontrakt nie oznacza, że wszystkie workery zostały uruchomione. Release wymaga rzeczywistych wyników i dowodów.

## Granica implementacji

Zaimplementowano:
- nadrzędny 19-etapowy lifecycle,
- zależności etapów,
- cztery domeny inteligencji pod Factory Core,
- ciągłość projectId i artefaktów,
- Research → Ideation → GDD → Game DNA → Game Builder,
- wejście Story World do wspólnego projektu,
- wspólny kontrakt Asset/3D/Audio/Cinematic/QA,
- adapter Ludo API/MCP.

Nie deklaruję jako wykonane bez runtime evidence:
- rzeczywistych wywołań Ludo API/MCP,
- produkcyjnych cloud workers,
- rzeczywistych buildów silników,
- wygenerowanego w tym commicie APK/AAB,
- testów urządzeniowych,
- produkcyjnego secret managera.

## Publiczne źródła

Aktualne publiczne materiały Ludo.ai dokumentują API/MCP oraz generatory i integracje agentowe. Unity dokumentuje MCP jako most pomiędzy klientem AI a Unity Editor.

https://ludo.ai/docs/api-mcp
https://ludo.ai/blog/introducing-ludo-ai-api-mcp-integration
https://ludo.ai/tools/game-asset-mcp-server
https://docs.unity3d.com/Packages/com.unity.ai.assistant@2.0/manual/unity-mcp-overview.html

## 3D Asset Factory

The shared asset layer now includes the complete game-ready 3D Asset Factory: text/image/multiview/concept input, Smart Mesh, high detail, segmentation, retopology, polygon optimization, UV, AI texture, PBR materials, auto rig, animation, LOD0-LOD3, collision, quality/performance/provenance gates and GLB/FBX/OBJ/USD plus engine export targets.

The Asset Optimization Agent selects mobile/web/PC/console/VR/custom profiles before engine import. Its output includes polygon budget, texture resolution, LOD budgets, collision policy, material complexity, draw-call budget and target memory.

Tripo is integrated through an adapter contract for its asynchronous API v3 operations. The Factory remains provider-agnostic and does not expose provider credentials to Android clients.
