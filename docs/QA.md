# QA / Quality Assurance

QA is an evidence-gated release subsystem. It does not merely display test statuses: each required check must return machine-readable status plus evidence before the project can pass the QA release gate.

## Complete QA matrix

| Check | Scope | Typical evidence |
|---|---|---|
| Static analysis | lint, type analysis, static rules | tool report / CI run |
| Code validation | compile, schemas, generated code contracts | compiler/test output |
| Asset validation | dimensions, formats, importability, PBR/mesh constraints | asset validation report |
| Dependency checks | dependency integrity, vulnerabilities, incompatible versions | dependency scan |
| Performance | frame time, CPU/GPU, load times, budgets | benchmark/device trace |
| Memory | heap/RAM/VRAM, leaks, allocation budgets | profiler snapshot |
| Crashes | crash-free runs, stack traces, fatal exceptions | crash report |
| Gameplay tests | core loops, controls, save/load, win/lose conditions | automated/playtest evidence |
| Narrative consistency | story graph, choices, states, dialogue constraints | narrative QA report |
| Continuity | character/world/state/reference continuity | continuity report |
| Localization | missing strings, placeholders, overflow, locale coverage, timing | localization report |
| Accessibility | input, text, contrast, captions, audio alternatives and platform checks | accessibility audit |
| Security | secrets, permissions, unsafe dependencies, attack-surface rules | security scan |
| License / IP | dependency licenses, asset/model provenance, usage restrictions | license/IP report |
| Device testing | Android/device matrix, resolution, API level, hardware/runtime behavior | device-lab evidence |
| Regression tests | previously fixed defects and golden scenarios | regression suite report |

## Release gate

All 16 checks are required by the default `createQAPlan()`.

A check is not considered passed merely because its process completed. It must return:

- explicit `passed` status
- at least one evidence reference
- optional findings and metrics
- worker identity/timestamps where available.

Missing worker, missing evidence, failed check, blocked check or skipped required check prevents `ready === true`.

## Architecture

`QA Plan → QA Workers → QA Results → Evidence → Gate Evaluation → Build/Release`

Workers are intentionally adapter-neutral. Static analysis may run in CI, gameplay/device tests may run in a device lab, narrative checks may delegate to Narrative QA, asset checks to Asset Factory validators, and license/security checks to dedicated scanners.

## Existing Factory integration

- Narrative consistency can consume the existing Narrative QA report.
- Asset validation can consume Asset Factory validation evidence.
- Security and license/IP checks align with the existing provenance and policy contracts.
- Device testing belongs to the cloud/device-lab side of the Android-first architecture.
- Build Center must consume the QA report before release packaging is considered release-ready.

## No false positives

QA deliberately distinguishes `passed` from `not configured`. A missing worker produces `blocked`, not `passed`. This prevents the control center from displaying a green QA state when no actual test was executed.

## Scope boundary

QA contracts orchestrate and gate tests; they do not pretend to implement third-party scanners, real Android devices, profilers or engine runtimes inside Factory Core. Those capabilities are supplied by workers/adapters and their evidence is retained by the Factory.