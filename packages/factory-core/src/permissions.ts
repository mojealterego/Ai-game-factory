import type { AgentPermission } from "./agents";

export interface PermissionPolicy {
  agentId: string;
  allow: AgentPermission[];
  deny?: AgentPermission[];
  requiresApproval?: AgentPermission[];
}

export class PermissionManager {
  private policies = new Map<string, PermissionPolicy>();
  setPolicy(policy: PermissionPolicy): void { this.policies.set(policy.agentId, policy); }
  can(agentId: string, permission: AgentPermission): boolean {
    const p = this.policies.get(agentId);
    return !!p && !p.deny?.includes(permission) && p.allow.includes(permission);
  }
  requiresApproval(agentId: string, permission: AgentPermission): boolean {
    return this.policies.get(agentId)?.requiresApproval?.includes(permission) ?? false;
  }
}
