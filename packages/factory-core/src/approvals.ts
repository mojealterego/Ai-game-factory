export type ApprovalStatus = "pending" | "approved" | "rejected";

export interface ApprovalRequest {
  id: string;
  projectId: string;
  taskId?: string;
  agentId: string;
  action: string;
  status: ApprovalStatus;
  requestedAt: string;
  decidedAt?: string;
  decidedBy?: string;
  reason?: string;
}

export class ApprovalManager {
  private requests = new Map<string, ApprovalRequest>();
  request(input: Omit<ApprovalRequest, "status" | "requestedAt">): ApprovalRequest {
    const r = { ...input, status: "pending" as const, requestedAt: new Date().toISOString() };
    this.requests.set(r.id, r);
    return r;
  }
  decide(id: string, status: "approved" | "rejected", decidedBy: string, reason?: string): ApprovalRequest {
    const current = this.requests.get(id);
    if (!current) throw new Error("Unknown approval: " + id);
    const next = { ...current, status, decidedBy, reason, decidedAt: new Date().toISOString() };
    this.requests.set(id, next);
    return next;
  }
  get(id: string): ApprovalRequest | undefined { return this.requests.get(id); }
  list(projectId?: string): ApprovalRequest[] { return [...this.requests.values()].filter(r => !projectId || r.projectId === projectId); }
}
