import {
  createStoryWorld,
  applyStoryEvent,
  resolveDynamicEvents,
  recordPlayerChoice,
  addMemory,
  evaluateCanon,
  advanceTimeline,
  type StoryWorldSpec
} from "./story-world-engine";

const assert = (condition: boolean, message: string) => {
  if (!condition) throw new Error(message);
};

const spec: StoryWorldSpec = {
  id: "test-world",
  title: "Test World",
  world: {
    geography: ["Old City"],
    history: ["The founding war"],
    politics: ["Council"],
    culture: ["Festival"],
    factions: ["Guild"],
    rules: ["Magic requires a cost"]
  },
  characters: [{
    id: "hero",
    identity: "Hero",
    personality: ["curious"],
    memory: [],
    goals: ["find the truth"],
    relationships: [],
    secrets: ["hidden origin"],
    arc: "discovery"
  }],
  events: [{
    id: "found-clue",
    type: "main",
    title: "Found a clue",
    conditions: [],
    effects: [{ path: "characters.hero.goals", op: "append", value: "protect the witness" }]
  }],
  canon: [{ id: "canon-1", statement: "The founding war happened.", immutable: true }],
  timeline: [{ id: "t1", order: 1, label: "Day 1" }]
};

export function runStoryWorldContractTests(): void {
  let state = createStoryWorld(spec);
  state = applyStoryEvent(state, "found-clue");
  assert(state.eventsHistory.includes("found-clue"), "event must become part of narrative state");
  assert(state.characters.hero.memory.length === 1, "event must update character memory");

  state = recordPlayerChoice(state, {
    id: "choice-1",
    label: "Tell the truth",
    effects: [{ path: "world.flags.truth_told", op: "set", value: true }]
  });
  assert(state.playerChoices.length === 1, "player choice must be persisted");
  assert(state.world.flags.truth_told === true, "choice consequence must mutate world state");

  state = addMemory(state, "hero", "The witness trusted me.");
  assert(state.characters.hero.memory.includes("The witness trusted me."), "character memory must persist");

  state = advanceTimeline(state);
  assert(state.timelinePosition === 2, "timeline must advance deterministically");

  const dynamic = resolveDynamicEvents(state);
  assert(dynamic.some(event => event.id === "found-clue"), "eligible events must be resolvable from state");

  assert(evaluateCanon(state, "The founding war happened.") === true, "canon must be queryable");
}

runStoryWorldContractTests();
