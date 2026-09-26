import type { AudioProviderAdapter } from "../../factory-core/src/audio";

/**
 * ElevenLabs provider contract.
 * API keys are referenced by secret-manager IDs and never stored in jobs.
 */
export const ELEVENLABS_PROVIDER_ID = "elevenlabs";

export const ELEVENLABS_CAPABILITIES: AudioProviderAdapter["capabilities"] = [
  "voice_generation",
  "dubbing",
  "multilingual_voice",
];

export interface ElevenLabsProviderConfig {
  apiBaseUrl?: "https://api.elevenlabs.io";
  apiKeySecretRef: string;
  defaultTtsModel?: string;
  defaultDubbingModel?: "dubbing_v1" | "dubbing_v2";
}

export function createElevenLabsAdapter(
  config: ElevenLabsProviderConfig,
  transport: {
    submit: (request: Record<string, unknown>) => Promise<Record<string, unknown>>;
    getJob: (jobId: string) => Promise<Record<string, unknown>>;
    cancelJob?: (jobId: string) => Promise<void>;
  },
): AudioProviderAdapter {
  return {
    id: ELEVENLABS_PROVIDER_ID,
    capabilities: ELEVENLABS_CAPABILITIES,
    async submit(job) {
      return (await transport.submit({
        provider: "elevenlabs",
        secretRef: config.apiKeySecretRef,
        ttsModel: config.defaultTtsModel ?? "eleven_multilingual_v2",
        dubbingModel: config.defaultDubbingModel ?? "dubbing_v2",
        job,
      })) as never;
    },
    async getJob(jobId) {
      return (await transport.getJob(jobId)) as never;
    },
    async cancelJob(jobId) {
      await transport.cancelJob?.(jobId);
    },
  };
}
