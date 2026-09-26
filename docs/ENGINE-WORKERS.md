# Engine Workers

AI GAME FACTORY keeps engine SDKs outside Factory Core.

## Pipeline

Factory Core → Engine Adapter → Generated Project → Engine Worker → Artifact

The project generator creates an engine-native starter project. The build worker resolves a deterministic command for the selected engine and target. A worker implementation supplies the actual process runner and the installed SDK/toolchain. Build Center then requires stage evidence and a real binary artifact before the run can be marked successful.

## Supported command families

| Engine | Worker command family |
|---|---|
| Unreal | RunUAT / BuildCookRun |
| Unity | Unity batchmode + executeMethod |
| Godot | headless export preset |
| Cocos Creator | CocosCreator CLI build |
| Defold | Bob CLI |
| Stride | dotnet build |
| MonoGame | dotnet build + platform packaging |
| Bevy | cargo build |
| O3DE | CMake configure/build |
| HTML5/Web | npm build |
| Ren'Py | Ren'Py CLI distribute / Android / web |
| Custom Runtime | project-provided ./factory/build |

The command plan is implemented in packages/factory-core/src/engine-build-worker.ts.

## Important boundary

A command plan is not evidence that an engine SDK executed successfully. A worker must run the command, capture stdout/stderr and exit code, then attach artifact URI/path, byte size, SHA-256, format/MIME metadata and build evidence before a release can be marked successful.

## Android CI

The repository's native Android control center is independently built by .github/workflows/android-build.yml.

Current verified CI flow:
- debug APK
- release APK
- release AAB
- artifact upload

Production signing remains external and must use a real signing identity/secret.
