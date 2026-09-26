import type { GameReference, GameResearchRecord, GameIdea } from "./reference-ideation-engine";

export type LudoTransport = "api" | "mcp";
export type LudoCapability =
  | "game_research" | "game_ideation" | "game_project"
  | "sprite_generation" | "animation_generation" | "icon_generation"
  | "ui_generation" | "texture_generation" | "music_generation"
  | "sound_generation" | "sfx_generation" | "3d_generation"
  | "video_generation" | "concept_art_generation";

export interface LudoConnectionConfig {
  transport: LudoTransport;
  baseUrl: string;
  apiKeyRef?: string;
  mcpServerRef?: string;
  projectId?: string;
}

export interface LudoInvocation {
  capability: LudoCapability;
  input: Record<string, unknown>;
  projectId?: string;
  idempotencyKey: string;
}

export interface LudoInvocationResult {
  status: "accepted" | "succeeded" | "failed";
  jobId?: string;
  output?: Record<string, unknown>;
  artifactIds?: string[];
  evidence?: string[];
  error?: string;
}

export interface LudoTransportAdapter {
  invoke(config: LudoConnectionConfig, request: LudoInvocation): Promise<LudoInvocationResult>;
}

export interface LudoResearchRequest {
  query: string;
  projectId: string;
  references?: GameReference[];
  mechanics?: GameReference[];
}

export interface LudoIdeationRequest {
  projectId: string;
  theme?: string;
  genres?: string[];
  mechanics?: string[];
  references?: GameReference[];
  platform?: string;
  constraints?: string[];
  batchSize?: number;
}

export interface LudoAssetRequest {
  projectId: string;
  capability: Exclude<LudoCapability, "game_research" | "game_ideation" | "game_project">;
  prompt: string;
  references?: string[];
  outputFormat?: string;
  engine?: string;
}

export interface LudoAdapter {
  readonly id: "ludo";
  readonly capabilities: readonly LudoCapability[];
  research(request: LudoResearchRequest): Promise<LudoInvocationResult>;
  ideate(request: LudoIdeationRequest): Promise<LudoInvocationResult>;
  generateAsset(request: LudoAssetRequest): Promise<LudoInvocationResult>;
}

export const LUDO_PUBLIC_CAPABILITIES: readonly LudoCapability[] = [
  "game_research", "game_ideation", "game_project",
  "sprite_generation", "animation_generation", "icon_generation",
  "ui_generation", "texture_generation", "music_generation",
  "sound_generation", "sfx_generation", "3d_generation",
  "video_generation", "concept_art_generation"
];

export const LUDO_DEFAULT_ENDPOINTS = {
  api: "https://ludo.ai/api",
  mcp: "https://ludo.ai/mcp"
} as const;

function invocation(capability: LudoCapability, input: Record<string, unknown>, projectId: string): LudoInvocation {
  return { capability, input, projectId, idempotencyKey: crypto.randomUUID() };
}

export function createLudoAdapter(config: LudoConnectionConfig, transport: LudoTransportAdapter): LudoAdapter {
  const call = (capability: LudoCapability, input: Record<string, unknown>, projectId: string) =>
    transport.invoke(config, invocation(capability, input, projectId));

  return {
    id: "ludo",
    capabilities: LUDO_PUBLIC_CAPABILITIES,
    research: request => call("game_research", {
      query: request.query, references: request.references ?? [], mechanics: request.mechanics ?? []
    }, request.projectId),
    ideate: request => call("game_ideation", {
      theme: request.theme, genres: request.genres ?? [], mechanics: request.mechanics ?? [],
      references: request.references ?? [], platform: request.platform,
      constraints: request.constraints ?? [], batchSize: request.batchSize ?? 5
    }, request.projectId),
    generateAsset: request => call(request.capability, {
      prompt: request.prompt, references: request.references ?? [],
      outputFormat: request.outputFormat, engine: request.engine
    }, request.projectId)
  };
}

export function createLudoResearchRecord(projectId: string, query: string, result: LudoInvocationResult): GameResearchRecord {
  const output = result.output ?? {};
  return {
    id: "ludo-research-" + projectId + "-" + Date.now(),
    query,
    referenceGames: Array.isArray(output.referenceGames) ? output.referenceGames as GameReference[] : [],
    mechanicDatabase: Array.isArray(output.mechanicDatabase) ? output.mechanicDatabase as GameReference[] : [],
    signals: Array.isArray(output.signals) ? output.signals as GameResearchRecord["signals"] : [],
    generatedAt: new Date().toISOString()
  };
}

export function createLudoIdeaBatch(projectId: string, result: LudoInvocationResult): GameIdea[] {
  const ideas = result.output?.ideas;
  if (!Array.isArray(ideas)) return [];
  return ideas.map((idea, index) => {
    const source = idea as GameIdea;
    return {
      ...source,
      id: String(source.id ?? "ludo-idea-" + projectId + "-" + index),
      projectId,
      selected: Boolean(source.selected),
      provenance: {
        ...source.provenance,
        sourceReferenceIds: source.provenance?.sourceReferenceIds ?? [],
        generatedFrom: "reference_blend",
        stage: "batch_ideation"
      }
    };
  });
}
