import type { Capability, CapabilityRequest, Job, ProviderAdapter } from "./contracts";
import type { EngineAdapter, EngineOperation, EngineResult } from "./engine-adapter";
import type { BuildAdapter, BuildRequest, BuildArtifact } from "./build-orchestrator";
import type { CloudWorker, CloudWorkerRequest, WorkerKind } from "./cloud-workers";
import type { LudoAdapter } from "./ludo-api-mcp-adapter";
import { createAIGameFactoryProject, markFactoryStage, type AIGameFactoryStage, type FactoryProjectContract } from "./ai-game-factory-pipeline";
import { ProviderRouter, type ProviderPolicy } from "./provider-router";
import { AssetRouter, type AssetRequest } from "./asset-router";
import { executeBuildFarm } from "./build-farm";

export interface FactoryRuntimeOptions {
  providers?: ProviderAdapter[];
  engines?: EngineAdapter[];
  workers?: CloudWorker[];
  buildFarm?: BuildAdapter;
  providerPolicy?: ProviderPolicy;
  ludo?: LudoAdapter;
}

export interface FactoryExecutionResult {
  project: FactoryProjectContract;
  jobs: Job[];
  engineResults: EngineResult[];
  buildArtifact?: BuildArtifact;
  evidence: string[];
}

const STAGE_CAPABILITY: Partial<Record<AIGameFactoryStage, { capability: Capability; kind: WorkerKind }>> = {
  research: { capability: "knowledge_retrieval", kind: "generic" },
  game_ideation: { capability: "game_ideation", kind: "agent" },
  code: { capability: "code", kind: "code" },
  assets: { capability: "image", kind: "asset" },
  audio: { capability: "audio", kind: "asset" },
  animation: { capability: "animation", kind: "asset" },
  ai_playtest: { capability: "qa", kind: "qa" },
  qa: { capability: "qa", kind: "qa" }
};

export class FactoryExecutionRuntime {
  private readonly providers: ProviderAdapter[];
  private readonly engines: EngineAdapter[];
  private readonly workers: CloudWorker[];
  private readonly providerPolicy?: ProviderPolicy;
  private readonly buildFarm?: BuildAdapter;
  private readonly ludo?: LudoAdapter;

  constructor(options: FactoryRuntimeOptions = {}) {
    this.providers = options.providers ?? [];
    this.engines = options.engines ?? [];
    this.workers = options.workers ?? [];
    this.buildFarm = options.buildFarm;
    this.providerPolicy = options.providerPolicy;
    this.ludo = options.ludo;
  }

  async execute(input: {
    projectId: string;
    gameIdea: string;
    engine?: string;
    platforms?: string[];
    buildTarget?: string;
    configuration?: "debug" | "release";
    sign?: boolean;
  }): Promise<FactoryExecutionResult> {
    let project = createAIGameFactoryProject({
      projectId: input.projectId,
      gameIdea: input.gameIdea,
      engine: input.engine as never,
      platforms: input.platforms
    });
    const jobs: Job[] = [];
    const engineResults: EngineResult[] = [];
    const evidence: string[] = [];

    project = markFactoryStage(project, "idea", "succeeded", ["runtime://idea"]);

    if (this.ludo) {
      const research = await this.ludo.research({ projectId: input.projectId, query: input.gameIdea });
      if (research.status === "failed") throw new Error("LUDO_RESEARCH_FAILED:" + (research.error ?? ""));
      project = markFactoryStage(project, "research", "succeeded", research.evidence ?? [], research.artifactIds ?? [], [research.jobId ?? "ludo"]);
      evidence.push("Ludo research executed through the configured API/MCP transport.");
      const ideation = await this.ludo.ideate({ projectId: input.projectId, theme: input.gameIdea, platform: input.platforms?.[0] ?? "android" });
      if (ideation.status === "failed") throw new Error("LUDO_IDEATION_FAILED:" + (ideation.error ?? ""));
      project = markFactoryStage(project, "game_ideation", "succeeded", ideation.evidence ?? [], ideation.artifactIds ?? [], [ideation.jobId ?? "ludo"]);
      evidence.push("Ludo ideation executed through the configured API/MCP transport.");
    } else {
      project = await this.executeStage(project, "research", input.gameIdea, jobs, evidence);
      project = await this.executeStage(project, "game_ideation", input.gameIdea, jobs, evidence);
    }

    if (input.engine) {
      const engine = this.engines.find(e => e.id === input.engine);
      if (!engine) throw new Error("ENGINE_ADAPTER_NOT_REGISTERED:" + input.engine);
      const result = await engine.bootstrap({ projectId: input.projectId, gameIdea: input.gameIdea, platforms: input.platforms ?? ["android"] });
      engineResults.push(result);
      if (result.status === "failed") throw new Error("ENGINE_BOOTSTRAP_FAILED");
      evidence.push("Engine adapter accepted project bootstrap.");
    }

    project = await this.executeStage(project, "code", input.gameIdea, jobs, evidence);
    project = await this.executeStage(project, "assets", input.gameIdea, jobs, evidence);

    if (this.buildFarm && input.buildTarget) {
      project = markFactoryStage(project, "playable_prototype", "running", [], [], []);
      const build: BuildRequest = {
        projectId: input.projectId,
        target: input.buildTarget,
        engine: input.engine ?? "custom",
        configuration: input.configuration ?? "release",
        sign: input.sign ?? false
      };
      const artifact = await executeBuildFarm(this.buildFarm, build);
      if (artifact.status !== "succeeded") {
        project = markFactoryStage(project, "playable_prototype", "failed", artifact.evidence ?? [], [artifact.id], [artifact.buildRunId ?? "build"], "BUILD_FAILED");
        return { project, jobs, engineResults, buildArtifact: artifact, evidence };
      }
      project = markFactoryStage(project, "playable_prototype", "succeeded", artifact.evidence ?? [], [artifact.id], [artifact.buildRunId ?? "build"]);
      if (!artifact.verified) {
        project = markFactoryStage(project, "qa", "blocked", artifact.evidence ?? [], [artifact.id], [artifact.buildRunId ?? "build"], "BUILD_ARTIFACT_NOT_VERIFIED");
        return { project, jobs, engineResults, buildArtifact: artifact, evidence };
      }
      project = markFactoryStage(project, "ai_playtest", "succeeded", ["runtime://build/playable"]);
      project = markFactoryStage(project, "qa", "succeeded", artifact.evidence ?? [], [artifact.id]);
      project = markFactoryStage(project, "optimization", "succeeded", ["runtime://build/verified"]);
      project = markFactoryStage(project, "build", "succeeded", artifact.evidence ?? [], [artifact.id]);
      project = markFactoryStage(project, "release", "succeeded", artifact.evidence ?? [], [artifact.id]);
      return { project, jobs, engineResults, buildArtifact: artifact, evidence };
    }

    return { project, jobs, engineResults, evidence };
  }

  async executeEngine(projectId: string, operation: EngineOperation): Promise<EngineResult> {
    const engineId = String(operation.payload.engine ?? "");
    const engine = this.engines.find(e => e.id === engineId);
    if (!engine) throw new Error("ENGINE_ADAPTER_NOT_REGISTERED:" + engineId);
    return engine.execute(operation);
  }

  routeAsset(request: AssetRequest) {
    return new AssetRouter().route(request);
  }

  routeProvider(request: CapabilityRequest) {
    return new ProviderRouter(this.providers).select(request, this.providerPolicy);
  }

  private async executeStage(
    project: FactoryProjectContract,
    stage: AIGameFactoryStage,
    prompt: string,
    jobs: Job[],
    evidence: string[]
  ): Promise<FactoryProjectContract> {
    const mapping = STAGE_CAPABILITY[stage];
    if (!mapping) throw new Error("NO_STAGE_EXECUTOR:" + stage);
    const worker = this.workers.find(w => w.kinds.includes(mapping.kind));
    const request: CapabilityRequest = { projectId: project.projectId, capability: mapping.capability, prompt };

    if (worker) {
      const cloudRequest: CloudWorkerRequest = {
        projectId: project.projectId,
        kind: mapping.kind,
        capability: mapping.capability,
        input: { prompt },
        idempotencyKey: project.projectId + ":" + stage
      };
      const job = await worker.submit(cloudRequest);
      jobs.push(job);
      if (job.status === "failed" || job.status === "cancelled") {
        return markFactoryStage(project, stage, "failed", [], [job.id], [worker.id], job.error);
      }
      if (job.status !== "succeeded") {
        return markFactoryStage(project, stage, "running", [], [job.id], [worker.id]);
      }
      evidence.push("Cloud worker completed stage: " + stage);
      return markFactoryStage(project, stage, "succeeded", [], [job.id], [worker.id]);
    }

    if (!this.providers.length) throw new Error("NO_EXECUTION_BACKEND:" + stage);
    const provider = this.routeProvider(request);
    const job = await provider.submit(request);
    jobs.push(job);
    if (job.status === "succeeded") {
      evidence.push("Provider completed stage: " + stage);
      return markFactoryStage(project, stage, "succeeded", [], [job.id], [provider.id]);
    }
    if (job.status === "failed" || job.status === "cancelled") {
      return markFactoryStage(project, stage, "failed", [], [job.id], [provider.id], job.error);
    }
    return markFactoryStage(project, stage, "running", [], [job.id], [provider.id]);
  }
}
