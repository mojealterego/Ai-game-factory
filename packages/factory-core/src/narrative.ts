export type NarrativeNodeType =
  | "scene" | "choice" | "qte" | "investigation" | "dialogue" | "ending";

export interface NarrativeState {
  world: Record<string, number | string | boolean>;
  characters: Record<string, {
    alive: boolean;
    variables: Record<string, number | string | boolean>;
  }>;
  relationships: Record<string, number>;
  flags: Record<string, boolean>;
  timeline: string[];
}

export interface NarrativeNode {
  id: string;
  type: NarrativeNodeType;
  title: string;
  prerequisites?: Array<{ key: string; equals: unknown }>;
  mutations?: Array<{ path: string; value: unknown }>;
  next: string[];
}

export interface NarrativeGraph {
  startNodeId: string;
  nodes: NarrativeNode[];
  endings: string[];
}

export function canEnter(node: NarrativeNode, state: NarrativeState): boolean {
  return (node.prerequisites ?? []).every(({ key, equals }) => {
    const [scope, id, field] = key.split(".");
    const source = scope === "character"
      ? state.characters[id ?? ""]
      : scope === "world"
        ? state.world
        : state.flags;
    return source?.[field ?? id ?? ""] === equals;
  });
}

export function applyMutation(state: NarrativeState, mutation: { path: string; value: unknown }): NarrativeState {
  const next: NarrativeState = structuredClone(state);
  const parts = mutation.path.split(".");
  let cursor: any = next;
  for (const part of parts.slice(0, -1)) cursor = cursor[part];
  cursor[parts.at(-1)!] = mutation.value;
  return next;
}
