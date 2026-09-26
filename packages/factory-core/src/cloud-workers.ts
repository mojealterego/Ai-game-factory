import type { Job, CapabilityRequest } from "./contracts";

export type WorkerKind = "agent" | "asset" | "code" | "build" | "qa" | "generic";

export interface CloudWorkerRequest {
  projectId: string;
  kind: WorkerKind;
  capability: string;
  input: Record<string, unknown>;
  idempotencyKey: string;
  priority?: number;
}

export interface CloudWorker {
  id: string;
  kinds: WorkerKind[];
  submit(request: CloudWorkerRequest): Promise<Job>;
  getJob(jobId: string): Promise<Job>;
  cancel?(jobId: string): Promise<void>;
}

export interface WorkerHttpTransport {
  request<T>(method: "POST" | "GET" | "DELETE", path: string, body?: unknown): Promise<T>;
}

export class HttpCloudWorker implements CloudWorker {
  constructor(
    readonly id: string,
    private readonly transport: WorkerHttpTransport,
    readonly kinds: WorkerKind[]
  ) {}

  submit(request: CloudWorkerRequest): Promise<Job> {
    return this.transport.request<Job>("POST", "/v1/jobs", request);
  }

  getJob(jobId: string): Promise<Job> {
    return this.transport.request<Job>("GET", "/v1/jobs/" + encodeURIComponent(jobId));
  }

  cancel(jobId: string): Promise<void> {
    return this.transport.request<void>("DELETE", "/v1/jobs/" + encodeURIComponent(jobId));
  }
}

export class FetchWorkerTransport implements WorkerHttpTransport {
  constructor(private readonly baseUrl: string, private readonly token?: string) {
    if (!baseUrl.trim()) throw new Error("WORKER_BASE_URL_REQUIRED");
  }

  async request<T>(method: "POST" | "GET" | "DELETE", path: string, body?: unknown): Promise<T> {
    const response = await fetch(new URL(path, this.baseUrl), {
      method,
      headers: {
        "content-type": "application/json",
        ...(this.token ? { authorization: "Bearer " + this.token } : {})
      },
      body: body === undefined ? undefined : JSON.stringify(body)
    });
    const text = await response.text();
    if (!response.ok) throw new Error("WORKER_HTTP_" + response.status + ":" + text.slice(0, 500));
    return (text ? JSON.parse(text) : undefined) as T;
  }
}

export function toWorkerRequest(request: CapabilityRequest, kind: WorkerKind, input: Record<string, unknown>, idempotencyKey: string): CloudWorkerRequest {
  return { projectId: request.projectId, kind, capability: request.capability, input, idempotencyKey };
}
