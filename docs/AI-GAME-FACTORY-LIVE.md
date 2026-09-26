# AI GAME FACTORY — Live Build Reference

## Current live application

- URL: https://ai-game-factory.floot.app
- Platform: Android-first mobile command center
- Parent studio: Mojealterego / Andrzej Mikulski
- Product icon: AI GAME FACTORY
- UI system: obsidian / matte black / restrained 24K gold

## Factory surfaces

Dashboard, Projects, AI Agents, Game DNA, AI Story Generator, Game Builder Hub, Asset Factory, Audio & Dubbing, 3D Asset Pipeline, Local Models / GGUF, Hugging Face, GitHub, Cloud Workspace, Build Center, QA / Tests, Activity / Logs and Settings.

## Production model

The control application is intentionally provider-agnostic. External AI providers, repositories, cloud compute and native Android builds are separate integrations. The client uses explicit states instead of claiming an operation completed without backend evidence.

## Android

Native Android APK/AAB generation is handled by the mobile build system. A source repository should not claim that an APK exists until a native build artifact is actually generated and verified.
