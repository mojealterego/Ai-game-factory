export interface ProvenanceRecord {
  artifactId: string;
  sourceType: "human" | "generated" | "imported" | "derived";
  provider?: string;
  model?: string;
  sourceUri?: string;
  license?: string;
  promptHash?: string;
  inputArtifactIds?: string[];
  generatedAt: string;
}

export function assertLicensable(record: ProvenanceRecord): void {
  if (!record.license) throw new Error("Artifact license/provenance is missing");
  if (record.sourceType === "generated" && !record.provider && !record.model) {
    throw new Error("Generated artifact must identify its generation source");
  }
}
