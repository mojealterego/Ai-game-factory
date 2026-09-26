import type { EngineId } from "./contracts";
import type { GameDNA } from "./state";
import { generateEngineProjectFiles, type EngineProjectFile } from "./engine-project-generator";

export const AI_GAME_BUILDER_PIPELINE = [
  "prompt",
  "game_spec",
  "game_dna",
  "system_design",
  "code_generation",
  "asset_generation",
  "world_generation",
  "playable_build",
  "playtest",
  "ai_analysis",
  "iteration"
] as const;

export type AIGameBuilderStage = typeof AI_GAME_BUILDER_PIPELINE[number];

export interface GameCreationPrompt {
  projectId: string;
  prompt: string;
  platform?: "android" | "ios" | "web" | "desktop" | "console" | "multi";
  engine?: EngineId;
  genre?: string[];
  constraints?: Record<string, unknown>;
}

export interface GameSpec {
  projectId: string;
  title: string;
  description: string;
  platforms: string[];
  genre: string[];
  dimensionality: "2D" | "2.5D" | "3D";
  heroCount: number;
  endingCount: number;
  features: string[];
  mechanics: string[];
  worldRequirements: string[];
  multiplayer: boolean;
  browserNative: boolean;
  adaptiveDifficulty: boolean;
  proceduralQuests: boolean;
  npcMemory: boolean;
  dynamicDialogue: boolean;
  progression: string[];
  engine: EngineId;
}

export interface SystemDesign {
  systems: string[];
  architecture: string[];
  dependencies: Record<string, string[]>;
  dataContracts: string[];
}

export interface GameProjectStructure {
  directories: string[];
  files: EngineProjectFile[];
}

export interface CompiledGamePlan {
  spec: GameSpec;
  dna: GameDNA;
  systemDesign: SystemDesign;
  projectStructure: GameProjectStructure;
  pipeline: readonly AIGameBuilderStage[];
}

export interface GameBuildState {
  projectId: string;
  stage: AIGameBuilderStage;
  spec: GameSpec;
  dna: GameDNA;
  systemDesign: SystemDesign;
  projectFiles: EngineProjectFile[];
  generatedAssets: string[];
  generatedWorld: string[];
  playtestEvidence: PlaytestEvidence[];
  analysis?: PlaytestAnalysis;
  iteration?: IterationPlan;
  history: AIGameBuilderStage[];
}

export interface PlaytestEvidence {
  sessions: number;
  completedSessions: number;
  crashes: number;
  averageFrameTimeMs?: number;
  failedChecks?: string[];
}

export interface PlaytestAnalysis {
  iterationRequired: boolean;
  findings: string[];
  severity: "none" | "low" | "medium" | "high" | "critical";
  metrics: Record<string, number>;
}

export interface IterationPlan {
  priority: string[];
  codeChanges: string[];
  assetChanges: string[];
  worldChanges: string[];
  regressionChecks: string[];
}

const normalize = (value: string) => value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

function hasAny(text: string, terms: string[]): boolean {
  return terms.some(term => text.includes(normalize(term)));
}

function numberFrom(text: string, terms: string[], fallback: number): number {
  const value = normalize(text);
  for (const term of terms) {
    const match = value.match(new RegExp("(\\d+)\\s*" + term));
    if (match) return Number(match[1]);
  }
  const numberWords: Array<[number, string[]]> = [
    [1, ["jeden", "jedna", "jednym", "jednego", "jedna"]],
    [2, ["dwa", "dwoch", "dwoma", "dwie"]],
    [3, ["trzy", "trzech", "trzema"]],
    [4, ["cztery", "czterech", "czterema"]],
    [5, ["piec", "pieciu", "piecioma", "pietoma"]],
    [6, ["szesc", "szesciu", "szescioma"]],
    [7, ["siedem", "siedmiu", "siedmioma"]],
    [8, ["osiem", "osmiu", "osmioma"]],
    [9, ["dziewiec", "dziewieciu", "dziewiecioma"]],
    [10, ["dziesiec", "dziesieciu", "dziesiecioma"]]
  ];
  for (const [number, words] of numberWords) {
    for (const term of terms) {
      if (words.some(word => value.includes(word + " " + term) || value.includes(word + term))) return number;
    }
  }
  return fallback;
}

function inferEngine(text: string, requested?: EngineId): EngineId {
  if (requested) return requested;
  const value = normalize(text);
  if (value.includes("unity")) return "unity";
  if (value.includes("unreal")) return "unreal";
  if (value.includes("godot")) return "godot";
  if (value.includes("renpy")) return "renpy";
  if (value.includes("cocos")) return "cocos";
  if (value.includes("defold")) return "defold";
  if (value.includes("bevy")) return "bevy";
  if (value.includes("monogame")) return "monogame";
  if (value.includes("stride")) return "stride";
  if (value.includes("o3de")) return "o3de";
  return "godot";
}

function inferGenres(text: string, requested?: string[]): string[] {
  const value = normalize(text);
  const genres = [...(requested ?? [])];
  const map: Array<[string, string[]]> = [
    ["horror", ["horror", "groza", "strach"]],
    ["survival", ["survival", "przetrwanie"]],
    ["rpg", ["rpg", "role playing"]],
    ["racing", ["racing", "wyscig"]],
    ["strategy", ["strategy", "strategia"]],
    ["puzzle", ["puzzle", "zagadka"]],
    ["action", ["action", "akcja"]],
    ["visual_novel", ["visual novel", "powiesc wizualna"]],
    ["adventure", ["adventure", "przygoda"]],
    ["simulation", ["simulation", "symulacja"]],
    ["platformer", ["platformer", "platformowka"]]
  ];
  for (const [genre, terms] of map) if (terms.some(term => value.includes(term))) genres.push(genre);
  return [...new Set(genres.length ? genres : ["custom"])];
}

function inferPlatforms(input: GameCreationPrompt, text: string): string[] {
  if (input.platform) return [input.platform];
  const value = normalize(text);
  const platforms: string[] = [];
  if (hasAny(value, ["android", "mobile", "telefon", "smartfon"])) platforms.push("android");
  if (hasAny(value, ["ios", "iphone", "ipad"])) platforms.push("ios");
  if (hasAny(value, ["browser", "web", "przegladarka"])) platforms.push("web");
  if (hasAny(value, ["pc", "desktop", "windows", "komputer"])) platforms.push("desktop");
  return platforms.length ? [...new Set(platforms)] : ["android"];
}

function inferFeatures(text: string): string[] {
  const value = normalize(text);
  const features: string[] = [];
  if (hasAny(value, ["decyzj", "wybor", "choice", "consequence"])) features.push("decision_system");
  if (hasAny(value, ["procedural", "losow", "dynamiczne wydarzenia", "proceduralne wydarzenia"])) features.push("procedural_events");
  if (hasAny(value, ["npc", "postac niezalezna"])) features.push("ai_npc");
  if (hasAny(value, ["pamiec npc", "npc memory", "pamiec postaci"])) features.push("npc_memory");
  if (hasAny(value, ["dynamiczny dialog", "dynamic dialogue", "dialog"])) features.push("dynamic_dialogue");
  if (hasAny(value, ["adaptive difficulty", "dynamiczna trudnosc", "adaptacyjna trudnosc"])) features.push("adaptive_difficulty");
  if (hasAny(value, ["quest", "zadani"])) features.push("procedural_quests");
  if (hasAny(value, ["multiplayer", "coop", "co-op", "pvp"])) features.push("multiplayer");
  if (hasAny(value, ["browser", "web", "przegladarka"])) features.push("browser_native");
  if (hasAny(value, ["progression", "progres", "rozwoj postaci"])) features.push("progression");
  if (hasAny(value, ["2d"])) features.push("2d");
  if (hasAny(value, ["2.5d"])) features.push("2.5d");
  if (hasAny(value, ["3d"])) features.push("3d");
  return [...new Set(features)];
}

function createDNA(spec: GameSpec, prompt: string): GameDNA {
  const is3d = spec.dimensionality === "3D";
  return {
    genre: spec.genre,
    subgenre: [],
    platforms: spec.platforms,
    dimensionality: spec.dimensionality,
    camera: { mode: is3d ? "third_person" : "side_scroller", perspective: is3d ? "third_person" : "side_scroller" },
    gameplayLoop: "Explore → encounter → decide → survive/progress → resolve consequences → replay",
    mechanics: spec.mechanics,
    progression: spec.progression,
    economy: { systems: ["progression_resources"], currencies: [] },
    world: { setting: spec.worldRequirements.join(", "), rules: ["system-driven world state", "persistent consequences"] },
    heroes: Array.from({ length: spec.heroCount }, (_, i) => "hero_" + (i + 1)),
    enemies: ["threat_system"],
    npcs: spec.npcMemory || spec.dynamicDialogue ? ["adaptive_npc"] : [],
    locations: spec.worldRequirements,
    quests: spec.proceduralQuests ? ["procedural_quest_generator"] : [],
    narrative: {
      premise: prompt,
      structure: "branching",
      themes: [],
      branching: true,
      endings: Array.from({ length: spec.endingCount }, (_, i) => "ending_" + (i + 1))
    },
    artisticStyle: { direction: "project-defined AI art direction" },
    cinematicStyle: { direction: "cinematic interactive", cameraLanguage: "state-driven" },
    ui: { direction: "platform-native game UI" },
    audio: { direction: "adaptive game soundscape", dynamicMixing: true },
    music: { direction: "adaptive soundtrack", adaptive: true },
    voice: { enabled: true, languages: ["en", "pl"] },
    monetization: [],
    multiplayer: { enabled: spec.multiplayer, mode: spec.multiplayer ? "online_coop" : "single_player" },
    saveSystem: { type: "hybrid", autosave: true, slots: 3, crossSave: false },
    accessibility: ["subtitles", "remappable_controls", "text_scaling"],
    targetHardware: { devices: spec.platforms, targetFps: spec.platforms.includes("android") ? 60 : 60 },
    performanceBudget: { targetFps: 60, frameTimeMs: 16.67, memoryMb: spec.platforms.includes("android") ? 1024 : 4096 },
    ageRating: { target: "project_defined" },
    localization: { languages: ["pl", "en"], fallbackLanguage: "en" },
    businessModel: { model: "project_defined" },
    engine: spec.engine,
    visualStyle: "project-defined",
    gameplayPillars: ["core loop", "responsive interaction", "replayability"],
    narrativePillars: spec.features.includes("decision_system") ? ["choices", "consequences", "alternative paths"] : ["world", "progression"],
    audience: "project-defined",
    constraints: { sourcePrompt: prompt },
    version: 1
  };
}

export function compileGamePrompt(input: GameCreationPrompt): CompiledGamePlan {
  if (!input.projectId.trim()) throw new Error("projectId is required.");
  if (!input.prompt.trim()) throw new Error("prompt is required.");
  const text = normalize(input.prompt);
  const platforms = inferPlatforms(input, input.prompt);
  const features = inferFeatures(input.prompt);
  const genres = inferGenres(input.prompt, input.genre);
  const heroCount = numberFrom(text, ["bohater", "bohaterow", "hero", "heroes"], 1);
  const endingCount = numberFrom(text, ["zakonczen", "zakonczenie", "ending", "endings"], 1);
  const engine = inferEngine(input.prompt, input.engine);
  const spec: GameSpec = {
    projectId: input.projectId,
    title: input.projectId.replace(/[-_]+/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
    description: input.prompt.trim(),
    platforms,
    genre: genres,
    dimensionality: features.includes("3d") ? "3D" : features.includes("2.5d") ? "2.5D" : "2D",
    heroCount,
    endingCount,
    features,
    mechanics: [
      ...features.filter(f => ["decision_system", "procedural_events", "adaptive_difficulty", "procedural_quests", "progression", "multiplayer"].includes(f))
    ],
    worldRequirements: hasAny(input.prompt, ["szpital", "hospital"]) ? ["abandoned_hospital", "procedural_event_zones"] : ["project_world"],
    multiplayer: features.includes("multiplayer"),
    browserNative: features.includes("browser_native"),
    adaptiveDifficulty: features.includes("adaptive_difficulty"),
    proceduralQuests: features.includes("procedural_quests"),
    npcMemory: features.includes("npc_memory"),
    dynamicDialogue: features.includes("dynamic_dialogue"),
    progression: features.includes("progression") ? ["character_progression", "unlockable_content"] : ["story_progression"],
    engine
  };
  if (heroCount > 1 && !features.includes("multiplayer")) spec.features.push("multi_protagonist");
  if (endingCount > 1) spec.features.push("multiple_endings");
  const dna = createDNA(spec, input.prompt);
  const systems = [
    "game_loop", "input", "save_load", "progression", "event_bus", "telemetry",
    ...spec.features
  ];
  const dependencies: Record<string, string[]> = {
    game_loop: ["input", "world_state"],
    decision_system: ["world_state", "character_state", "relationship_state"],
    procedural_events: ["world_state", "seeded_random"],
    procedural_quests: ["world_state", "quest_templates"],
    adaptive_difficulty: ["telemetry", "difficulty_model"],
    ai_npc: ["character_state", "dialogue_system"],
    npc_memory: ["ai_npc", "memory_store"],
    dynamic_dialogue: ["ai_npc", "narrative_runtime"],
    multiplayer: ["network_state", "authority_model"]
  };
  const systemDesign: SystemDesign = {
    systems: [...new Set(systems)],
    architecture: ["Factory Core", "Game Runtime Adapter", "Generated Project", "Asset Runtime", "Telemetry/Playtest"],
    dependencies,
    dataContracts: ["game-spec.json", "game-dna.json", "system-design.json", "playtest-evidence.json"]
  };
  const engineFiles = generateEngineProjectFiles({ engine, projectId: input.projectId, name: spec.title });
  const projectFiles: EngineProjectFile[] = [
    { path: "factory/game-spec.json", content: JSON.stringify(spec, null, 2) + "\n" },
    { path: "factory/game-dna.json", content: JSON.stringify(dna, null, 2) + "\n" },
    { path: "factory/system-design.json", content: JSON.stringify(systemDesign, null, 2) + "\n" },
    { path: "factory/iteration-policy.json", content: JSON.stringify({ maxAutomaticIterations: 5, requireHumanApprovalFor: ["publish", "production_deploy"] }, null, 2) + "\n" },
    ...engineFiles
  ];
  return { spec, dna, systemDesign, projectStructure: { directories: [...new Set(projectFiles.map(file => file.path.split("/").slice(0, -1).join("/")).filter(Boolean))], files: projectFiles }, pipeline: AI_GAME_BUILDER_PIPELINE };
}

export function createInitialGameBuild(plan: CompiledGamePlan): GameBuildState {
  return {
    projectId: plan.spec.projectId,
    stage: "prompt",
    spec: plan.spec,
    dna: plan.dna,
    systemDesign: plan.systemDesign,
    projectFiles: plan.projectStructure.files,
    generatedAssets: [],
    generatedWorld: [],
    playtestEvidence: [],
    history: ["prompt"]
  };
}

export function advanceGameBuild(state: GameBuildState): GameBuildState {
  const index = AI_GAME_BUILDER_PIPELINE.indexOf(state.stage);
  const nextStage = AI_GAME_BUILDER_PIPELINE[Math.min(index + 1, AI_GAME_BUILDER_PIPELINE.length - 1)];
  if (nextStage === state.stage) return state;
  const next = structuredClone(state);
  next.stage = nextStage;
  next.history.push(nextStage);
  if (nextStage === "asset_generation") next.generatedAssets = ["characters", "environments", "props", "ui", "audio"];
  if (nextStage === "world_generation") next.generatedWorld = ["locations", "encounters", "quests", "world_state"];
  if (nextStage === "playable_build") {
    next.projectFiles.push({ path: "factory/playable-build.manifest.json", content: JSON.stringify({ projectId: next.projectId, engine: next.spec.engine, status: "playable_candidate" }, null, 2) + "\n" });
  }
  return next;
}

export function analyzePlaytest(state: GameBuildState, evidence: PlaytestEvidence): PlaytestAnalysis {
  const findings: string[] = [];
  if (evidence.sessions <= 0) findings.push("No playtest sessions were recorded.");
  if (evidence.crashes > 0) findings.push(evidence.crashes + " crash(es) recorded.");
  if ((evidence.averageFrameTimeMs ?? 0) > 16.67) findings.push("Frame-time budget exceeded.");
  if ((evidence.failedChecks ?? []).length) findings.push(...evidence.failedChecks!.map(check => "Failed check: " + check));
  if (evidence.completedSessions < evidence.sessions) findings.push("Not all playtest sessions completed.");
  const severity: PlaytestAnalysis["severity"] =
    evidence.crashes > 0 ? "high" :
    findings.length > 0 ? "medium" : "none";
  return {
    iterationRequired: findings.length > 0,
    findings,
    severity,
    metrics: {
      sessions: evidence.sessions,
      completedSessions: evidence.completedSessions,
      crashes: evidence.crashes,
      averageFrameTimeMs: evidence.averageFrameTimeMs ?? 0
    }
  };
}

export function planIteration(state: GameBuildState, analysis: PlaytestAnalysis): IterationPlan {
  const priority = analysis.findings.length ? [...analysis.findings] : ["polish", "accessibility", "performance"];
  return {
    priority,
    codeChanges: analysis.findings.filter(f => /crash|check|frame-time/i.test(f)),
    assetChanges: analysis.findings.filter(f => /asset|visual|audio/i.test(f)),
    worldChanges: analysis.findings.filter(f => /world|quest|encounter/i.test(f)),
    regressionChecks: ["factory-spec-validation", "gameplay-smoke-test", "performance-budget", "save-load", "narrative-continuity"]
  };
}
