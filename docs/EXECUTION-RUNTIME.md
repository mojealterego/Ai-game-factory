# AI GAME FACTORY — Execution & Runtime Layer

## Cel

Ten moduł zamienia architekturę Factory Core w wykonywalny pipeline:

Agent OS → Cloud Workers → Provider/Ludo → Engine Adapter → Build Farm → APK/AAB

Factory Core pozostaje warstwą kontraktów i deterministycznego planowania. Runtime dostarcza wykonanie przez rzeczywiste adaptery.

## Warstwy

1. Agent OS Runtime — wykonuje graf No-Code Agent Builder, utrzymuje run state, checkpoint i evidence, obsługuje routing warunkowy.
2. Cloud Worker Runtime — abstrahuje zdalne workery HTTP i używa idempotency keys.
3. Provider Runtime — wykonuje istniejące ProviderAdapter przez ProviderRouter.
4. Ludo Runtime — wykonuje LudoAdapter przez API/MCP transport z backendowym secret resolverem.
5. Engine Runtime — wykonuje EngineAdapter i deleguje specyfikę silnika do właściwego workera.
6. Build Farm — GitHubActionsBuildFarm deleguje build do GitHub Actions.

## Rzeczywisty przebieg

Android Control Center
  → Factory Execution Runtime
  → Agent OS Runtime
  → Cloud Worker Runtime
  → Ludo / Provider Runtime
  → Engine Adapter
  → Build Farm
  → GitHub Actions
  → Gradle
  → APK/AAB
  → checksum + evidence
  → artifact

## Konfiguracja wykonawcza

Runtime wymaga backendowego secret managera dla:
- GitHub Actions tokena z uprawnieniami wymaganymi do dispatchu i odczytu runów/artefaktów,
- kluczy Ludo,
- kluczy providerów,
- kluczy podpisywania Androida.

Sekrety nie powinny być przekazywane do aplikacji Android ani zapisywane w Game DNA, agentach, logach lub artefaktach.

## APK/AAB

Workflow .github/workflows/factory-build.yml ma workflow_dispatch z wejściami:
- projectId
- engine
- target: android-apk / android-aab
- configuration
- sign

Dla Androida buduje istniejący projekt apps/android-native. Jest to rzeczywisty build Gradle, a nie symulacja.

## Granica obecnego wykonania

Kod runtime i workflow są zaimplementowane. Do wykonania end-to-end wymagane są:
- token GitHub Actions,
- skonfigurowani providerzy/Ludo,
- dostępne workery cloud,
- konkretny projekt silnika,
- produkcyjny keystore, jeśli wymagane jest podpisanie release.

Samo dodanie adaptera nie jest traktowane jako dowód wykonania. Evidence musi pochodzić z rzeczywistego workera, runu lub artefaktu.

## Źródła implementacyjne

GitHub REST API udostępnia dispatch workflow przez workflow_dispatch oraz odczyt statusu runów i artefaktów. Runtime korzysta z tych granic zamiast emulować wykonanie.
