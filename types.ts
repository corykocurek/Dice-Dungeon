

export enum PlayerRole {
  HERO = 'HERO',
  DM = 'DM'
}

export enum StatType {
  MUSCLE = 'MUSCLE',
  AGILITY = 'AGILITY',
  FORTITUDE = 'FORTITUDE',
  KNOWLEDGE = 'KNOWLEDGE',
  SMARTS = 'SMARTS',
  LOOKS = 'LOOKS'
}

export enum HeroClass {
  FIGHTER = 'FIGHTER',
  ROGUE = 'ROGUE',
  WIZARD = 'WIZARD',
  CLERIC = 'CLERIC',
  BARBARIAN = 'BARBARIAN',
  BARD = 'BARD'
}

export interface Die {
  id: string;
  faces: StatType[];
  multipliers: number[]; // Array of 6 numbers, defaulting to 1. Upgrades make them 2.
  currentValue: StatType;
  lockedToObstacleId: string | null; // ID of obstacle this die is committed to
}

export interface ItemDefinition {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  bonusStat?: StatType;
  bonusAmount?: number; // +1 success to matching stat
  grantsExtraDie?: boolean; // Tools
  effectType?: 'TELEPORT' | 'TELEPORT_OTHERS' | 'NUKE_OBSTACLE' | 'GRANT_UPGRADE'; // Usable effect
  targetStat?: StatType; // For NUKE_OBSTACLE
}

export interface Player {
  id: string;
  peerId?: string; // Network ID
  name: string;
  role: PlayerRole;
  heroClass?: HeroClass;
  currentRoomId: string; // "x,y" coordinate string
  previousRoomId: string | null; // For retreat logic
  visitedRooms: string[]; // List of room IDs visited
  dicePool: Die[];
  inventory: string[]; // Collected item IDs
  isMoving: boolean;
  moveUnlockTime: number; // Timestamp when movement finishes
  lastRerollTime: number; // Timestamp for reroll cooldown
  
  // Upgrade Logic
  upgradePoints: number;
  obstaclesDefeatedCount: number; // Every 2 grants a point
  
  // Drafting
  draftStep: number;
  draftDieOptions: Die[];
  isReady: boolean;
}

export interface ObstacleSpecialRules {
  preventsRetreat?: boolean;
  resetsOnLeave?: boolean;
  accumulatesDamage?: boolean; // If true, dice aren't locked, they deal damage and reroll
  reward?: 'EXTRA_DIE' | 'LOOT_DROP'; // If defeated, grants a reward
}

// Map of Stat -> Required Successes
export type RequirementMap = Partial<Record<StatType, number>>;

export interface ObstacleCard {
  id: string;
  name: string;
  cost: number;
  // Multi-stat requirements replacement
  requirements: RequirementMap; 
  description: string;
  specialRules?: ObstacleSpecialRules;
  keyRequirement?: string; // If set, requires this item ID to unlock
  imageUrl?: string;
  tier?: 'BASIC' | 'NEUTRAL' | 'ADVANCED';
}

export interface RoomObstacle {
  id: string;
  card: ObstacleCard;
  currentSuccesses: RequirementMap; // Visual display of progress per stat
  permanentSuccesses: RequirementMap; // For accumulating obstacles per stat
  isDefeated: boolean;
}

export interface Room {
  id: string; // "x,y"
  x: number;
  y: number;
  isStart: boolean;
  isExit: boolean;
  connections: string[]; // IDs of connected rooms
  activeObstacles: RoomObstacle[];
  items: string[]; // IDs of items on the floor (e.g., 'RED_KEY')
  superChargeUnlockTime: number; // Timestamp when supercharge effect wears off
}

export interface GameState {
  status: 'LOBBY' | 'PREGAME' | 'PLAYING' | 'VICTORY_HERO' | 'VICTORY_DM';
  gameId?: string;
  timer: number; // Seconds remaining
  dmResources: number;
  dmHand: ObstacleCard[];
  dmDeck: ObstacleCard[]; // Drafted deck
  dmDraftOptions: ObstacleCard[]; // For pregame
  players: Player[];
  map: Record<string, Room>; // Map keyed by "x,y"
  localPlayerId: string | null;
  lastResourceTick: number;
  lastCardDrawTick: number;
  lastSuperChargeTime: number; // Timestamp for DM global cooldown
}

// Network & Action Types

export type NetworkMessage = 
  | { type: 'SYNC_STATE'; payload: GameState }
  | { type: 'ACTION'; payload: GameAction }
  | { type: 'JOIN_REQUEST'; payload: Player };

export type GameAction = 
  | { type: 'MOVE'; playerId: string; direction: 'N'|'S'|'E'|'W' }
  | { type: 'USE_DIE'; playerId: string; obstacleId: string; dieIndex: number }
  | { type: 'UNLOCK_DIE'; playerId: string; dieIndex: number }
  | { type: 'PICKUP_ITEM'; playerId: string; itemId: string }
  | { type: 'DROP_ITEM'; playerId: string; itemId: string }
  | { type: 'USE_ITEM'; playerId: string; itemId: string }
  | { type: 'UNLOCK_OBSTACLE'; playerId: string; obstacleId: string }
  | { type: 'REROLL'; playerId: string }
  | { type: 'UPGRADE_DIE'; playerId: string; dieIndex: number; faceIndex: number }
  | { type: 'DM_PLACE_TRAP'; cardId: string; roomId: string }
  | { type: 'SUPER_CHARGE_ROOM'; roomId: string }
  | { type: 'START_GAME' }
  | { type: 'PLAYER_JOIN'; player: Player }
  | { type: 'UPDATE_PLAYER'; playerId: string; data: Partial<Player> }
  | { type: 'ESCAPE_DUNGEON'; playerId: string }
  | { type: 'RESET_LOBBY' }
  | { type: 'DRAFT_DIE'; playerId: string; dieIndex: number } // dieIndex refers to index in draftDieOptions
  | { type: 'DRAFT_CARD'; cardIndex: number } // cardIndex refers to index in dmDraftOptions
  | { type: 'PLAYER_READY'; playerId: string };