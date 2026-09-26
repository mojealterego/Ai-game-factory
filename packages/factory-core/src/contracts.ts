export type EngineId =
  | "unreal" | "unity" | "godot" | "cocos" | "defold" | "stride"
  | "monogame" | "bevy" | "o3de" | "html5" | "renpy" | "custom";

export type Capability =
  | "game_ideation" | "gdd" | "story" | "narrative_runtime"
  | "gameplay_logic" | "code" | "image" | "sprite" | "video"
  | "audio" | "music" | "soundtrack" | "ambient" | "sfx" | "footsteps" | "ui_sounds"
  | "cinematic_sound" | "voice_generation" | "dubbing" | "lip_sync" | "dialogue_timing"
  | "multilingual_voice" | "voice" | "text_to_3d" | "image_to_3d" | "multiview_to_3d"
  | "mesh_processing" | "texturing" | "rigging" | "animation"
  | "retargeting" | "local_inference" | "embedding" | "speech_to_text" | "build" | "qa";

export interface CapabilityRequest {
  projectId: string;
  capability: Capability;
  prompt?: string;
  engine?: EngineId;
  constraints?: Record<string, unknown>;
  preferredProviders?: string[];
  localOnly?: boolean;
  budget?: { maxCredits?: number; maxLatencyMs?: number };
}

export interface Job {
  id: string;
  projectId: string;
  capability: Capability;
  providerId: string;
  status: "queued" | "running" | "succeeded" | "failed" | "cancelled";
  progress: number;
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Artifact {
  id: string;
  projectId: string;
  kind: string;
  uri: string;
  mimeType?: string;
  sha256?: string;
  license?: string;
  sourceProvider?: string;
  metadata: Record<string, unknown>;
  validation: {
    status: "pending" | "passed" | "failed";
    checks: string[];
  };
}

export interface ProviderAdapter {
  id: string;
  capabilities: Capability[];
  submit(request: CapabilityRequest): Promise<Job>;
  getJob(jobId: string): Promise<Job>;
  cancelJob?(jobId: string): Promise<void>;
}
