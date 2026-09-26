import type { AssetKind } from "./assets";

export type ThreeDFactoryInputMode = "text" | "image" | "multiview" | "concept";
export type ThreeDFactoryStage =
  | "input" | "generation" | "smart_mesh" | "high_detail" | "segmentation"
  | "retopology" | "polygon_optimization" | "uv" | "ai_texture" | "pbr_materials"
  | "material_optimization" | "auto_rig" | "animation" | "lod" | "collision"
  | "asset_optimization" | "quality_check" | "performance_check"
  | "license_provenance" | "export";

export const THREE_D_ASSET_FACTORY_PIPELINE: readonly ThreeDFactoryStage[] = [
  "input", "generation", "smart_mesh", "high_detail", "segmentation",
  "retopology", "polygon_optimization", "uv", "ai_texture", "pbr_materials",
  "material_optimization", "auto_rig", "animation", "lod", "collision",
  "asset_optimization", "quality_check", "performance_check",
  "license_provenance", "export"
];

export type ThreeDAssetCategory =
  | "character" | "prop" | "environment" | "vehicle" | "weapon" | "npc_variant";

export type ThreeDExportFormat =
  | "glb" | "fbx" | "obj" | "usd" | "unity" | "unreal" | "godot" | "cocos";

export type OptimizationProfile = "mobile" | "web" | "pc" | "console" | "vr" | "custom";
export type LODLevel = "LOD0" | "LOD1" | "LOD2" | "LOD3";

export interface ThreeDFactorySpec {
  projectId: string;
  assetId: string;
  assetKind: ThreeDAssetCategory;
  input: {
    mode: ThreeDFactoryInputMode;
    prompt?: string;
    references?: string[];
  };
  target: {
    engine: string;
    platform: string;
  };
  quality?: {
    detail?: "standard" | "high" | "ultra";
    polygonBudget?: number;
    textureResolution?: number;
  };
  rig?: {
    required: boolean;
    animation?: boolean;
    rigType?: "biped" | "quadruped" | "custom";
  };
  exportFormats: ThreeDExportFormat[];
}

export interface LODBudget {
  level: LODLevel;
  maxTriangles: number;
  maxTextureResolution: number;
  maxMaterialSlots: number;
}

export interface AssetOptimizationPlan {
  profile: OptimizationProfile;
  polygonBudget: number;
  textureResolution: number;
  lods: LODBudget[];
  collision: "generated" | "custom" | "none";
  materialComplexity: "low" | "medium" | "high";
  drawCallBudget: number;
  targetMemoryMb: number;
  rationale: string[];
}

export interface ThreeDFactoryJob {
  id: string;
  spec: ThreeDFactorySpec;
  status: "queued" | "running" | "succeeded" | "failed";
  currentStage: ThreeDFactoryStage;
  stages: Array<{
    stage: ThreeDFactoryStage;
    status: "pending" | "running" | "succeeded" | "failed" | "skipped";
    artifactIds: string[];
    evidence: string[];
    error?: string;
  }>;
  optimization: AssetOptimizationPlan;
  outputs: Partial<Record<ThreeDExportFormat, string>>;
  provenance: {
    provider?: string;
    model?: string;
    sourceReferences: string[];
    license?: string;
    taskIds: string[];
  };
}

export interface ThreeDFactoryExecutor {
  execute(stage: ThreeDFactoryStage, job: ThreeDFactoryJob): Promise<{
    artifactIds?: string[];
    evidence?: string[];
    outputs?: Partial<Record<ThreeDExportFormat, string>>;
  }>;
}

export const THREE_D_PIPELINE_BY_CATEGORY: Record<ThreeDAssetCategory, readonly ThreeDFactoryStage[]> = {
  character: ["input", "generation", "smart_mesh", "high_detail", "segmentation", "retopology", "polygon_optimization", "uv", "ai_texture", "pbr_materials", "material_optimization", "auto_rig", "animation", "lod", "collision", "asset_optimization", "quality_check", "performance_check", "license_provenance", "export"],
  npc_variant: ["input", "generation", "smart_mesh", "segmentation", "retopology", "polygon_optimization", "uv", "ai_texture", "pbr_materials", "material_optimization", "auto_rig", "animation", "lod", "collision", "asset_optimization", "quality_check", "performance_check", "license_provenance", "export"],
  prop: ["input", "generation", "smart_mesh", "high_detail", "segmentation", "retopology", "polygon_optimization", "uv", "ai_texture", "pbr_materials", "material_optimization", "lod", "collision", "asset_optimization", "quality_check", "performance_check", "license_provenance", "export"],
  environment: ["input", "generation", "smart_mesh", "high_detail", "segmentation", "retopology", "polygon_optimization", "uv", "ai_texture", "pbr_materials", "material_optimization", "lod", "collision", "asset_optimization", "quality_check", "performance_check", "license_provenance", "export"],
  vehicle: ["input", "generation", "smart_mesh", "high_detail", "segmentation", "retopology", "polygon_optimization", "uv", "ai_texture", "pbr_materials", "material_optimization", "lod", "collision", "asset_optimization", "quality_check", "performance_check", "license_provenance", "export"],
  weapon: ["input", "generation", "smart_mesh", "high_detail", "segmentation", "retopology", "polygon_optimization", "uv", "ai_texture", "pbr_materials", "material_optimization", "lod", "collision", "asset_optimization", "quality_check", "performance_check", "license_provenance", "export"]
};

function profileFor(platform: string): OptimizationProfile {
  const p = platform.toLowerCase();
  if (p.includes("android") || p.includes("ios") || p.includes("mobile")) return "mobile";
  if (p.includes("web")) return "web";
  if (p.includes("console") || p.includes("ps") || p.includes("xbox")) return "console";
  if (p.includes("vr") || p.includes("quest")) return "vr";
  return "pc";
}

export function planAssetOptimization(input: {
  platform: string;
  assetKind: ThreeDAssetCategory;
  requestedPolygonBudget?: number;
  requestedTextureResolution?: number;
  profile?: OptimizationProfile;
}): AssetOptimizationPlan {
  const profile = input.profile ?? profileFor(input.platform);
  const limits: Record<OptimizationProfile, { polygons: number; texture: number; drawCalls: number; memory: number }> = {
    mobile: { polygons: 50000, texture: 2048, drawCalls: 4, memory: 128 },
    web: { polygons: 75000, texture: 2048, drawCalls: 6, memory: 256 },
    pc: { polygons: 150000, texture: 4096, drawCalls: 12, memory: 512 },
    console: { polygons: 200000, texture: 4096, drawCalls: 16, memory: 768 },
    vr: { polygons: 100000, texture: 2048, drawCalls: 8, memory: 512 },
    custom: { polygons: 100000, texture: 2048, drawCalls: 8, memory: 256 }
  };
  const limit = limits[profile];
  const polygonBudget = Math.min(input.requestedPolygonBudget ?? limit.polygons, limit.polygons);
  const textureResolution = Math.min(input.requestedTextureResolution ?? limit.texture, limit.texture);
  const factors = [1, 0.5, 0.25, 0.125];
  const lods = factors.map((factor, i) => ({
    level: ("LOD" + i) as LODLevel,
    maxTriangles: Math.max(100, Math.floor(polygonBudget * factor)),
    maxTextureResolution: Math.max(256, Math.floor(textureResolution * Math.sqrt(factor))),
    maxMaterialSlots: i === 0 ? 4 : i === 1 ? 3 : 2
  }));
  return {
    profile,
    polygonBudget,
    textureResolution,
    lods,
    collision: input.assetKind === "environment" ? "generated" : "generated",
    materialComplexity: profile === "mobile" || profile === "web" ? "low" : "medium",
    drawCallBudget: limit.drawCalls,
    targetMemoryMb: limit.memory,
    rationale: [
      "Profile selected from target platform.",
      "Polygon and texture budgets are capped before engine import.",
      "Four LOD levels are generated for predictable runtime scaling.",
      "Material and draw-call complexity are bounded for the target profile."
    ]
  };
}

export function create3DAssetFactoryJob(spec: ThreeDFactorySpec): ThreeDFactoryJob {
  if (!spec.projectId || !spec.assetId) throw new Error("projectId and assetId are required");
  const pipeline = THREE_D_PIPELINE_BY_CATEGORY[spec.assetKind];
  if (!pipeline) throw new Error("UNSUPPORTED_3D_ASSET_CATEGORY");
  return {
    id: "3d-factory:" + spec.projectId + ":" + spec.assetId,
    spec,
    status: "queued",
    currentStage: "input",
    stages: pipeline.map(stage => ({ stage, status: "pending", artifactIds: [], evidence: [] })),
    optimization: planAssetOptimization({
      platform: spec.target.platform,
      assetKind: spec.assetKind,
      requestedPolygonBudget: spec.quality?.polygonBudget,
      requestedTextureResolution: spec.quality?.textureResolution
    }),
    outputs: {},
    provenance: { sourceReferences: spec.input.references ?? [], taskIds: [] }
  };
}

export function resolveAssetPipeline(assetKind: ThreeDAssetCategory): readonly ThreeDFactoryStage[] {
  return THREE_D_PIPELINE_BY_CATEGORY[assetKind];
}

export async function execute3DAssetFactory(
  initialJob: ThreeDFactoryJob,
  executor: ThreeDFactoryExecutor
): Promise<ThreeDFactoryJob> {
  const job = structuredClone(initialJob);
  job.status = "running";
  for (const stage of resolveAssetPipeline(job.spec.assetKind)) {
    const record = job.stages.find(x => x.stage === stage)!;
    record.status = "running";
    job.currentStage = stage;
    try {
      const result = await executor.execute(stage, job);
      record.artifactIds = result.artifactIds ?? [];
      record.evidence = result.evidence ?? [];
      job.outputs = { ...job.outputs, ...(result.outputs ?? {}) };
      record.status = "succeeded";
    } catch (error) {
      record.status = "failed";
      record.error = error instanceof Error ? error.message : String(error);
      job.status = "failed";
      return job;
    }
  }
  job.status = "succeeded";
  return job;
}

export function validate3DAssetExport(input: {
  formats: ThreeDExportFormat[];
  artifactUris: Partial<Record<ThreeDExportFormat, string>>;
  sha256?: string;
  license?: string;
  provenance?: string;
}): { passed: boolean; errors: string[] } {
  const errors: string[] = [];
  for (const format of input.formats) {
    if (!input.artifactUris[format]) errors.push("Missing export: " + format);
  }
  if (!input.sha256) errors.push("Missing SHA-256");
  if (!input.license) errors.push("Missing license");
  if (!input.provenance) errors.push("Missing provenance");
  return { passed: errors.length === 0, errors };
}
