import {
  AI_MODEL_PROVIDER_CATALOG,
  canRunModel,
  nextLifecycleStatus,
  selectModelRoute,
  validateGGUFModel,
  type GGUFModelSpec
} from "./model-factory";

const assert = (condition: boolean, message: string) => {
  if (!condition) throw new Error(message);
};

export function runModelFactoryContractTests(): void {
  const model: GGUFModelSpec = {
    id: "local:qwen-chat",
    name: "Qwen Chat GGUF",
    kind: "chat",
    runtime: "local",
    providerId: "local:gguf",
    capabilities: ["chat"],
    quantization: "Q4_K_M",
    format: "gguf",
    resources: { sizeLabel: "8 GB", contextLength: 32768, ramGb: 10, vramGb: 8 },
    provenance: {
      source: "https://huggingface.co/",
      sourceType: "huggingface",
      version: "1.0",
      checksum: "sha256:example",
      checksumAlgorithm: "sha256",
      license: "unknown"
    },
    compatibility: { android: true, cloud: true },
    source: "https://huggingface.co/",
    checksum: "sha256:example",
    lifecycle: "installed"
  };

  assert(validateGGUFModel(model).length === 0, "valid GGUF must pass validation");
  assert(canRunModel(model, "android"), "Android-compatible model must be runnable on Android");
  assert(nextLifecycleStatus("activate", "installed") === "active", "install -> active transition must work");
  assert(AI_MODEL_PROVIDER_CATALOG.some((p) => p.id === "openai"), "OpenAI must be in provider catalog");
  assert(AI_MODEL_PROVIDER_CATALOG.some((p) => p.id === "huggingface"), "Hugging Face must be in provider catalog");

  const route = selectModelRoute({
    projectId: "test",
    capability: "code",
    preferredProviders: ["deepseek"]
  });
  assert(route.providerId === "deepseek", "preferred provider must win compatible routing");
}

runModelFactoryContractTests();
