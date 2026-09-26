import type { BuildRequest } from "./build-orchestrator";

export const BUILD_CENTER_STAGES = [
  "project",
  "validate",
  "generate",
  "compile",
  "test",
  "package",
  "sign",
  "artifact"
] as const;

export type BuildCenterStage = typeof BUILD_CENTER_STAGES[number];

export type BuildCenterTarget =
  | "android-apk"
  | "android-aab"
  | "web"
  | "windows"
  | "linux"
  | (string & {});

export interface BuildArtifactRecord {
  id: string;
  projectId: string;
  target: BuildCenterTarget;
  format: "apk" | "aab" | "web" | "windows" | "linux" | "archive" | "custom";
  uri: string;
  sha256: string;
  sizeBytes: number;
  mimeType: string;
  signed: boolean;
  verified: boolean;
  evidence: string[];
  createdAt?: string;
  buildRunId?: string;
  version?: string;
}

export interface BuildStageResult {
  evidence: string[];
  metrics?: Record<string, number>;
  metadata?: Record<string, unknown>;
  signed?: boolean;
}

export interface BuildCenterRequest extends BuildRequest {
  buildRunId?: string;
  version?: string;
  expectedArtifact?: {
    format: BuildArtifactRecord["format"];
    mimeType?: string;
  };
}

export interface BuildCenterStages {
  project: () => Promise<BuildStageResult>;
  validate: () => Promise<BuildStageResult>;
  generate: () => Promise<BuildStageResult>;
  compile: () => Promise<BuildStageResult>;
  test: () => Promise<BuildStageResult>;
  package: () => Promise<BuildStageResult>;
  sign: () => Promise<BuildStageResult>;
  artifact: () => Promise<BuildArtifactRecord>;
}

export interface BuildCenterContext {
  request: BuildCenterRequest;
  stages: BuildCenterStages;
}

export interface BuildCenterResult {
  stage: BuildCenterStage;
  status: "succeeded" | "failed";
  completedStages: BuildCenterStage[];
  evidence: string[];
  artifact?: BuildArtifactRecord;
  error?: string;
}

export function isRealBuildArtifact(
  artifact: Partial<BuildArtifactRecord> | undefined
): artifact is BuildArtifactRecord {
  return Boolean(
    artifact &&
    artifact.id &&
    artifact.projectId &&
    artifact.target &&
    artifact.uri &&
    artifact.uri.trim().length > 0 &&
    /^[a-f0-9]{64}$/i.test(artifact.sha256 ?? "") &&
    Number.isFinite(artifact.sizeBytes) &&
    artifact.sizeBytes > 0 &&
    artifact.mimeType &&
    artifact.evidence?.length &&
    artifact.verified === true
  );
}

function artifactFormatForTarget(target: BuildCenterTarget): BuildArtifactRecord["format"] {
  if (target === "android-apk") return "apk";
  if (target === "android-aab") return "aab";
  if (target === "web") return "web";
  if (target === "windows") return "windows";
  if (target === "linux") return "linux";
  return "custom";
}

export async function runBuildCenter(context: BuildCenterContext): Promise<BuildCenterResult> {
  const completedStages: BuildCenterStage[] = [];
  const evidence: string[] = [];
  let current: BuildCenterStage = "project";

  try {
    for (const stage of BUILD_CENTER_STAGES) {
      current = stage;

      if (stage === "artifact") {
        const artifact = await context.stages.artifact();
        const normalized = {
          ...artifact,
          projectId: artifact.projectId || context.request.projectId,
          target: artifact.target || context.request.target,
          format: artifact.format || artifactFormatForTarget(context.request.target),
          buildRunId: artifact.buildRunId || context.request.buildRunId,
          version: artifact.version || context.request.version
        };

        if (!isRealBuildArtifact(normalized)) {
          throw new Error(
            "Build Center refused completion: final output is not a verified real artifact (URI, SHA-256, positive size and evidence are required)."
          );
        }

        if (context.request.sign && !normalized.signed) {
          throw new Error("Build Center refused completion: signing was required but the artifact is not signed.");
        }

        evidence.push(...normalized.evidence);
        completedStages.push(stage);
        return {
          stage,
          status: "succeeded",
          completedStages,
          evidence,
          artifact: normalized
        };
      }

      const result = await context.stages[stage]();
      if (!result.evidence?.length) {
        throw new Error(`Build Center stage "${stage}" completed without evidence.`);
      }

      evidence.push(...result.evidence);
      completedStages.push(stage);

      if (stage === "sign" && context.request.sign && result.signed !== true) {
        throw new Error("Build Center refused completion: signing stage returned no verified signing evidence.");
      }
    }

    throw new Error("Build Center terminated without producing an artifact.");
  } catch (error) {
    return {
      stage: current,
      status: "failed",
      completedStages,
      evidence,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

export interface BuildCenterAdapter {
  id: string;
  targets: string[];
  execute(context: BuildCenterContext): Promise<BuildCenterResult>;
}

export function createBuildCenterAdapter(
  id: string,
  targets: string[],
  execute: BuildCenterAdapter["execute"]
): BuildCenterAdapter {
  return { id, targets, execute };
}
