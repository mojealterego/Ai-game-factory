import type { EngineAdapter, EngineCapability, EngineOperation, EngineResult } from "./engine-adapter";

export const RENPY_ENGINE_ID = "renpy" as const;
export const RENPY_CAPABILITIES: EngineCapability[] = ["project_bootstrap","scene_edit","code_edit","asset_import","animation","ui","save_system","test","build"];

export interface RenPyProjectInput { projectId: string; title: string; packageName?: string; script?: string; language?: string; resolution?: { width: number; height: number }; }
export interface RenPyProjectFile { path: string; content: string; }

const safeName = (value: string) => value.trim().replace(/[^a-zA-Z0-9._-]+/g, "_").replace(/^\.+|\.+$/g, "") || "game";

export function createRenPyProjectFiles(input: RenPyProjectInput): RenPyProjectFile[] {
  const title = input.title.trim();
  if (!title) throw new Error("Ren'Py project title is required.");
  const width = input.resolution?.width ?? 1920;
  const height = input.resolution?.height ?? 1080;
  if (width <= 0 || height <= 0) throw new Error("Ren'Py resolution must be positive.");
  const script = input.script?.trim() || ("label start:\n    \"Welcome to " + title + ".\"\n    return\n");
  const packageName = safeName(input.packageName || title).toLowerCase();
  return [
    { path: "game/script.rpy", content: script.endsWith("\n") ? script : script + "\n" },
    { path: "game/options.rpy", content: "define config.name = " + JSON.stringify(title) + "\ndefine config.version = \"0.1.0\"\ndefine config.screen_width = " + width + "\ndefine config.screen_height = " + height + "\ndefine build.name = " + JSON.stringify(packageName) + "\n" },
    { path: "factory/ai-game-factory.json", content: JSON.stringify({ engine: RENPY_ENGINE_ID, projectId: input.projectId, language: input.language || "pl", generatedBy: "AI GAME FACTORY" }, null, 2) + "\n" },
  ];
}

export function validateRenPyProjectFiles(files: RenPyProjectFile[]): string[] {
  const errors: string[] = [];
  if (!files.some((file) => file.path === "game/script.rpy")) errors.push("Ren'Py project requires game/script.rpy.");
  if (!files.some((file) => file.path === "game/options.rpy")) errors.push("Ren'Py project requires game/options.rpy.");
  return errors;
}

export class RenPyEngineAdapter implements EngineAdapter {
  readonly id = RENPY_ENGINE_ID;
  readonly name = "Ren'Py";
  readonly capabilities = RENPY_CAPABILITIES;
  constructor(readonly version?: string) {}
  async bootstrap(input: Record<string, unknown>): Promise<EngineResult> {
    const files = createRenPyProjectFiles(input as unknown as RenPyProjectInput);
    const diagnostics = validateRenPyProjectFiles(files);
    if (diagnostics.length) return { status: "failed", diagnostics };
    return { status: "succeeded", artifacts: files.map((file) => file.path), diagnostics: ["Ren'Py project scaffold generated."] };
  }
  async execute(operation: EngineOperation): Promise<EngineResult> {
    if (!this.capabilities.includes(operation.capability)) return { status: "failed", diagnostics: ["Ren'Py adapter does not support capability: " + operation.capability] };
    return { status: "succeeded", diagnostics: ["Operation accepted by Ren'Py adapter: " + operation.capability] };
  }
  async build(target: string): Promise<EngineResult> {
    if (!target.trim()) return { status: "failed", diagnostics: ["Ren'Py build target is required."] };
    return { status: "queued", diagnostics: ["Ren'Py build target registered: " + target, "Build execution is delegated to the configured Ren'Py worker/toolchain."] };
  }
}