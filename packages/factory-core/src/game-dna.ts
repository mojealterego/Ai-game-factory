import type { GameDNA } from "./state";

export const GAME_DNA_FIELDS = [
  "genre","subgenre","platforms","dimensionality","camera","gameplayLoop",
  "mechanics","progression","economy","world","heroes","enemies","npcs",
  "locations","quests","narrative","artisticStyle","cinematicStyle","ui",
  "audio","music","voice","monetization","multiplayer","saveSystem",
  "accessibility","targetHardware","performanceBudget","ageRating",
  "localization","businessModel"
] as const;

export type GameDNAField = typeof GAME_DNA_FIELDS[number];

export type GameDNAInput = Partial<GameDNA>;

export interface GameDNAValidationIssue {
  field: GameDNAField;
  message: string;
  severity: "error" | "warning";
}

export interface GameDNAValidationResult {
  valid: boolean;
  issues: GameDNAValidationIssue[];
}

export function validateGameDNA(dna: GameDNAInput): GameDNAValidationResult {
  const issues: GameDNAValidationIssue[] = [];
  for (const field of GAME_DNA_FIELDS) {
    if ((dna as Record<string, unknown>)[field] === undefined) {
      issues.push({ field, message: "Field is not defined.", severity: "warning" });
    }
  }
  if (!dna.genre?.length) issues.push({ field: "genre", message: "At least one genre is required.", severity: "error" });
  if (!dna.platforms?.length) issues.push({ field: "platforms", message: "At least one platform is required.", severity: "error" });
  if (!dna.gameplayLoop?.trim()) issues.push({ field: "gameplayLoop", message: "Gameplay loop is required.", severity: "error" });
  if (!dna.performanceBudget?.targetFps) issues.push({ field: "performanceBudget", message: "Target FPS is required.", severity: "error" });
  return { valid: issues.every(issue => issue.severity !== "error"), issues };
}

export function mergeGameDNA(base: GameDNA, patch: GameDNAInput): GameDNA {
  return {
    ...base,
    ...patch,
    camera: { ...base.camera, ...patch.camera },
    economy: { ...base.economy, ...patch.economy },
    world: { ...base.world, ...patch.world },
    narrative: { ...base.narrative, ...patch.narrative },
    artisticStyle: { ...base.artisticStyle, ...patch.artisticStyle },
    cinematicStyle: { ...base.cinematicStyle, ...patch.cinematicStyle },
    ui: { ...base.ui, ...patch.ui },
    audio: { ...base.audio, ...patch.audio },
    music: { ...base.music, ...patch.music },
    voice: { ...base.voice, ...patch.voice },
    multiplayer: { ...base.multiplayer, ...patch.multiplayer },
    saveSystem: { ...base.saveSystem, ...patch.saveSystem },
    targetHardware: { ...base.targetHardware, ...patch.targetHardware },
    performanceBudget: { ...base.performanceBudget, ...patch.performanceBudget },
    ageRating: { ...base.ageRating, ...patch.ageRating },
    localization: { ...base.localization, ...patch.localization },
    businessModel: { ...base.businessModel, ...patch.businessModel },
    version: base.version + 1
  };
}
