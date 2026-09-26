import {
  THREE_D_ASSET_PIPELINE,
  type ThreeDAssetJob,
  type ThreeDStage,
  type ThreeDStageRecord,
} from "./assets";

export interface ThreeDStageExecutorContext {
  job: ThreeDAssetJob;
  stage: ThreeDStage;
}

export interface ThreeDStageExecutorResult {
  outputArtifactIds: string[];
  metrics?: Record<string, number | string | boolean>;
  evidence?: string[];
}

export type ThreeDStageExecutor = (
  context: ThreeDStageExecutorContext,
) => Promise<ThreeDStageExecutorResult>;

export interface ThreeDPipelineOptions {
  executors: Partial<Record<ThreeDStage, ThreeDStageExecutor>>;
  now?: () => string;
  stopOnFailure?: boolean;
}

export async function executeThreeDPipeline(
  initialJob: ThreeDAssetJob,
  options: ThreeDPipelineOptions,
): Promise<ThreeDAssetJob> {
  const now = options.now ?? (() => new Date().toISOString());
  const job = structuredClone(initialJob);
  job.status = "running";
  job.updatedAt = now();

  for (const stage of THREE_D_ASSET_PIPELINE) {
    job.currentStage = stage;
    const record = job.stages.find(item => item.stage === stage) as ThreeDStageRecord;
    const executor = options.executors[stage];

    if (!executor) {
      record.status = "skipped";
      job.updatedAt = now();
      continue;
    }

    record.status = "running";
    try {
      const result = await executor({ job, stage });
      record.outputArtifactIds = result.outputArtifactIds;
      record.metrics = result.metrics;
      record.evidence = result.evidence ?? [];
      record.status = "succeeded";
    } catch (error) {
      record.status = "failed";
      record.error = error instanceof Error ? error.message : String(error);
      job.status = "failed";
      job.updatedAt = now();
      if (options.stopOnFailure ?? true) return job;
    }
    job.updatedAt = now();
  }

  job.status = job.stages.some(stage => stage.status === "failed")
    ? "failed"
    : "succeeded";
  return job;
}
