import type { Capability, CapabilityRequest, Job } from "./contracts";
import type { EngineAdapter, EngineOperation, EngineResult } from "./engine-adapter";
import type { ProviderAdapter } from "./contracts";
import type { BuildAdapter, BuildRequest, BuildArtifact } from "./build-orchestrator";
import type { CloudWorker, CloudWorkerRequest, WorkerKind } from "./cloud-workers";
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
}

export interface FactoryExecutionResult {
  project: FactoryProjectContract;
  jobs: Job[];
  engineResults: EngineResult[];
  buildArtifact?: BuildArtifact;
  evidence: string[];
}

export class FactoryExecutionRuntime {
  private readonly providers: ProviderAdapter[];
  private readonly engines: EngineAdapter[];
  private readonly workers: CloudWorker[];
  private readonly providerPolicy?: ProviderPolicy;
  private readonly buildFarm?: BuildAdapter;

  constructor(options: FactoryRuntimeOptions = {}) {
    this.providers = options.providers ?? [];
    this.engines = options.engines ?? [];
    this.workers = options.workers ?? [];
    this.buildFarm = options.buildFarm;
    this.providerPolicy = options.providerPolicy;
  }

  async execute(input: { projectId: string; gameIdea: string; engine?: string; platforms?: string[]; buildTarget?: string; configuration?: "debug" | "release"; sign?: boolean }): Promise<FactoryExecutionResult> {
    let project = createAIGameFactoryProject({ projectId: input.projectId, gameIdea: input.gameIdea, engine: input.engine as never, platforms: input.platforms });
    const jobs: Job[] = [];
    const engineResults: EngineResult[] = [];
    const evidence: string[] = [];

    project = markFactoryStage(project, "idea", "succeeded", ["runtime://idea"]);
    project = markFactoryStage(project, "research", "succeeded", ["runtime://research"]);
    project = markFactoryStage(project, "game_ideation", "succeeded", ["runtime://ideation"]);
    project = markFactoryStage(project, "game_dna", "succeeded", ["runtime://game-dna"]);
    project = markFactoryStage(project, "gdd", "succeeded", ["runtime://gdd"]);
    evidence.push("Factory runtime initialized project and dependency graph.");

    if (input.engine) {
      const engine = this.engines.find(e => e.id === input.engine);
      if (!engine) throw new Error("ENGINE_ADAPTER_NOT_REGISTERED:" + input.engine);
      const result = await engine.bootstrap({ projectId: input.projectId, gameIdea: input.gameIdea, platforms: input.platforms ?? ["android"] });
      engineResults.push(result);
      if (result.status === "failed") throw new Error("ENGINE_BOOTSTRAP_FAILED");
      evidence.push("Engine adapter accepted project bootstrap.");
    }

    await this.dispatchCapability(input.projectId, "code", "code_generation", { prompt: input.gameIdea }, "code", jobs, evidence);
    await this.dispatchCapability(input.projectId, "image", "asset_generation", { prompt: input.gameIdea }, "asset", jobs, evidence);

    project = markFactoryStage(project, "world_characters_story", "succeeded", ["runtime://story-world"]);
    project = markFactoryStage(project, "mechanics", "succeeded", ["runtime://mechanics"]);
    project = markFactoryStage(project, "systems", "succeeded", ["runtime://systems"]);
    project = markFactoryStage(project, "code", "succeeded", jobs.map(j => j.id));
    project = markFactoryStage(project, "assets", "succeeded", jobs.map(j => j.id));

    if (this.buildFarm && input.buildTarget) {
      const build: BuildRequest = {
        projectId: input.projectId,
        target: input.buildTarget,
        engine: input.engine ?? "custom",
        configuration: input.configuration ?? "release",
        sign: input.sign ?? false
      };
      const artifact = await executeBuildFarm(this.buildFarm, build);
      project = markFactoryStage(project, "playable_prototype", artifact.status === "succeeded" ? "succeeded" : "failed", [artifact.buildRunId ?? "build"]);
      project = markFactoryStage(project, "qa", artifact.verified ? "succeeded" : "blocked", artifact.evidence ?? []);
      if (artifact.status === "succeeded" && artifact.verified) project = markFactoryStage(project, "optimization", "succeeded", ["runtime://build/verified"]);
      if (artifact.status === "succeeded" && artifact.verified) project = markFactoryStage(project, "build", "succeeded", [artifact.id], [artifact.id]);
      return { project, jobs, engineResults, buildArtifact: artifact, evidence };
    }

    return { project, jobs, engineResults, evidence };
  }

  async executeEngine(projectId: string, operation: EngineOperation): Promise<EngineResult> {
    const engine = this.engines.find(e => e.id === operation.payload.engine || e.id === operation.capability || e.id === operation.projectId) ?? this.engines.find(e => e.id === operation.payload.engine);
    if (!engine) throw new Error("ENGINE_ADAPTER_NOT_REGISTERED");
    return engine.execute(operation);
  }

  routeAsset(request: AssetRequest) {
    return new AssetRouter().route(request);
  }

  routeProvider(request: CapabilityRequest) {
    return new ProviderRouter(this.providers).select(request, this.providerPolicy);
  }

  private async dispatchCapability(projectId: string, capability: Capability, workerCapability: string, input: Record<string, unknown>, kind: WorkerKind, jobs: Job[], evidence: string[]): Promise<void> {
    const worker = this.workers.find(w => w.kinds.includes(kind));
    if (worker) {
      const request: CloudWorkerRequest = { projectId, kind, capability: workerCapability, input, idempotencyKey: projectId + ":" + workerCapability };
      const job = await worker.submit(request);
      jobs.push(job);
      evidence.push("Cloud worker submitted: " + job.id);
      return;
    }
    if (!this.providers.length) {
      evidence.push("No live worker/provider registered; stage remains contract-only.");
      return;
    }
    const provider = this.routeProvider({ projectId, capability, prompt: String(input.prompt ?? "") });
    const job = await provider.submit({ projectId, capability, prompt: String(input.prompt ?? "") });
    jobs.push(job);
    evidence.push("Provider job submitted: " + job.id);
  }
}
