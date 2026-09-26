# Native Android Control Center

## Goal

A real native Android application, not a disguised web page.

## Stack direction

- Kotlin
- Jetpack Compose
- Android Architecture Components
- Kotlin Coroutines / Flow
- secure credential/token storage
- offline-first project/job cache
- WebSocket/SSE job updates
- deep links into project/build artifacts
- WorkManager for resilient background synchronization

## Screens

Dashboard, Projects, Game DNA, Story Studio, Builders, Agents, Assets, 3D, Audio, Models/GGUF, Hugging Face, GitHub, Cloud, Build Center, QA, Providers, Agent Builder, Logs, Settings.

## Mobile/cloud split

Android performs orchestration, caching, local-compatible model actions and user approvals. Cloud/worker infrastructure performs large model inference, compilation, 3D processing and long builds.

## Native release

The release pipeline must produce and verify:

- signed APK
- signed AAB
- version metadata
- checksum
- build logs
- test results

No release UI may report success without artifact evidence.
