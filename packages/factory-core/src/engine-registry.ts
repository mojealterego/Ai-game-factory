import type { EngineId } from "./contracts";
import type { EngineAdapter } from "./engine-adapter";
import { RenPyEngineAdapter } from "./renpy-adapter";

export const FACTORY_ENGINE_IDS: readonly EngineId[] = [
  "unreal","unity","godot","cocos","defold","stride","monogame","bevy","o3de","html5","renpy","custom",
];

export type EngineProjectKind =
  | "unreal-project" | "unity-project" | "godot-project" | "cocos-project"
  | "defold-project" | "stride-project" | "monogame-project" | "bevy-project"
  | "o3de-project" | "web-project" | "renpy-project" | "custom-runtime-project";

export interface EngineDefinition {
  id: EngineId;
  name: string;
  projectKind: EngineProjectKind;
  description: string;
  strengths: string[];
  targetPlatforms: string[];
  projectFiles: string[];
  buildTargets: string[];
}

export const ENGINE_DEFINITIONS: Record<EngineId, EngineDefinition> = {
  unreal:{id:"unreal",name:"Unreal Engine",projectKind:"unreal-project",description:"High-end 3D runtime with Blueprint/C++ project generation.",strengths:["3D","cinematics","physics","large worlds"],targetPlatforms:["windows","linux","android","ios","web"],projectFiles:[".uproject","Source/","Content/","Config/"],buildTargets:["windows","linux","android","ios"]},
  unity:{id:"unity",name:"Unity",projectKind:"unity-project",description:"Cross-platform engine with C# project generation.",strengths:["2D","3D","mobile","multiplatform"],targetPlatforms:["windows","macos","linux","android","ios","web"],projectFiles:["Assets/","Packages/","ProjectSettings/"],buildTargets:["windows","linux","android","ios","webgl"]},
  godot:{id:"godot",name:"Godot",projectKind:"godot-project",description:"Open-source 2D/3D engine with scene and script project generation.",strengths:["2D","3D","open source","web"],targetPlatforms:["windows","macos","linux","android","ios","web"],projectFiles:["project.godot","scenes/","scripts/","assets/"],buildTargets:["windows","linux","android","ios","web"]},
  cocos:{id:"cocos",name:"Cocos Creator",projectKind:"cocos-project",description:"2D/3D engine and editor for interactive mobile/web projects.",strengths:["2D","mobile","web","UI"],targetPlatforms:["windows","macos","android","ios","web"],projectFiles:["project.json","assets/","settings/"],buildTargets:["android","ios","web","windows","macos"]},
  defold:{id:"defold",name:"Defold",projectKind:"defold-project",description:"Lua-based lightweight cross-platform game project generation.",strengths:["2D","mobile","HTML5","small runtime"],targetPlatforms:["windows","macos","linux","android","ios","html5"],projectFiles:["game.project","main/","collection/","scripts/"],buildTargets:["windows","linux","macos","android","ios","html5"]},
  stride:{id:"stride",name:"Stride",projectKind:"stride-project",description:"C#/.NET-oriented 2D/3D project generation.",strengths:["C#","3D",".NET","desktop"],targetPlatforms:["windows","linux","android"],projectFiles:["*.sln","*.csproj","Game/","Assets/"],buildTargets:["windows","linux","android"]},
  monogame:{id:"monogame",name:"MonoGame",projectKind:"monogame-project",description:"Code-first C# framework for deterministic custom game runtimes.",strengths:["C#","2D","code-first","custom systems"],targetPlatforms:["windows","linux","macos","android","ios"],projectFiles:["*.csproj","Program.cs","Game1.cs","Content/"],buildTargets:["windows","linux","macos","android","ios"]},
  bevy:{id:"bevy",name:"Bevy",projectKind:"bevy-project",description:"Rust ECS-oriented engine framework with generated project structure.",strengths:["Rust","ECS","3D","systems"],targetPlatforms:["windows","linux","macos","web","android","ios"],projectFiles:["Cargo.toml","src/","assets/"],buildTargets:["windows","linux","macos","web"]},
  o3de:{id:"o3de",name:"Open 3D Engine",projectKind:"o3de-project",description:"Open-source 3D engine with component-oriented project generation.",strengths:["3D","open source","simulation","large worlds"],targetPlatforms:["windows","linux","android","ios","macos"],projectFiles:["project.json","Code/","Assets/","Registry/"],buildTargets:["windows","linux","android","ios"]},
  html5:{id:"html5",name:"HTML5 / WebGL",projectKind:"web-project",description:"Engine-independent browser runtime target for generated web games.",strengths:["browser","WebGL","WebAssembly","instant deployment"],targetPlatforms:["web"],projectFiles:["index.html","src/","assets/","package.json"],buildTargets:["web"]},
  renpy:{id:"renpy",name:"RenPy",projectKind:"renpy-project",description:"Narrative and visual-novel runtime with script-driven project generation.",strengths:["visual novels","branching narrative","dialogue","2D"],targetPlatforms:["windows","macos","linux","android","ios","web"],projectFiles:["game/script.rpy","game/options.rpy","game/"],buildTargets:["windows","macos","linux","android","ios","web"]},
  custom:{id:"custom",name:"Custom Runtime",projectKind:"custom-runtime-project",description:"Engine-neutral contract for user-defined runtimes and specialized workers.",strengths:["custom runtime","maximum control","specialized targets"],targetPlatforms:["custom"],projectFiles:["runtime.manifest.json","src/","assets/","build/"],buildTargets:["custom"]},
};

export function getEngineDefinition(id: EngineId): EngineDefinition {
  return ENGINE_DEFINITIONS[id];
}

export interface GeneratedProject {
  engine: EngineId;
  projectId: string;
  kind: EngineProjectKind;
  files: Array<{path:string;content:string}>;
  buildTargets: string[];
  provenance: {factory:"AI GAME FACTORY";generatedAt:string;engine:EngineId};
}

export function createGeneratedProject(input:{engine:EngineId;projectId:string;name:string;generatedAt?:string}):GeneratedProject {
  const definition=getEngineDefinition(input.engine);
  const name=input.name.trim();
  if (!input.projectId.trim()) throw new Error("Generated project requires projectId.");
  if (!name) throw new Error("Generated project requires name.");
  const generatedAt=input.generatedAt || new Date().toISOString();
  const manifest=JSON.stringify({factory:"AI GAME FACTORY",engine:input.engine,projectId:input.projectId,name},null,2)+"\n";
  return {engine:input.engine,projectId:input.projectId,kind:definition.projectKind,files:[{path:"factory/project-manifest.json",content:manifest}],buildTargets:definition.buildTargets,provenance:{factory:"AI GAME FACTORY",generatedAt,engine:input.engine}};
}

export class GeneratedProjectEngineAdapter implements EngineAdapter {
  readonly id: EngineId;
  readonly name: string;
  readonly capabilities = ["project_bootstrap","scene_edit","code_edit","asset_import","animation","ui","navigation","save_system","test","build"] as const;
  constructor(private readonly definition: EngineDefinition) {
    this.id = definition.id;
    this.name = definition.name;
  }
  async bootstrap(input: Record<string, unknown>) {
    const project = createGeneratedProject({
      engine: this.id,
      projectId: String(input.projectId || ""),
      name: String(input.name || this.definition.name + " Project"),
      generatedAt: typeof input.generatedAt === "string" ? input.generatedAt : undefined,
    });
    return { status:"succeeded" as const, artifacts:project.files.map(file => file.path), diagnostics:["Generated project manifest created for "+this.definition.name+"."] };
  }
  async execute(operation: import("./engine-adapter").EngineOperation) {
    if (!(this.capabilities as readonly string[]).includes(operation.capability)) {
      return { status:"failed" as const, diagnostics:["Unsupported engine operation: "+operation.capability] };
    }
    return { status:"succeeded" as const, diagnostics:["Operation delegated to "+this.definition.name+" worker: "+operation.capability] };
  }
  async build(target:string) {
    if (!this.definition.buildTargets.includes(target)) {
      return { status:"failed" as const, diagnostics:["Unsupported "+this.definition.name+" build target: "+target] };
    }
    return { status:"queued" as const, diagnostics:["Build delegated to "+this.definition.name+" worker for target: "+target] };
  }
}

export function createEngineAdapter(id:EngineId):EngineAdapter {
  if (id==="renpy") return new RenPyEngineAdapter();
  return new GeneratedProjectEngineAdapter(getEngineDefinition(id));
}
