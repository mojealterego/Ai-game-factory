export type ProjectState = "draft" | "planning" | "designing" | "generating" | "building" | "testing" | "ready" | "released" | "paused" | "failed" | "rolled_back";

export interface GameDNA {
  genre: string[];
  platforms: string[];
  engine?: string;
  visualStyle?: string;
  gameplayPillars: string[];
  narrativePillars: string[];
  audience?: string;
  monetization?: string[];
  constraints: Record<string, unknown>;
  version: number;
}

export interface CanonEntry {
  id: string;
  category: "character" | "world" | "story" | "mechanic" | "visual" | "rule" | "other";
  key: string;
  value: unknown;
  source: string;
  immutable?: boolean;
  version: number;
}

export interface ProjectSnapshot {
  id: string;
  projectId: string;
  version: number;
  createdAt: string;
  state: ProjectState;
  dna: GameDNA;
  canon: CanonEntry[];
  data: Record<string, unknown>;
  reason: string;
}

export interface ProjectStateStore {
  get(projectId: string): { state: ProjectState; dna: GameDNA; canon: CanonEntry[]; data: Record<string, unknown> } | undefined;
  set(projectId: string, value: { state: ProjectState; dna: GameDNA; canon: CanonEntry[]; data: Record<string, unknown> }): void;
}
