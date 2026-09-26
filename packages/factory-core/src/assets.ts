/**
 * Asset Factory domain contracts.
 *
 * The factory is asset-kind agnostic: every asset moves through the same
 * evidence-producing lifecycle, while kind-specific validators/transformers
 * are supplied by adapters.
 */

export type AssetKind =
  | "concept_art"
  | "character"
  | "environment"
  | "prop"
  | "weapon"
  | "vehicle"
  | "ui"
  | "icon"
  | "texture"
  | "material"
  | "sprite"
  | "background"
  | "vfx"
  | "thumbnail"
  | "promotional_graphic"
  | "mesh"
  | "animation"
  | "audio"
  | "voice";

export type AssetStage =
  | "concept"
  | "reference"
  | "generation"
  | "variation"
  | "selection"
  | "editing"
  | "optimization"
  | "metadata"
  | "import"
  | "engine_asset";

export type AssetStageStatus =
  | "pending"
  | "queued"
  | "running"
  | "succeeded"
  | "failed"
  | "skipped";

export const ASSET_FACTORY_PIPELINE: readonly AssetStage[] = [
  "concept",
  "reference",
  "generation",
  "variation",
  "selection",
  "editing",
  "optimization",
  "metadata",
  "import",
  "engine_asset",
] as const;

export const ASSET_KINDS: readonly AssetKind[] = [
  "concept_art",
  "character",
  "environment",
  "prop",
  "weapon",
  "vehicle",
  "ui",
  "icon",
  "texture",
  "material",
  "sprite",
  "background",
  "vfx",
  "thumbnail",
  "promotional_graphic",
] as const;

export interface AssetBudget {
  polygons?: number;
  texturePixels?: number;
  textureMemoryMb?: number;
  memoryMb?: number;
  drawCalls?: number;
  fileSizeMb?: number;
  maxDimensions?: { width: number; height: number };
}

export interface AssetProvenance {
  provider?: string;
  model?: string;
  generationJobId?: string;
  license?: string;
  sourceUrls?: string[];
  referenceAssetIds?: string[];
  generatedAt?: string;
  humanEdited?: boolean;
}

export interface AssetValidation {
  geometry: boolean;
  materials: boolean;
  uv: boolean;
  scale: boolean;
  pivot: boolean;
  collision: boolean;
  lod: boolean;
  provenance: boolean;
  visualContinuity: boolean;
  technical: boolean;
}

export interface AssetMetadata {
  name: string;
  description?: string;
  tags: string[];
  semanticLabels?: string[];
  dimensions?: { width?: number; height?: number; depth?: number };
  units?: "px" | "m" | "cm" | "mm";
  targetEngine?: string;
  targetPlatform?: string;
  targetResolution?: string;
  colorSpace?: "sRGB" | "linear" | "ACEScg" | "unknown";
  alphaMode?: "none" | "straight" | "premultiplied";
  sourceFormat?: string;
  outputFormat?: string;
  dependencies?: string[];
  custom?: Record<string, unknown>;
}

export interface AssetSpec {
  id: string;
  projectId?: string;
  kind: AssetKind;
  prompt: string;
  references?: string[];
  targetEngine?: string;
  targetPlatform?: string;
  budget?: AssetBudget;
  provenance?: AssetProvenance;
  metadata?: AssetMetadata;
}

export interface AssetArtifact {
  id: string;
  assetId: string;
  stage: AssetStage;
  uri: string;
  mimeType?: string;
  sha256?: string;
  width?: number;
  height?: number;
  fileSizeBytes?: number;
  createdAt: string;
  metadata: Record<string, unknown>;
}

export interface AssetStageRecord {
  stage: AssetStage;
  status: AssetStageStatus;
  startedAt?: string;
  completedAt?: string;
  inputArtifactIds: string[];
  outputArtifactIds: string[];
  provider?: string;
  model?: string;
  evidence?: string[];
  error?: string;
}

export interface AssetFactoryJob {
  id: string;
  asset: AssetSpec;
  status: "queued" | "running" | "succeeded" | "failed" | "cancelled";
  currentStage: AssetStage;
  stages: AssetStageRecord[];
  selectedArtifactId?: string;
  engineAssetId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssetValidationResult {
  passed: boolean;
  checks: Record<string, boolean>;
  warnings: string[];
  errors: string[];
}

export function createAssetFactoryJob(asset: AssetSpec, now = new Date().toISOString()): AssetFactoryJob {
  return {
    id: `asset-job:${asset.id}`,
    asset,
    status: "queued",
    currentStage: "concept",
    stages: ASSET_FACTORY_PIPELINE.map(stage => ({
      stage,
      status: "pending",
      inputArtifactIds: [],
      outputArtifactIds: [],
    })),
    createdAt: now,
    updatedAt: now,
  };
}

export function isTerminalStage(stage: AssetStage): boolean {
  return stage === "engine_asset";
}

export function nextAssetStage(stage: AssetStage): AssetStage | undefined {
  const index = ASSET_FACTORY_PIPELINE.indexOf(stage);
  return index >= 0 && index < ASSET_FACTORY_PIPELINE.length - 1
    ? ASSET_FACTORY_PIPELINE[index + 1]
    : undefined;
}

export function validateAssetKind(kind: string): kind is AssetKind {
  return ASSET_KINDS.includes(kind as AssetKind);
}
