import {
  createIdeationRequest,
  generateIdeaBatch,
  selectIdea,
  createVariation,
  createGDD,
  buildReferenceFingerprint,
  type ReferenceIdeationRequest
} from "./reference-ideation-engine";

const assert = (condition: boolean, message: string) => {
  if (!condition) throw new Error(message);
};

const request: ReferenceIdeationRequest = {
  projectId: "hospital-lab",
  theme: "abandoned hospital",
  genres: ["horror", "survival"],
  mechanics: ["decision system", "procedural events"],
  references: [
    { id: "ref-1", type: "game", title: "Reference Game", notes: "branching survival drama" }
  ],
  platform: "android",
  perspective: "third_person",
  artStyle: "cinematic realistic",
  constraints: ["three playable protagonists", "five endings"],
  batchSize: 3
};

export function runReferenceIdeationContractTests(): void {
  const normalized = createIdeationRequest(request);
  assert(normalized.batchSize === 3, "ideation request must preserve batch size");
  assert(normalized.references.length === 1, "reference games must remain first-class inputs");

  const batch = generateIdeaBatch(normalized);
  assert(batch.length === 3, "ideator must produce requested batch size");
  assert(batch.every(idea => idea.references.some(ref => ref.id === "ref-1")), "ideas must retain reference provenance");

  const selected = selectIdea(batch, batch[0].id);
  assert(selected.selected === true, "selected idea must be marked selected");

  const variation = createVariation(selected, { mechanics: ["investigation"], constraints: ["single-session prototype"] });
  assert(variation.parentIdeaId === selected.id, "variation must preserve parent lineage");
  assert(variation.mechanics.includes("investigation"), "variation must merge the new mechanic");

  const gdd = createGDD(variation);
  assert(gdd.projectId === "hospital-lab", "GDD must retain project identity");
  assert(gdd.sections.some(section => section.key === "mechanics"), "GDD must include mechanics");
  assert(gdd.sections.some(section => section.key === "references"), "GDD must include references");

  const fingerprint = buildReferenceFingerprint(request.references);
  assert(fingerprint.includes("ref-1"), "reference fingerprint must preserve source IDs");

  const constrained = generateIdeaBatch({ ...normalized, batchSize: 0 });
  assert(constrained.length === 1, "invalid batch size must fail closed to one idea");
}

runReferenceIdeationContractTests();
