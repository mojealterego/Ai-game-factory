import {
  HUGGINGFACE_HUB_PIPELINE,
  executeHuggingFaceImport,
  type HuggingFaceHubAdapter,
  type HuggingFaceImportRequest
} from "./huggingface-hub";

const assert = (condition: boolean, message: string) => {
  if (!condition) throw new Error(message);
};

const adapter: HuggingFaceHubAdapter = {
  async search() {
    return [{ repoId: "demo/model", tags: [], url: "https://huggingface.co/demo/model" }];
  },
  async getModelCard() {
    return { repoId: "demo/model", revision: "r1", license: "apache-2.0", tags: [] };
  },
  async listFiles() {
    return [{ path: "model.Q4_K_M.gguf", kind: "gguf", quantization: "Q4_K_M", downloadUrl: "https://example.invalid/model.gguf", sha256: "sha256:demo" }];
  },
  async checkCompatibility() {
    return { compatible: true, target: "android", reasons: [], requirements: { android: true, cloud: true } };
  },
  async getLicense() { return "apache-2.0"; },
  async detectQuantization() { return { detected: true, format: "gguf", quantization: "Q4_K_M", source: "filename" }; },
  async download() { return { path: "/models/demo.gguf", sha256: "sha256:demo" }; },
  async verify() { return { valid: true, sha256: "sha256:demo" }; }
};

export async function runHuggingFaceHubContractTests(): Promise<void> {
  assert(HUGGINGFACE_HUB_PIPELINE.join("→") === "search→model_card→files→compatibility→license→quantization→download→verify→import→register→activate", "pipeline order must be exact");

  const request: HuggingFaceImportRequest = {
    projectId: "test",
    repoId: "demo/model",
    target: "android",
    kind: "chat",
    activate: true
  };

  let registered = false;
  let activated = false;
  const result = await executeHuggingFaceImport(
    adapter,
    request,
    () => { registered = true; },
    () => { activated = true; }
  );

  assert(result.status === "succeeded", "valid Hugging Face import must succeed");
  assert(registered, "model must be registered");
  assert(activated, "requested activation must execute");
  assert(result.model?.lifecycle === "active", "activated model must be active");
  assert(result.stages.length === 11, "all 11 stages must be recorded");
}

void runHuggingFaceHubContractTests();
