import { UnityEngineAdapter } from "./unity-engine-adapter";
import { UnityGeneratorAdapter } from "./unity-asset-generator";
import { AssetRouter } from "./asset-router";

const assert = (condition: boolean, message: string) => { if (!condition) throw new Error(message); };

export async function runUnityAdapterContractTests(): Promise<void> {
  let rejected = false;
  try { new UnityEngineAdapter({ unityVersion: "Unity 2022.3" }); } catch { rejected = true; }
  assert(rejected, "Unity AI adapter must reject pre-Unity-6 versions");

  const adapter = new UnityEngineAdapter({
    unityVersion: "6000.3",
    mcp: { enabled: true, projectContext: true, allowEditorActions: true, allowReadLogs: true },
    aiGateway: { enabled: true, provider: "openai", audit: true },
    runtimeML: { enabled: true, runtime: "sentis" },
  });
  assert(adapter.mcpAvailable(), "MCP bridge availability must be exposed");
  assert(adapter.aiGatewayAvailable(), "AI Gateway availability must be exposed");
  assert(adapter.runtimeMLAvailable(), "Sentis runtime availability must be exposed");

  const queued = await adapter.runAssistant("p1", "Inspect the active scene", "ask");
  assert(queued.status === "queued", "Assistant must delegate when no live bridge is attached");

  const generator = new UnityGeneratorAdapter();
  const asset = await generator.generate({
    projectId: "p1",
    kind: "material",
    prompt: "worn painted metal",
    outputPath: "Assets/Generated/worn-metal.mat",
  });
  assert(asset.aiGenerated === true, "Unity-generated assets must carry AI metadata");
  assert(asset.kind === "material", "Generator must preserve asset kind");

  const router = new AssetRouter();
  assert(router.route({ projectId: "p1", kind: "texture", prompt: "stone", targetEngine: "unity" }).provider === "unity",
    "Unity target should prefer Unity-native generator");
  assert(router.route({ projectId: "p1", kind: "character", prompt: "hero", targetEngine: "unity", preferredProviders: ["tripo"] }).provider === "tripo",
    "Preferred Tripo provider must be respected");
  assert(router.route({ projectId: "p1", kind: "texture", prompt: "stone", localOnly: true }).provider === "local-gguf",
    "localOnly must route to local GGUF when compatible");
}

void runUnityAdapterContractTests();
