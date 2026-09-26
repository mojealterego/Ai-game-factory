import type { GameDNA } from "./state";

export const REFERENCE_IDEATION_PIPELINE = [
  "research",
  "reference_ingestion",
  "constraint_modeling",
  "batch_ideation",
  "selection",
  "variation",
  "gdd"
] as const;

export type IdeationStage = typeof REFERENCE_IDEATION_PIPELINE[number];

export type ReferenceType =
  | "game"
  | "mechanic"
  | "genre"
  | "concept"
  | "gdd"
  | "image"
  | "document"
  | "market_signal";

export interface GameReference {
  id: string;
  type: ReferenceType;
  title: string;
  source?: string;
  notes?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface ResearchSignal {
  id: string;
  category: "genre" | "mechanic" | "trend" | "competition" | "platform";
  label: string;
  evidence: string;
  sourceIds: string[];
  confidence: number;
}

export interface GameResearchRecord {
  id: string;
  query: string;
  referenceGames: GameReference[];
  mechanicDatabase: GameReference[];
  signals: ResearchSignal[];
  generatedAt: string;
}

export interface IdeationConstraints {
  values: string[];
  hard: boolean;
}

export interface ReferenceIdeationRequest {
  projectId: string;
  theme?: string;
  genres?: string[];
  mechanics?: string[];
  references: GameReference[];
  platform?: "mobile" | "desktop" | "web" | "console" | "multi" | "android" | "ios";
  perspective?: string;
  artStyle?: string;
  constraints?: string[];
  batchSize?: number;
  research?: GameResearchRecord;
}

export interface GameIdea {
  id: string;
  projectId: string;
  title: string;
  concept: string;
  theme?: string;
  genres: string[];
  mechanics: string[];
  references: GameReference[];
  platform?: string;
  perspective?: string;
  artStyle?: string;
  constraints: IdeationConstraints;
  conceptArtPrompt: string;
  score?: number;
  selected: boolean;
  parentIdeaId?: string;
  variationIndex?: number;
  provenance: {
    sourceReferenceIds: string[];
    generatedFrom: "request" | "variation" | "reference_blend";
    stage: IdeationStage;
  };
}

export interface GDDSection {
  key: "overview" | "pillars" | "mechanics" | "gameplay_loop" | "world" | "characters" | "narrative" | "references" | "constraints" | "platform" | "art";
  title: string;
  content: string;
}

export interface GameConceptGDD {
  id: string;
  projectId: string;
  title: string;
  sections: GDDSection[];
  sourceIdeaId: string;
  referenceIds: string[];
  version: number;
}

export interface IdeationVariationPatch {
  theme?: string;
  genres?: string[];
  mechanics?: string[];
  references?: GameReference[];
  platform?: string;
  perspective?: string;
  artStyle?: string;
  constraints?: string[];
}

export interface MechanicMix {
  id: string;
  mechanics: string[];
  rationale: string;
}

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

export function createIdeationRequest(input: ReferenceIdeationRequest): ReferenceIdeationRequest {
  return {
    ...input,
    theme: input.theme?.trim(),
    genres: [...new Set((input.genres ?? []).map(value => value.trim()).filter(Boolean))],
    mechanics: [...new Set((input.mechanics ?? []).map(value => value.trim()).filter(Boolean))],
    references: input.references.map(reference => ({ ...reference, tags: [...new Set(reference.tags ?? [])] })),
    constraints: [...new Set((input.constraints ?? []).map(value => value.trim()).filter(Boolean))],
    batchSize: Math.max(1, Math.min(50, input.batchSize ?? 5))
  };
}

export function buildReferenceFingerprint(references: GameReference[]): string {
  return references
    .map(reference => `${reference.id}:${reference.type}:${reference.title}`)
    .sort()
    .join("|");
}

export function researchGames(input: {
  query: string;
  referenceGames?: GameReference[];
  mechanics?: GameReference[];
  signals?: ResearchSignal[];
}): GameResearchRecord {
  return {
    id: `research-${Date.now()}`,
    query: input.query.trim(),
    referenceGames: [...(input.referenceGames ?? [])],
    mechanicDatabase: [...(input.mechanics ?? [])],
    signals: (input.signals ?? []).map(signal => ({
      ...signal,
      confidence: clamp01(signal.confidence)
    })),
    generatedAt: new Date().toISOString()
  };
}

export function mixMechanics(mechanics: string[], references: GameReference[] = []): MechanicMix {
  const unique = [...new Set(mechanics.map(value => value.trim()).filter(Boolean))];
  return {
    id: `mechanic-mix-${unique.join("-").toLowerCase().replace(/[^a-z0-9-]+/g, "-") || "empty"}`,
    mechanics: unique,
    rationale: references.length
      ? `Mixed from requested mechanics and ${references.length} reference input(s).`
      : "Mixed from requested mechanics."
  };
}

function makeIdea(request: ReferenceIdeationRequest, index: number, seed?: GameIdea): GameIdea {
  const genres = [...new Set(seed?.genres ?? request.genres ?? ["custom"])];
  const mechanics = [...new Set(seed?.mechanics ?? request.mechanics ?? ["core gameplay loop"])];
  const references = [...(seed?.references ?? request.references)];
  const titleSeed = seed?.title ?? request.theme ?? genres.join(" + ");
  const title = `${titleSeed} — Concept ${index + 1}`;
  const variationText = seed ? ` Variation ${index + 1} explores a different combination of the selected constraints.` : "";
  return {
    id: `${request.projectId}-idea-${Date.now()}-${index}`,
    projectId: request.projectId,
    title,
    concept: `A ${genres.join(" / ")} game built around ${mechanics.join(", ")}.${variationText}`,
    theme: seed?.theme ?? request.theme,
    genres,
    mechanics,
    references,
    platform: seed?.platform ?? request.platform,
    perspective: seed?.perspective ?? request.perspective,
    artStyle: seed?.artStyle ?? request.artStyle,
    constraints: { values: [...(seed?.constraints.values ?? request.constraints ?? [])], hard: true },
    conceptArtPrompt: [request.artStyle, request.theme, genres.join(", "), mechanics.join(", ")].filter(Boolean).join(" | "),
    selected: false,
    parentIdeaId: seed?.id,
    variationIndex: seed ? index + 1 : undefined,
    provenance: {
      sourceReferenceIds: references.map(reference => reference.id),
      generatedFrom: seed ? "variation" : references.length ? "reference_blend" : "request",
      stage: "batch_ideation"
    }
  };
}

export function generateIdeaBatch(request: ReferenceIdeationRequest): GameIdea[] {
  const normalized = createIdeationRequest(request);
  return Array.from({ length: normalized.batchSize ?? 1 }, (_, index) => makeIdea(normalized, index));
}

export function selectIdea(ideas: GameIdea[], ideaId: string): GameIdea {
  const selected = ideas.find(idea => idea.id === ideaId);
  if (!selected) throw new Error("Unknown idea: " + ideaId);
  return { ...selected, selected: true, provenance: { ...selected.provenance, stage: "selection" } };
}

export function createVariation(idea: GameIdea, patch: IdeationVariationPatch): GameIdea {
  const variation = {
    ...idea,
    id: `${idea.id}-v${(idea.variationIndex ?? 0) + 1}`,
    title: `${patch.theme ?? idea.theme ?? idea.title} — Variation ${(idea.variationIndex ?? 0) + 1}`,
    theme: patch.theme ?? idea.theme,
    genres: [...new Set(patch.genres ?? idea.genres)],
    mechanics: [...new Set(patch.mechanics ?? idea.mechanics)],
    references: [...new Map([...(idea.references ?? []), ...(patch.references ?? [])].map(reference => [reference.id, reference])).values()],
    platform: patch.platform ?? idea.platform,
    perspective: patch.perspective ?? idea.perspective,
    artStyle: patch.artStyle ?? idea.artStyle,
    constraints: { values: [...new Set(patch.constraints ?? idea.constraints.values)], hard: idea.constraints.hard },
    selected: false,
    parentIdeaId: idea.id,
    variationIndex: (idea.variationIndex ?? 0) + 1,
    provenance: {
      ...idea.provenance,
      generatedFrom: "variation" as const,
      stage: "variation" as const,
      sourceReferenceIds: [...new Set([...(idea.provenance.sourceReferenceIds ?? []), ...(patch.references ?? []).map(reference => reference.id)])]
    }
  };
  variation.concept = `A ${variation.genres.join(" / ")} game built around ${variation.mechanics.join(", ")}.`;
  variation.conceptArtPrompt = [variation.artStyle, variation.theme, variation.genres.join(", "), variation.mechanics.join(", ")].filter(Boolean).join(" | ");
  return variation;
}

export function createGDD(idea: GameIdea): GameConceptGDD {
  const sections: GDDSection[] = [
    { key: "overview", title: "Overview", content: idea.concept },
    { key: "pillars", title: "Design Pillars", content: idea.genres.join(", ") },
    { key: "mechanics", title: "Mechanics", content: idea.mechanics.join(", ") },
    { key: "gameplay_loop", title: "Gameplay Loop", content: `Explore → interact → ${idea.mechanics[0] ?? "play"} → progress → repeat.` },
    { key: "world", title: "World", content: idea.theme ?? "Project-defined world" },
    { key: "characters", title: "Characters", content: "Project-defined characters and roles." },
    { key: "narrative", title: "Narrative", content: "Project-defined narrative structure." },
    { key: "references", title: "References", content: idea.references.map(reference => `${reference.title} [${reference.id}]`).join("; ") || "None" },
    { key: "constraints", title: "Constraints", content: idea.constraints.values.join("; ") || "None" },
    { key: "platform", title: "Platform", content: idea.platform ?? "Project-defined" },
    { key: "art", title: "Art Direction", content: idea.artStyle ?? "Project-defined" }
  ];
  return {
    id: `${idea.projectId}-gdd-${idea.id}`,
    projectId: idea.projectId,
    title: idea.title,
    sections,
    sourceIdeaId: idea.id,
    referenceIds: idea.references.map(reference => reference.id),
    version: 1
  };
}

export function convertGDDToGameDNA(gdd: GameConceptGDD, idea: GameIdea): GameDNA {
  return {
    genre: idea.genres,
    subgenre: [],
    platforms: idea.platform ? [idea.platform] : ["android"],
    dimensionality: "3D",
    camera: { mode: idea.perspective ?? "third_person", perspective: "third_person" },
    gameplayLoop: gdd.sections.find(section => section.key === "gameplay_loop")?.content ?? "",
    mechanics: idea.mechanics,
    progression: ["project-defined progression"],
    economy: { systems: [] },
    world: { setting: idea.theme ?? "project-defined" },
    heroes: ["project-defined protagonist"],
    enemies: [],
    npcs: [],
    locations: [],
    quests: [],
    narrative: { premise: idea.concept, structure: "project-defined", branching: false },
    artisticStyle: { direction: idea.artStyle ?? "project-defined" },
    cinematicStyle: { direction: "project-defined" },
    ui: { direction: "project-defined" },
    audio: { direction: "project-defined" },
    music: { direction: "project-defined" },
    voice: { enabled: false },
    monetization: [],
    multiplayer: { enabled: false, mode: "single_player" },
    saveSystem: { type: "local" },
    accessibility: [],
    targetHardware: { devices: idea.platform ? [idea.platform] : ["android"] },
    performanceBudget: { targetFps: 60 },
    ageRating: { target: "project-defined" },
    localization: { languages: ["en"], fallbackLanguage: "en" },
    businessModel: { model: "project-defined" },
    engine: undefined,
    visualStyle: idea.artStyle,
    gameplayPillars: idea.genres,
    narrativePillars: [],
    constraints: { values: idea.constraints.values, referenceIds: idea.references.map(reference => reference.id) },
    version: 1
  };
}
