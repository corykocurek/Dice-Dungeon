
export enum StatType {
  MUSCLE = 'MUSCLE',
  AGILITY = 'AGILITY',
  FORTITUDE = 'FORTITUDE',
  KNOWLEDGE = 'KNOWLEDGE',
  SMARTS = 'SMARTS',
  LOOKS = 'LOOKS',
  GOLD = 'GOLD',
  EXP = 'EXP',
}

export enum HeroClass {
  FIGHTER = 'FIGHTER',
  ROGUE = 'ROGUE',
  WIZARD = 'WIZARD',
  CLERIC = 'CLERIC',
  BARBARIAN = 'BARBARIAN',
  BARD = 'BARD',
}

export enum PlayerRole {
  HERO = 'HERO',
  DM = 'DM',
}

export interface ItemDefinition {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    price: number;
    bonusStat?: StatType;
    bonusAmount?: number;
    grantsExtraDie?: boolean;
    effectType?: 'TELEPORT' | 'TELEPORT_OTHERS' | 'GRANT_UPGRADE' | 'NUKE_OBSTACLE';
    targetStat?: StatType;
}

export interface ObstacleCard {
    id: string;
    name: string;
    cost: number;
    requirements: Partial<Record<StatType, number>>;
    description: string;
    imageUrl: string;
    tier?: 'BASIC' | 'NEUTRAL' | 'ADVANCED';
    keyRequirement?: string;
    specialRules?: {
        preventsRetreat?: boolean;
        resetsOnLeave?: boolean;
        accumulatesDamage?: boolean;
        reward?: 'LOOT_DROP';
        passable?: boolean;
        manaGeneration?: boolean;
    };
}

export interface RoomObstacle {
    id: string;
    card: ObstacleCard;
    currentSuccesses: Partial<Record<StatType, number>>;
    permanentSuccesses: Partial<Record<StatType, number>>;
    isDefeated: boolean;
}

export interface Room {
    id: string;
    x: number;
    y: number;
    isStart: boolean;
    isExit: boolean;
    connections: string[];
    activeObstacles: RoomObstacle[];
    items: string[];
    superChargeUnlockTime: number;
    recentSuccesses?: number[];
}

export interface Die {
    id: string;
    faces: StatType[];
    multipliers: number[];
    currentValue: StatType;
    lockedToObstacleId: string | null;
    lastInteractionTime?: number; 
}

export interface Player {
    id: string;
    name: string;
    role: PlayerRole;
    heroClass?: HeroClass;
    currentRoomId: string;
    previousRoomId: string | null;
    visitedRooms: string[];
    dicePool: Die[];
    inventory: string[];
    isMoving: boolean;
    moveUnlockTime: number;
    lastRerollTime: number;
    upgradePoints: number;
    obstaclesDefeatedCount: number;
    draftStep: number;
    draftDieOptions: Die[];
    draftItemOptions: string[]; // IDs of items
    hasDraftedItem: boolean;
    isReady: boolean;
    gold: number;
    exp: number;
    level: number;
}

export interface GameState {
  status: 'LOBBY' | 'PREGAME' | 'PLAYING' | 'VICTORY_HERO' | 'VICTORY_DM';
  gameId?: string;
  timer: number; // Seconds remaining
  dmResources: number;
  dmHand: ObstacleCard[];
  dmDeck: ObstacleCard[]; // Drafted deck
  dmDraftOptions: ObstacleCard[]; // For pregame
  dmDeckPointer: number; // Tracks the index of the next card to draw
  players: Player[];
  map: Record<string, Room>; // Map keyed by "x,y"
  localPlayerId: string | null;
  lastResourceTick: number;
  lastCardDrawTick: number;
  lastSuperChargeTime: number; // Timestamp for DM global cooldown
  lastTimerTick: number; // Timestamp for last second decrement
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
  | { type: 'BUY_ITEM'; playerId: string; itemId: string }
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
  | { type: 'DRAFT_DIE'; playerId: string; dieIndex: number } 
  | { type: 'DRAFT_ITEM'; playerId: string; itemIndex: number }
  | { type: 'DRAFT_CARD'; cardIndex: number } 
  | { type: 'PLAYER_READY'; playerId: string };
