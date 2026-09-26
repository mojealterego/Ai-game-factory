export type GitArtifactKind = "generated_code" | "generated_asset" | "documentation" | "snapshot";
export type GitOperation =
  | "repository_read" | "branch_create" | "branch_sync" | "commit" | "pull_request"
  | "issue" | "snapshot" | "release_tag" | "source_sync" | "artifact_sync";

export interface RepositoryRef {
  owner: string;
  name: string;
  fullName: string;
  defaultBranch: string;
}

export interface GitBranch {
  name: string;
  sha: string;
  protected?: boolean;
  aheadBy?: number;
  behindBy?: number;
}

export interface GitCommitRecord {
  sha: string;
  message: string;
  branch: string;
  parentShas: string[];
  changedPaths: string[];
  createdAt: string;
  generatedBy?: string;
}

export interface PullRequestRecord {
  number: number;
  title: string;
  body?: string;
  head: string;
  base: string;
  state: "open" | "closed" | "merged";
  draft: boolean;
  headSha?: string;
  baseSha?: string;
}

export interface IssueRecord {
  number: number;
  title: string;
  body?: string;
  state: "open" | "closed";
  labels: string[];
}

export interface GitArtifactRecord {
  id: string;
  kind: GitArtifactKind;
  path: string;
  sha256?: string;
  sourceJobId?: string;
  generatedBy?: string;
  metadata?: Record<string, unknown>;
}

export interface ProjectSnapshot {
  id: string;
  projectId: string;
  repository: RepositoryRef;
  branch: string;
  commitSha: string;
  createdAt: string;
  artifactIds: string[];
  manifestPath: string;
  manifestSha256?: string;
  description?: string;
}

export interface ReleaseTag {
  name: string;
  commitSha: string;
  immutable: boolean;
  createdAt: string;
  releaseNotesPath?: string;
}

export interface SourceSyncPlan {
  repository: RepositoryRef;
  branch: string;
  generatedCode: GitArtifactRecord[];
  generatedAssets: GitArtifactRecord[];
  documentation: GitArtifactRecord[];
  commitMessage: string;
  createSnapshot: boolean;
  createPullRequest: boolean;
  releaseTag?: string;
}

export interface GitRepositoryAdapter {
  getRepository(fullName: string): Promise<RepositoryRef>;
  listBranches(fullName: string): Promise<GitBranch[]>;
  createBranch(fullName: string, branch: string, fromRef: string): Promise<GitBranch>;
  commit(fullName: string, branch: string, message: string, paths: string[]): Promise<GitCommitRecord>;
  createPullRequest(fullName: string, input: {
    title: string;
    body?: string;
    head: string;
    base: string;
    draft?: boolean;
  }): Promise<PullRequestRecord>;
  createIssue(fullName: string, input: {
    title: string;
    body?: string;
    labels?: string[];
  }): Promise<IssueRecord>;
  compare(fullName: string, base: string, head: string): Promise<{
    aheadBy: number;
    behindBy: number;
    changedFiles: string[];
  }>;
  createTag(fullName: string, tag: string, commitSha: string): Promise<ReleaseTag>;
  writeSnapshot(fullName: string, snapshot: ProjectSnapshot): Promise<void>;
}

export function validateRepositoryRef(repository: RepositoryRef): string[] {
  const errors: string[] = [];
  if (!repository.owner) errors.push("repository.owner is required");
  if (!repository.name) errors.push("repository.name is required");
  if (!repository.fullName) errors.push("repository.fullName is required");
  if (!repository.defaultBranch) errors.push("repository.defaultBranch is required");
  if (repository.fullName !== `${repository.owner}/${repository.name}`) {
    errors.push("repository.fullName must equal owner/name");
  }
  return errors;
}

export function buildSnapshot(
  projectId: string,
  repository: RepositoryRef,
  branch: string,
  commitSha: string,
  artifacts: GitArtifactRecord[],
  createdAt = new Date().toISOString()
): ProjectSnapshot {
  return {
    id: `${projectId}:${commitSha}`,
    projectId,
    repository,
    branch,
    commitSha,
    createdAt,
    artifactIds: artifacts.map((artifact) => artifact.id),
    manifestPath: `.factory/snapshots/${projectId}/${commitSha}.json`
  };
}

export function buildSourceSyncPlan(
  repository: RepositoryRef,
  branch: string,
  artifacts: GitArtifactRecord[],
  options: {
    commitMessage?: string;
    createSnapshot?: boolean;
    createPullRequest?: boolean;
    releaseTag?: string;
  } = {}
): SourceSyncPlan {
  return {
    repository,
    branch,
    generatedCode: artifacts.filter((a) => a.kind === "generated_code"),
    generatedAssets: artifacts.filter((a) => a.kind === "generated_asset"),
    documentation: artifacts.filter((a) => a.kind === "documentation"),
    commitMessage: options.commitMessage ?? "chore(factory): sync generated project artifacts",
    createSnapshot: options.createSnapshot ?? true,
    createPullRequest: options.createPullRequest ?? false,
    releaseTag: options.releaseTag
  };
}

export function releaseTagName(version: string): string {
  const normalized = version.trim().replace(/^v/i, "");
  if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(normalized)) {
    throw new Error("version must use semver-like MAJOR.MINOR.PATCH format");
  }
  return `v${normalized}`;
}

export class GitHubGitService {
  constructor(private readonly adapter: GitRepositoryAdapter) {}

  async syncProject(
    plan: SourceSyncPlan,
    artifacts: GitArtifactRecord[],
    projectId: string,
    commitSha: string
  ): Promise<ProjectSnapshot | undefined> {
    if (plan.createSnapshot) {
      const snapshot = buildSnapshot(projectId, plan.repository, plan.branch, commitSha, artifacts);
      await this.adapter.writeSnapshot(plan.repository.fullName, snapshot);
      return snapshot;
    }
    return undefined;
  }
}
