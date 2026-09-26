import type { EngineId } from "./contracts";

export type BuildTarget = "android-apk" | "android-aab" | "web" | "windows" | "linux" | "macos" | "ios";

export interface EngineBuildRequest {
  engine: EngineId;
  projectPath: string;
  target: BuildTarget | string;
  configuration?: "debug" | "release" | "profile";
  outputPath?: string;
}

export interface EngineBuildCommand {
  executable: string;
  args: string[];
  cwd: string;
  env?: Record<string, string>;
  notes: string[];
}

const target = (value: string) => value.trim().toLowerCase();

export interface EngineProcessResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

export interface EngineProcessRunner {
  run(command: EngineBuildCommand): Promise<EngineProcessResult>;
}

export interface EngineWorker {
  build(request: EngineBuildRequest): Promise<EngineProcessResult>;
}

export function createEngineWorker(runner: EngineProcessRunner): EngineWorker {
  return {
    async build(request) {
      const command = resolveEngineBuildCommand(request);
      return runner.run(command);
    },
  };
}

function unityTarget(value: string): string {
  const map: Record<string, string> = {
    "android-apk": "android", "android-aab": "android", android: "android",
    web: "webgl", webgl: "webgl", windows: "win64", linux: "linux64",
    macos: "osxuniversal", ios: "ios",
  };
  return map[target(value)] || value;
}

function godotPreset(value: string): string {
  const map: Record<string, string> = {
    "android-apk": "Android", "android-aab": "Android", android: "Android",
    web: "Web", windows: "Windows Desktop", linux: "Linux/X11", macos: "macOS",
  };
  return map[target(value)] || value;
}

export function resolveEngineBuildCommand(request: EngineBuildRequest): EngineBuildCommand {
  const cfg = request.configuration ?? "release";
  const out = request.outputPath ?? "build";
  const t = target(request.target);
  if (!request.projectPath.trim()) throw new Error("projectPath is required.");

  switch (request.engine) {
    case "unreal":
      return { executable: "$UE_ROOT/RunUAT", args: ["BuildCookRun", "-Project=" + request.projectPath, "-Build", "-Cook", "-Stage", "-Package", "-NoP4", "-Archive", "-ArchiveDirectory=" + out, "-TargetPlatform=" + t], cwd: request.projectPath, notes: ["Requires a configured Unreal Engine installation and RunUAT."] };
    case "unity":
      return { executable: "Unity", args: ["-batchmode", "-nographics", "-quit", "-projectPath", request.projectPath, "-buildTarget", unityTarget(t), "-executeMethod", "FactoryBuild.Build", "-factoryOutput", out, "-logFile", "-"], cwd: request.projectPath, notes: ["The generated project must provide FactoryBuild.Build; credentials/licensing remain external."] };
    case "godot":
      return { executable: "godot", args: ["--headless", "--path", request.projectPath, "--export-" + (cfg === "debug" ? "debug" : "release"), godotPreset(t), out], cwd: request.projectPath, notes: ["Requires a matching export preset in export_presets.cfg and installed export templates."] };
    case "cocos":
      return { executable: "CocosCreator", args: ["--project", request.projectPath, "--build", "platform=" + t + ";debug=" + (cfg !== "release")], cwd: request.projectPath, notes: ["CLI flags depend on the installed Cocos Creator major version."] };
    case "defold":
      return { executable: "bob", args: ["--project", request.projectPath, "--platform", t, "--archive", "--bundle-output", out], cwd: request.projectPath, notes: ["Requires Defold Bob CLI and target SDK/toolchain."] };
    case "stride":
      return { executable: "dotnet", args: ["build", request.projectPath, "--configuration", cfg === "profile" ? "Release" : cfg[0].toUpperCase() + cfg.slice(1)], cwd: request.projectPath, notes: ["Requires the Stride-compatible .NET SDK/tooling on the worker."] };
    case "monogame":
      return { executable: "dotnet", args: ["build", request.projectPath, "--configuration", cfg === "debug" ? "Debug" : "Release"], cwd: request.projectPath, notes: ["Platform packaging may require the MonoGame platform toolchain after compilation."] };
    case "bevy":
      return { executable: "cargo", args: ["build", cfg === "release" ? "--release" : ""].filter(Boolean), cwd: request.projectPath, notes: ["Web/mobile targets require the corresponding Rust target and packaging toolchain."] };
    case "o3de":
      return { executable: "cmake", args: ["--build", request.projectPath + "/build/" + t, "--config", cfg === "debug" ? "debug" : cfg === "profile" ? "profile" : "release"], cwd: request.projectPath, notes: ["O3DE project must be configured with CMake and its third-party dependencies before this step."] };
    case "html5":
      return { executable: "npm", args: ["run", "build", "--", "--output", out], cwd: request.projectPath, notes: ["Web projects must expose a deterministic npm build script."] };
    case "renpy":
      if (t === "android-apk" || t === "android") return { executable: "renpy.sh", args: ["launcher", "android_build", request.projectPath, "--destination", out], cwd: request.projectPath, notes: ["Ren'Py Android SDK/key configuration must already exist on the worker."] };
      if (t === "android-aab") return { executable: "renpy.sh", args: ["launcher", "android_build", request.projectPath, "--destination", out, "--bundle"], cwd: request.projectPath, notes: ["Ren'Py Android SDK/key configuration must already exist on the worker."] };
      if (t === "web") return { executable: "renpy.sh", args: ["launcher", "web_build", request.projectPath, "--destination", out], cwd: request.projectPath, notes: ["Ren'Py web support must be installed in the SDK."] };
      return { executable: "renpy.sh", args: ["launcher", "distribute", request.projectPath, "--destination", out], cwd: request.projectPath, notes: ["Ren'Py desktop distribution is delegated to its CLI."] };
    case "custom":
      return { executable: "./factory/build", args: ["--project", request.projectPath, "--target", t, "--configuration", cfg], cwd: request.projectPath, notes: ["Custom Runtime requires a project-provided executable at ./factory/build."] };
  }
}
