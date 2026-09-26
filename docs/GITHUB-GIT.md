# GitHub / Git Integration

## Repository

The canonical project repository is:
mojealterego/Ai-game-factory

The repository is treated as the source-control home of the Factory itself. The implementation is in packages/, apps/, docs/, workflows and supporting project files; README-only status is explicitly not sufficient.

GitHub's repository API provides repository metadata, branches, commits, contents, refs and tags as distinct resources. The Factory maps those primitives into an engine-neutral Git subsystem. citeturn0search0

## Supported scope

### Repository management
- repository identity and default branch
- repository permissions/state
- source-of-truth declaration
- generated artifact roots

### Branches
- create branch from a known ref/SHA
- branch metadata
- ahead/behind comparison
- isolated generated-work branches

### Commits
- generated code commits
- generated asset commits
- generated documentation commits
- project-state commits
- commit provenance and changed paths

### Pull requests
- open PRs from Factory branches
- draft PR support
- base/head tracking
- PR state and commit references

### Issues
- create production issues
- labels
- issue state
- link issues to Factory jobs/snapshots through metadata

### Source synchronization
Factory output is classified before synchronization:
generated_code | generated_asset | documentation | snapshot

The sync plan separates these categories and preserves the source job ID and optional checksum.

### Project snapshots
A snapshot records an exact Git commit SHA plus the Factory artifact IDs represented by that repository state.

Snapshots are immutable records. Git remains the authoritative history.

### Versioning and release tags
Versions use semver-like MAJOR.MINOR.PATCH identifiers. Release tags are normalized to vMAJOR.MINOR.PATCH and point at an exact commit SHA.

### Generated project material
The repository reserves:
- generated/code/
- generated/assets/
- generated/docs/

The directories are intentionally part of the real repository structure so generated output has a deterministic synchronization target.

## Factory workflow

Factory Job
  -> Generate code/assets/docs
  -> Classify + checksum + provenance
  -> Create isolated branch
  -> Write/sync artifacts
  -> Commit
  -> Snapshot commit SHA
  -> Optional PR
  -> QA / review
  -> Merge
  -> Release tag

## Safety invariants

1. Never commit provider/API secrets.
2. Never claim synchronization without a resulting commit SHA.
3. Never claim a snapshot exists without a recorded snapshot manifest.
4. Never claim a PR exists without a returned PR number/URL.
5. Never claim a release tag exists without its commit SHA.
6. Generated assets and generated code retain Factory provenance.
7. Git history remains authoritative; Factory snapshots provide machine-readable state references.

## Existing repository status

This repository already contains executable Factory Core modules, engine adapters, narrative, asset, 3D, audio and AI Model Factory contracts, plus Android/cloud project scaffolding. This GitHub/Git module adds source-control orchestration contracts around those real project files.
