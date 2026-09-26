export type EngineCapability =
  | "project_bootstrap" | "scene_edit" | "code_edit" | "asset_import"
  | "animation" | "physics" | "ui" | "navigation" | "save_system"
  | "multiplayer" | "test" | "build";

export interface EngineAdapter {
  id: string;
  name: string;
  version?: string;
  capabilities: EngineCapability[];
  bootstrap(input: Record<string, unknown>): Promise<EngineResult>;
  execute(operation: EngineOperation): Promise<EngineResult>;
  build(target: string): Promise<EngineResult>;
}

export interface EngineOperation {
  projectId: string;
  capability: EngineCapability;
  payload: Record<string, unknown>;
  approvalToken?: string;
}

export interface EngineResult {
  status: "queued" | "running" | "succeeded" | "failed";
  jobId?: string;
  artifacts?: string[];
  diagnostics?: string[];
}
