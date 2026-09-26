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
    { id: "end-good", title: "Good", conditions: [{ key: "world.publicOpinion", equals: 1 }] },
    { id: "end-bad", title: "Bad", conditions: [{ key: "world.publicOpinion", equals: -1 }] }
  ]
};

describe("Cinematic Interactive Drama Framework", () => {
  it("keeps the story alive when a playable character dies", () => {
    const state = createDramaState(project);
    const next = applyDramaDecision(state, {
      id: "d1",
      label: "Sacrifice A",
      mutations: [{ path: "characters.a.alive", value: false }],
      nextSceneId: "s2"
    });
    expect(next.characters.a.alive).toBe(false);
    expect(next.activePlayableCharacterId).toBe("b");
    expect(next.currentSceneId).toBe("s2");
  });

  it("applies immediate and queues delayed consequences", () => {
    const state = createDramaState(project);
    const next = applyDramaDecision(state, {
      id: "d2",
      label: "Public speech",
      mutations: [{ path: "world.variables.publicOpinion", value: 1 }],
      delayedConsequences: [{ sceneId: "s2", mutations: [{ path: "world.flags.riot", value: true }] }],
      nextSceneId: "s2"
    });
    expect(next.world.variables.publicOpinion).toBe(1);
    expect(next.consequenceQueue).toHaveLength(1);
  });

  it("resolves endings from the accumulated state", () => {
    const state = createDramaState(project);
    const next = applyDramaDecision(state, {
      id: "d3",
      label: "Win trust",
      mutations: [{ path: "world.variables.publicOpinion", value: 1 }]
    });
    expect(resolveEnding(project.endings, next)?.id).toBe("end-good");
  });

  it("evaluates QTE and investigation outcomes deterministically", () => {
    expect(evaluateQTE({ durationMs: 1000, input: "tap", successInput: "tap", elapsedMs: 500 })).toBe("success");
    expect(evaluateQTE({ durationMs: 1000, input: "tap", successInput: "tap", elapsedMs: 1200 })).toBe("failure");
    expect(evaluateInvestigation({ clueIds: ["c1", "c2"], requiredClueIds: ["c1", "c2"] })).toBe(true);
  });

  it("builds a replayable narrative flowchart and reports continuity errors", () => {
    const flow = buildNarrativeFlowchart(project);
    expect(flow.nodes).toHaveLength(5);
    const broken = { ...project, story: { ...project.story, scenes: [{ ...project.story.scenes[0], nextSceneIds: ["missing"] }] } };
    expect(validateContinuity(broken).some(issue => issue.severity === "error")).toBe(true);
  });
});
