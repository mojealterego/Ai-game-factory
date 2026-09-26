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
  getArtifacts?(runId: number): Promise<Array<{ name: string; archiveDownloadUrl: string; expired: boolean }>>;
}

export class GitHubActionsFetchTransport implements GitHubActionsTransport {
  constructor(private readonly repository: string, private readonly token: string, private readonly apiBase = "https://api.github.com") {
    if (!token.trim()) throw new Error("GITHUB_ACTIONS_TOKEN_REQUIRED");
  }

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const response = await fetch(this.apiBase + path, {
      ...init,
      headers: {
        accept: "application/vnd.github+json",
        "content-type": "application/json",
        "x-github-api-version": "2026-03-10",
        authorization: "Bearer " + this.token,
        ...(init.headers ?? {})
      }
    });
    const text = await response.text();
    if (!response.ok) throw new Error("GITHUB_ACTIONS_HTTP_" + response.status + ":" + text.slice(0, 500));
    return (text ? JSON.parse(text) : undefined) as T;
  }

  async dispatchWorkflow(input: { workflow: string; ref: string; inputs: Record<string, string> }) {
    const response = await this.request<{ workflow_run_id?: number; run_url?: string; html_url?: string }>(
      "/repos/" + this.repository + "/actions/workflows/" + encodeURIComponent(input.workflow) + "/dispatches",
      { method: "POST", body: JSON.stringify({ ref: input.ref, inputs: input.inputs }) }
    );
    return { runId: response.workflow_run_id, runUrl: response.html_url ?? response.run_url };
  }

  async getWorkflowRun(runId: number) {
    const response = await this.request<{ status: string; conclusion: string | null; html_url?: string }>(
      "/repos/" + this.repository + "/actions/runs/" + runId
    );
    return { status: response.status, conclusion: response.conclusion, htmlUrl: response.html_url };
  }

  async getArtifacts(runId: number) {
    const response = await this.request<{ artifacts: Array<{ name: string; archive_download_url: string; expired: boolean }> }>(
      "/repos/" + this.repository + "/actions/runs/" + runId + "/artifacts"
    );
    return response.artifacts.map(a => ({ name: a.name, archiveDownloadUrl: a.archive_download_url, expired: a.expired }));
  }
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
