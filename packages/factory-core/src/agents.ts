export type AgentPermission =
  | "read_project" | "write_code" | "write_assets" | "run_build"
  | "run_tests" | "external_api" | "publish" | "delete";

export interface AgentDefinition {
  id: `A${number}`;
  name: string;
  capabilities: string[];
  permissions: AgentPermission[];
  inputSchema: Record<string, unknown>;
  outputSchema: Record<string, unknown>;
  retryPolicy?: { maxAttempts: number; backoffMs: number };
  approvalRequired?: boolean;
}

export interface AgentTask {
  agentId: AgentDefinition["id"];
  projectId: string;
  input: Record<string, unknown>;
  correlationId: string;
}
