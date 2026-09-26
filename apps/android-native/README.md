# AI GAME FACTORY — Native Android

This directory is the native Android Control Center foundation.

## Product role

The phone is the command surface for the Factory. It manages projects, agents, jobs, models, providers, assets, cloud workspaces, QA and release artifacts.

## Native principles

- Kotlin + Jetpack Compose
- MVVM / unidirectional state
- Coroutines + Flow
- WorkManager for resilient synchronization
- secure token storage
- offline cache
- WebSocket/SSE job updates
- deep links to artifacts
- accessibility and large-text support

The native client must not embed provider secrets. It talks to Factory APIs and receives signed, scoped session credentials where required.
