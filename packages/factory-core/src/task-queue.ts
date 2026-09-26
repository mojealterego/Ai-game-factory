export type TaskStatus = "queued" | "running" | "succeeded" | "failed" | "paused" | "cancelled";

export interface FactoryTask {
  id: string;
  projectId: string;
  type: string;
  priority: number;
  payload: Record<string, unknown>;
  dependencies: string[];
  agentId?: string;
  status: TaskStatus;
  attempts: number;
  maxAttempts: number;
  createdAt: string;
  updatedAt: string;
  error?: string;
  output?: Record<string, unknown>;
}

export class TaskQueue {
  private tasks = new Map<string, FactoryTask>();

  enqueue(task: Omit<FactoryTask, "status" | "attempts" | "createdAt" | "updatedAt">): FactoryTask {
    const now = new Date().toISOString();
    const item: FactoryTask = { ...task, status: "queued", attempts: 0, createdAt: now, updatedAt: now };
    this.tasks.set(item.id, item);
    return item;
  }

  next(projectId?: string): FactoryTask | undefined {
    return [...this.tasks.values()]
      .filter(t => t.status === "queued" && (!projectId || t.projectId === projectId))
      .filter(t => t.dependencies.every(id => this.tasks.get(id)?.status === "succeeded"))
      .sort((a, b) => b.priority - a.priority || a.createdAt.localeCompare(b.createdAt))[0];
  }

  update(id: string, patch: Partial<FactoryTask>): FactoryTask {
    const task = this.tasks.get(id);
    if (!task) throw new Error("Unknown task: " + id);
    const next = { ...task, ...patch, updatedAt: new Date().toISOString() };
    this.tasks.set(id, next);
    return next;
  }

  pause(id: string): FactoryTask { return this.update(id, { status: "paused" }); }
  resume(id: string): FactoryTask { return this.update(id, { status: "queued", error: undefined }); }
  cancel(id: string): FactoryTask { return this.update(id, { status: "cancelled" }); }
  list(projectId?: string): FactoryTask[] { return [...this.tasks.values()].filter(t => !projectId || t.projectId === projectId); }
}
