# Android Control Center

Android is the command center of AI GAME FACTORY, not merely a mobile UI.

```text
ANDROID
│
├── Factory API
│
├── Agent Runtime
│
├── Project Workspace
│
├── Cloud Workers
│
├── Model Registry
│
└── Build Farm
```

## End-to-end mission

The Android client can initiate and observe the complete factory lifecycle:

```text
game idea
  ↓
Game DNA
  ↓
agent runtime
  ↓
asset generation
  ↓
code/project generation
  ↓
Build Farm
  ↓
QA
  ↓
verified APK/AAB artifact
```

The phone is the control plane. Heavy generation, compilation, profiling and device/build workloads remain in cloud workers or connected runtimes.

## Factory API

`packages/factory-core/src/android-control-center.ts` defines project-scoped authenticated API endpoints for:
- project/game creation;
- Game DNA generation;
- agent execution;
- asset generation;
- code generation;
- build submission;
- QA;
- verified artifact retrieval;
- pipeline status.

Every project operation is explicitly project-scoped. API credentials remain backend-only under the Security/IP contract.

## Agent Runtime

Android submits commands to the Agent Runtime and observes:
- active agents;
- status;
- pause/resume;
- job IDs;
- evidence;
- failures.

The No-Code Agent Builder provides the portable agent graph contract used by runtime workers.

## Project Workspace

A workspace handle tracks project ID, workspace URI, branch and dirty state. The Android client should never become the canonical source of the entire project: the workspace/cloud repository remains authoritative.

## Cloud Workers

Workers are asynchronous and typed by job:
- agent;
- asset;
- code;
- build;
- QA;
- generic.

The phone observes and controls jobs through the Factory API.

## Model Registry

Android can select models/routes through the existing Model Factory. Local Android GGUF and cloud providers are both represented, while actual inference stays on the runtime capable of executing the selected model.

## Build Farm

Build requests are dispatched to Build Center/engine workers. Android receives only artifact metadata until a real artifact exists.

A build is not considered delivered merely because a job says "success". Delivery requires:
- URI;
- SHA-256;
- positive artifact size;
- QA passed;
- verified artifact state.

Targets include Android APK and AAB plus web/desktop/future adapter targets.

## Release gate

`canDeliverArtifact()` blocks delivery unless both Build and all required QA gates have completed.

This connects the Android control plane to the existing Build Center and QA contracts without claiming that the Android device itself compiles Unreal/Unity/Godot projects.

## Runtime boundary

This module is the control-plane contract. Actual network transport, authentication/session refresh, persistent workspace, cloud workers, model inference and Build Farm require backend/runtime adapters. The contract deliberately does not fake those services.
