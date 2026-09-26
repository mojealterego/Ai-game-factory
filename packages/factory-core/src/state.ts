export type ProjectState = "draft" | "planning" | "designing" | "generating" | "building" | "testing" | "ready" | "released" | "paused" | "failed" | "rolled_back";

export interface GameDNA {
  genre: string[];
  subgenre: string[];
  platforms: string[];
  dimensionality: "2D" | "2.5D" | "3D";
  camera: { mode: string; perspective?: "first_person"|"third_person"|"top_down"|"isometric"|"side_scroller"|"fixed"|"cinematic"|"custom"; custom?: string };
  gameplayLoop: string;
  mechanics: string[];
  progression: string[];
  economy: { currencies?: string[]; systems: string[]; sources?: string[]; sinks?: string[] };
  world: { setting: string; rules?: string[]; regions?: string[] };
  heroes: string[];
  enemies: string[];
  npcs: string[];
  locations: string[];
  quests: string[];
  narrative: { premise?: string; structure?: string; themes?: string[]; branching?: boolean; endings?: string[] };
  artisticStyle: { direction: string; references?: string[]; palette?: string[] };
  cinematicStyle: { direction: string; cameraLanguage?: string; lighting?: string; pacing?: string };
  ui: { direction: string; navigation?: string; hud?: string; accessibility?: string[] };
  audio: { direction: string; soundscape?: string; dynamicMixing?: boolean };
  music: { direction: string; genres?: string[]; adaptive?: boolean };
  voice: { enabled: boolean; direction?: string; languages?: string[]; casting?: string };
  monetization: string[];
  multiplayer: { enabled: boolean; mode?: "single_player"|"local_coop"|"online_coop"|"pvp"|"mmo"|"asynchronous"|"custom"; maxPlayers?: number; networking?: string };
  saveSystem: { type: "local"|"cloud"|"hybrid"|"checkpoint"|"custom"; autosave?: boolean; slots?: number; crossSave?: boolean };
  accessibility: string[];
  targetHardware: { devices: string[]; minSpec?: Record<string, unknown>; targetFps?: number; resolution?: string };
  performanceBudget: { targetFps: number; frameTimeMs?: number; memoryMb?: number; downloadMb?: number; installMb?: number; cpuBudget?: string; gpuBudget?: string; networkBudget?: string };
  ageRating: { target: string; contentDescriptors?: string[] };
  localization: { languages: string[]; fallbackLanguage?: string; rtl?: boolean; localizationNotes?: string[] };
  businessModel: { model: string; channels?: string[]; retention?: string; liveOps?: boolean };
  engine?: string;
  visualStyle?: string;
  gameplayPillars: string[];
  narrativePillars: string[];
  audience?: string;
  constraints: Record<string, unknown>;
  version: number;
}

export interface CanonEntry {
  id: string;
  category: "character"|"world"|"story"|"mechanic"|"visual"|"rule"|"other";
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
