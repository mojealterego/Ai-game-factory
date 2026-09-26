import type { GGUFModelSpec, ModelCompatibility, ModelKind, ModelLifecycleJob } from "./model-factory";

export type HuggingFaceHubStage =
  | "search"
  | "model_card"
  | "files"
  | "compatibility"
  | "license"
  | "quantization"
  | "download"
  | "verify"
  | "import"
  | "register"
  | "activate";

export const HUGGINGFACE_HUB_PIPELINE: readonly HuggingFaceHubStage[] = [
  "search","model_card","files","compatibility","license","quantization",
  "download","verify","import","register","activate"
];

export type HuggingFaceFileKind = "gguf" | "safetensors" | "onnx" | "other";

export interface HuggingFaceModelCard {
  repoId: string;
  revision?: string;
  license?: string;
  licenseUrl?: string;
  pipelineTag?: string;
  libraryName?: string;
  tags: string[];
  languages?: string[];
  baseModel?: string;
  description?: string;
  rawMarkdown?: string;
  metadata?: Record<string, unknown>;
}

export interface HuggingFaceFile {
  path: string;
  sizeBytes?: number;
  kind: HuggingFaceFileKind;
  sha256?: string;
  downloadUrl: string;
  quantization?: string;
  metadata?: Record<string, unknown>;
}

export interface HuggingFaceModelSearchResult {
  repoId: string;
  author?: string;
  downloads?: number;
  likes?: number;
  lastModified?: string;
  task?: string;
  library?: string;
  tags: string[];
  url: string;
}

export interface HuggingFaceCompatibilityResult {
  compatible: boolean;
  target: "android" | "cloud";
  reasons: string[];
  requirements?: ModelCompatibility;
}

export interface HuggingFaceQuantizationResult {
  detected: boolean;
  format?: HuggingFaceFileKind;
  quantization?: string;
  source: "filename" | "metadata" | "model-card" | "unknown";
}

export interface HuggingFaceImportRequest {
  projectId: string;
  repoId: string;
  revision?: string;
  target: "android" | "cloud";
  kind: ModelKind;
  filePath?: string;
  activate?: boolean;
  requiredCompatibility?: Partial<ModelCompatibility>;
}

export interface HuggingFaceImportContext {
  request: HuggingFaceImportRequest;
  search?: HuggingFaceModelSearchResult;
  card?: HuggingFaceModelCard;
  files?: HuggingFaceFile[];
  selectedFile?: HuggingFaceFile;
  compatibility?: HuggingFaceCompatibilityResult;
  license?: string;
  quantization?: HuggingFaceQuantizationResult;
  downloadedPath?: string;
  verifiedChecksum?: string;
  importedModelId?: string;
  registeredModel?: GGUFModelSpec;
  lifecycleJob?: ModelLifecycleJob;
}

export interface HuggingFaceHubAdapter {
  search(query: string): Promise<HuggingFaceModelSearchResult[]>;
  getModelCard(repoId: string, revision?: string): Promise<HuggingFaceModelCard>;
  listFiles(repoId: string, revision?: string): Promise<HuggingFaceFile[]>;
  checkCompatibility(file: HuggingFaceFile, target: "android" | "cloud", required?: Partial<ModelCompatibility>): Promise<HuggingFaceCompatibilityResult>;
  getLicense(card: HuggingFaceModelCard): Promise<string | undefined>;
  detectQuantization(file: HuggingFaceFile, card: HuggingFaceModelCard): Promise<HuggingFaceQuantizationResult>;
  download(file: HuggingFaceFile, target: "android" | "cloud"): Promise<{ path: string; sha256?: string }>;
  verify(path: string, expectedSha256?: string): Promise<{ valid: boolean; sha256?: string; reason?: string }>;
}

export interface HuggingFaceImportResult {
  status: "succeeded" | "failed";
  context: HuggingFaceImportContext;
  stages: Array<{ stage: HuggingFaceHubStage; status: "passed" | "failed"; evidence?: Record<string, unknown>; error?: string }>;
  model?: GGUFModelSpec;
}

export async function executeHuggingFaceImport(
  adapter: HuggingFaceHubAdapter,
  request: HuggingFaceImportRequest,
  register: (model: GGUFModelSpec) => Promise<void> | void,
  activate?: (model: GGUFModelSpec) => Promise<void> | void
): Promise<HuggingFaceImportResult> {
  const context: HuggingFaceImportContext = { request };
  const stages: HuggingFaceImportResult["stages"] = [];

  const run = async (stage: HuggingFaceHubStage, fn: () => Promise<Record<string, unknown> | void>) => {
    try {
      const evidence = await fn();
      stages.push({ stage, status: "passed", evidence });
    } catch (error) {
      stages.push({ stage, status: "failed", error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  };

  try {
    await run("search", async () => {
      const results = await adapter.search(request.repoId);
      context.search = results.find((r) => r.repoId === request.repoId) ?? results[0];
      if (!context.search) throw new Error(`Hugging Face model not found: ${request.repoId}`);
      return { repoId: context.search.repoId };
    });

    await run("model_card", async () => {
      context.card = await adapter.getModelCard(request.repoId, request.revision);
      return { repoId: context.card.repoId, revision: context.card.revision };
    });

    await run("files", async () => {
      context.files = await adapter.listFiles(request.repoId, request.revision);
      const files = context.files.filter((file) => request.filePath ? file.path === request.filePath : file.kind === "gguf");
      context.selectedFile = files[0];
      if (!context.selectedFile) throw new Error("No compatible model file selected");
      return { path: context.selectedFile.path, kind: context.selectedFile.kind };
    });

    await run("compatibility", async () => {
      context.compatibility = await adapter.checkCompatibility(context.selectedFile!, request.target, request.requiredCompatibility);
      if (!context.compatibility.compatible) throw new Error(`Model is incompatible: ${context.compatibility.reasons.join("; ")}`);
      return { target: request.target, compatible: true };
    });

    await run("license", async () => {
      context.license = await adapter.getLicense(context.card!);
      if (!context.license) throw new Error("Model license could not be established");
      return { license: context.license };
    });

    await run("quantization", async () => {
      context.quantization = await adapter.detectQuantization(context.selectedFile!, context.card!);
      if (request.kind !== "embedding" && !context.quantization.detected) {
        throw new Error("Model quantization/format could not be established");
      }
      return { quantization: context.quantization.quantization, format: context.quantization.format };
    });

    await run("download", async () => {
      const result = await adapter.download(context.selectedFile!, request.target);
      context.downloadedPath = result.path;
      context.verifiedChecksum = result.sha256;
      return { path: result.path, sha256: result.sha256 };
    });

    await run("verify", async () => {
      const result = await adapter.verify(context.downloadedPath!, context.selectedFile!.sha256);
      if (!result.valid) throw new Error(result.reason ?? "Downloaded model failed verification");
      context.verifiedChecksum = result.sha256 ?? context.verifiedChecksum;
      return { valid: true, sha256: context.verifiedChecksum };
    });

    await run("import", async () => {
      context.importedModelId = `local:hf:${request.repoId}:${context.selectedFile!.path}`;
      return { modelId: context.importedModelId };
    });

    await run("register", async () => {
      if (context.selectedFile!.kind !== "gguf") {
        throw new Error("Factory registration currently requires a GGUF file for local model registration");
      }
      const model: GGUFModelSpec = {
        id: context.importedModelId!,
        name: request.repoId,
        kind: request.kind,
        runtime: request.target === "android" ? "local" : "hybrid",
        providerId: "local:gguf",
        capabilities: [request.kind === "chat" ? "chat" : request.kind === "code" ? "code" : request.kind === "embedding" ? "embedding" : request.kind === "speech" ? "speech" : request.kind === "image" ? "image_generation" : request.kind === "video" ? "video_generation" : "multimodal"],
        quantization: context.quantization?.quantization ?? "unknown",
        format: "gguf",
        resources: {
          sizeBytes: context.selectedFile!.sizeBytes,
          sizeLabel: context.selectedFile!.sizeBytes ? `${Math.round(context.selectedFile!.sizeBytes / 1024 / 1024)} MB` : undefined,
          contextLength: typeof context.card?.metadata?.context_length === "number" ? context.card.metadata.context_length : undefined
        },
        provenance: {
          source: `https://huggingface.co/${request.repoId}`,
          sourceType: "huggingface",
          version: context.card?.revision ?? request.revision,
          revision: context.card?.revision ?? request.revision,
          checksum: context.verifiedChecksum ?? context.selectedFile!.sha256,
          checksumAlgorithm: "sha256",
          license: context.license,
          modelCardUrl: `https://huggingface.co/${request.repoId}`
        },
        compatibility: context.compatibility?.requirements ?? { android: request.target === "android", cloud: request.target === "cloud" },
        source: context.selectedFile!.downloadUrl,
        checksum: context.verifiedChecksum ?? context.selectedFile!.sha256 ?? "unverified",
        lifecycle: "installed",
        installedPath: context.downloadedPath,
        downloadUrl: context.selectedFile!.downloadUrl
      };
      context.registeredModel = model;
      await register(model);
      return { modelId: model.id };
    });

    if (request.activate) {
      await run("activate", async () => {
        if (!context.registeredModel) throw new Error("Cannot activate an unregistered model");
        if (activate) await activate(context.registeredModel);
        context.registeredModel = { ...context.registeredModel, lifecycle: "active" };
        return { modelId: context.registeredModel.id, lifecycle: "active" };
      });
    }

    return { status: "succeeded", context, stages, model: context.registeredModel };
  } catch {
    return { status: "failed", context, stages, model: context.registeredModel };
  }
}
