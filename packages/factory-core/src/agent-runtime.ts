import type { NoCodeAgentDefinition, AgentRunState, AgentGraphNode } from "./no-code-agent-builder";
import { appendAgentLog, createAgentRun, recordAgentEvidence, validateAgentGraph } from "./no-code-agent-builder";

export interface AgentRuntimeContext {
  projectId: string;
  inputs: Record<string, unknown>;
  memory: Record<string, unknown>;
  artifacts: string[];
}

export interface AgentNodeExecutor {
  execute(node: AgentGraphNode, context: AgentRuntimeContext): Promise<Record<string, unknown>>;
}

export interface AgentRuntimeResult {
  run: AgentRunState;
  outputs: Record<string, unknown>;
  artifacts: string[];
}

export class AgentOSRuntime {
  constructor(private readonly executors: Record<string, AgentNodeExecutor> = {}) {}

  async run(definition: NoCodeAgentDefinition, runId: string, context: AgentRuntimeContext): Promise<AgentRuntimeResult> {
    const validation = validateAgentGraph(definition);
    if (!validation.valid) throw new Error("AGENT_GRAPH_INVALID:" + validation.issues.filter(i => i.severity === "error").map(i => i.code).join(","));
    let run = createAgentRun(definition, runId);
    run = { ...run, status: "running", startedAt: new Date().toISOString(), currentNodeId: definition.graph.entryNodeId };
    const values: Record<string, unknown> = { ...context.inputs };
    let current = definition.graph.entryNodeId;
    const visited = new Set<string>();

    while (current) {
      if (visited.has(current)) throw new Error("AGENT_GRAPH_CYCLE:" + current);
      visited.add(current);
      const node = definition.graph.nodes.find(n => n.id === current);
      if (!node || !node.enabled) throw new Error("AGENT_NODE_UNAVAILABLE:" + current);
      run = appendAgentLog(run, { timestamp: new Date().toISOString(), level: "info", runId, nodeId: current, message: "Executing agent node." });
      run = recordAgentEvidence(run, { id: crypto.randomUUID(), runId, nodeId: current, type: "input", timestamp: new Date().toISOString(), summary: node.name });
      if (node.kind === "output") break;

      const executor = this.executors[node.kind];
      if (!executor) throw new Error("NO_AGENT_NODE_EXECUTOR:" + node.kind);
      const result = await executor.execute(node, { ...context, inputs: values, artifacts: [...context.artifacts] });
      Object.assign(values, result);
      run = recordAgentEvidence(run, { id: crypto.randomUUID(), runId, nodeId: current, type: "output", timestamp: new Date().toISOString(), summary: "Node completed." });

      const edges = definition.graph.edges.filter(e => e.from === current);
      if (!edges.length) break;
      const chosen = edges.find(e => !e.condition || evaluateCondition(e.condition, values));
      if (!chosen) throw new Error("NO_AGENT_ROUTE:" + current);
      current = chosen.to;
      run = { ...run, currentNodeId: current };
    }

    run = { ...run, status: "succeeded", completedAt: new Date().toISOString(), checkpoint: values };
    return { run, outputs: values, artifacts: context.artifacts };
  }
}

function evaluateCondition(expression: string, values: Record<string, unknown>): boolean {
  const match = expression.match(/^([A-Za-z0-9_.-]+)\\s*(===|==|!==|!=|truthy)\\s*(.*)$/);
  if (!match) return false;
  const actual = values[match[1]];
  const expected = match[3]?.replace(/^['"]|['"]$/g, "");
  if (match[2] === "truthy") return Boolean(actual);
  if (match[2] === "===" || match[2] === "==") return String(actual) === expected;
  return String(actual) !== expected;
}
