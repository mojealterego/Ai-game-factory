import {
  compileGamePrompt,
  createInitialGameBuild,
  advanceGameBuild,
  analyzePlaytest,
  planIteration,
  type GameCreationPrompt
} from "./ai-game-builder-engine";

const assert = (condition: boolean, message: string) => {
  if (!condition) throw new Error(message);
};

const request: GameCreationPrompt = {
  projectId: "hospital-survival",
  prompt: "Stwórz mi mobilną grę survival horror w opuszczonym szpitalu, z trzema bohaterami, systemem decyzji, proceduralnymi wydarzeniami i pięcioma zakończeniami.",
  platform: "android"
};

export function runAIGameBuilderContractTests(): void {
  const compiled = compileGamePrompt(request);
  assert(compiled.spec.platforms.includes("android"), "prompt compiler must infer Android");
  assert(compiled.spec.genre.includes("horror"), "prompt compiler must infer horror");
  assert(compiled.spec.genre.includes("survival"), "prompt compiler must infer survival");
  assert(compiled.spec.heroCount === 3, "prompt compiler must infer three heroes");
  assert(compiled.spec.endingCount === 5, "prompt compiler must infer five endings");
  assert(compiled.spec.features.includes("decision_system"), "prompt compiler must detect decisions");
  assert(compiled.spec.features.includes("procedural_events"), "prompt compiler must detect procedural events");
  assert(compiled.dna.gameplayPillars.length > 0, "compiler must produce Game DNA");
  assert(compiled.systemDesign.systems.includes("decision_system"), "system design must contain requested mechanics");
  assert(compiled.projectStructure.files.some(file => file.path === "factory/game-spec.json"), "project must start with a generated structure");
  assert(compiled.pipeline.length === 11, "builder pipeline must contain the complete 11 stages");

  let build = createInitialGameBuild(compiled);
  assert(build.stage === "prompt", "initial build must start at prompt");
  for (let i = 0; i < 11; i++) build = advanceGameBuild(build);
  assert(build.stage === "playtest", "pipeline must reach playable playtest stage");
  assert(build.projectFiles.length > 0, "playable stage must have project files");

  const report = analyzePlaytest(build, {
    sessions: 12,
    completedSessions: 7,
    crashes: 1,
    averageFrameTimeMs: 21,
    failedChecks: ["missing tutorial feedback"]
  });
  assert(report.iterationRequired, "failed playtest evidence must request iteration");

  const iteration = planIteration(build, report);
  assert(iteration.priority.length > 0, "iteration planner must produce priorities");
}

runAIGameBuilderContractTests();
