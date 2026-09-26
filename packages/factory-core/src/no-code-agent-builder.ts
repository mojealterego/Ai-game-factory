export type AgentNodeKind = "trigger" | "agent" | "model" | "tool" | "condition" | "output" | "memory" | "approval";
export type AgentRunStatus = "draft" | "validating" | "ready" | "running" | "paused" | "waiting_approval" | "succeeded" | "failed" | "cancelled";
export type DeploymentStatus = "draft" | "validated" | "deployed" | "paused" | "retired";
export type RetryStrategy = "none" | "fixed" | "exponential";
export type ApprovalMode = "none" | "before_deploy" | "before_node" | "on_failure";

export interface AgentGraphNode {
  id: string;
  kind: AgentNodeKind;
  name: string;
  config: Record<string, unknown>;
  permissions: string[];
  enabled: boolean;
}

export interface AgentGraphEdge {
  id: string;
  from: string;
  to: string;
  condition?: string;
  label?: string;
}

export interface AgentGraph {
  nodes: AgentGraphNode[];
  edges: AgentGraphEdge[];
  entryNodeId: string;
  outputNodeIds: string[];
}

export interface AgentInput {
  name: string;
  type: string;
  required: boolean;
  description?: string;
  defaultValue?: unknown;
}

export interface AgentOutput {
  name: string;
  type: string;
  description?: string;
}

export interface AgentMemoryPolicy {
  enabled: boolean;
  scope: "run" | "agent" | "project" | "global";
  read: boolean;
  write: boolean;
  retention?: string;
}

export interface AgentRetryPolicy {
  strategy: RetryStrategy;
  maxAttempts: number;
  delayMs: number;
  maxDelayMs?: number;
}

export interface AgentApprovalPolicy {
  mode: ApprovalMode;
  requiredPermissions?: string[];
  timeoutMs?: number;
}

export interface AgentDeployment {
  environment: "draft" | "staging" | "production";
  status: DeploymentStatus;
  endpoint?: string;
  deployedVersion?: string;
}

export interface AgentLogEntry {
  timestamp: string;
  level: "debug" | "info" | "warn" | "error";
  runId: string;
  nodeId?: string;
  message: string;
  data?: Record<string, unknown>;
}

export interface AgentEvidence {
  id: string;
  runId: string;
  nodeId?: string;
  type: "input" | "output" | "tool_call" | "model_call" | "approval" | "condition" | "error" | "artifact";
  timestamp: string;
  hash?: string;
  uri?: string;
  summary: string;
}

export interface AgentVersion {
  version: string;
  createdAt: string;
  createdBy: string;
  graph: AgentGraph;
  inputs: AgentInput[];
  outputs: AgentOutput[];
  memory: AgentMemoryPolicy;
  retry: AgentRetryPolicy;
  approvals: AgentApprovalPolicy;
  permissions: string[];
  tools: string[];
  models: string[];
  changelog?: string;
}

export interface NoCodeAgentDefinition {
  id: string;
  name: string;
  description?: string;
  graph: AgentGraph;
  inputs: AgentInput[];
  outputs: AgentOutput[];
  permissions: string[];
  tools: string[];
  models: string[];
  memory: AgentMemoryPolicy;
  retry: AgentRetryPolicy;
  approvals: AgentApprovalPolicy;
  deployment: AgentDeployment;
  versions: AgentVersion[];
}

export interface AgentRunState {
  runId: string;
  agentId: string;
  version: string;
  status: AgentRunStatus;
  currentNodeId?: string;
  startedAt?: string;
  pausedAt?: string;
  resumedAt?: string;
  completedAt?: string;
  attempts: Record<string, number>;
  logs: AgentLogEntry[];
  evidence: AgentEvidence[];
  checkpoint?: Record<string, unknown>;
  error?: string;
}

export interface AgentValidationIssue {
  severity: "error" | "warning";
  code: string;
  message: string;
  nodeId?: string;
}

export interface AgentValidationResult {
  valid: boolean;
  issues: AgentValidationIssue[];
}

export function validateAgentGraph(definition: NoCodeAgentDefinition): AgentValidationResult {
  const issues: AgentValidationIssue[] = [];
  const { graph } = definition;
  const ids = new Set(graph.nodes.map((n) => n.id));
  if (!graph.nodes.length) issues.push({ severity: "error", code: "EMPTY_GRAPH", message: "Agent graph has no nodes." });
  if (!ids.has(graph.entryNodeId)) issues.push({ severity: "error", code: "INVALID_ENTRY", message: "Entry node does not exist." });
  for (const id of graph.outputNodeIds) if (!ids.has(id)) issues.push({ severity: "error", code: "INVALID_OUTPUT", message: `Output node ${id} does not exist.` });
  for (const edge of graph.edges) {
    if (!ids.has(edge.from) || !ids.has(edge.to)) issues.push({ severity: "error", code: "INVALID_EDGE", message: `Edge ${edge.id} references an unknown node.` });
  }
  const kinds = new Set(graph.nodes.map((n) => n.kind));
  if (!kinds.has("trigger")) issues.push({ severity: "error", code: "MISSING_TRIGGER", message: "Graph requires a trigger node." });
  if (!kinds.has("output")) issues.push({ severity: "error", code: "MISSING_OUTPUT", message: "Graph requires an output node." });
  for (const node of graph.nodes) {
    if (!node.name.trim()) issues.push({ severity: "error", code: "EMPTY_NODE_NAME", message: "Node name cannot be empty.", nodeId: node.id });
    if (!node.permissions.length && node.kind === "tool") issues.push({ severity: "warning", code: "TOOL_WITHOUT_PERMISSIONS", message: "Tool node has no explicit permissions.", nodeId: node.id });
  }
  if (definition.retry.maxAttempts < 1 || definition.retry.maxAttempts > 5)
    issues.push({ severity: "error", code: "INVALID_RETRY_LIMIT", message: "Retry maxAttempts must be between 1 and 5." });
  return { valid: !issues.some((i) => i.severity === "error"), issues };
}

export function createAgentRun(definition: NoCodeAgentDefinition, runId: string, version = definition.versions.at(-1)?.version ?? "0.1.0"): AgentRunState {
  return { runId, agentId: definition.id, version, status: "ready", attempts: {}, logs: [], evidence: [] };
}

export function pauseAgentRun(run: AgentRunState): AgentRunState {
  if (run.status !== "running" && run.status !== "waiting_approval") return run;
  return { ...run, status: "paused", pausedAt: new Date().toISOString() };
}

export function resumeAgentRun(run: AgentRunState): AgentRunState {
  if (run.status !== "paused") return run;
  return { ...run, status: "running", resumedAt: new Date().toISOString() };
}

export function nextRetryDelay(policy: AgentRetryPolicy, attempt: number): number {
  if (policy.strategy === "none") return 0;
  const raw = policy.strategy === "fixed" ? policy.delayMs : policy.delayMs * 2 ** Math.max(0, attempt - 1);
  return Math.min(raw, policy.maxDelayMs ?? raw);
}

export function createAgentVersion(definition: NoCodeAgentDefinition, version: string, createdBy: string, changelog?: string): AgentVersion {
  return {
    version, createdAt: new Date().toISOString(), createdBy, graph: structuredClone(definition.graph),
    inputs: structuredClone(definition.inputs), outputs: structuredClone(definition.outputs),
    memory: structuredClone(definition.memory), retry: structuredClone(definition.retry),
    approvals: structuredClone(definition.approvals), permissions: [...definition.permissions],
    tools: [...definition.tools], models: [...definition.models], changelog
  };
}

export function recordAgentEvidence(run: AgentRunState, evidence: AgentEvidence): AgentRunState {
  return { ...run, evidence: [...run.evidence, evidence] };
}

export function appendAgentLog(run: AgentRunState, entry: AgentLogEntry): AgentRunState {
  return { ...run, logs: [...run.logs, entry] };
}
