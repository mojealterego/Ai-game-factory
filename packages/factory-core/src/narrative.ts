export type NarrativeNodeType =
  | "scene" | "choice" | "qte" | "timed_choice" | "investigation" | "dialogue" | "ending";

export type MemoryScope = "story" | "character" | "relationship" | "world" | "scene";

export interface StoryBible {
  id: string;
  title: string;
  premise: string;
  themes: string[];
  tone: string;
  genre: string;
  canonVersion: number;
  canon: Record<string, unknown>;
  rules: string[];
  languages: string[];
}

export interface StoryWorld {
  id: string;
  name: string;
  setting: string;
  rules: string[];
  locations: string[];
  factions?: string[];
  timeline?: string[];
}

export interface StoryCharacter {
  id: string;
  name: string;
  role: string;
  traits: string[];
  goals: string[];
  secrets?: string[];
  alive: boolean;
  variables: Record<string, number | string | boolean>;
  memory: CharacterMemory[];
}

export interface CharacterMemory {
  id: string;
  summary: string;
  importance: number;
  sourceSceneId?: string;
  timestamp: number;
  tags?: string[];
}

export interface Relationship {
  id: string;
  fromCharacterId: string;
  toCharacterId: string;
  score: number;
  state: string;
  history: RelationshipEvent[];
}

export interface RelationshipEvent {
  sceneId: string;
  delta: number;
  reason: string;
  timestamp: number;
}

export interface StoryMemory {
  id: string;
  scope: MemoryScope;
  ownerId?: string;
  summary: string;
  importance: number;
  sourceId: string;
  createdAt: string;
  tags: string[];
}

export interface Chapter {
  id: string;
  number: number;
  title: string;
  sceneIds: string[];
  summary?: string;
}

export interface Scene {
  id: string;
  chapterId: string;
  title: string;
  locationId?: string;
  actorIds: string[];
  objective?: string;
  beats: SceneBeat[];
  dialogueIds: string[];
  choiceIds: string[];
  cameraCues: CameraCue[];
  blocking: SceneBlocking[];
  qteIds: string[];
  timedChoiceIds: string[];
  investigationIds: string[];
  entryConditions?: Condition[];
  exits: string[];
  mutations?: Mutation[];
  continuityTags: string[];
}

export interface SceneBeat {
  id: string;
  order: number;
  description: string;
  durationMs?: number;
  emotionalTarget?: string;
}

export interface DialogueLine {
  id: string;
  sceneId: string;
  characterId: string;
  text: string;
  translations: Record<string, string>;
  voice?: VoiceRequest;
}

export interface Choice {
  id: string;
  sceneId: string;
  prompt: string;
  options: ChoiceOption[];
}

export interface ChoiceOption {
  id: string;
  label: string;
  targetNodeId: string;
  consequences: Consequence[];
  prerequisites?: Condition[];
}

export interface Consequence {
  id: string;
  type: "immediate" | "delayed" | "hidden";
  mutation?: Mutation;
  relationshipDelta?: { relationshipId: string; delta: number };
  memory?: Omit<StoryMemory, "id" | "createdAt">;
  delaySceneIds?: string[];
}

export interface QTE {
  id: string;
  sceneId: string;
  prompt: string;
  input: string;
  durationMs: number;
  successTargetId: string;
  failureTargetId: string;
  consequences: Consequence[];
}

export interface TimedChoice {
  id: string;
  sceneId: string;
  prompt: string;
  durationMs: number;
  options: ChoiceOption[];
  timeoutTargetId: string;
}

export interface Investigation {
  id: string;
  sceneId: string;
  clues: string[];
  requiredClues?: number;
  deductions: InvestigationDeduction[];
}

export interface InvestigationDeduction {
  id: string;
  requiredClueIds: string[];
  conclusion: string;
  targetNodeId: string;
}

export interface CameraCue {
  id: string;
  type: "shot" | "movement" | "lens" | "focus" | "transition";
  value: string;
  startMs?: number;
  durationMs?: number;
}

export interface SceneBlocking {
  actorId: string;
  position: string;
  action: string;
  facing?: string;
  startMs?: number;
  endMs?: number;
}

export interface Ending {
  id: string;
  title: string;
  prerequisites?: Condition[];
  summary: string;
  epilogue?: string;
}

export interface Condition {
  key: string;
  equals: unknown;
}

export interface Mutation {
  path: string;
  value: unknown;
}

export interface VoiceRequest {
  provider?: string;
  voiceId?: string;
  language: string;
  emotion?: string;
}

export interface MediaGenerationSpec {
  type: "voice" | "music" | "cinematic";
  provider?: string;
  prompt: string;
  sourceIds: string[];
  outputFormat?: string;
}

export interface NarrativeState {
  world: Record<string, number | string | boolean>;
  characters: Record<string, {
    alive: boolean;
    variables: Record<string, number | string | boolean>;
  }>;
  relationships: Record<string, number>;
  flags: Record<string, boolean>;
  timeline: string[];
  knowledge: Record<string, boolean>;
  inventory: Record<string, number>;
  unresolvedThreads: string[];
  consequenceQueue: Consequence[];
}

export interface NarrativeNode {
  id: string;
  type: NarrativeNodeType;
  title: string;
  prerequisites?: Condition[];
  mutations?: Mutation[];
  next: string[];
}

export interface NarrativeGraph {
  startNodeId: string;
  nodes: NarrativeNode[];
  endings: string[];
}

export interface ContinuityIssue {
  id: string;
  severity: "error" | "warning";
  category: "canon" | "character" | "relationship" | "timeline" | "location" | "prop" | "dialogue";
  sceneId?: string;
  message: string;
  sourceIds: string[];
}

export interface NarrativeQAReport {
  valid: boolean;
  issues: ContinuityIssue[];
  unreachableNodes: string[];
  unreachableEndings: string[];
  deadBranches: string[];
  contradictions: string[];
}

export interface SelectiveRegenerationRequest {
  targetType: "story_bible" | "world" | "character" | "chapter" | "scene" | "dialogue" | "choice" | "cinematic" | "voice" | "music";
  targetId: string;
  reason: string;
  preserveCanon?: boolean;
  preserveDependencies?: boolean;
  language?: string;
}

export interface StoryToGameManifest {
  projectId: string;
  storyBibleId: string;
  chapters: string[];
  scenes: string[];
  characters: string[];
  dialogue: string[];
  choices: string[];
  endings: string[];
  requiredCapabilities: string[];
  engine?: string;
}

export interface CinematicNarrativeProject {
  storyBible: StoryBible;
  world: StoryWorld;
  characters: StoryCharacter[];
  relationships: Relationship[];
  chapters: Chapter[];
  scenes: Scene[];
  dialogue: DialogueLine[];
  choices: Choice[];
  qtes: QTE[];
  timedChoices: TimedChoice[];
  investigations: Investigation[];
  endings: Ending[];
  memories: StoryMemory[];
  media: MediaGenerationSpec[];
}

export function canEnter(node: NarrativeNode, state: NarrativeState): boolean {
  return (node.prerequisites ?? []).every(({ key, equals }) => {
    const [scope, id, field] = key.split(".");
    const source = scope === "character"
      ? state.characters[id ?? ""]
      : scope === "world" ? state.world
      : scope === "knowledge" ? state.knowledge
      : state.flags;
    return source?.[field ?? id ?? ""] === equals;
  });
}

export function applyMutation(state: NarrativeState, mutation: Mutation): NarrativeState {
  const next: NarrativeState = structuredClone(state);
  const parts = mutation.path.split(".");
  let cursor: any = next;
  for (const part of parts.slice(0, -1)) {
    if (cursor[part] === undefined) cursor[part] = {};
    cursor = cursor[part];
  }
  cursor[parts.at(-1)!] = mutation.value;
  return next;
}

export function addCharacterMemory(
  character: StoryCharacter,
  memory: Omit<CharacterMemory, "id" | "timestamp">
): StoryCharacter {
  return {
    ...character,
    memory: [...character.memory, {
      ...memory,
      id: `mem_${character.id}_${character.memory.length + 1}`,
      timestamp: Date.now()
    }]
  };
}

export function applyRelationshipDelta(
  relationship: Relationship,
  delta: number,
  sceneId: string,
  reason: string
): Relationship {
  return {
    ...relationship,
    score: Math.max(-100, Math.min(100, relationship.score + delta)),
    history: [...relationship.history, { sceneId, delta, reason, timestamp: Date.now() }]
  };
}

export function selectiveRegenerationScope(
  request: SelectiveRegenerationRequest,
  project: CinematicNarrativeProject
): string[] {
  const dependencies = new Set<string>([request.targetId]);
  if (request.preserveCanon !== false) dependencies.add(project.storyBible.id);
  if (request.targetType === "character") {
    for (const scene of project.scenes) if (scene.actorIds.includes(request.targetId)) dependencies.add(scene.id);
  }
  if (request.targetType === "chapter") {
    const chapter = project.chapters.find(item => item.id === request.targetId);
    chapter?.sceneIds.forEach(id => dependencies.add(id));
  }
  return [...dependencies];
}

export function narrativeQA(project: CinematicNarrativeProject, graph: NarrativeGraph): NarrativeQAReport {
  const issues: ContinuityIssue[] = [];
  const characterIds = new Set(project.characters.map(c => c.id));
  for (const scene of project.scenes) {
    for (const actorId of scene.actorIds) {
      if (!characterIds.has(actorId)) issues.push({
        id: `missing-character-${scene.id}-${actorId}`, severity: "error", category: "character",
        sceneId: scene.id, message: "Scene references an unknown character.", sourceIds: [scene.id, actorId]
      });
    }
    for (const beat of scene.beats) {
      if (beat.durationMs !== undefined && beat.durationMs < 0) issues.push({
        id: `negative-duration-${beat.id}`, severity: "error", category: "timeline",
        sceneId: scene.id, message: "Scene beat has a negative duration.", sourceIds: [beat.id]
      });
    }
  }
  const reachable = new Set<string>();
  const byId = new Map(graph.nodes.map(n => [n.id, n]));
  const visit = (id: string) => {
    if (reachable.has(id)) return;
    const node = byId.get(id);
    if (!node) return;
    reachable.add(id);
    node.next.forEach(visit);
  };
  visit(graph.startNodeId);
  const unreachableNodes = graph.nodes.filter(n => !reachable.has(n.id)).map(n => n.id);
  const unreachableEndings = graph.endings.filter(id => !reachable.has(id));
  return {
    valid: issues.every(i => i.severity !== "error") && unreachableEndings.length === 0,
    issues,
    unreachableNodes,
    unreachableEndings,
    deadBranches: [],
    contradictions: []
  };
}

export function compileStoryToGame(project: CinematicNarrativeProject, projectId: string, engine?: string): StoryToGameManifest {
  return {
    projectId,
    storyBibleId: project.storyBible.id,
    chapters: project.chapters.map(c => c.id),
    scenes: project.scenes.map(s => s.id),
    characters: project.characters.map(c => c.id),
    dialogue: project.dialogue.map(d => d.id),
    choices: project.choices.map(c => c.id),
    endings: project.endings.map(e => e.id),
    requiredCapabilities: [
      "narrative_runtime", "gameplay_logic", "code", "audio", "voice",
      "video", "qa"
    ],
    engine
  };
}
