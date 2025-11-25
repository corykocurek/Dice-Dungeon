
import { StatType, HeroClass, ObstacleCard, Die, ItemDefinition } from './types';
import { ASSETS } from './assets';

export const GAME_DURATION = 600; // 10 minutes in seconds
export const MOVEMENT_DELAY = 5000; // 5 seconds in ms
export const OBSTACLE_ROLL_DELAY = 5000; // 5 seconds
export const RESOURCE_TICK_INTERVAL = 30000; // 30 seconds
export const CARD_DRAW_INTERVAL = 30000; // 30 seconds
export const REROLL_COOLDOWN = 5000; // 5 seconds

export const MAP_SIZE = 8;

export const RED_KEY_ID = 'RED_KEY';

// Color mapping for stats
export const STAT_COLORS: Record<StatType, string> = {
  [StatType.MUSCLE]: 'text-red-500 border-red-500',
  [StatType.AGILITY]: 'text-yellow-400 border-yellow-400',
  [StatType.FORTITUDE]: 'text-orange-500 border-orange-500',
  [StatType.KNOWLEDGE]: 'text-blue-400 border-blue-400',
  [StatType.SMARTS]: 'text-purple-400 border-purple-400',
  [StatType.LOOKS]: 'text-pink-400 border-pink-400',
};

// Explicit background colors to ensure Tailwind includes them
export const STAT_BG_COLORS: Record<StatType, string> = {
  [StatType.MUSCLE]: 'bg-red-500',
  [StatType.AGILITY]: 'bg-yellow-400',
  [StatType.FORTITUDE]: 'bg-orange-500',
  [StatType.KNOWLEDGE]: 'bg-blue-400',
  [StatType.SMARTS]: 'bg-purple-400',
  [StatType.LOOKS]: 'bg-pink-400',
};

export const CLASS_BONUS: Record<HeroClass, StatType> = {
  [HeroClass.FIGHTER]: StatType.MUSCLE,
  [HeroClass.ROGUE]: StatType.AGILITY,
  [HeroClass.WIZARD]: StatType.KNOWLEDGE,
  [HeroClass.CLERIC]: StatType.SMARTS,
  [HeroClass.BARBARIAN]: StatType.FORTITUDE,
  [HeroClass.BARD]: StatType.LOOKS,
};

// Item Definitions
export const ITEM_REGISTRY: Record<string, ItemDefinition> = {
    [RED_KEY_ID]: {
        id: RED_KEY_ID,
        name: 'Red Key',
        description: 'Unlocks Red Doors.',
        imageUrl: ASSETS.KEY_RED
    },
    'ITEM_SWORD': { id: 'ITEM_SWORD', name: 'Iron Sword', description: '+1 to Muscle rolls.', imageUrl: ASSETS.ITEM_SWORD, bonusStat: StatType.MUSCLE, bonusAmount: 1 },
    'ITEM_SHIELD': { id: 'ITEM_SHIELD', name: 'Tower Shield', description: '+1 to Fortitude rolls.', imageUrl: ASSETS.ITEM_SHIELD, bonusStat: StatType.FORTITUDE, bonusAmount: 1 },
    'ITEM_BOOTS': { id: 'ITEM_BOOTS', name: 'Elven Boots', description: '+1 to Agility rolls.', imageUrl: ASSETS.ITEM_BOOTS, bonusStat: StatType.AGILITY, bonusAmount: 1 },
    'ITEM_BOOK': { id: 'ITEM_BOOK', name: 'Arcane Tome', description: '+1 to Knowledge rolls.', imageUrl: ASSETS.ITEM_BOOK, bonusStat: StatType.KNOWLEDGE, bonusAmount: 1 },
    'ITEM_STAFF': { id: 'ITEM_STAFF', name: 'Elder Staff', description: '+1 to Smarts rolls.', imageUrl: ASSETS.ITEM_STAFF, bonusStat: StatType.SMARTS, bonusAmount: 1 },
    'ITEM_TOOLS': { id: 'ITEM_TOOLS', name: 'Thieves Tools', description: 'Adds an Extra Die to your pool.', imageUrl: ASSETS.ITEM_TOOLS, grantsExtraDie: true },
    'ITEM_SCROLL': { id: 'ITEM_SCROLL', name: 'Teleport Scroll', description: 'Teleport self to Start.', imageUrl: ASSETS.SCROLL, effectType: 'TELEPORT' },
    
    // New Items (20 total mixed)
    'ITEM_SUMMON': { id: 'ITEM_SUMMON', name: 'Summoning Scroll', description: 'Teleports all allies to you.', imageUrl: ASSETS.SCROLL, effectType: 'TELEPORT_OTHERS' },
    'ITEM_POTION_UPGRADE': { id: 'ITEM_POTION_UPGRADE', name: 'Potion of Growth', description: 'Gain 1 Upgrade Point.', imageUrl: ASSETS.POTION, effectType: 'GRANT_UPGRADE' },
    
    // Charms
    'ITEM_CHARM_MUSCLE': { id: 'ITEM_CHARM_MUSCLE', name: 'Bear Charm', description: '+1 Muscle', imageUrl: ASSETS.CHARM, bonusStat: StatType.MUSCLE, bonusAmount: 1 },
    'ITEM_CHARM_AGILITY': { id: 'ITEM_CHARM_AGILITY', name: 'Cat Charm', description: '+1 Agility', imageUrl: ASSETS.CHARM, bonusStat: StatType.AGILITY, bonusAmount: 1 },
    'ITEM_CHARM_FORT': { id: 'ITEM_CHARM_FORT', name: 'Ox Charm', description: '+1 Fortitude', imageUrl: ASSETS.CHARM, bonusStat: StatType.FORTITUDE, bonusAmount: 1 },
    'ITEM_CHARM_KNOW': { id: 'ITEM_CHARM_KNOW', name: 'Owl Charm', description: '+1 Knowledge', imageUrl: ASSETS.CHARM, bonusStat: StatType.KNOWLEDGE, bonusAmount: 1 },
    'ITEM_CHARM_SMART': { id: 'ITEM_CHARM_SMART', name: 'Fox Charm', description: '+1 Smarts', imageUrl: ASSETS.CHARM, bonusStat: StatType.SMARTS, bonusAmount: 1 },
    'ITEM_CHARM_LOOKS': { id: 'ITEM_CHARM_LOOKS', name: 'Swan Charm', description: '+1 Looks', imageUrl: ASSETS.CHARM, bonusStat: StatType.LOOKS, bonusAmount: 1 },

    // Bombs (Nukes)
    'ITEM_BOMB_FIRE': { id: 'ITEM_BOMB_FIRE', name: 'Fire Bomb', description: 'Destroy Agility traps in room.', imageUrl: ASSETS.BOMB, effectType: 'NUKE_OBSTACLE', targetStat: StatType.AGILITY },
    'ITEM_BOMB_ICE': { id: 'ITEM_BOMB_ICE', name: 'Ice Bomb', description: 'Destroy Muscle traps in room.', imageUrl: ASSETS.BOMB, effectType: 'NUKE_OBSTACLE', targetStat: StatType.MUSCLE },
    'ITEM_BOMB_ACID': { id: 'ITEM_BOMB_ACID', name: 'Acid Bomb', description: 'Destroy Fortitude traps in room.', imageUrl: ASSETS.BOMB, effectType: 'NUKE_OBSTACLE', targetStat: StatType.FORTITUDE },
    'ITEM_BOMB_LIGHT': { id: 'ITEM_BOMB_LIGHT', name: 'Light Bomb', description: 'Destroy Knowledge traps in room.', imageUrl: ASSETS.BOMB, effectType: 'NUKE_OBSTACLE', targetStat: StatType.KNOWLEDGE },
    'ITEM_BOMB_VOID': { id: 'ITEM_BOMB_VOID', name: 'Void Bomb', description: 'Destroy Smarts traps in room.', imageUrl: ASSETS.BOMB, effectType: 'NUKE_OBSTACLE', targetStat: StatType.SMARTS },
    'ITEM_BOMB_GLAM': { id: 'ITEM_BOMB_GLAM', name: 'Glamour Bomb', description: 'Destroy Looks traps in room.', imageUrl: ASSETS.BOMB, effectType: 'NUKE_OBSTACLE', targetStat: StatType.LOOKS },

    // More Gear
    'ITEM_HELM': { id: 'ITEM_HELM', name: 'Iron Helm', description: '+1 Fortitude', imageUrl: ASSETS.ITEM_SHIELD, bonusStat: StatType.FORTITUDE, bonusAmount: 1 },
    'ITEM_DAGGER': { id: 'ITEM_DAGGER', name: 'Rusty Dagger', description: '+1 Agility', imageUrl: ASSETS.ITEM_SWORD, bonusStat: StatType.AGILITY, bonusAmount: 1 },
    'ITEM_ROBE': { id: 'ITEM_ROBE', name: 'Silk Robe', description: '+1 Looks', imageUrl: ASSETS.ITEM_BOOK, bonusStat: StatType.LOOKS, bonusAmount: 1 },
    'ITEM_RING': { id: 'ITEM_RING', name: 'Ring of Mind', description: '+1 Smarts', imageUrl: ASSETS.CHARM, bonusStat: StatType.SMARTS, bonusAmount: 1 },
};

export const LOOT_TABLE = [
    'ITEM_SWORD', 'ITEM_SHIELD', 'ITEM_BOOTS', 'ITEM_BOOK', 'ITEM_STAFF', 'ITEM_TOOLS',
    'ITEM_SUMMON', 'ITEM_POTION_UPGRADE', 'ITEM_CHARM_MUSCLE', 'ITEM_CHARM_AGILITY',
    'ITEM_BOMB_FIRE', 'ITEM_BOMB_ICE', 'ITEM_BOMB_ACID', 'ITEM_DAGGER', 'ITEM_ROBE'
];

// Special card not in the main deck
export const RED_DOOR_CARD: ObstacleCard = {
    id: 'special-red-door',
    name: "Red Door",
    cost: 0,
    requirements: { [StatType.AGILITY]: 99 }, // Effectively impossible
    description: "Requires RED KEY",
    keyRequirement: RED_KEY_ID,
    imageUrl: `${ASSETS.DOOR_RED}`
};

// Huge Obstacle Expansion
const BASIC_CARDS: Omit<ObstacleCard, 'id'>[] = [
    { name: "Locked Door", cost: 1, requirements: { [StatType.AGILITY]: 1 }, description: "A rusty lock.", imageUrl: ASSETS.LOCKED_DOOR, tier: 'BASIC' },
    { name: "Web Trap", cost: 1, requirements: { [StatType.SMARTS]: 1 }, description: "Sticky webs.", specialRules: { preventsRetreat: true }, imageUrl: ASSETS.WEB_TRAP, tier: 'BASIC' },
    { name: "Goblin Scout", cost: 1, requirements: { [StatType.LOOKS]: 1 }, description: "Ugly little guy.", imageUrl: ASSETS.ORC_GUARD, tier: 'BASIC' },
    { name: "Loose Rocks", cost: 1, requirements: { [StatType.FORTITUDE]: 1 }, description: "Watch your head.", imageUrl: ASSETS.BOULDER, tier: 'BASIC' },
    { name: "Simple Riddle", cost: 1, requirements: { [StatType.KNOWLEDGE]: 1 }, description: "What has 4 legs?", imageUrl: ASSETS.SPHINX, tier: 'BASIC' },
    { name: "Heavy Box", cost: 1, requirements: { [StatType.MUSCLE]: 1 }, description: "Lift with your legs.", imageUrl: ASSETS.TREASURE_CHEST, tier: 'BASIC' },
    
    { name: "Orc Guard", cost: 2, requirements: { [StatType.MUSCLE]: 2 }, description: "A grumpy guard.", imageUrl: ASSETS.ORC_GUARD, tier: 'BASIC' },
    { name: "Poison Gas", cost: 2, requirements: { [StatType.FORTITUDE]: 2 }, description: "Choking fumes.", imageUrl: ASSETS.POISON_GAS, tier: 'BASIC' },
    { name: "Seductive Siren", cost: 2, requirements: { [StatType.LOOKS]: 2 }, description: "Distractingly beautiful.", imageUrl: ASSETS.SIREN, tier: 'BASIC' },
    { name: "Heavy Boulder", cost: 2, requirements: { [StatType.MUSCLE]: 2 }, description: "Blockage in the path.", imageUrl: ASSETS.BOULDER, tier: 'BASIC' },
];

const NEUTRAL_CARDS: Omit<ObstacleCard, 'id'>[] = [
    { name: "Spiked Pit", cost: 3, requirements: { [StatType.AGILITY]: 3 }, description: "A floor covered in illusions.", imageUrl: ASSETS.SPIKED_PIT, tier: 'NEUTRAL' },
    { name: "Rune Trap", cost: 3, requirements: { [StatType.KNOWLEDGE]: 3 }, description: "Explosive magical runes.", imageUrl: ASSETS.RUNE_TRAP, tier: 'NEUTRAL' },
    { name: "Sphinx Riddle", cost: 3, requirements: { [StatType.SMARTS]: 3 }, description: "Answer or perish.", imageUrl: ASSETS.SPHINX, tier: 'NEUTRAL' },
    { name: "Ancient Curse", cost: 3, requirements: { [StatType.FORTITUDE]: 3 }, description: "Bad vibes only. Resets on leave.", specialRules: { resetsOnLeave: true }, imageUrl: ASSETS.ANCIENT_CURSE, tier: 'NEUTRAL' },
    
    { name: "Slime Cube", cost: 2, requirements: { [StatType.FORTITUDE]: 3 }, description: "It burns!", imageUrl: ASSETS.MONSTER_SLIME, tier: 'NEUTRAL' },
    { name: "Ghost", cost: 2, requirements: { [StatType.KNOWLEDGE]: 3 }, description: "Spooky spirit.", imageUrl: ASSETS.MONSTER_GHOST, tier: 'NEUTRAL' },
    { name: "Giant Bat", cost: 2, requirements: { [StatType.AGILITY]: 3 }, description: "Screeching horror.", imageUrl: ASSETS.MONSTER_BAT, tier: 'NEUTRAL' },
    
    { name: "Treasure Chest", cost: 2, requirements: { [StatType.MUSCLE]: 2 }, description: "Smash open! Loot drop.", specialRules: { reward: 'LOOT_DROP' }, imageUrl: ASSETS.TREASURE_CHEST, tier: 'NEUTRAL' },
    { name: "Mimic", cost: 3, requirements: { [StatType.MUSCLE]: 3 }, description: "It bites back.", imageUrl: ASSETS.TREASURE_CHEST, tier: 'NEUTRAL' },

    // New Multi-Stat Neutral Cards
    { name: "Locked Grimoire", cost: 3, requirements: { [StatType.KNOWLEDGE]: 1, [StatType.SMARTS]: 1 }, description: "Magical lock.", imageUrl: ASSETS.ITEM_BOOK, tier: 'NEUTRAL' },
    { name: "Dodgeball Team", cost: 3, requirements: { [StatType.AGILITY]: 1, [StatType.MUSCLE]: 1 }, description: "Think fast!", imageUrl: ASSETS.ORC_GUARD, tier: 'NEUTRAL' },
    { name: "Bodyguard", cost: 3, requirements: { [StatType.MUSCLE]: 1, [StatType.LOOKS]: 1 }, description: "Tough and stylish.", imageUrl: ASSETS.ORC_GUARD, tier: 'NEUTRAL' },
    { name: "Poisoned Darts", cost: 3, requirements: { [StatType.AGILITY]: 1, [StatType.FORTITUDE]: 1 }, description: "Dodge or resist.", imageUrl: ASSETS.SPIKED_PIT, tier: 'NEUTRAL' },
    { name: "Haunted Mirror", cost: 3, requirements: { [StatType.KNOWLEDGE]: 1, [StatType.LOOKS]: 1 }, description: "Reflects your soul.", imageUrl: ASSETS.MONSTER_GHOST, tier: 'NEUTRAL' },
];

const ADVANCED_CARDS: Omit<ObstacleCard, 'id'>[] = [
    { name: "Cave Troll", cost: 4, requirements: { [StatType.MUSCLE]: 6 }, description: "Huge HP. Damage accumulates.", specialRules: { accumulatesDamage: true }, imageUrl: ASSETS.TROLL, tier: 'ADVANCED' },
    { name: "Lich King", cost: 5, requirements: { [StatType.KNOWLEDGE]: 7 }, description: "Master of death.", specialRules: { accumulatesDamage: true, reward: 'LOOT_DROP' }, imageUrl: ASSETS.ANCIENT_CURSE, tier: 'ADVANCED' },
    { name: "Dragon", cost: 5, requirements: { [StatType.FORTITUDE]: 8 }, description: "Fire breath.", specialRules: { accumulatesDamage: true, reward: 'LOOT_DROP' }, imageUrl: ASSETS.TROLL, tier: 'ADVANCED' },
    
    { name: "Mirror Maze", cost: 4, requirements: { [StatType.SMARTS]: 5 }, description: "Reflections lie.", imageUrl: ASSETS.RUNE_TRAP, tier: 'ADVANCED' },
    { name: "Lava Floor", cost: 4, requirements: { [StatType.AGILITY]: 5 }, description: "Floor is lava.", imageUrl: ASSETS.POISON_GAS, tier: 'ADVANCED' },
    { name: "Vampire Lord", cost: 4, requirements: { [StatType.LOOKS]: 5 }, description: "Hypnotic gaze.", imageUrl: ASSETS.SIREN, tier: 'ADVANCED' },
    
    { name: "Iron Golem", cost: 4, requirements: { [StatType.MUSCLE]: 6 }, description: "Unstoppable.", imageUrl: ASSETS.ORC_GUARD, tier: 'ADVANCED' },
    { name: "Grand Chest", cost: 3, requirements: { [StatType.SMARTS]: 4 }, description: "Epic Loot inside.", specialRules: { reward: 'LOOT_DROP' }, imageUrl: ASSETS.TREASURE_CHEST, tier: 'ADVANCED' },

    // New Multi-Stat Advanced Cards
    { name: "Chimera", cost: 5, requirements: { [StatType.MUSCLE]: 3, [StatType.KNOWLEDGE]: 3 }, description: "Lion, Goat, Snake.", specialRules: { accumulatesDamage: true }, imageUrl: ASSETS.TROLL, tier: 'ADVANCED' },
    { name: "Sphinx's Gym", cost: 4, requirements: { [StatType.MUSCLE]: 2, [StatType.SMARTS]: 2 }, description: "Brain and brawn.", imageUrl: ASSETS.SPHINX, tier: 'ADVANCED' },
    { name: "Beauty Contest", cost: 4, requirements: { [StatType.LOOKS]: 4 }, description: "Very judgey.", imageUrl: ASSETS.SIREN, tier: 'ADVANCED' },
    { name: "Marathon", cost: 4, requirements: { [StatType.FORTITUDE]: 2, [StatType.AGILITY]: 2 }, description: "Endurance run.", imageUrl: ASSETS.BOULDER, tier: 'ADVANCED' },
    { name: "Debate Club", cost: 4, requirements: { [StatType.SMARTS]: 2, [StatType.KNOWLEDGE]: 2 }, description: "Logic trap.", imageUrl: ASSETS.RUNE_TRAP, tier: 'ADVANCED' },
    { name: "Triathlon", cost: 5, requirements: { [StatType.MUSCLE]: 2, [StatType.AGILITY]: 2, [StatType.FORTITUDE]: 2 }, description: "Ultimate test.", specialRules: { resetsOnLeave: true }, imageUrl: ASSETS.ORC_GUARD, tier: 'ADVANCED' },
    { name: "Chess Boxing", cost: 4, requirements: { [StatType.MUSCLE]: 2, [StatType.SMARTS]: 2 }, description: "Punch then pawn.", imageUrl: ASSETS.ORC_GUARD, tier: 'ADVANCED' },
    { name: "Mud Pit Wrestling", cost: 4, requirements: { [StatType.MUSCLE]: 2, [StatType.AGILITY]: 1, [StatType.FORTITUDE]: 1 }, description: "Slippery fight.", imageUrl: ASSETS.MONSTER_SLIME, tier: 'ADVANCED' },
    { name: "Laser Grid", cost: 4, requirements: { [StatType.AGILITY]: 3, [StatType.SMARTS]: 1 }, description: "Don't touch.", imageUrl: ASSETS.WEB_TRAP, tier: 'ADVANCED' },
    { name: "Bard Off", cost: 4, requirements: { [StatType.LOOKS]: 2, [StatType.KNOWLEDGE]: 2 }, description: "Sing battle.", imageUrl: ASSETS.SIREN, tier: 'ADVANCED' },
    { name: "Arm Wrestling", cost: 4, requirements: { [StatType.MUSCLE]: 3, [StatType.FORTITUDE]: 2 }, description: "Over the top.", imageUrl: ASSETS.ORC_GUARD, tier: 'ADVANCED' },
    { name: "Spiked Wall", cost: 4, requirements: { [StatType.MUSCLE]: 2, [StatType.AGILITY]: 2 }, description: "Closing in.", specialRules: { preventsRetreat: true }, imageUrl: ASSETS.SPIKED_PIT, tier: 'ADVANCED' },
    { name: "Medusa", cost: 5, requirements: { [StatType.FORTITUDE]: 3, [StatType.AGILITY]: 2 }, description: "Don't look.", imageUrl: ASSETS.ANCIENT_CURSE, tier: 'ADVANCED' },
    { name: "Hydra", cost: 5, requirements: { [StatType.MUSCLE]: 3, [StatType.FORTITUDE]: 2 }, description: "Cut one head...", specialRules: { accumulatesDamage: true }, imageUrl: ASSETS.MONSTER_SLIME, tier: 'ADVANCED' },
    { name: "Cerberus", cost: 5, requirements: { [StatType.MUSCLE]: 5 }, description: "Three heads.", imageUrl: ASSETS.TROLL, tier: 'ADVANCED' },
];

// Combine all cards
export const OBSTACLE_DECK: Omit<ObstacleCard, 'id'>[] = [
    ...BASIC_CARDS,
    ...NEUTRAL_CARDS,
    ...ADVANCED_CARDS
];

export const generateStandardDie = (id: string): Die => {
  // Randomly assign 6 faces from the pool
  const allStats = Object.values(StatType);
  const faces: StatType[] = [];
  const multipliers: number[] = [];
  
  for (let i = 0; i < 6; i++) {
    faces.push(allStats[Math.floor(Math.random() * allStats.length)]);
    multipliers.push(1); // Default multiplier 1x
  }
  
  const currentValue = faces[Math.floor(Math.random() * faces.length)];
  return { id, faces, multipliers, currentValue, lockedToObstacleId: null };
};

export const generateBalancedDie = (id: string): Die => {
  // Always has exactly one of each stat
  const faces = Object.values(StatType);
  const multipliers = [1, 1, 1, 1, 1, 1];
  
  const currentValue = faces[Math.floor(Math.random() * faces.length)];
  return { id, faces, multipliers, currentValue, lockedToObstacleId: null };
};

export const generateStarterDice = (): Die[] => {
  // First die is always balanced (1 of each face)
  // Second die is standard (random faces)
  return [generateBalancedDie('d1'), generateStandardDie('d2')];
};
