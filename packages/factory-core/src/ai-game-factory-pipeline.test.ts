import {
  AI_GAME_FACTORY_PIPELINE, FACTORY_STAGE_DEPENDENCIES,
  createAIGameFactoryProject, getFactoryArchitecture,
  markFactoryStage, prepareGameIdeation, compileDesign
} from "./ai-game-factory-pipeline";

const assert = (condition: boolean, message: string) => { if (!condition) throw new Error(message); };

export function runAIGameFactoryPipelineContractTests(): void {
  assert(AI_GAME_FACTORY_PIPELINE.length === 19, "factory pipeline must contain the complete 19-stage lifecycle");
  assert(AI_GAME_FACTORY_PIPELINE[0] === "idea", "pipeline must start with idea");
  assert(AI_GAME_FACTORY_PIPELINE.at(-1) === "release", "pipeline must end with release");
  assert(FACTORY_STAGE_DEPENDENCIES.build.includes("optimization"), "build must depend on optimization");
  assert(FACTORY_STAGE_DEPENDENCIES.release.includes("qa"), "release must depend on QA");

  const project = createAIGameFactoryProject({
    projectId: "contract-project",
    gameIdea: "Mobile survival horror in an abandoned hospital",
    engine: "godot",
    platforms: ["android"]
  });

  assert(project.intelligence.length === 4, "the four intelligence engines must be unified under Factory Core");
  assert(project.stages.length === 19, "all lifecycle stages must exist");

  let next = markFactoryStage(project, "idea", "succeeded", ["test://idea"]);
  let blocked = false;
  try { markFactoryStage(next, "game_dna", "running"); } catch { blocked = true; }
  assert(blocked, "downstream stage must be blocked until dependencies are complete");

  const ideated = prepareGameIdeation(next, {
    projectId: researched.projectId, theme: "abandoned hospital",
    genres: ["horror", "survival"], mechanics: ["decision system", "procedural events"],
    references: [], platform: "android", batchSize: 3
  });
  assert(ideated.ideas.length === 3, "ideation must produce requested batch");
  const designed = compileDesign(ideated.project, ideated.ideas[0]);
  assert(designed.gdd?.sourceIdeaId === ideated.ideas[0].id, "GDD must derive from selected idea");
  assert(designed.gameDna?.genre.includes("horror") === true, "Game DNA must derive from GDD/idea");
  assert(designed.compiledGame !== undefined, "game builder must receive the compiled design");

  const architecture = getFactoryArchitecture();
  assert(architecture.qaGates.length === 16, "all QA gates must be exposed");
  assert(architecture.assetPipeline.length > 0, "asset factory must be part of shared core");
  assert(architecture.threeDPipeline.length > 0, "3D pipeline must be part of shared core");
  assert(architecture.audioPipeline.length > 0, "audio/dubbing must be part of shared core");
  assert(architecture.storyWorldEngine.length > 0, "story/world engine must be part of shared core");
  assert(architecture.cinematicDramaEngine.length > 0, "cinematic drama must be part of shared core");
}
runAIGameFactoryPipelineContractTests();
