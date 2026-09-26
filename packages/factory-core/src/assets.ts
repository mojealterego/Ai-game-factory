export type AssetKind =
  | "sprite" | "texture" | "material" | "audio" | "voice" | "animation"
  | "mesh" | "character" | "environment" | "prop" | "vehicle" | "vfx";

export interface AssetSpec {
  id: string;
  kind: AssetKind;
  prompt: string;
  references?: string[];
  targetEngine?: string;
  targetPlatform?: string;
  budget?: {
    polygons?: number;
    texturePixels?: number;
    memoryMb?: number;
    drawCalls?: number;
  };
  provenance?: {
    provider?: string;
    model?: string;
    license?: string;
    sourceUrls?: string[];
  };
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
}
