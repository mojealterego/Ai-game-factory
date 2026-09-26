import type { BuildArtifact, BuildRequest, BuildTarget } from "./build-orchestrator";
import { buildAndVerify, type BuildAdapter } from "./build-orchestrator";

export interface BuildFarmSubmission {
  buildId: string;
  projectId: string;
  target: BuildTarget;
  status: "queued" | "running" | "succeeded" | "failed";
  workflowUrl?: string;
}

export interface BuildFarmAdapter extends BuildAdapter {
  submit(request: BuildRequest): Promise<BuildFarmSubmission>;
  wait(buildId: string, timeoutMs?: number): Promise<BuildArtifact>;
}

export interface GitHubActionsTransport {
  dispatchWorkflow(input: { workflow: string; ref: string; inputs: Record<string, string> }): Promise<{ runUrl?: string; runId?: number }>;
  getWorkflowRun(runId: number): Promise<{ status: string; conclusion: string | null; htmlUrl?: string }>;
}

export class GitHubActionsBuildFarm implements BuildFarmAdapter {
  readonly id = "github-actions";
  readonly targets: BuildTarget[] = ["android-apk", "android-aab", "web", "windows", "linux", "macos", "ios"];

  constructor(private readonly transport: GitHubActionsTransport, private readonly workflow = "factory-build.yml", private readonly ref = "main") {}

  async submit(request: BuildRequest): Promise<BuildFarmSubmission> {
    const dispatched = await this.transport.dispatchWorkflow({
      workflow: this.workflow,
      ref: this.ref,
      inputs: { projectId: request.projectId, engine: request.engine, target: request.target, configuration: request.configuration, sign: String(request.sign) }
    });
    return { buildId: String(dispatched.runId ?? crypto.randomUUID()), projectId: request.projectId, target: request.target, status: "queued", workflowUrl: dispatched.runUrl };
  }

  async build(request: BuildRequest): Promise<BuildArtifact> {
    const submission = await this.submit(request);
    return this.wait(submission.buildId);
  }

  async wait(buildId: string, timeoutMs = 30 * 60 * 1000): Promise<BuildArtifact> {
    const runId = Number(buildId);
    if (!Number.isFinite(runId)) throw new Error("GITHUB_ACTION_RUN_ID_REQUIRED_FOR_WAIT");
    const started = Date.now();
    while (Date.now() - started < timeoutMs) {
      const run = await this.transport.getWorkflowRun(runId);
      if (run.status === "completed") {
        if (run.conclusion !== "success") return { id: buildId, target: "custom", status: "failed", verified: false };
        return { id: buildId, target: "custom", status: "succeeded", verified: false, buildRunId: buildId };
      }
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
    return { id: buildId, target: "custom", status: "failed", verified: false };
  }

  verify(artifact: BuildArtifact): Promise<BuildArtifact> {
    if (artifact.status !== "succeeded") return Promise.resolve(artifact);
    if (!artifact.downloadUri || !artifact.sha256 || !artifact.sizeBytes || artifact.sizeBytes <= 0) {
      throw new Error("BUILD_ARTIFACT_METADATA_INCOMPLETE");
    }
    return Promise.resolve({ ...artifact, verified: true });
  }
}

export async function executeBuildFarm(adapter: BuildFarmAdapter, request: BuildRequest): Promise<BuildArtifact> {
  return buildAndVerify(adapter, request);
}
