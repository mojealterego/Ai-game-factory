import {
  applyDramaDecision,
  createDramaState,
  resolveEnding,
  evaluateQTE,
  evaluateInvestigation,
  buildNarrativeFlowchart,
  validateContinuity,
  type CinematicDramaProject
} from "./narrative";

const assert = (condition: boolean, message: string) => {
  if (!condition) throw new Error(message);
};

const project: CinematicDramaProject = {
  story: {
    id: "story-1",
    title: "Test Drama",
    playableCharacterIds: ["a", "b"],
    scenes: [
      { id: "s1", playableCharacterId: "a", nextSceneIds: ["s2", "s3"], conditions: [] },
      { id: "s2", playableCharacterId: "b", nextSceneIds: ["end-good"], conditions: [] },
      { id: "s3", playableCharacterId: "a", nextSceneIds: ["end-bad"], conditions: [] }
    ]
  },
  world: { variables: { publicOpinion: 0 }, flags: {} },
  characters: [
    { id: "a", alive: true, variables: { trust: 0 } },
    { id: "b", alive: true, variables: { trust: 0 } }
  ],
  relationships: [{ id: "r1", from: "a", to: "b", score: 0 }],
  decisions: [],
  consequences: [],
  endings: [
    { id: "end-good", title: "Good", conditions: [{ key: "world.variables.publicOpinion", equals: 1 }] },
    { id: "end-bad", title: "Bad", conditions: [{ key: "world.variables.publicOpinion", equals: -1 }] }
  ]
};

export function runCinematicDramaContractTests(): void {
  const state = createDramaState(project);
  const deadCharacter = applyDramaDecision(state, {
    id: "d1",
    label: "Sacrifice A",
    mutations: [{ path: "characters.a.alive", value: false }],
    nextSceneId: "s2"
  });
  assert(deadCharacter.characters.a.alive === false, "dead playable character must remain dead");
  assert(deadCharacter.activePlayableCharacterId === "b", "runtime must switch to a living playable character");
  assert(deadCharacter.currentSceneId === "s2", "decision must advance to its target scene");

  const consequenceState = applyDramaDecision(state, {
    id: "d2",
    label: "Public speech",
    mutations: [{ path: "world.variables.publicOpinion", value: 1 }],
    delayedConsequences: [{ sceneId: "s2", mutations: [{ path: "world.flags.riot", value: true }] }],
    nextSceneId: "s2"
  });
  assert(consequenceState.world.variables.publicOpinion === 1, "immediate consequence must mutate state");
  assert(consequenceState.consequenceQueue.length === 1, "delayed consequence must be queued");

  const endingState = applyDramaDecision(state, {
    id: "d3",
    label: "Win trust",
    mutations: [{ path: "world.variables.publicOpinion", value: 1 }]
  });
  assert(resolveEnding(project.endings, endingState)?.id === "end-good", "ending resolver must use accumulated state");

  assert(evaluateQTE({ durationMs: 1000, input: "tap", successInput: "tap", elapsedMs: 500 }) === "success", "QTE success must be deterministic");
  assert(evaluateQTE({ durationMs: 1000, input: "tap", successInput: "tap", elapsedMs: 1200 }) === "failure", "QTE timeout must fail");
  assert(evaluateInvestigation({ clueIds: ["c1", "c2"], requiredClueIds: ["c1", "c2"] }), "investigation must resolve when all required clues exist");

  const flow = buildNarrativeFlowchart(project);
  assert(flow.nodes.length === 5, "flowchart must contain scenes and endings");
  const broken = { ...project, story: { ...project.story, scenes: [{ ...project.story.scenes[0], nextSceneIds: ["missing"] }] } };
  assert(validateContinuity(broken).some(issue => issue.severity === "error"), "continuity doctor must report missing targets");
}

runCinematicDramaContractTests();
