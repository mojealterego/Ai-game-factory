# AI GAME FACTORY — Native Android Control Center

Native Android client target: Kotlin + Jetpack Compose.

The phone is the control plane. Generation, compilation and heavy inference can run in cloud workers or compatible local workers.

## Planned modules

- Dashboard
- Projects
- Game DNA
- Story / Narrative
- Agents A00–A61
- Builders
- Assets
- 3D Pipeline
- Audio
- Models / GGUF
- Hugging Face
- GitHub
- Cloud Jobs
- Build Center
- QA
- Providers
- Agent Builder
- Logs
- Settings

## Security

Credentials are never embedded in the APK. The app stores only short-lived session material and references to server-side secrets.

## Native build targets

- debug APK
- release APK
- signed AAB

Build artifacts must be generated and verified by the build pipeline before being reported as available.
