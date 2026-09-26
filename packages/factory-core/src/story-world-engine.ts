export type StoryEventType = "main" | "side" | "dynamic" | "emergent";
export type StoryValue = string | number | boolean | string[];

export interface StoryWorldModel {
  geography: string[];
  history: string[];
  politics: string[];
  culture: string[];
  factions: string[];
  rules: string[];
  flags?: Record<string, boolean>;
  variables?: Record<string, StoryValue>;
}

export interface StoryCharacterModel {
  id: string;
  identity: string;
  personality: string[];
  memory: string[];
  goals: string[];
  relationships: StoryRelationship[];
  secrets: string[];
  arc: string;
}

export interface StoryRelationship {
  characterId: string;
  targetCharacterId: string;
  type: string;
  value: number;
  history?: string[];
}

export interface StoryCondition {
  path: string;
  equals?: StoryValue;
  notEquals?: StoryValue;
}

export type StoryEffectOp = "set" | "increment" | "append" | "remove";

export interface StoryEffect {
  path: string;
  op: StoryEffectOp;
  value: StoryValue;
}

export interface StoryEvent {
  id: string;
  type: StoryEventType;
  title: string;
  conditions: StoryCondition[];
  effects: StoryEffect[];
  priority?: number;
}

export interface CanonEntry {
  id: string;
  statement: string;
  immutable: boolean;
  sourceEventId?: string;
}

export interface TimelineEntry {
  id: string;
  order: number;
  label: string;
  eventIds?: string[];
}

export interface StoryWorldSpec {
  id: string;
  title: string;
  world: StoryWorldModel;
  characters: StoryCharacterModel[];
  events: StoryEvent[];
  canon: CanonEntry[];
  timeline: TimelineEntry[];
}

export interface PlayerChoice {
  id: string;
  label: string;
  effects: StoryEffect[];
}

export interface StoryWorldState {
  storyId: string;
  world: StoryWorldModel;
  characters: Record<string, StoryCharacterModel>;
  events: Record<string, StoryEvent>;
  canon: CanonEntry[];
  timeline: TimelineEntry[];
  timelinePosition: number;
  playerChoices: string[];
  choiceHistory: PlayerChoice[];
  eventsHistory: string[];
  consequenceHistory: string[];
  emergentEvents: string[];
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

function getPath(state: StoryWorldState, path: string): unknown {
  return path.split(".").reduce<unknown>((cursor, key) => {
    if (cursor === null || cursor === undefined || typeof cursor !== "object") return undefined;
    return (cursor as Record<string, unknown>)[key];
  }, state);
}

function setPath(state: StoryWorldState, path: string, value: unknown): StoryWorldState {
  const next = clone(state);
  const parts = path.split(".");
  let cursor = next as unknown as Record<string, unknown>;
  for (const part of parts.slice(0, -1)) {
    const existing = cursor[part];
    if (!existing || typeof existing !== "object") cursor[part] = {};
    cursor = cursor[part] as Record<string, unknown>;
  }
  cursor[parts.at(-1)!] = value;
  return next;
}

function applyEffect(state: StoryWorldState, effect: StoryEffect): StoryWorldState {
  const current = getPath(state, effect.path);
  if (effect.op === "set") return setPath(state, effect.path, effect.value);
  if (effect.op === "increment") {
    const currentNumber = typeof current === "number" ? current : 0;
    const amount = typeof effect.value === "number" ? effect.value : 0;
    return setPath(state, effect.path, currentNumber + amount);
  }
  if (effect.op === "append") {
    const list = Array.isArray(current) ? [...current] : [];
    if (!list.includes(effect.value as never)) list.push(effect.value as never);
    return setPath(state, effect.path, list);
  }
  if (effect.op === "remove") {
    const list = Array.isArray(current) ? current.filter(item => item !== effect.value) : [];
    return setPath(state, effect.path, list);
  }
  return state;
}

function conditionsMatch(state: StoryWorldState, conditions: StoryCondition[]): boolean {
  return conditions.every(condition => {
    const value = getPath(state, condition.path);
    if (condition.equals !== undefined) return JSON.stringify(value) === JSON.stringify(condition.equals);
    if (condition.notEquals !== undefined) return JSON.stringify(value) !== JSON.stringify(condition.notEquals);
    return value !== undefined;
  });
}

export function createStoryWorld(spec: StoryWorldSpec): StoryWorldState {
  return {
    storyId: spec.id,
    world: clone(spec.world),
    characters: Object.fromEntries(spec.characters.map(character => [character.id, clone(character)])),
    events: Object.fromEntries(spec.events.map(event => [event.id, clone(event)])),
    canon: clone(spec.canon),
    timeline: clone(spec.timeline).sort((a, b) => a.order - b.order),
    timelinePosition: 0,
    playerChoices: [],
    choiceHistory: [],
    eventsHistory: [],
    consequenceHistory: [],
    emergentEvents: []
  };
}

export function applyStoryEvent(state: StoryWorldState, eventId: string): StoryWorldState {
  const event = state.events[eventId];
  if (!event) throw new Error("Unknown story event: " + eventId);
  if (!conditionsMatch(state, event.conditions)) return state;
  let next = clone(state);
  for (const effect of event.effects) next = applyEffect(next, effect);
  next.eventsHistory.push(eventId);
  next.consequenceHistory.push(`event:${eventId}`);
  const characterIds = Object.keys(next.characters);
  for (const characterId of characterIds) {
    const character = next.characters[characterId];
    if (event.effects.some(effect => effect.path.startsWith(`characters.${characterId}.`))) {
      character.memory = [...character.memory, `Experienced event: ${event.title}`];
    }
  }
  return next;
}

export function recordPlayerChoice(state: StoryWorldState, choice: PlayerChoice): StoryWorldState {
  let next = clone(state);
  next.playerChoices.push(choice.id);
  next.choiceHistory.push(clone(choice));
  for (const effect of choice.effects) next = applyEffect(next, effect);
  next.consequenceHistory.push(`choice:${choice.id}`);
  return next;
}

export function addMemory(state: StoryWorldState, characterId: string, memory: string): StoryWorldState {
  const character = state.characters[characterId];
  if (!character) throw new Error("Unknown character: " + characterId);
  const next = clone(state);
  if (!next.characters[characterId].memory.includes(memory)) next.characters[characterId].memory.push(memory);
  return next;
}

export function resolveDynamicEvents(state: StoryWorldState): StoryEvent[] {
  return Object.values(state.events)
    .filter(event => event.type === "dynamic" || event.type === "emergent" || event.type === "main" || event.type === "side")
    .filter(event => !state.eventsHistory.includes(event.id))
    .filter(event => conditionsMatch(state, event.conditions))
    .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
}

export function advanceTimeline(state: StoryWorldState): StoryWorldState {
  const next = clone(state);
  next.timelinePosition = Math.min(next.timelinePosition + 1, next.timeline.length);
  const current = next.timeline[next.timelinePosition - 1];
  for (const eventId of current?.eventIds ?? []) {
    if (next.events[eventId] && !next.eventsHistory.includes(eventId)) {
      const after = applyStoryEvent(next, eventId);
      Object.assign(next, after);
    }
  }
  return next;
}

export function evaluateCanon(state: StoryWorldState, statement: string): boolean {
  return state.canon.some(entry => entry.statement === statement);
}

export function registerCanon(state: StoryWorldState, entry: CanonEntry): StoryWorldState {
  const existing = state.canon.find(item => item.id === entry.id);
  if (existing?.immutable && existing.statement !== entry.statement) {
    throw new Error("Immutable canon cannot be rewritten: " + entry.id);
  }
  const next = clone(state);
  const index = next.canon.findIndex(item => item.id === entry.id);
  if (index >= 0) next.canon[index] = clone(entry);
  else next.canon.push(clone(entry));
  return next;
}

export function registerEmergentEvent(state: StoryWorldState, event: StoryEvent): StoryWorldState {
  if (state.events[event.id]) throw new Error("Event already exists: " + event.id);
  const next = clone(state);
  next.events[event.id] = clone(event);
  next.emergentEvents.push(event.id);
  return next;
}

export function getCharacterMemory(state: StoryWorldState, characterId: string): string[] {
  return [...(state.characters[characterId]?.memory ?? [])];
}

export function getRelationship(state: StoryWorldState, characterId: string, targetCharacterId: string): StoryRelationship | undefined {
  return state.characters[characterId]?.relationships.find(item => item.targetCharacterId === targetCharacterId);
}

export const AI_STORY_WORLD_ENGINE = [
  "world.geography",
  "world.history",
  "world.politics",
  "world.culture",
  "world.factions",
  "world.rules",
  "character.identity",
  "character.personality",
  "character.memory",
  "character.goals",
  "character.relationships",
  "character.secrets",
  "character.arc",
  "events.main",
  "events.side",
  "events.dynamic",
  "events.emergent",
  "narrative.canon",
  "narrative.timeline",
  "narrative.consequences",
  "narrative.relationships",
  "narrative.player_choices"
] as const;
