# Build Center

Build Center is the evidence-gated production pipeline for turning a versioned Factory project into a real distributable artifact.

## Pipeline

Project → Validate → Generate → Compile → Test → Package → Sign → Artifact

Every stage must produce evidence. The pipeline cannot finish successfully at a status record alone.

## Targets

Targets are adapter-defined. Baseline targets:
- Android APK
- Android AAB
- Web
- Windows
- Linux

The contract also permits additional adapter targets such as macOS, iOS and future platforms without changing Factory Core.

## Real artifact contract

A completed artifact must contain:
- stable artifact ID
- project ID
- target
- format
- non-empty URI/path
- SHA-256 checksum
- positive byte size
- MIME type
- verification state
- evidence references
- signing state when signing is required.

`isRealBuildArtifact()` rejects a result that only says `build successful`.

## Signing

Signing is an adapter/worker responsibility. Factory Core requires explicit signing evidence when `BuildRequest.sign === true`.

Production signing credentials are never stored in source. CI/worker signing must consume repository/cloud secret-manager references.

The native Android CI verifies signed debug APK/AAB outputs. Release artifacts are still real files, but production release signing requires a configured signing identity; the pipeline must not fabricate that evidence.

## Android Build Center

.github/workflows/android-build.yml performs:
1. Project/validation checks.
2. Gradle compile/package for APK and AAB.
3. Non-zero file-size verification.
4. SHA-256 calculation.
5. APK signature verification where a signed APK is produced.
6. AAB integrity/signature verification where a signed bundle is produced.
7. Build Center manifest generation.
8. Upload of the actual APK/AAB files plus evidence.

The uploaded artifact is therefore a binary file produced by Gradle, not a database row claiming success.

## Evidence manifest

Each Android run produces:
- `build-manifest.json`
- `SHA256SUMS`
- `SIGNING.txt`
- APK binaries
- AAB binaries

The manifest records artifact paths, sizes and SHA-256 values.

## Engine adapters

Factory Core keeps engine SDKs outside the core package:

Factory Core → Engine Adapter → Generated Project → Engine Worker → Build Center → Artifact

The existing engine worker resolves commands for Unreal, Unity, Godot, Cocos Creator, Defold, Stride, MonoGame, Bevy, O3DE, HTML/Web, Ren'Py and Custom Runtime.

A command plan is never treated as proof of compilation. The worker must return process evidence and an actual artifact before Build Center can complete.

## Release gate

A release is ready only when required gates pass and the final artifact satisfies the real-artifact contract. Failed compilation, missing tests, missing signature evidence or missing artifact evidence leaves the run failed.