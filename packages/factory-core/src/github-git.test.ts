import {
  buildSnapshot,
  buildSourceSyncPlan,
  releaseTagName,
  validateRepositoryRef,
  type GitArtifactRecord,
  type RepositoryRef
} from "./github-git";

const assert = (condition: boolean, message: string) => {
  if (!condition) throw new Error(message);
};

export function runGitHubGitContractTests(): void {
  const repository: RepositoryRef = {
    owner: "mojealterego",
    name: "Ai-game-factory",
    fullName: "mojealterego/Ai-game-factory",
    defaultBranch: "main"
  };

  assert(validateRepositoryRef(repository).length === 0, "valid repository ref must pass");
  assert(releaseTagName("0.2.0") === "v0.2.0", "release tag must normalize to v-prefixed semver");
  assert(releaseTagName("v1.4.2-beta.1") === "v1.4.2-beta.1", "pre-release tag must be preserved");

  const artifacts: GitArtifactRecord[] = [
    { id: "code-1", kind: "generated_code", path: "games/demo/src/main.ts" },
    { id: "asset-1", kind: "generated_asset", path: "games/demo/assets/player.png" },
    { id: "docs-1", kind: "documentation", path: "games/demo/GDD.md" }
  ];

  const plan = buildSourceSyncPlan(repository, "factory/demo", artifacts, {
    createSnapshot: true,
    createPullRequest: true,
    releaseTag: "v0.2.0"
  });

  assert(plan.generatedCode.length === 1, "code artifacts must be routed to generatedCode");
  assert(plan.generatedAssets.length === 1, "asset artifacts must be routed to generatedAssets");
  assert(plan.documentation.length === 1, "documentation artifacts must be routed to documentation");
  assert(plan.createPullRequest, "PR creation must be preserved");

  const snapshot = buildSnapshot("demo", repository, "factory/demo", "abc123", artifacts, "2026-09-26T00:00:00.000Z");
  assert(snapshot.manifestPath.includes(".factory/snapshots/demo/abc123.json"), "snapshot manifest path must be deterministic");
  assert(snapshot.artifactIds.length === 3, "snapshot must reference every artifact");
}

runGitHubGitContractTests();
