import type { EngineId } from "./contracts";
import type { GameDNA } from "./state";
import { validateGameDNA } from "./game-dna";
import {
  createGDD, convertGDDToGameDNA, generateIdeaBatch,
  type GameConceptGDD, type GameIdea, type ReferenceIdeationRequest
} from "./reference-ideation-engine";
import { createGamePipeline, type FactoryPipelineState } from "./android-control-center";
import { compileGamePrompt, type CompiledGamePlan, type GameCreationPrompt } from "./ai-game-builder-engine";
import { createStoryWorld, type StoryWorldSpec } from "./story-world-engine";
import { AI_STORY_WORLD_ENGINE } from "./story-world-engine";
import { CINEMATIC_DRAMA_FRAMEWORK } from "./narrative";
import { ASSET_FACTORY_PIPELINE, THREE_D_ASSET_PIPELINE } from "./assets";
import { AUDIO_DUBBING_PIPELINE } from "./audio";
import { QA_CHECKS, type QAReport } from "./qa";

export const AI_GAME_FACTORY_PIPELINE = [
  "idea", "research", "game_ideation", "game_dna", "gdd",
  "world_characters_story", "mechanics", "systems", "code", "assets",
  "audio", "animation", "cinematics", "playable_prototype", "ai_playtest",
  "qa", "optimization", "build", "release"
] as const;

export type AIGameFactoryStage = typeof AI_GAME_FACTORY_PIPELINE[number];
export type FactoryStageStatus = "pending" | "ready" | "running" | "succeeded" | "blocked" | "failed" | "skipped";

export interface FactoryStageRecord {
  stage: AIGameFactoryStage;
  status: FactoryStageStatus;
  dependencies: AIGameFactoryStage[];
  artifactIds: string[];
  evidenceIds: string[];
  workerIds: string[];
  startedAt?: string;
  finishedAt?: string;
  error?: string;
}

export interface FactoryIntelligenceSource {
  id: "research" | "creation" | "story_world" | "cinematic_drama";
  role: string;
  adapterIds: string[];
  active: boolean;
}

export interface FactoryProjectContract {
  projectId: string;
  engine?: EngineId;
  platforms: string[];
  stages: FactoryStageRecord[];
  intelligence: FactoryIntelligenceSource[];
  gameIdea?: string;
  selectedIdea?: GameIdea;
  gdd?: GameConceptGDD;
  gameDna?: GameDNA;
  compiledGame?: CompiledGamePlan;
  storyWorld?: ReturnType<typeof createStoryWorld>;
  qa?: QAReport;
  pipeline: FactoryPipelineState;
}

export const FACTORY_INTEGRATION_SURFACE = {
  research: ["Reference & Ideation Engine", "Game Knowledge Hub", "Ludo API/MCP Adapter"],
  creation: ["AI Game Builder Engine", "Game DNA", "Engine Adapter System", "Provider Router", "No-Code Agent Builder"],
  storyWorld: ["AI Story World Engine", "Story Generator", "Game Knowledge Hub"],
  cinematicDrama: ["Cinematic Narrative Engine", "Cinematic Narrative Studio", "Continuity Doctor", "Camera/Cinematics runtime"],
  shared: [
    "Asset Factory", "3D Asset Pipeline", "Audio/Dubbing", "GGUF/Local Models",
    "Hugging Face", "AI Agent OS A00-A61", "GitHub", "Cloud Workspace",
    "Build Center", "QA", "Security/IP", "No-Code Agent Builder", "Android Control Center"
  ]
} as const;

export const FACTORY_STAGE_DEPENDENCIES: Record<AIGameFactoryStage, AIGameFactoryStage[]> = {
  idea: [],
  research: ["idea"],
  game_ideation: ["research"],
  game_dna: ["game_ideation"],
  gdd: ["game_dna"],
  world_characters_story: ["gdd"],
  mechanics: ["game_dna", "world_characters_story"],
  systems: ["mechanics"],
  code: ["systems"],
  assets: ["game_dna", "world_characters_story", "systems"],
  audio: ["world_characters_story", "assets"],
  animation: ["assets", "systems"],
  cinematics: ["world_characters_story", "animation", "audio"],
  playable_prototype: ["code", "assets", "audio", "animation"],
  ai_playtest: ["playable_prototype"],
  qa: ["ai_playtest"],
  optimization: ["ai_playtest", "qa"],
  build: ["optimization", "qa"],
  release: ["build", "qa"]
};

export const FACTORY_INTELLIGENCE: readonly FactoryIntelligenceSource[] = [
  { id: "research", role: "Research, references, mechanics and ideation intelligence.", adapterIds: ["reference-ideation-engine", "ludo-api", "ludo-mcp", "game-knowledge-hub"], active: true },
  { id: "creation", role: "Game specification, Game DNA, systems, code and playable project generation.", adapterIds: ["ai-game-builder-engine", "engine-adapters", "provider-router", "agent-os"], active: true },
  { id: "story_world", role: "Executable world, character memory, relationships, events and narrative state.", adapterIds: ["story-world-engine", "story-generator", "game-knowledge-hub"], active: true },
  { id: "cinematic_drama", role: "Branching drama, consequences, QTE, investigation, camera, continuity and endings.", adapterIds: ["cinematic-narrative-engine", "cinematic-narrative-studio"], active: true }
];

function stageRecords(): FactoryStageRecord[] {
  return AI_GAME_FACTORY_PIPELINE.map(stage => ({
    stage,
    status: stage === "idea" ? "ready" : "pending",
    dependencies: FACTORY_STAGE_DEPENDENCIES[stage],
    artifactIds: [],
    evidenceIds: [],
    workerIds: []
  }));
}

export function createAIGameFactoryProject(input: {
  projectId: string;
  gameIdea: string;
  engine?: EngineId;
  platforms?: string[];
}): FactoryProjectContract {
  if (!input.gameIdea.trim()) throw new Error("gameIdea is required");
  return {
    projectId: input.projectId,
    engine: input.engine,
    platforms: input.platforms ?? ["android"],
    stages: stageRecords(),
    intelligence: FACTORY_INTELLIGENCE.map(source => ({ ...source, adapterIds: [...source.adapterIds] })),
    gameIdea: input.gameIdea,
    pipeline: createGamePipeline(input.projectId, input.gameIdea)
  };
}

export function markFactoryStage(
  project: FactoryProjectContract,
  stage: AIGameFactoryStage,
  status: FactoryStageStatus,
  evidenceIds: string[] = [],
  artifactIds: string[] = [],
  workerIds: string[] = [],
  error?: string
): FactoryProjectContract {
  const record = project.stages.find(item => item.stage === stage);
  if (!record) throw new Error("UNKNOWN_FACTORY_STAGE");
  const dependenciesReady = record.dependencies.every(dep =>
    project.stages.find(item => item.stage === dep)?.status === "succeeded"
  );
  if (status === "running" && !dependenciesReady) throw new Error("STAGE_DEPENDENCIES_BLOCKED:" + stage);
  const now = new Date().toISOString();
  return {
    ...project,
    stages: project.stages.map(item => item.stage === stage ? {
      ...item,
      status,
      evidenceIds: [...item.evidenceIds, ...evidenceIds],
      artifactIds: [...item.artifactIds, ...artifactIds],
      workerIds: [...item.workerIds, ...workerIds],
      startedAt: status === "running" ? now : item.startedAt,
      finishedAt: ["succeeded", "failed", "blocked", "skipped"].includes(status) ? now : item.finishedAt,
      error
    } : item)
  };
}

export function prepareResearch(project: FactoryProjectContract): FactoryProjectContract {
  if (project.stages.find(item => item.stage === "idea")?.status !== "succeeded") throw new Error("IDEA_STAGE_REQUIRED");
  return markFactoryStage(project, "research", "succeeded", ["local://research/request"]);
}

export function prepareGameIdeation(
  project: FactoryProjectContract,
  request: ReferenceIdeationRequest
): { project: FactoryProjectContract; ideas: GameIdea[] } {
  if (project.stages.find(item => item.stage === "research")?.status !== "succeeded") throw new Error("RESEARCH_STAGE_REQUIRED");
  const ideas = generateIdeaBatch({ ...request, projectId: project.projectId });
  return { project: markFactoryStage(project, "game_ideation", "succeeded", ["local://ideation/batch"]), ideas };
}

export function selectGameIdea(project: FactoryProjectContract, idea: GameIdea): FactoryProjectContract {
  if (project.stages.find(item => item.stage === "game_ideation")?.status !== "succeeded") throw new Error("IDEATION_STAGE_REQUIRED");
  return { ...project, selectedIdea: idea, gameIdea: idea.concept };
}

export function compileDesign(project: FactoryProjectContract, idea: GameIdea): FactoryProjectContract {
  const gdd = createGDD(idea);
  const gameDna = convertGDDToGameDNA(gdd, idea);
  const validation = validateGameDNA(gameDna);
  if (!validation.valid) throw new Error("GAME_DNA_INVALID:" + validation.issues.filter(item => item.severity === "error").map(item => item.message).join(";"));
  const prompt: GameCreationPrompt = {
    projectId: project.projectId,
    prompt: idea.concept,
    platform: project.platforms.includes("android") ? "android" : "multi",
    engine: project.engine,
    genre: idea.genres
  };
  const compiledGame = compileGamePrompt(prompt);
  let next = selectGameIdea(project, idea);
  next = { ...next, gdd, gameDna, compiledGame };
  next = markFactoryStage(next, "game_dna", "succeeded", ["local://game-dna/compiled"]);
  return markFactoryStage(next, "gdd", "succeeded", ["local://gdd/generated"]);
}

export function initializeStoryWorld(project: FactoryProjectContract, spec: StoryWorldSpec): FactoryProjectContract {
  if (project.stages.find(item => item.stage === "gdd")?.status !== "succeeded") throw new Error("GDD_STAGE_REQUIRED");
  return {
    ...markFactoryStage(project, "world_characters_story", "succeeded", ["local://story-world/initialized"]),
    storyWorld: createStoryWorld(spec)
  };
}

export function getFactoryArchitecture() {
  return {
    pipeline: AI_GAME_FACTORY_PIPELINE,
    intelligence: FACTORY_INTELLIGENCE,
    integration: FACTORY_INTEGRATION_SURFACE,
    qaGates: QA_CHECKS,
    assetPipeline: ASSET_FACTORY_PIPELINE,
    threeDPipeline: THREE_D_ASSET_PIPELINE,
    audioPipeline: AUDIO_DUBBING_PIPELINE,
    storyWorldEngine: AI_STORY_WORLD_ENGINE,
    cinematicDramaEngine: CINEMATIC_DRAMA_FRAMEWORK
  };
}
