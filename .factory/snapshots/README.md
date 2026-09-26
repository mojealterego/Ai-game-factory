# Project Snapshots

Snapshots are immutable project-state records.

Each snapshot records project ID, repository, branch, commit SHA, creation time and generated artifact IDs.

Snapshot manifests are written under .factory/snapshots/<projectId>/<commitSha>.json.

A snapshot is a record of repository state; it is not a replacement for Git history.
