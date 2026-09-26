import type { BuildCenterTarget } from "./build-center";
import type { ModelRouteRequest } from "./model-factory";
import type { QACheck } from "./qa";

export type ControlCenterSubsystem =
  | "factory-api" | "agent-runtime" | "project-workspace" | "cloud-workers" | "model-registry" | "build-farm";

export type FactoryCommand =
  | "create_game" | "generate_game_dna" | "run_agents" | "generate_assets"
  | "generate_code" | "build_project" | "run_qa" | "deliver_artifact";

export interface FactoryApiEndpoint {
  id: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  authenticated: boolean;
  projectScoped: boolean;
  description: string;
}

export interface AndroidControlSession {
  sessionId: string;
  projectId: string;
  userId: string;
  deviceId?: string;
  connectedAt: string;
  lastSeenAt: string;
  capabilities: string[];
}

export interface AgentRuntimeHandle {
  runtimeId: string;
  projectId: string;
  status: "idle" | "running" | "paused" | "failed";
  activeAgentIds: string[];
}

export interface ProjectWorkspaceHandle {
  workspaceId: string;
  projectId: string;
  uri?: string;
  branch?: string;
  dirty: boolean;
}

export interface CloudWorkerHandle {
  workerId: string;
  projectId: string;
  kind: "agent" | "asset" | "code" | "build" | "qa" | "generic";
  status: "queued" | "running" | "succeeded" | "failed" | "paused";
  jobId: string;
}

export interface ModelRegistryHandle {
  projectId: string;
  modelIds: string[];
  route?: ModelRouteRequest;
}

export interface BuildFarmHandle {
  projectId: string;
  buildId: string;
  target: BuildCenterTarget;
  status: "queued" | "running" | "succeeded" | "failed";
  artifactUri?: string;
  artifactSha256?: string;
}

export interface AndroidFactoryStatus {
  session: AndroidControlSession;
  subsystems: Record<ControlCenterSubsystem, "offline" | "ready" | "busy" | "error">;
  activeProjectId: string;
  pipeline: FactoryPipelineState;
}

export interface FactoryPipelineState {
  projectId: string;
  gameIdea?: string;
  gameDnaStatus: "not_started" | "generating" | "ready" | "invalid";
  agentStatus: "idle" | "running" | "paused" | "completed" | "failed";
  assetStatus: "idle" | "running" | "completed" | "failed";
  codeStatus: "idle" | "running" | "completed" | "failed";
  buildStatus: "idle" | "queued" | "running" | "completed" | "failed";
  qaStatus: "idle" | "running" | "passed" | "blocked" | "failed";
  artifact?: { target: BuildCenterTarget; uri: string; sha256: string; sizeBytes: number };
}

export interface CreateGameRequest {
  projectId: string;
  gameIdea: string;
  builderId?: string;
  engineId?: string;
  platforms?: string[];
}

export interface FactoryCommandRequest {
  projectId: string;
  command: FactoryCommand;
  payload: Record<string, unknown>;
  idempotencyKey: string;
}

export interface FactoryCommandResult {
  commandId: string;
  projectId: string;
  command: FactoryCommand;
  status: "accepted" | "queued" | "running" | "succeeded" | "failed";
  jobIds: string[];
  evidenceIds: string[];
  artifact?: FactoryPipelineState["artifact"];
  error?: string;
}

export const ANDROID_FACTORY_API: readonly FactoryApiEndpoint[] = [
  {id:"projects.create",method:"POST",path:"/v1/projects",authenticated:true,projectScoped:false,description:"Create project workspace."},
  {id:"games.create",method:"POST",path:"/v1/projects/:projectId/game",authenticated:true,projectScoped:true,description:"Start game creation pipeline."},
  {id:"dna.generate",method:"POST",path:"/v1/projects/:projectId/dna/generate",authenticated:true,projectScoped:true,description:"Generate and validate Game DNA."},
  {id:"agents.run",method:"POST",path:"/v1/projects/:projectId/agents/run",authenticated:true,projectScoped:true,description:"Start agent runtime jobs."},
  {id:"assets.generate",method:"POST",path:"/v1/projects/:projectId/assets/generate",authenticated:true,projectScoped:true,description:"Dispatch asset generation workers."},
  {id:"code.generate",method:"POST",path:"/v1/projects/:projectId/code/generate",authenticated:true,projectScoped:true,description:"Dispatch code/project generation."},
  {id:"builds.create",method:"POST",path:"/v1/projects/:projectId/builds",authenticated:true,projectScoped:true,description:"Submit build to Build Farm."},
  {id:"qa.run",method:"POST",path:"/v1/projects/:projectId/qa",authenticated:true,projectScoped:true,description:"Run QA gates."},
  {id:"artifacts.get",method:"GET",path:"/v1/projects/:projectId/artifacts/:artifactId",authenticated:true,projectScoped:true,description:"Retrieve verified artifact metadata."},
  {id:"pipeline.get",method:"GET",path:"/v1/projects/:projectId/pipeline",authenticated:true,projectScoped:true,description:"Read factory pipeline state."}
];

export function createAndroidControlSession(projectId: string, userId: string, deviceId?: string): AndroidControlSession {
  const now = new Date().toISOString();
  return {sessionId: crypto.randomUUID(),projectId,userId,deviceId,connectedAt:now,lastSeenAt:now,capabilities:["factory_control","project_workspace","agent_runtime","cloud_workers","model_registry","build_farm"]};
}

export function createGamePipeline(projectId: string, gameIdea: string): FactoryPipelineState {
  if (!gameIdea.trim()) throw new Error("gameIdea is required");
  return {projectId,gameIdea,gameDnaStatus:"not_started",agentStatus:"idle",assetStatus:"idle",codeStatus:"idle",buildStatus:"idle",qaStatus:"idle"};
}

export function canDeliverArtifact(state: FactoryPipelineState): boolean {
  return state.buildStatus === "completed" && state.qaStatus === "passed" && Boolean(state.artifact?.uri && state.artifact?.sha256 && state.artifact.sizeBytes > 0);
}

export function createBuildFarmRequest(projectId: string, target: BuildCenterTarget): FactoryCommandRequest {
  return {projectId,command:"build_project",payload:{target},idempotencyKey:crypto.randomUUID()};
}

export function requiredQAGatesForRelease(): readonly QACheck[] {
  return ["static_analysis","code_validation","asset_validation","dependency_checks","performance","memory","crashes","gameplay_tests","narrative_consistency","continuity","localization","accessibility","security","license_ip","device_testing","regression_tests"];
}
