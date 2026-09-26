export interface FactoryAgent {
  id: `A${number}`;
  name: string;
  domain: string;
  capabilities: string[];
  approvalRequired: boolean;
}

const names = [
  "Intent & Creative Director","Reference & Identity Analyst","Game Director","Game Designer",
  "Narrative Director","Story Architect","Character Designer","World Designer","Level Designer",
  "Quest Designer","Dialogue Designer","Cinematic Director","Camera Director","Gameplay Designer",
  "Systems Designer","Economy Designer","UX/UI Designer","Technical Director","Engine Specialist",
  "Code Architect","Code Generator","AI/ML Specialist","Asset Director","2D Artist","3D Artist",
  "Texture & Material Artist","Animation Agent","Rigging Agent","VFX Agent","Audio Director",
  "Music Agent","SFX Agent","Voice & Dubbing Agent","Localization Agent","Optimization Agent",
  "QA Agent","Playtest Agent","Security Agent","IP & License Agent","Build Agent","Release Agent",
  "GitHub Agent","Cloud Agent","Documentation Agent","Continuity Doctor","Narrative QA",
  "Game Balance Agent","Mobile Optimization Agent","Performance Agent","Provider Router Agent",
  "Model Registry Agent","Game Knowledge Agent","Research Agent","Ideation Agent","GDD Compiler",
  "Game Compiler","World Simulation Agent","NPC Intelligence Agent","Multiplayer Agent",
  "Monetization Systems Agent","Store Publishing Agent","Telemetry Agent","Factory Orchestrator"
] as const;

export const AGENT_REGISTRY: FactoryAgent[] = names.map((name, index) => ({
  id: `A${String(index).padStart(2, "0")}` as `A${number}`,
  name,
  domain: index < 22 ? "design" : index < 40 ? "production" : "platform",
  capabilities: [],
  approvalRequired: ["Build Agent","Release Agent","Store Publishing Agent"].includes(name)
}));
