import {
  BUILD_CENTER_STAGES,
  isRealBuildArtifact,
  runBuildCenter,
  type BuildCenterContext,
  type BuildArtifactRecord
} from "./build-center";

const assert = (condition: boolean, message: string) => {
  if (!condition) throw new Error(message);
};

export async function runBuildCenterContractTests(): Promise<void> {
  assert(BUILD_CENTER_STAGES.join(" → ") === "project → validate → generate → compile → test → package → sign → artifact", "Build Center stages must be ordered");

  const valid: BuildArtifactRecord = {
    id: "artifact-1",
    projectId: "demo",
    target: "android-apk",
    format: "apk",
    uri: "https://example.invalid/artifacts/app-release.apk",
    sha256: "a".repeat(64),
    sizeBytes: 1024,
    mimeType: "application/vnd.android.package-archive",
    signed: true,
    verified: true,
    evidence: ["ci://run/1/job/2", "sha256:a".repeat(64)]
  };
  assert(isRealBuildArtifact(valid), "artifact with URI, hash, size and evidence must be real");

  const fake = { ...valid, uri: undefined, verified: false };
  assert(!isRealBuildArtifact(fake), "status-only or URI-less result must not be a real artifact");

  const context: BuildCenterContext = {
    request: {
      projectId: "demo",
      target: "android-apk",
      engine: "custom",
      configuration: "release",
      sign: true
    },
    stages: {
      project: async () => ({ evidence: ["project://demo"] }),
      validate: async () => ({ evidence: ["validation://passed"] }),
      generate: async () => ({ evidence: ["generation://1"] }),
      compile: async () => ({ evidence: ["compile://1"] }),
      test: async () => ({ evidence: ["test://passed"] }),
      package: async () => ({ evidence: ["package://1"] }),
      sign: async () => ({ evidence: ["signature://verified"], signed: true }),
      artifact: async () => valid
    }
  };

  const result = await runBuildCenter(context);
  assert(result.stage === "artifact", "successful Build Center must finish at artifact stage");
  assert(result.artifact?.verified === true, "final artifact must be verified");
  assert(result.artifact?.sha256.length === 64, "final artifact must contain SHA-256");
}

runBuildCenterContractTests();
