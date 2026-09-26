import {
  THREE_D_ASSET_FACTORY_PIPELINE,
  create3DAssetFactoryJob,
  planAssetOptimization,
  validate3DAssetExport,
  resolveAssetPipeline,
  type ThreeDAssetFactorySpec
} from "./three-d-asset-factory";

const assert = (condition: boolean, message: string) => {
  if (!condition) throw new Error(message);
};

export function runThreeDAssetFactoryContractTests(): void {
  assert(THREE_D_ASSET_FACTORY_PIPELINE.includes("segmentation"), "segmentation stage missing");
  assert(THREE_D_ASSET_FACTORY_PIPELINE.includes("retopology"), "retopology stage missing");
  assert(THREE_D_ASSET_FACTORY_PIPELINE.includes("lod"), "LOD stage missing");
  assert(THREE_D_ASSET_FACTORY_PIPELINE.includes("license_provenance"), "provenance stage missing");
  assert(THREE_D_ASSET_FACTORY_PIPELINE.includes("export"), "export stage missing");

  const spec: ThreeDAssetFactorySpec = {
    projectId: "mobile-demo",
    assetId: "hero",
    assetKind: "character",
    input: { mode: "image", references: ["ref://hero"] },
    target: { engine: "godot", platform: "android" },
    quality: { detail: "high", polygonBudget: 50000, textureResolution: 2048 },
    rig: { required: true, animation: true },
    exportFormats: ["glb", "fbx", "unity", "unreal", "godot", "cocos"]
  };

  const job = create3DAssetFactoryJob(spec);
  assert(job.optimization.profile === "mobile", "Android must select mobile optimization profile");
  assert(job.optimization.lods.length === 4, "mobile profile must provide LOD0-LOD3");

  const optimized = planAssetOptimization({
    platform: "android",
    assetKind: "character",
    requestedPolygonBudget: 80000,
    requestedTextureResolution: 4096
  });
  assert(optimized.polygonBudget <= 50000, "mobile polygon budget must be constrained");
  assert(optimized.textureResolution <= 2048, "mobile texture resolution must be constrained");
  assert(optimized.lods.every(lod => lod.maxTriangles > 0), "LOD budgets must be positive");
  assert(optimized.drawCallBudget <= 4, "mobile draw-call budget must be constrained");
  assert(optimized.collision === "generated", "collision policy must be generated");

  const valid = validate3DAssetExport({
    formats: ["glb", "fbx", "obj", "usd", "unity", "unreal", "godot", "cocos"],
    artifactUris: Object.fromEntries(["glb", "fbx", "obj", "usd", "unity", "unreal", "godot", "cocos"].map(x => [x, "artifact://" + x])),
    sha256: "abc",
    license: "CC-BY-4.0",
    provenance: "provider://tripo/task-1"
  });
  assert(valid.passed, "complete export metadata must validate");

  assert(resolveAssetPipeline("character").includes("auto_rig"), "character pipeline must include rigging");
  assert(resolveAssetPipeline("vehicle").includes("lod"), "vehicle pipeline must include LOD");
  assert(resolveAssetPipeline("prop").includes("collision"), "prop pipeline must include collision");
}

runThreeDAssetFactoryContractTests();
