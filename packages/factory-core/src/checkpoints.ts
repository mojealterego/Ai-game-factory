import type { ProjectSnapshot, ProjectStateStore } from "./state";

export class CheckpointManager {
  private snapshots = new Map<string, ProjectSnapshot[]>();

  constructor(private readonly store: ProjectStateStore) {}

  create(projectId: string, reason: string): ProjectSnapshot {
    const current = this.store.get(projectId);
    if (!current) throw new Error("Unknown project: " + projectId);
    const list = this.snapshots.get(projectId) ?? [];
    const snapshot: ProjectSnapshot = {
      id: projectId + ":v" + String(list.length + 1),
      projectId,
      version: list.length + 1,
      createdAt: new Date().toISOString(),
      state: current.state,
      dna: structuredClone(current.dna),
      canon: structuredClone(current.canon),
      data: structuredClone(current.data),
      reason
    };
    list.push(snapshot);
    this.snapshots.set(projectId, list);
    return snapshot;
  }

  list(projectId: string): ProjectSnapshot[] { return this.snapshots.get(projectId) ?? []; }

  rollback(projectId: string, version: number): ProjectSnapshot {
    const snapshot = this.list(projectId).find(s => s.version === version);
    if (!snapshot) throw new Error("Checkpoint not found: " + projectId + " v" + version);
    this.store.set(projectId, { state: "rolled_back", dna: structuredClone(snapshot.dna), canon: structuredClone(snapshot.canon), data: structuredClone(snapshot.data) });
    return snapshot;
  }
}
