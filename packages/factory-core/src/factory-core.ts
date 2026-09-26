import { CheckpointManager } from "./checkpoints";
import { EvidenceLog } from "./evidence-log";
import { ProjectManager } from "./project-manager";
import { FactoryOrchestrator } from "./orchestrator";
import type { CanonEntry, GameDNA, ProjectState, ProjectStateStore } from "./state";

export class InMemoryProjectStateStore implements ProjectStateStore {
  private states = new Map<string, { state: ProjectState; dna: GameDNA; canon: CanonEntry[]; data: Record<string, unknown> }>();
  get(projectId: string) { return this.states.get(projectId); }
  set(projectId: string, value: { state: ProjectState; dna: GameDNA; canon: CanonEntry[]; data: Record<string, unknown> }) { this.states.set(projectId, value); }
}

export class FactoryCore {
  readonly projects = new ProjectManager();
  readonly state = new InMemoryProjectStateStore();
  readonly orchestrator = new FactoryOrchestrator();
  readonly evidence = new EvidenceLog();
  readonly checkpoints = new CheckpointManager(this.state);

  createProject(input: { id: string; name: string; templateId: string; dna: GameDNA }) {
    const project = this.projects.createProject(input);
    this.state.set(project.id, { state: "draft", dna: input.dna, canon: [], data: {} });
    this.evidence.append({
      id: crypto.randomUUID(), projectId: project.id, level: "info",
      source: "FactoryCore", action: "project.created", message: project.name
    });
    return project;
  }
}
