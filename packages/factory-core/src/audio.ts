import type { Job } from "./contracts";

export type AudioAssetKind =
  | "music" | "soundtrack" | "ambient" | "sfx" | "footsteps"
  | "ui_sounds" | "cinematic_sound" | "voice" | "dub" | "lip_sync";

export type AudioStage =
  | "brief" | "reference" | "generation" | "variation" | "selection"
  | "editing" | "mix" | "dialogue_timing" | "localization" | "lip_sync"
  | "mastering" | "metadata" | "validation" | "engine_export";

export const AUDIO_DUBBING_PIPELINE: readonly AudioStage[] = [
  "brief","reference","generation","variation","selection","editing","mix",
  "dialogue_timing","localization","lip_sync","mastering","metadata",
  "validation","engine_export",
] as const;

export interface DialogueLine {
  id: string;
  characterId: string;
  text: string;
  startMs?: number;
  endMs?: number;
  language?: string;
  voiceId?: string;
  emotion?: string;
  pronunciationHints?: string[];
}

export interface AudioSpec {
  id: string;
  projectId: string;
  kind: AudioAssetKind;
  prompt?: string;
  references?: string[];
  targetLanguage?: string;
  targetLanguages?: string[];
  sampleRate?: number;
  channels?: number;
  durationMs?: number;
  dialogue?: DialogueLine[];
  targetEngine?: string;
  targetPlatform?: string;
  providerPreferences?: string[];
  license?: string;
  metadata?: Record<string, unknown>;
}

export interface AudioArtifact {
  id: string;
  audioId: string;
  stage: AudioStage;
  uri: string;
  mimeType?: string;
  sha256?: string;
  durationMs?: number;
  sampleRate?: number;
  channels?: number;
  language?: string;
  speakerId?: string;
  voiceId?: string;
  provider?: string;
  model?: string;
  metadata: Record<string, unknown>;
}

export interface AudioStageRecord {
  stage: AudioStage;
  status: "pending" | "queued" | "running" | "succeeded" | "failed" | "skipped";
  inputArtifactIds: string[];
  outputArtifactIds: string[];
  provider?: string;
  model?: string;
  evidence?: string[];
  error?: string;
}

export interface AudioJob {
  id: string;
  spec: AudioSpec;
  status: "queued" | "running" | "succeeded" | "failed" | "cancelled";
  currentStage: AudioStage;
  stages: AudioStageRecord[];
  artifacts: AudioArtifact[];
  createdAt: string;
  updatedAt: string;
}

export interface AudioProviderAdapter {
  id: string;
  capabilities: Array<
    | "music" | "soundtrack" | "ambient" | "sfx" | "footsteps"
    | "ui_sounds" | "cinematic_sound" | "voice_generation"
    | "dubbing" | "lip_sync" | "dialogue_timing" | "multilingual_voice"
  >;
  submit(job: AudioJob): Promise<Job>;
  getJob(jobId: string): Promise<Job>;
  cancelJob?(jobId: string): Promise<void>;
}

export interface AudioRoutingPolicy {
  allowedProviders?: string[];
  deniedProviders?: string[];
  preferredProviders?: string[];
  fallbackProviders?: string[];
  maxLatencyMs?: number;
  maxCost?: number;
  requiredLanguages?: string[];
  requireCommercialUse?: boolean;
  requireLipSync?: boolean;
}

export interface AudioValidationResult {
  passed: boolean;
  checks: {
    timing: boolean;
    language: boolean;
    loudness: boolean;
    clipping: boolean;
    sampleRate: boolean;
    channels: boolean;
    voiceContinuity: boolean;
    lipSync?: boolean;
    provenance: boolean;
  };
  warnings: string[];
  errors: string[];
}
