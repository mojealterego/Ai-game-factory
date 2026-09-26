export type ModelRuntime = "cloud" | "local" | "hybrid";
export type ModelKind = "chat" | "code" | "image" | "video" | "embedding" | "speech";
export type ModelLifecycleAction = "download" | "install" | "activate" | "deactivate" | "delete";
export type ModelLifecycleStatus =
  | "discovered"
  | "queued"
  | "downloading"
  | "downloaded"
  | "installing"
  | "installed"
  | "active"
  | "inactive"
  | "deleting"
  | "deleted"
  | "failed";

export type AIModelProviderId =
  | "openai"
  | "gemini"
  | "claude"
  | "grok"
  | "mistral"
  | "cohere"
  | "groq"
  | "deepseek"
  | "qwen"
  | "openrouter"
  | "together"
  | "fireworks"
  | "perplexity"
  | "azure-openai"
  | "aws-bedrock"
  | "vertex-ai"
  | "custom-openai-compatible"
  | "huggingface"
  | "replicate"
  | "fal"
  | "stability"
  | "image-provider"
  | "video-provider"
  | "music-provider"
  | "voice-provider";

export type ModelCapability =
  | "chat"
  | "code"
  | "image_generation"
  | "video_generation"
  | "embedding"
  | "speech"
  | "voice_generation"
  | "music_generation"
  | "multimodal";

export interface ModelCompatibility {
  android: boolean;
  cloud: boolean;
  cpu?: boolean;
  gpu?: boolean;
  minRamGb?: number;
  minVramGb?: number;
  architectures?: string[];
  runtimes?: string[];
  notes?: string[];
}

export interface ModelResourceProfile {
  sizeBytes?: number;
  sizeLabel?: string;
  contextLength?: number;
  ramGb?: number;
  vramGb?: number;
}

export interface ModelProvenance {
  source: string;
  sourceType: "provider" | "huggingface" | "custom" | "local";
  version?: string;
  revision?: string;
  checksum?: string;
  checksumAlgorithm?: "sha256" | "sha512";
  license?: string;
  licenseUrl?: string;
  modelCardUrl?: string;
}

export interface AIModelSpec {
  id: string;
  name: string;
  kind: ModelKind;
  runtime: ModelRuntime;
  providerId: AIModelProviderId | `local:${string}`;
  capabilities: ModelCapability[];
  quantization?: string;
  format?: "gguf" | "safetensors" | "onnx" | "api" | "other";
  resources: ModelResourceProfile;
  provenance: ModelProvenance;
  compatibility: ModelCompatibility;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface GGUFModelSpec extends AIModelSpec {
  runtime: "local" | "hybrid";
  format: "gguf";
  quantization: string;
  source: string;
  capabilities: ModelCapability[];
  kind: ModelKind;
  lifecycle: ModelLifecycleStatus;
  installedPath?: string;
  downloadUrl?: string;
  checksum: string;
}

export interface ModelLifecycleJob {
  id: string;
  modelId: string;
  action: ModelLifecycleAction;
  target: "android" | "cloud";
  status: ModelLifecycleStatus;
  progress: number;
  requestedAt: string;
  updatedAt: string;
  error?: string;
  evidence?: {
    uri?: string;
    checksumVerified?: boolean;
    installedPath?: string;
    runtime?: string;
  };
}

export interface ModelProviderConfig {
  id: AIModelProviderId;
  displayName: string;
  runtime: "cloud" | "hybrid";
  capabilities: ModelCapability[];
  baseUrl?: string;
  openAICompatible?: boolean;
  secretRef?: string;
  enabled: boolean;
  metadata?: Record<string, unknown>;
}

export interface ModelRouteRequest {
  projectId: string;
  capability: ModelCapability;
  kind?: ModelKind;
  runtime?: ModelRuntime;
  preferredProviders?: Array<AIModelProviderId | `local:${string}`>;
  deniedProviders?: Array<AIModelProviderId | `local:${string}`>;
  requiredCompatibility?: Partial<ModelCompatibility>;
  maxLatencyMs?: number;
  maxCostCredits?: number;
}

export interface ModelRoute {
  providerId: AIModelProviderId | `local:${string}`;
  modelId?: string;
  reason: "preferred" | "compatible" | "fallback";
}

export const AI_MODEL_PROVIDER_CATALOG: readonly ModelProviderConfig[] = [
  { id: "openai", displayName: "OpenAI", runtime: "cloud", capabilities: ["chat","code","image_generation","video_generation","embedding","speech","multimodal"], enabled: true },
  { id: "gemini", displayName: "Google Gemini", runtime: "cloud", capabilities: ["chat","code","image_generation","video_generation","embedding","multimodal"], enabled: true },
  { id: "claude", displayName: "Anthropic Claude", runtime: "cloud", capabilities: ["chat","code","multimodal"], enabled: true },
  { id: "grok", displayName: "xAI Grok", runtime: "cloud", capabilities: ["chat","code","image_generation","multimodal"], enabled: true },
  { id: "mistral", displayName: "Mistral", runtime: "cloud", capabilities: ["chat","code","embedding","multimodal"], enabled: true },
  { id: "cohere", displayName: "Cohere", runtime: "cloud", capabilities: ["chat","embedding","multimodal"], enabled: true },
  { id: "groq", displayName: "Groq", runtime: "cloud", capabilities: ["chat","code","speech"], enabled: true },
  { id: "deepseek", displayName: "DeepSeek", runtime: "cloud", capabilities: ["chat","code"], enabled: true },
  { id: "qwen", displayName: "Qwen", runtime: "cloud", capabilities: ["chat","code","image_generation","multimodal"], enabled: true },
  { id: "openrouter", displayName: "OpenRouter", runtime: "cloud", capabilities: ["chat","code","image_generation","video_generation","embedding","multimodal"], openAICompatible: true, enabled: true },
  { id: "together", displayName: "Together AI", runtime: "cloud", capabilities: ["chat","code","image_generation","embedding","multimodal"], openAICompatible: true, enabled: true },
  { id: "fireworks", displayName: "Fireworks AI", runtime: "cloud", capabilities: ["chat","code","image_generation","multimodal"], openAICompatible: true, enabled: true },
  { id: "perplexity", displayName: "Perplexity", runtime: "cloud", capabilities: ["chat","multimodal"], enabled: true },
  { id: "azure-openai", displayName: "Azure OpenAI", runtime: "cloud", capabilities: ["chat","code","image_generation","embedding","speech","multimodal"], openAICompatible: true, enabled: true },
  { id: "aws-bedrock", displayName: "AWS Bedrock", runtime: "cloud", capabilities: ["chat","code","image_generation","embedding","multimodal"], enabled: true },
  { id: "vertex-ai", displayName: "Google Vertex AI", runtime: "cloud", capabilities: ["chat","code","image_generation","video_generation","embedding","multimodal"], enabled: true },
  { id: "custom-openai-compatible", displayName: "Custom OpenAI-compatible", runtime: "hybrid", capabilities: ["chat","code","image_generation","embedding","multimodal"], openAICompatible: true, enabled: true },
  { id: "huggingface", displayName: "Hugging Face", runtime: "hybrid", capabilities: ["chat","code","image_generation","video_generation","embedding","speech","multimodal"], enabled: true },
  { id: "replicate", displayName: "Replicate", runtime: "cloud", capabilities: ["image_generation","video_generation","speech","multimodal"], enabled: true },
  { id: "fal", displayName: "Fal", runtime: "cloud", capabilities: ["image_generation","video_generation","speech","music_generation"], enabled: true },
  { id: "stability", displayName: "Stability AI", runtime: "cloud", capabilities: ["image_generation","video_generation"], enabled: true },
  { id: "image-provider", displayName: "Generic Image Provider", runtime: "cloud", capabilities: ["image_generation"], enabled: true },
  { id: "video-provider", displayName: "Generic Video Provider", runtime: "cloud", capabilities: ["video_generation"], enabled: true },
  { id: "music-provider", displayName: "Generic Music Provider", runtime: "cloud", capabilities: ["music_generation"], enabled: true },
  { id: "voice-provider", displayName: "Generic Voice Provider", runtime: "cloud", capabilities: ["voice_generation","speech"], enabled: true }
];

export function validateGGUFModel(model: GGUFModelSpec): string[] {
  const errors: string[] = [];
  if (!model.id) errors.push("model.id is required");
  if (!model.name) errors.push("model.name is required");
  if (!model.quantization) errors.push("quantization is required");
  if (!model.source) errors.push("source is required");
  if (!model.checksum) errors.push("checksum is required");
  if (model.format !== "gguf") errors.push("format must be gguf");
  if (model.kind === "embedding" && !model.capabilities.includes("embedding")) errors.push("embedding capability is required");
  if (model.kind === "speech" && !model.capabilities.includes("speech")) errors.push("speech capability is required");
  return errors;
}

export function canRunModel(model: AIModelSpec, target: "android" | "cloud"): boolean {
  return target === "android" ? model.compatibility.android : model.compatibility.cloud;
}

export function nextLifecycleStatus(action: ModelLifecycleAction, current: ModelLifecycleStatus): ModelLifecycleStatus {
  const transitions: Record<ModelLifecycleAction, ModelLifecycleStatus[]> = {
    download: ["discovered","queued","downloading","downloaded"],
    install: ["downloaded","installing","installed"],
    activate: ["installed","inactive","active"],
    deactivate: ["active","inactive"],
    delete: ["inactive","installed","downloaded","deleted"]
  };
  const target = transitions[action];
  if (!target.includes(current)) throw new Error(`Invalid ${action} transition from ${current}`);
  return action === "download" ? "downloaded"
    : action === "install" ? "installed"
    : action === "activate" ? "active"
    : action === "deactivate" ? "inactive"
    : "deleted";
}

export function selectModelRoute(
  request: ModelRouteRequest,
  providers: readonly ModelProviderConfig[] = AI_MODEL_PROVIDER_CATALOG,
  models: readonly AIModelSpec[] = []
): ModelRoute {
  const preferred = request.preferredProviders ?? [];
  const denied = new Set(request.deniedProviders ?? []);
  const candidates = providers.filter((p) =>
    p.enabled &&
    !denied.has(p.id) &&
    p.capabilities.includes(request.capability) &&
    (!request.runtime || p.runtime === request.runtime || request.runtime === "hybrid")
  );
  const ordered = [...candidates].sort((a, b) => {
    const ai = preferred.indexOf(a.id);
    const bi = preferred.indexOf(b.id);
    return (ai < 0 ? 999 : ai) - (bi < 0 ? 999 : bi);
  });
  const selected = ordered[0];
  if (selected) {
    const matchingModel = models.find((m) =>
      m.providerId === selected.id &&
      m.capabilities.includes(request.capability) &&
      (!request.kind || m.kind === request.kind)
    );
    return { providerId: selected.id, modelId: matchingModel?.id, reason: preferred.includes(selected.id) ? "preferred" : "compatible" };
  }
  const local = models.find((m) =>
    m.providerId.startsWith("local:") &&
    m.capabilities.includes(request.capability) &&
    (!request.kind || m.kind === request.kind) &&
    (!request.runtime || request.runtime === "local" || request.runtime === "hybrid") &&
    !denied.has(m.providerId)
  );
  if (local) return { providerId: local.providerId, modelId: local.id, reason: "fallback" };
  throw new Error(`No model provider supports capability: ${request.capability}`);
}

export class AIModelFactory {
  constructor(
    private readonly providers: readonly ModelProviderConfig[] = AI_MODEL_PROVIDER_CATALOG,
    private readonly models: AIModelSpec[] = []
  ) {}

  registerModel(model: AIModelSpec): void {
    if (this.models.some((m) => m.id === model.id)) throw new Error(`Model already registered: ${model.id}`);
    this.models.push(model);
  }

  listModels(filter?: { kind?: ModelKind; runtime?: ModelRuntime; capability?: ModelCapability }): AIModelSpec[] {
    return this.models.filter((m) =>
      (!filter?.kind || m.kind === filter.kind) &&
      (!filter?.runtime || m.runtime === filter.runtime) &&
      (!filter?.capability || m.capabilities.includes(filter.capability))
    );
  }

  route(request: ModelRouteRequest): ModelRoute {
    return selectModelRoute(request, this.providers, this.models);
  }
}
