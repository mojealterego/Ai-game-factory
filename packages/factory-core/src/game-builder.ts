import type { EngineId } from "./contracts";

export const GAME_BUILDER_IDS = ["mobile","2d","2.5d","3d","cinematic","rpg","adventure","visual_novel","interactive_fiction","racing","sports","strategy","simulation","tycoon","puzzle","horror","survival","action","arcade","platformer","tower_defense","idle","social","educational","multiplayer","party","card","board","couples_intimacy","mature_18_plus","casino_style_virtual","custom"] as const;
export type GameBuilderId = typeof GAME_BUILDER_IDS[number];

export interface GameBuilderProfile {
  id: GameBuilderId;
  name: string;
  description: string;
  dimensions?: Array<"2D"|"2.5D"|"3D">;
  defaultEngines: EngineId[];
  capabilities: string[];
  dnaOverrides?: Record<string, unknown>;
  constraints?: Record<string, unknown>;
  ageGate?: "none"|"18+";
  virtualOnly?: boolean;
  supportsMultiplayer?: boolean;
}

export interface GameBuilderSelection {
  builderId: GameBuilderId;
  projectId: string;
  engine?: EngineId;
  options: Record<string, unknown>;
}

const shared = ["gameplay_logic","code","qa","build"];

export const GAME_BUILDER_PROFILES: Record<GameBuilderId, GameBuilderProfile> = {
  mobile:{id:"mobile",name:"Mobile Game Builder",description:"Mobile-first production path with device and performance budgets.",dimensions:["2D","2.5D","3D"],defaultEngines:["unity","godot","cocos","defold"],capabilities:[...shared,"mobile_optimization"]},
  "2d":{id:"2d",name:"2D Game Builder",description:"Sprite, UI, animation and 2D gameplay production.",dimensions:["2D"],defaultEngines:["godot","unity","cocos","defold","monogame"],capabilities:[...shared,"sprite","animation"]},
  "2.5d":{id:"2.5d",name:"2.5D Builder",description:"Layered 2D/3D presentation and hybrid gameplay.",dimensions:["2.5D"],defaultEngines:["unity","godot","unreal"],capabilities:[...shared,"image","animation"]},
  "3d":{id:"3d",name:"3D Builder",description:"Full 3D gameplay, world, assets and runtime systems.",dimensions:["3D"],defaultEngines:["unreal","unity","godot","o3de","bevy"],capabilities:[...shared,"text_to_3d","image_to_3d","animation"]},
  cinematic:{id:"cinematic",name:"Cinematic Game Builder",description:"Narrative-first cinematic scenes, branching, camera and performance.",dimensions:["3D"],defaultEngines:["unreal","unity"],capabilities:[...shared,"narrative_runtime","story","video","voice"]},
  rpg:{id:"rpg",name:"RPG Builder",description:"Characters, stats, progression, quests, inventory and combat.",defaultEngines:["unreal","unity","godot"],capabilities:[...shared,"narrative_runtime"]},
  adventure:{id:"adventure",name:"Adventure Builder",description:"Exploration, puzzles, narrative and quest-driven progression.",defaultEngines:["unreal","unity","godot"],capabilities:[...shared,"narrative_runtime"]},
  visual_novel:{id:"visual_novel",name:"Visual Novel Builder",description:"Dialogue, branching, character presentation and backgrounds.",dimensions:["2D","2.5D"],defaultEngines:["godot","unity"],capabilities:[...shared,"story","narrative_runtime","voice"]},
  interactive_fiction:{id:"interactive_fiction",name:"Interactive Fiction Builder",description:"Text-led branching interactive narratives.",dimensions:["2D"],defaultEngines:["html5","godot","custom"],capabilities:[...shared,"story","narrative_runtime"]},
  racing:{id:"racing",name:"Racing Builder",description:"Vehicles, tracks, physics, lap systems and race events.",dimensions:["3D"],defaultEngines:["unreal","unity","godot"],capabilities:[...shared]},
  sports:{id:"sports",name:"Sports Builder",description:"Rules-driven sports gameplay, teams, matches and progression.",dimensions:["2D","3D"],defaultEngines:["unity","unreal","godot"],capabilities:[...shared]},
  strategy:{id:"strategy",name:"Strategy Builder",description:"Resource, territory, tactics and strategic decision systems.",dimensions:["2D","2.5D","3D"],defaultEngines:["unity","godot","bevy"],capabilities:[...shared]},
  simulation:{id:"simulation",name:"Simulation Builder",description:"Rule-based systems, agents, environments and simulation loops.",dimensions:["2D","3D"],defaultEngines:["unity","godot","bevy"],capabilities:[...shared]},
  tycoon:{id:"tycoon",name:"Tycoon Builder",description:"Economy, production chains, expansion and management.",dimensions:["2D","2.5D","3D"],defaultEngines:["unity","godot"],capabilities:[...shared]},
  puzzle:{id:"puzzle",name:"Puzzle Builder",description:"Puzzle rules, generation, validation and progression.",dimensions:["2D","2.5D","3D"],defaultEngines:["godot","unity","html5"],capabilities:[...shared]},
  horror:{id:"horror",name:"Horror Builder",description:"Atmosphere, tension, exploration, threats and narrative.",dimensions:["2D","3D"],defaultEngines:["unreal","unity","godot"],capabilities:[...shared,"audio","voice"]},
  survival:{id:"survival",name:"Survival Builder",description:"Resources, crafting, threats, exploration and survival loops.",dimensions:["2D","3D"],defaultEngines:["unreal","unity","godot"],capabilities:[...shared]},
  action:{id:"action",name:"Action Builder",description:"Real-time combat, movement, abilities and encounters.",dimensions:["2D","3D"],defaultEngines:["unreal","unity","godot"],capabilities:[...shared]},
  arcade:{id:"arcade",name:"Arcade Builder",description:"Short-session score, timing and replay loops.",dimensions:["2D","3D"],defaultEngines:["godot","unity","html5"],capabilities:[...shared]},
  platformer:{id:"platformer",name:"Platformer Builder",description:"Traversal, platforming, hazards, checkpoints and level flow.",dimensions:["2D","2.5D","3D"],defaultEngines:["godot","unity","unreal"],capabilities:[...shared]},
  tower_defense:{id:"tower_defense",name:"Tower Defense Builder",description:"Waves, towers, targeting, resources and map control.",dimensions:["2D","2.5D","3D"],defaultEngines:["godot","unity"],capabilities:[...shared]},
  idle:{id:"idle",name:"Idle Builder",description:"Offline progression, automation, upgrades and retention loops.",dimensions:["2D","2.5D"],defaultEngines:["unity","godot","html5"],capabilities:[...shared]},
  social:{id:"social",name:"Social Builder",description:"Social spaces, profiles, activities and community systems.",dimensions:["2D","3D"],defaultEngines:["unity","godot","unreal"],capabilities:[...shared,"narrative_runtime"]},
  educational:{id:"educational",name:"Educational Builder",description:"Learning objectives, progression, assessment and accessibility.",dimensions:["2D","3D"],defaultEngines:["unity","godot","html5"],capabilities:[...shared]},
  multiplayer:{id:"multiplayer",name:"Multiplayer Builder",description:"Networked gameplay, sessions, state synchronization and backend contracts.",dimensions:["2D","3D"],defaultEngines:["unreal","unity","godot"],capabilities:[...shared,"networking"],supportsMultiplayer:true},
  party:{id:"party",name:"Party Games Builder",description:"Local or online short-form party experiences.",dimensions:["2D","3D"],defaultEngines:["unity","godot"],capabilities:[...shared,"networking"],supportsMultiplayer:true},
  card:{id:"card",name:"Card Games Builder",description:"Cards, decks, rules, turns, effects and progression.",dimensions:["2D","2.5D"],defaultEngines:["godot","unity","html5"],capabilities:[...shared]},
  board:{id:"board",name:"Board Games Builder",description:"Boards, pieces, turns, rules and AI opponents.",dimensions:["2D","2.5D","3D"],defaultEngines:["godot","unity"],capabilities:[...shared]},
  couples_intimacy:{id:"couples_intimacy",name:"Couples & Intimacy Builder",description:"Adult relationship, romance and intimacy themes without explicit sexual content.",dimensions:["2D","2.5D","3D"],defaultEngines:["unity","godot","html5"],capabilities:[...shared,"narrative_runtime"],ageGate:"18+"},
  mature_18_plus:{id:"mature_18_plus",name:"Mature 18+ Builder",description:"Age-gated mature themes such as horror, crime, violence and dark narratives.",dimensions:["2D","2.5D","3D"],defaultEngines:["unreal","unity","godot"],capabilities:[...shared,"narrative_runtime"],ageGate:"18+"},
  casino_style_virtual:{id:"casino_style_virtual",name:"Casino-Style Virtual Builder",description:"Simulated casino-style mechanics for entertainment only.",dimensions:["2D","2.5D","3D"],defaultEngines:["unity","godot","html5"],capabilities:[...shared],virtualOnly:true,constraints:{realMoneyWagering:false,cashOut:false,monetaryStaking:false}},
  custom:{id:"custom",name:"Custom Game Builder",description:"Configurable builder assembled from Game DNA and selected capabilities.",dimensions:["2D","2.5D","3D"],defaultEngines:["unreal","unity","godot","cocos","defold","stride","monogame","bevy","o3de","html5","custom"],capabilities:[...shared]}
};

export function getGameBuilderProfile(id: GameBuilderId): GameBuilderProfile { return GAME_BUILDER_PROFILES[id]; }

export function createBuilderSelection(input: GameBuilderSelection): GameBuilderSelection {
  const profile = getGameBuilderProfile(input.builderId);
  if (!profile) throw new Error("Unknown builder: " + input.builderId);
  if (input.engine && !profile.defaultEngines.includes(input.engine)) throw new Error("Engine is not configured for this builder profile: " + input.engine);
  return {...input,options:{...input.options,builderProfile:profile.id}};
}
