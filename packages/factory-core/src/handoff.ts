export interface AgentHandoff {
  id: string;
  projectId: string;
  fromAgentId: string;
  toAgentId: string;
  taskId: string;
  context: Record<string, unknown>;
  artifacts: string[];
  acceptanceCriteria: string[];
  createdAt: string;
}

export class HandoffManager {
  private handoffs: AgentHandoff[] = [];
  transfer(input: Omit<AgentHandoff, "createdAt">): AgentHandoff {
    const h = { ...input, createdAt: new Date().toISOString() };
    this.handoffs.push(h);
    return h;
  }
  list(projectId: string): AgentHandoff[] { return this.handoffs.filter(h => h.projectId === projectId); }
}
