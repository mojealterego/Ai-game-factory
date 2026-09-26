import type { Capability, CapabilityRequest, Job, ProviderAdapter } from "./contracts";

export interface ProviderPolicy {
  allowedProviders?: string[];
  deniedProviders?: string[];
  preferredProviders?: string[];
  maxLatencyMs?: number;
  localOnly?: boolean;
}

export class ProviderRouter {
  constructor(private readonly providers: ProviderAdapter[]) {}

  select(request: CapabilityRequest, policy: ProviderPolicy = {}): ProviderAdapter {
    const candidates = this.providers.filter((p) => p.capabilities.includes(request.capability));
    const allowed = policy.allowedProviders
      ? candidates.filter((p) => policy.allowedProviders!.includes(p.id))
      : candidates;
    const denied = allowed.filter((p) => !policy.deniedProviders?.includes(p.id));
    const preferred = policy.preferredProviders ?? request.preferredProviders ?? [];
    const ordered = [...denied].sort((a, b) => {
      const ap = preferred.indexOf(a.id);
      const bp = preferred.indexOf(b.id);
      return (ap < 0 ? 999 : ap) - (bp < 0 ? 999 : bp);
    });
    if (request.localOnly) {
      const local = ordered.find((p) => p.id.startsWith("local:"));
      if (!local) throw new Error("No compatible local provider is registered");
      return local;
    }
    const selected = ordered[0];
    if (!selected) throw new Error(`No provider supports capability: ${request.capability}`);
    return selected;
  }

  submit(request: CapabilityRequest, policy?: ProviderPolicy): Promise<Job> {
    return this.select(request, policy).submit(request);
  }
}
