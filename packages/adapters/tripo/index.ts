import type {
  ThreeDAssetFactorySpec, ThreeDFactoryInputMode, ThreeDFactoryStage
} from "../../factory-core/src/three-d-asset-factory";

export const TRIPO_API_V3_BASE_URL = "https://openapi.tripo3d.ai/v3";

export type TripoOperation =
  | "text_to_model" | "image_to_model" | "multiview_to_model"
  | "texture" | "segment" | "complete" | "decimate"
  | "rig_check" | "rig" | "retarget" | "convert";

export interface TripoTask {
  taskId: string;
  status: "queued" | "running" | "success" | "failed" | "cancelled";
  progress?: number;
  output?: Record<string, unknown>;
  error?: string;
}

export interface TripoTransport {
  create(operation: TripoOperation, input: Record<string, unknown>): Promise<{ taskId: string }>;
  getTask(taskId: string): Promise<TripoTask>;
}

export interface TripoAdapter {
  createGeneration(spec: ThreeDAssetFactorySpec): Promise<{ taskId: string; operation: TripoOperation }>;
  operationForInput(mode: ThreeDFactoryInputMode): TripoOperation;
  operationForStage(stage: ThreeDFactoryStage): TripoOperation | undefined;
  poll(taskId: string): Promise<TripoTask>;
}

export const TRIPO_OPERATION_MAP: Partial<Record<ThreeDFactoryStage, TripoOperation>> = {
  generation: "text_to_model",
  smart_mesh: "complete",
  segmentation: "segment",
  retopology: "decimate",
  ai_texture: "texture",
  auto_rig: "rig",
  animation: "retarget"
};

export function createTripoAdapter(transport: TripoTransport): TripoAdapter {
  return {
    operationForInput(mode) {
      if (mode === "text" || mode === "concept") return "text_to_model";
      if (mode === "image") return "image_to_model";
      return "multiview_to_model";
    },
    operationForStage(stage) {
      return TRIPO_OPERATION_MAP[stage];
    },
    async createGeneration(spec) {
      const operation = this.operationForInput(spec.input.mode);
      const input: Record<string, unknown> = {};
      if (spec.input.prompt) input.prompt = spec.input.prompt;
      if (spec.input.references?.length) input.references = spec.input.references;
      if (spec.quality?.polygonBudget) input.face_limit = spec.quality.polygonBudget;
      if (spec.quality?.detail === "high" || spec.quality?.detail === "ultra") input.geometry_quality = "detailed";
      input.texture = true;
      input.pbr = true;
      const result = await transport.create(operation, input);
      return { taskId: result.taskId, operation };
    },
    poll: taskId => transport.getTask(taskId)
  };
}
