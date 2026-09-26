# Game Knowledge Hub

## Purpose

Game Knowledge Hub is a separate evidence-aware knowledge layer for AI GAME FACTORY. It is distinct from narrative runtime knowledge: this hub stores external/project knowledge used to inform design, implementation, QA and agent decisions.

## Knowledge domains

- Public documentation
- Engine documentation
- API references
- Game design patterns
- Technical references
- Narrative patterns
- Optimization
- Platform requirements
- Project-specific knowledge

## Source tracking

Every knowledge entry points to a `KnowledgeSource`. Sources record URI, source type, publisher/author where known, version, retrieval timestamp, optional checksum, license and optional archived URI.

## Evidence

Claims are represented as `KnowledgeEvidence` and remain attached to their source. Evidence records include the claim, optional excerpt/locator, evidence strength and verification information.

Verified entries require strong or primary evidence. This prevents a weak or unverified web result from silently becoming authoritative project knowledge.

## Organization

Entries support:

- tags
- notes
- project linking
- engine linking
- platform linking
- related knowledge entries
- draft / verified / deprecated status
- explicit versioning

## Retrieval

The Hub exposes capability-aware retrieval with filters for text, category, tags, project, engine, platform, source type, evidence strength and status. Text retrieval scores title, summary, tags, source metadata and evidence claims, then adds evidence-strength weight.

## Relationship to Game Research Lab

Game Research Lab remains the research/discovery workflow. The Knowledge Hub is the durable knowledge layer into which validated research can be promoted. This separation prevents transient research results from being treated as canonical project knowledge.

## Relationship to Factory Evidence

The Hub uses its own structured source/evidence records while remaining compatible with Factory Core's existing append-only EvidenceLog and provenance model. EvidenceLog records factory events; KnowledgeEvidence records the evidentiary basis of knowledge claims.

## Project-specific knowledge

Project-specific entries must contain at least one project link. This permits the same public source to support multiple projects while keeping project notes and decisions scoped to the appropriate project.

## Security and provenance

Source URLs, licenses and retrieval timestamps are retained. The system does not silently copy protected content into project assets. Knowledge is a reference layer; generated game content remains subject to the Factory provenance, IP and license gates.

## Agent integration

A51 Game Knowledge Agent is the primary consumer of this layer. A52 Research Agent can discover sources and evidence; A44 Continuity Doctor, A45 Narrative QA, A34 Optimization Agent, A38 IP/License Agent and other agents can consume scoped knowledge through the same retrieval contract.