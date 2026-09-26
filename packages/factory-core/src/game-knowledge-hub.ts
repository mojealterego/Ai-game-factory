export type KnowledgeCategory =
  | "public_documentation"
  | "engine_documentation"
  | "api_reference"
  | "game_design_pattern"
  | "technical_reference"
  | "narrative_pattern"
  | "optimization"
  | "platform_requirement"
  | "project_specific";

export type KnowledgeSourceType =
  | "official_documentation"
  | "api_reference"
  | "technical_article"
  | "research_paper"
  | "game_postmortem"
  | "engine_reference"
  | "project_document"
  | "repository"
  | "other";

export type EvidenceStrength = "unverified" | "weak" | "moderate" | "strong" | "primary";

export interface KnowledgeSource {
  id: string;
  title: string;
  uri: string;
  sourceType: KnowledgeSourceType;
  publisher?: string;
  author?: string;
  version?: string;
  retrievedAt: string;
  checksum?: string;
  license?: string;
  archivedUri?: string;
}

export interface KnowledgeEvidence {
  id: string;
  sourceId: string;
  claim: string;
  excerpt?: string;
  locator?: string;
  strength: EvidenceStrength;
  verifiedAt?: string;
  verifiedBy?: string;
}

export interface KnowledgeNote {
  id: string;
  body: string;
  author?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface KnowledgeEntry {
  id: string;
  title: string;
  summary: string;
  category: KnowledgeCategory;
  sourceId: string;
  evidenceIds: string[];
  tags: string[];
  notes: KnowledgeNote[];
  projectIds: string[];
  engineIds?: string[];
  platformIds?: string[];
  relatedEntryIds?: string[];
  createdAt: string;
  updatedAt: string;
  version: number;
  status: "draft" | "verified" | "deprecated";
}

export interface KnowledgeQuery {
  text?: string;
  categories?: KnowledgeCategory[];
  tags?: string[];
  projectId?: string;
  engineId?: string;
  platformId?: string;
  sourceTypes?: KnowledgeSourceType[];
  minEvidenceStrength?: EvidenceStrength;
  status?: KnowledgeEntry["status"];
}

export interface KnowledgeMatch {
  entry: KnowledgeEntry;
  source: KnowledgeSource;
  evidence: KnowledgeEvidence[];
  score: number;
  matchedOn: string[];
}

const STRENGTH: Record<EvidenceStrength, number> = {
  unverified: 0,
  weak: 1,
  moderate: 2,
  strong: 3,
  primary: 4
};

export function validateKnowledgeEntry(entry: KnowledgeEntry, source?: KnowledgeSource, evidence: KnowledgeEvidence[] = []): string[] {
  const errors: string[] = [];
  if (!entry.id) errors.push("entry.id is required");
  if (!entry.title) errors.push("entry.title is required");
  if (!entry.summary) errors.push("entry.summary is required");
  if (!entry.sourceId) errors.push("entry.sourceId is required");
  if (!entry.projectIds.length && entry.category === "project_specific") errors.push("project_specific knowledge requires a project link");
  if (source && source.id !== entry.sourceId) errors.push("entry.sourceId must match source.id");
  if (entry.status === "verified" && !evidence.some((item) => STRENGTH[item.strength] >= STRENGTH.strong)) {
    errors.push("verified knowledge requires strong or primary evidence");
  }
  return errors;
}

function normalize(value: string): string {
  return value.toLowerCase().trim();
}

function contains(haystack: string, needle: string): boolean {
  return normalize(haystack).includes(normalize(needle));
}

export function searchKnowledge(
  entries: readonly KnowledgeEntry[],
  sources: readonly KnowledgeSource[],
  evidence: readonly KnowledgeEvidence[],
  query: KnowledgeQuery = {}
): KnowledgeMatch[] {
  const sourceMap = new Map(sources.map((source) => [source.id, source]));
  const evidenceMap = new Map(evidence.map((item) => [item.id, item]));
  const minStrength = query.minEvidenceStrength ? STRENGTH[query.minEvidenceStrength] : 0;

  return entries
    .filter((entry) => !query.status || entry.status === query.status)
    .filter((entry) => !query.categories?.length || query.categories.includes(entry.category))
    .filter((entry) => !query.projectId || entry.projectIds.includes(query.projectId))
    .filter((entry) => !query.engineId || entry.engineIds?.includes(query.engineId))
    .filter((entry) => !query.platformId || entry.platformIds?.includes(query.platformId))
    .filter((entry) => !query.tags?.length || query.tags.every((tag) => entry.tags.includes(tag)))
    .map((entry) => {
      const source = sourceMap.get(entry.sourceId);
      if (!source) return undefined;
      if (query.sourceTypes?.length && !query.sourceTypes.includes(source.sourceType)) return undefined;

      const entryEvidence = entry.evidenceIds.map((id) => evidenceMap.get(id)).filter((item): item is KnowledgeEvidence => Boolean(item));
      if (!entryEvidence.some((item) => STRENGTH[item.strength] >= minStrength)) return undefined;

      const matchedOn: string[] = [];
      let score = 0;
      if (query.text) {
        if (contains(entry.title, query.text)) { score += 5; matchedOn.push("title"); }
        if (contains(entry.summary, query.text)) { score += 3; matchedOn.push("summary"); }
        if (entry.tags.some((tag) => contains(tag, query.text))) { score += 2; matchedOn.push("tag"); }
        if (contains(source.title, query.text) || contains(source.uri, query.text)) { score += 1; matchedOn.push("source"); }
        if (entryEvidence.some((item) => contains(item.claim, query.text))) { score += 4; matchedOn.push("evidence"); }
        if (score === 0) return undefined;
      }
      score += Math.max(...entryEvidence.map((item) => STRENGTH[item.strength]), 0);
      return { entry, source, evidence: entryEvidence, score, matchedOn };
    })
    .filter((item): item is KnowledgeMatch => Boolean(item))
    .sort((a, b) => b.score - a.score);
}

export class GameKnowledgeHub {
  private readonly sources = new Map<string, KnowledgeSource>();
  private readonly evidence = new Map<string, KnowledgeEvidence>();
  private readonly entries = new Map<string, KnowledgeEntry>();

  addSource(source: KnowledgeSource): void {
    if (this.sources.has(source.id)) throw new Error(`Source already exists: ${source.id}`);
    this.sources.set(source.id, source);
  }

  addEvidence(item: KnowledgeEvidence): void {
    if (!this.sources.has(item.sourceId)) throw new Error(`Unknown knowledge source: ${item.sourceId}`);
    if (this.evidence.has(item.id)) throw new Error(`Evidence already exists: ${item.id}`);
    this.evidence.set(item.id, item);
  }

  addEntry(entry: KnowledgeEntry): void {
    if (this.entries.has(entry.id)) throw new Error(`Knowledge entry already exists: ${entry.id}`);
    const source = this.sources.get(entry.sourceId);
    const entryEvidence = entry.evidenceIds.map((id) => this.evidence.get(id)).filter((item): item is KnowledgeEvidence => Boolean(item));
    const errors = validateKnowledgeEntry(entry, source, entryEvidence);
    if (errors.length) throw new Error(errors.join("; "));
    this.entries.set(entry.id, entry);
  }

  linkEntryToProject(entryId: string, projectId: string): KnowledgeEntry {
    const entry = this.requireEntry(entryId);
    if (!entry.projectIds.includes(projectId)) entry.projectIds.push(projectId);
    entry.updatedAt = new Date().toISOString();
    entry.version += 1;
    return entry;
  }

  addNote(entryId: string, note: KnowledgeNote): KnowledgeEntry {
    const entry = this.requireEntry(entryId);
    entry.notes.push(note);
    entry.updatedAt = new Date().toISOString();
    entry.version += 1;
    return entry;
  }

  search(query: KnowledgeQuery = {}): KnowledgeMatch[] {
    return searchKnowledge([...this.entries.values()], [...this.sources.values()], [...this.evidence.values()], query);
  }

  getEntry(id: string): KnowledgeEntry {
    return this.requireEntry(id);
  }

  private requireEntry(id: string): KnowledgeEntry {
    const entry = this.entries.get(id);
    if (!entry) throw new Error(`Unknown knowledge entry: ${id}`);
    return entry;
  }
}
