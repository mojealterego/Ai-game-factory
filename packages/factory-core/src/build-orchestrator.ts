export type BuildTarget = "android-apk" | "android-aab" | "web" | "windows" | "linux";

export interface BuildRequest {
  projectId: string;
  target: BuildTarget;
  engine: string;
  configuration: "debug" | "release";
  sign: boolean;
}

export interface BuildArtifact {
  id: string;
  target: BuildTarget;
  status: "queued" | "building" | "succeeded" | "failed";
  downloadUri?: string;
  sha256?: string;
  verified: boolean;
}

export interface BuildAdapter {
  id: string;
  targets: BuildTarget[];
  build(request: BuildRequest): Promise<BuildArtifact>;
  verify(artifact: BuildArtifact): Promise<BuildArtifact>;
}

export async function buildAndVerify(adapter: BuildAdapter, request: BuildRequest): Promise<BuildArtifact> {
  const artifact = await adapter.build(request);
  if (artifact.status !== "succeeded") return artifact;
  const verified = await adapter.verify(artifact);
  if (!verified.verified) throw new Error("Build artifact failed verification");
  return verified;
}
