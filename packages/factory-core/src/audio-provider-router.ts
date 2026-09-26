import type { AudioJob, AudioProviderAdapter, AudioRoutingPolicy } from "./audio";

export class AudioProviderRouter {
  constructor(private readonly providers: AudioProviderAdapter[]) {}

  select(
    capability: AudioProviderAdapter["capabilities"][number],
    policy: AudioRoutingPolicy = {},
  ): AudioProviderAdapter {
    const candidates = this.providers
      .filter(provider => provider.capabilities.includes(capability))
      .filter(provider => !policy.deniedProviders?.includes(provider.id))
      .filter(provider => !policy.allowedProviders || policy.allowedProviders.includes(provider.id));

    const preference = policy.preferredProviders ?? [];
    const ordered = [...candidates].sort((a, b) => {
      const ai = preference.indexOf(a.id);
      const bi = preference.indexOf(b.id);
      return (ai < 0 ? 999 : ai) - (bi < 0 ? 999 : bi);
    });

    const selected = ordered[0];
    if (!selected) throw new Error("No audio provider supports capability: " + capability);
    return selected;
  }

  submit(
    job: AudioJob,
    capability: AudioProviderAdapter["capabilities"][number],
    policy?: AudioRoutingPolicy,
  ) {
    return this.select(capability, policy).submit(job);
  }
}
