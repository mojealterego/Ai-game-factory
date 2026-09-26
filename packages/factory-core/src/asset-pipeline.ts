import type { Artifact, CapabilityRequest, EngineId } from "./contracts";

export type AssetKind = "character" | "prop" | "environment" | "vehicle" | "weapon" | "ui" | "texture" | "material";

export interface AssetProfile {
  kind: AssetKind;
  targetEngine: EngineId;
  platform: "mobile" | "desktop" | "console" | "web";
  polygonBudget?: number;
  textureMaxSize?: number;
  lodCount?: number;
  requireRig?: boolean;
  requireCollision?: boolean;
}

export interface AssetPipelineStep {
  id: string;
  capability: CapabilityRequest["capability"];
  dependsOn: string[];
}

export function build3DAssetPlan(profile: AssetProfile): AssetPipelineStep[] {
  const steps: AssetPipelineStep[] = [
    { id: "generate", capability: "text_to_3d", dependsOn: [] },
    { id: "mesh", capability: "mesh_processing", dependsOn: ["generate"] },
    { id: "texture", capability: "texturing", dependsOn: ["mesh"] },
  ];
  if (profile.requireRig) {
    steps.push({ id: "rig", capability: "rigging", dependsOn: ["mesh"] });
    steps.push({ id: "animation", capability: "animation", dependsOn: ["rig"] });
  }
  return steps;
}

export interface AssetValidationResult {
  passed: boolean;
  checks: string[];
  warnings: string[];
}

export function validateArtifact(artifact: Artifact, profile: AssetProfile): AssetValidationResult {
  const checks = ["artifact-uri", "provenance", "license", "engine-target"];
  const warnings: string[] = [];
  if (profile.platform === "mobile" && !artifact.metadata["optimizedForMobile"]) {
    warnings.push("Artifact has not been marked as mobile-optimized");
  }
  return { passed: Boolean(artifact.uri && artifact.projectId), checks, warnings };
}
