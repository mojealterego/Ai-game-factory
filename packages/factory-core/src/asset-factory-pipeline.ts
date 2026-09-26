import {
  ASSET_FACTORY_PIPELINE,
  type AssetArtifact,
  type AssetFactoryJob,
  type AssetStage,
  type AssetStageRecord,
  type AssetValidationResult,
} from "./assets";

export interface AssetStageExecutorContext {
  job: AssetFactoryJob;
  stage: AssetStage;
  inputs: AssetArtifact[];
}

export interface AssetStageExecutorResult {
  artifacts: AssetArtifact[];
  evidence?: string[];
  validation?: AssetValidationResult;
}

export type AssetStageExecutor = (
  context: AssetStageExecutorContext,
) => Promise<AssetStageExecutorResult>;

export interface AssetFactoryExecutionOptions {
  executors: Partial<Record<AssetStage, AssetStageExecutor>>;
  now?: () => string;
  stopOnFailure?: boolean;
}

/**
 * Executes the canonical 10-stage Asset Factory pipeline.
 * Every stage records its inputs, outputs and evidence so a build can be
 * reproduced/audited instead of being treated as an opaque generation call.
 */
export async function executeAssetFactory(
  initialJob: AssetFactoryJob,
  options: AssetFactoryExecutionOptions,
): Promise<AssetFactoryJob> {
  const now = options.now ?? (() => new Date().toISOString());
  const stopOnFailure = options.stopOnFailure ?? true;
  const job: AssetFactoryJob = structuredClone(initialJob);
  job.status = "running";
  job.updatedAt = now();

  for (const stage of ASSET_FACTORY_PIPELINE) {
    const record = job.stages.find(item => item.stage === stage) as AssetStageRecord;
    job.currentStage = stage;

    const executor = options.executors[stage];
    if (!executor) {
      record.status = "skipped";
      record.completedAt = now();
      job.updatedAt = now();
      continue;
    }

    const previous = job.stages
      .filter(item => item.stage !== stage)
      .flatMap(item => item.outputArtifactIds);
    const inputs = previous
      .map(id => ({ id } as AssetArtifact))
      .filter(Boolean);

    record.status = "running";
    record.startedAt = now();
    record.inputArtifactIds = inputs.map(item => item.id);

    try {
      const result = await executor({ job, stage, inputs });
      record.outputArtifactIds = result.artifacts.map(item => item.id);
      record.evidence = result.evidence ?? [];
      record.status = result.validation && !result.validation.passed ? "failed" : "succeeded";
      record.completedAt = now();

      if (stage === "selection" && result.artifacts[0]) {
        job.selectedArtifactId = result.artifacts[0].id;
      }
      if (stage === "engine_asset" && result.artifacts[0]) {
        job.engineAssetId = result.artifacts[0].id;
      }

      if (record.status === "failed" && stopOnFailure) {
        job.status = "failed";
        job.updatedAt = now();
        return job;
      }
    } catch (error) {
      record.status = "failed";
      record.error = error instanceof Error ? error.message : String(error);
      record.completedAt = now();
      job.status = "failed";
      job.updatedAt = now();
      if (stopOnFailure) return job;
    }

    job.updatedAt = now();
  }

  job.status = job.stages.some(stage => stage.status === "failed") ? "failed" : "succeeded";
  job.updatedAt = now();
  return job;
}
