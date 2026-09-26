import {
  GameKnowledgeHub,
  searchKnowledge,
  type KnowledgeEntry,
  type KnowledgeEvidence,
  type KnowledgeSource
} from "./game-knowledge-hub";

const assert = (condition: boolean, message: string) => {
  if (!condition) throw new Error(message);
};

const source: KnowledgeSource = {
  id: "src-unity",
  title: "Unity Documentation",
  uri: "https://docs.unity3d.com/",
  sourceType: "official_documentation",
  publisher: "Unity",
  retrievedAt: "2026-09-26T00:00:00.000Z"
};

const evidence: KnowledgeEvidence = {
  id: "ev-1",
  sourceId: "src-unity",
  claim: "Engine documentation is authoritative for the referenced API behavior.",
  strength: "primary",
  verifiedAt: "2026-09-26T00:00:00.000Z"
};

const entry: KnowledgeEntry = {
  id: "knowledge-unity-api",
  title: "Unity API reference",
  summary: "Engine API documentation reference for a project.",
  category: "engine_documentation",
  sourceId: source.id,
  evidenceIds: [evidence.id],
  tags: ["unity", "api", "engine"],
  notes: [],
  projectIds: ["project-1"],
  engineIds: ["unity"],
  createdAt: "2026-09-26T00:00:00.000Z",
  updatedAt: "2026-09-26T00:00:00.000Z",
  version: 1,
  status: "verified"
};

export function runGameKnowledgeHubContractTests(): void {
  const hub = new GameKnowledgeHub();
  hub.addSource(source);
  hub.addEvidence(evidence);
  hub.addEntry(entry);

  assert(hub.search({ text: "Unity API" }).length === 1, "text search must find the entry");
  assert(hub.search({ projectId: "project-1" }).length === 1, "project filter must work");
  assert(hub.search({ engineId: "unity", minEvidenceStrength: "primary" }).length === 1, "engine/evidence filters must work");

  hub.linkEntryToProject(entry.id, "project-2");
  hub.addNote(entry.id, {
    id: "note-1",
    body: "Use this source when validating engine-specific behavior.",
    createdAt: "2026-09-26T00:00:00.000Z"
  });
  assert(hub.getEntry(entry.id).projectIds.includes("project-2"), "project linking must persist");
  assert(hub.getEntry(entry.id).notes.length === 1, "notes must persist");

  const results = searchKnowledge([entry], [source], [evidence], { tags: ["unity"] });
  assert(results[0]?.source.uri === source.uri, "search result must preserve source tracking");
}

runGameKnowledgeHubContractTests();
