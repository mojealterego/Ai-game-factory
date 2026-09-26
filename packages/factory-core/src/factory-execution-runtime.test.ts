import { FactoryExecutionRuntime } from "./factory-execution-runtime";
import type { ProviderAdapter } from "./contracts";
import type { EngineAdapter } from "./engine-adapter";

const assert = (v: boolean, m: string) => { if (!v) throw new Error(m); };

export async function runFactoryExecutionRuntimeTests(): Promise<void> {
  const provider: ProviderAdapter = {
    id: "test-provider",
    capabilities: ["code", "image"],
    async submit(request) { return { id: "job-1", projectId: request.projectId, capability: request.capability, providerId: "test-provider", status: "queued", progress: 0, input: {} , createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }; },
    async getJob(jobId) { return { id: jobId, projectId: "p", capability: "code", providerId: "test-provider", status: "succeeded", progress: 100, input: {}, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }; }
  };
  const engine: EngineAdapter = {
    id: "godot", name: "Godot", capabilities: ["project_bootstrap","build"],
    async bootstrap() { return { status: "queued", jobId: "bootstrap-1" }; },
    async execute() { return { status: "queued", jobId: "engine-1" }; },
    async build() { return { status: "queued", jobId: "build-1" }; }
  };
  const runtime = new FactoryExecutionRuntime({ providers: [provider], engines: [engine] });
  const result = await runtime.execute({ projectId: "p", gameIdea: "test game", engine: "godot" });
  assert(result.jobs.length === 2, "runtime must dispatch code and asset jobs");
  assert(result.engineResults.length === 1, "runtime must bootstrap the selected engine");
  assert(result.project.stages.find(s => s.stage === "code")?.status === "succeeded", "code stage must be advanced");
}
runFactoryExecutionRuntimeTests();
