import type { AgentTask } from "./agents";
import { ApprovalManager } from "./approvals";
import { EvidenceLog } from "./evidence-log";
import { HandoffManager } from "./handoff";
import { PermissionManager } from "./permissions";
import { TaskQueue } from "./task-queue";

export class FactoryOrchestrator {
  constructor(
    readonly queue = new TaskQueue(),
    readonly permissions = new PermissionManager(),
    readonly approvals = new ApprovalManager(),
    readonly evidence = new EvidenceLog(),
    readonly handoffs = new HandoffManager()
  ) {}

  submit(task: AgentTask & { id?: string; type?: string; priority?: number; dependencies?: string[] }): string {
    const id = task.id ?? crypto.randomUUID();
    this.queue.enqueue({
      id, projectId: task.projectId, type: task.type ?? "agent-task",
      priority: task.priority ?? 0, payload: task.input, dependencies: task.dependencies ?? [],
      agentId: task.agentId, maxAttempts: 3
    });
    this.evidence.append({
      id: crypto.randomUUID(), projectId: task.projectId, level: "info",
      source: "FactoryOrchestrator", action: "task.enqueued",
      message: "Task " + id + " queued for " + task.agentId, correlationId: task.correlationId
    });
    return id;
  }

  retry(taskId: string): void { this.queue.update(taskId, { status: "queued", error: undefined }); }
  pause(taskId: string): void { this.queue.pause(taskId); }
  resume(taskId: string): void { this.queue.resume(taskId); }
}
