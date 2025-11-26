

import { StatType, HeroClass, ObstacleCard, Die, ItemDefinition } from './types';
import { ASSETS } from './assets';
export { ASSETS };

export const GAME_DURATION = 600; // 10 minutes in seconds
export const PREGAME_DURATION = 180; // 3 minutes
export const MOVEMENT_DELAY = 3000; // 3 seconds in ms (Reduced from 5s)
export const OBSTACLE_ROLL_DELAY = 5000; // 5 seconds
export const RESOURCE_TICK_INTERVAL = 15000; // 15 seconds (Faster mana regen)
export const CARD_DRAW_INTERVAL = 30000; // 30 seconds
export const REROLL_COOLDOWN = 1000; // 1 second (Reduced)
export const SUPERCHARGE_COOLDOWN = 60000; // 60 seconds
export const SUPERCHARGE_DURATION = 20000; // 20 seconds

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
    requirements: { [StatType.AGILITY]: 99 }, 
    description: "Requires RED KEY",
    keyRequirement: RED_KEY_ID,
    imageUrl: `${ASSETS.DOOR_RED}`,
    tier: 'NEUTRAL'
};

const BASIC_CARDS: Omit<ObstacleCard, 'id'>[] = [
    { name: "Locked Door", cost: 1, requirements: { [StatType.AGILITY]: 2 }, description: "A rusty lock.", imageUrl: ASSETS.LOCKED_DOOR, tier: 'BASIC' },
    { name: "Web Trap", cost: 1, requirements: { [StatType.SMARTS]: 2 }, description: "Sticky webs.", specialRules: { preventsRetreat: true }, imageUrl: ASSETS.WEB_TRAP, tier: 'BASIC' },
    { name: "Goblin Scout", cost: 1, requirements: { [StatType.LOOKS]: 2 }, description: "Ugly little guy.", imageUrl: ASSETS.GOBLIN_SCOUT, tier: 'BASIC' },
    { name: "Loose Rocks", cost: 1, requirements: { [StatType.FORTITUDE]: 2 }, description: "Watch your head.", imageUrl: ASSETS.LOOSE_ROCKS, tier: 'BASIC' },
    { name: "Simple Riddle", cost: 1, requirements: { [StatType.KNOWLEDGE]: 2 }, description: "What has 4 legs?", imageUrl: ASSETS.SIMPLE_RIDDLE, tier: 'BASIC' },
    { name: "Heavy Box", cost: 1, requirements: { [StatType.MUSCLE]: 2 }, description: "Lift with your legs.", imageUrl: ASSETS.HEAVY_BOX, tier: 'BASIC' },
    { name: "Orc Guard", cost: 2, requirements: { [StatType.MUSCLE]: 4 }, description: "A grumpy guard.", imageUrl: ASSETS.ORC_GUARD, tier: 'BASIC' },
    { name: "Poison Gas", cost: 2, requirements: { [StatType.FORTITUDE]: 4 }, description: "Choking fumes.", imageUrl: ASSETS.POISON_GAS, tier: 'BASIC' },
    { name: "Seductive Siren", cost: 2, requirements: { [StatType.LOOKS]: 4 }, description: "Distractingly beautiful.", imageUrl: ASSETS.SIREN, tier: 'BASIC' },
    { name: "Heavy Boulder", cost: 2, requirements: { [StatType.MUSCLE]: 4 }, description: "Blockage in the path.", imageUrl: ASSETS.BOULDER, tier: 'BASIC' },
    
    { name: "Tripwire", cost: 1, requirements: { [StatType.AGILITY]: 2 }, description: "Watch your step.", imageUrl: ASSETS.TRIPWIRE, tier: 'BASIC' },
    { name: "Sleeping Guard", cost: 1, requirements: { [StatType.AGILITY]: 1, [StatType.SMARTS]: 1 }, description: "Don't wake him.", imageUrl: ASSETS.SLEEPING_GUARD, tier: 'BASIC' },
    { name: "Weak Wall", cost: 1, requirements: { [StatType.MUSCLE]: 3 }, description: "Looks breakable.", imageUrl: ASSETS.WEAK_WALL, tier: 'BASIC' },
    { name: "Annoying Pixie", cost: 1, requirements: { [StatType.LOOKS]: 3 }, description: "It's just so cute!", imageUrl: ASSETS.ANNOYING_PIXIE, tier: 'BASIC' },
    { name: "Sudoku Puzzle", cost: 1, requirements: { [StatType.KNOWLEDGE]: 3 }, description: "A simple numbers game.", imageUrl: ASSETS.SUDOKU_PUZZLE, tier: 'BASIC' },
    { name: "Endurance Test", cost: 2, requirements: { [StatType.FORTITUDE]: 4 }, description: "Just hold on.", imageUrl: ASSETS.ENDURANCE_TEST, tier: 'BASIC' },
    { name: "Greased Floor", cost: 2, requirements: { [StatType.AGILITY]: 4 }, description: "Slippery when wet.", imageUrl: ASSETS.GREASED_FLOOR, tier: 'BASIC' },
    { name: "Hypnotic Pattern", cost: 2, requirements: { [StatType.SMARTS]: 4 }, description: "Don't stare too long.", imageUrl: ASSETS.HYPNOTIC_PATTERN, tier: 'BASIC' },
    { name: "Charisma Check", cost: 2, requirements: { [StatType.LOOKS]: 4 }, description: "Talk your way out.", imageUrl: ASSETS.CHARISMA_CHECK, tier: 'BASIC' },
    { name: "Ancient Lever", cost: 2, requirements: { [StatType.MUSCLE]: 2, [StatType.FORTITUDE]: 2 }, description: "It's rusted shut.", imageUrl: ASSETS.ANCIENT_LEVER, tier: 'BASIC' },
    { name: "A Bad Smell", cost: 1, requirements: { [StatType.FORTITUDE]: 3 }, description: "Truly awful.", imageUrl: ASSETS.BAD_SMELL, tier: 'BASIC' },
    { name: "Kobold Thief", cost: 1, requirements: { [StatType.AGILITY]: 3 }, description: "Quick little lizard.", imageUrl: ASSETS.KOBOLD_THIEF, tier: 'BASIC' },
    { name: "Magic Mouth", cost: 1, requirements: { [StatType.KNOWLEDGE]: 3 }, description: "It speaks in riddles.", imageUrl: ASSETS.MAGIC_MOUTH, tier: 'BASIC' },
    { name: "Flex Off", cost: 2, requirements: { [StatType.MUSCLE]: 4 }, description: "Show your gains.", imageUrl: ASSETS.FLEX_OFF, tier: 'BASIC' },
    { name: "Staring Contest", cost: 2, requirements: { [StatType.LOOKS]: 4 }, description: "Don't blink.", imageUrl: ASSETS.STARING_CONTEST, tier: 'BASIC' },
    { name: "Pressure Plate", cost: 2, requirements: { [StatType.AGILITY]: 2, [StatType.SMARTS]: 2 }, description: "Requires a soft touch.", imageUrl: ASSETS.PRESSURE_PLATE, tier: 'BASIC' },
    { name: "Logical Fallacy", cost: 2, requirements: { [StatType.SMARTS]: 4 }, description: "This statement is false.", imageUrl: ASSETS.LOGICAL_FALLACY, tier: 'BASIC' },
    { name: "Forgotten Lore", cost: 2, requirements: { [StatType.KNOWLEDGE]: 4 }, description: "A dusty old book.", imageUrl: ASSETS.FORGOTTEN_LORE, tier: 'BASIC' },
    { name: "Thick Mud", cost: 2, requirements: { [StatType.MUSCLE]: 2, [StatType.FORTITUDE]: 2 }, description: "Hard to push through.", imageUrl: ASSETS.THICK_MUD, tier: 'BASIC' },
    { name: "Annoying Ghost", cost: 1, requirements: { [StatType.KNOWLEDGE]: 3 }, description: "Wants to talk about its life.", imageUrl: ASSETS.ANNOYING_GHOST, tier: 'BASIC' },
];

// Increased requirements by ~50%
const NEUTRAL_CARDS: Omit<ObstacleCard, 'id'>[] = [
    { name: "Spiked Pit", cost: 3, requirements: { [StatType.AGILITY]: 9 }, description: "A floor covered in illusions.", imageUrl: ASSETS.SPIKED_PIT, tier: 'NEUTRAL' },
    { name: "Rune Trap", cost: 3, requirements: { [StatType.KNOWLEDGE]: 9 }, description: "Explosive magical runes.", imageUrl: ASSETS.RUNE_TRAP, tier: 'NEUTRAL' },
    { name: "Sphinx Riddle", cost: 3, requirements: { [StatType.SMARTS]: 9 }, description: "Answer or perish.", imageUrl: ASSETS.SPHINX, tier: 'NEUTRAL' },
    { name: "Ancient Curse", cost: 3, requirements: { [StatType.FORTITUDE]: 9 }, description: "Bad vibes only. Resets on leave.", specialRules: { resetsOnLeave: true }, imageUrl: ASSETS.ANCIENT_CURSE, tier: 'NEUTRAL' },
    { name: "Slime Cube", cost: 2, requirements: { [StatType.FORTITUDE]: 9 }, description: "It burns!", imageUrl: ASSETS.MONSTER_SLIME, tier: 'NEUTRAL' },
    { name: "Ghost", cost: 2, requirements: { [StatType.KNOWLEDGE]: 9 }, description: "Spooky spirit.", imageUrl: ASSETS.MONSTER_GHOST, tier: 'NEUTRAL' },
    { name: "Giant Bat", cost: 2, requirements: { [StatType.AGILITY]: 9 }, description: "Screeching horror.", imageUrl: ASSETS.MONSTER_BAT, tier: 'NEUTRAL' },
    { name: "Treasure Chest", cost: 2, requirements: { [StatType.MUSCLE]: 6 }, description: "Smash open! Loot drop.", specialRules: { reward: 'LOOT_DROP' }, imageUrl: ASSETS.TREASURE_CHEST, tier: 'NEUTRAL' },
    { name: "Mimic", cost: 3, requirements: { [StatType.MUSCLE]: 9 }, description: "It bites back.", imageUrl: ASSETS.MIMIC, tier: 'NEUTRAL' },
    { name: "Locked Grimoire", cost: 3, requirements: { [StatType.KNOWLEDGE]: 3, [StatType.SMARTS]: 3 }, description: "Magical lock.", imageUrl: ASSETS.LOCKED_GRIMOIRE, tier: 'NEUTRAL' },
    { name: "Dodgeball Team", cost: 3, requirements: { [StatType.AGILITY]: 3, [StatType.MUSCLE]: 3 }, description: "Think fast!", imageUrl: ASSETS.DODGEBALL_TEAM, tier: 'NEUTRAL' },
    { name: "Bodyguard", cost: 3, requirements: { [StatType.MUSCLE]: 3, [StatType.LOOKS]: 3 }, description: "Tough and stylish.", imageUrl: ASSETS.BODYGUARD, tier: 'NEUTRAL' },
    { name: "Poisoned Darts", cost: 3, requirements: { [StatType.AGILITY]: 3, [StatType.FORTITUDE]: 3 }, description: "Dodge or resist.", imageUrl: ASSETS.POISONED_DARTS, tier: 'NEUTRAL' },
    { name: "Haunted Mirror", cost: 3, requirements: { [StatType.KNOWLEDGE]: 3, [StatType.LOOKS]: 3 }, description: "Reflects your soul.", imageUrl: ASSETS.HAUNTED_MIRROR, tier: 'NEUTRAL' },
    
    { name: "Ogre", cost: 3, requirements: { [StatType.MUSCLE]: 12 }, description: "Big and dumb.", imageUrl: ASSETS.OGRE, tier: 'NEUTRAL' },
    { name: "Blade Pendulum", cost: 3, requirements: { [StatType.AGILITY]: 6, [StatType.SMARTS]: 3 }, description: "Timing is everything.", imageUrl: ASSETS.BLADE_PENDULUM, tier: 'NEUTRAL' },
    { name: "Doppelganger", cost: 3, requirements: { [StatType.LOOKS]: 6, [StatType.SMARTS]: 3 }, description: "An evil twin.", imageUrl: ASSETS.DOPPELGANGER, tier: 'NEUTRAL' },
    { name: "Corrosive Slime", cost: 3, requirements: { [StatType.FORTITUDE]: 6, [StatType.AGILITY]: 3 }, description: "Melts your boots.", imageUrl: ASSETS.CORROSIVE_SLIME, tier: 'NEUTRAL' },
    { name: "Cultist Chanter", cost: 3, requirements: { [StatType.KNOWLEDGE]: 6, [StatType.LOOKS]: 3 }, description: "Interrupt the ritual.", imageUrl: ASSETS.CULTIST_CHANTER, tier: 'NEUTRAL' },
    { name: "Minotaur", cost: 4, requirements: { [StatType.MUSCLE]: 9, [StatType.SMARTS]: 3 }, description: "Lost in the maze.", imageUrl: ASSETS.MINOTAUR, tier: 'NEUTRAL' },
    { name: "Harpy Flock", cost: 3, requirements: { [StatType.LOOKS]: 9 }, description: "Their song is maddening.", imageUrl: ASSETS.HARPY_FLOCK, tier: 'NEUTRAL' },
    { name: "Fire Wall", cost: 3, requirements: { [StatType.FORTITUDE]: 9 }, description: "A wall of searing heat.", imageUrl: ASSETS.FIRE_WALL, tier: 'NEUTRAL' },
    { name: "Golem Sentry", cost: 4, requirements: { [StatType.MUSCLE]: 12 }, description: "Made of stone.", specialRules: { accumulatesDamage: true }, imageUrl: ASSETS.GOLEM_SENTRY, tier: 'NEUTRAL' },
    { name: "Flooding Room", cost: 4, requirements: { [StatType.FORTITUDE]: 6, [StatType.MUSCLE]: 6 }, description: "No time to waste!", specialRules: { preventsRetreat: true }, imageUrl: ASSETS.FLOODING_ROOM, tier: 'NEUTRAL' },
    { name: "Lesser Demon", cost: 3, requirements: { [StatType.KNOWLEDGE]: 9 }, description: "Know its true name.", imageUrl: ASSETS.LESSER_DEMON, tier: 'NEUTRAL' },
    { name: "Cursed Idol", cost: 2, requirements: { [StatType.FORTITUDE]: 6 }, description: "Don't touch it! Resets.", specialRules: { resetsOnLeave: true }, imageUrl: ASSETS.CURSED_IDOL, tier: 'NEUTRAL' },
    { name: "Gilded Chest", cost: 2, requirements: { [StatType.MUSCLE]: 6 }, description: "Better loot.", specialRules: { reward: 'LOOT_DROP' }, imageUrl: ASSETS.GILDED_CHEST, tier: 'NEUTRAL' },
    { name: "Gargoyle", cost: 3, requirements: { [StatType.FORTITUDE]: 9 }, description: "Stone skin.", imageUrl: ASSETS.GARGOYLE, tier: 'NEUTRAL' },
    { name: "Illusionary Wall", cost: 2, requirements: { [StatType.SMARTS]: 9 }, description: "It's not real.", imageUrl: ASSETS.ILLUSIONARY_WALL, tier: 'NEUTRAL' },
    { name: "Feast Hall", cost: 3, requirements: { [StatType.FORTITUDE]: 6, [StatType.LOOKS]: 3 }, description: "Resist the temptation.", imageUrl: ASSETS.FEAST_HALL, tier: 'NEUTRAL' },
    { name: "Quick Sand", cost: 3, requirements: { [StatType.MUSCLE]: 6, [StatType.AGILITY]: 3 }, description: "Don't struggle.", specialRules: { preventsRetreat: true }, imageUrl: ASSETS.QUICK_SAND, tier: 'NEUTRAL' },
    { name: "Necromancer's Puzzle", cost: 3, requirements: { [StatType.KNOWLEDGE]: 6, [StatType.SMARTS]: 3 }, description: "A deadly pattern.", imageUrl: ASSETS.NECROMANCER_PUZZLE, tier: 'NEUTRAL' },
    { name: "Banshee's Wail", cost: 3, requirements: { [StatType.FORTITUDE]: 9 }, description: "A deafening scream.", imageUrl: ASSETS.BANSHEE_WAIL, tier: 'NEUTRAL' },
    { name: "Bandit Ambush", cost: 2, requirements: { [StatType.AGILITY]: 6, [StatType.LOOKS]: 3 }, description: "Surprise attack!", imageUrl: ASSETS.BANDIT_AMBUSH, tier: 'NEUTRAL' },
];

// Increased requirements by ~50%
const ADVANCED_CARDS: Omit<ObstacleCard, 'id'>[] = [
    { name: "Cave Troll", cost: 4, requirements: { [StatType.MUSCLE]: 18 }, description: "Huge HP. Damage accumulates.", specialRules: { accumulatesDamage: true }, imageUrl: ASSETS.TROLL, tier: 'ADVANCED' },
    { name: "Lich King", cost: 5, requirements: { [StatType.KNOWLEDGE]: 21 }, description: "Master of death.", specialRules: { accumulatesDamage: true, reward: 'LOOT_DROP' }, imageUrl: ASSETS.LICH_KING, tier: 'ADVANCED' },
    { name: "Dragon", cost: 5, requirements: { [StatType.FORTITUDE]: 24 }, description: "Fire breath.", specialRules: { accumulatesDamage: true, reward: 'LOOT_DROP' }, imageUrl: ASSETS.DRAGON, tier: 'ADVANCED' },
    { name: "Mirror Maze", cost: 4, requirements: { [StatType.SMARTS]: 15 }, description: "Reflections lie.", imageUrl: ASSETS.MIRROR_MAZE, tier: 'ADVANCED' },
    { name: "Lava Floor", cost: 4, requirements: { [StatType.AGILITY]: 15 }, description: "Floor is lava.", imageUrl: ASSETS.LAVA_FLOOR, tier: 'ADVANCED' },
    { name: "Vampire Lord", cost: 4, requirements: { [StatType.LOOKS]: 15 }, description: "Hypnotic gaze.", imageUrl: ASSETS.VAMPIRE_LORD, tier: 'ADVANCED' },
    { name: "Iron Golem", cost: 4, requirements: { [StatType.MUSCLE]: 18 }, description: "Unstoppable.", imageUrl: ASSETS.IRON_GOLEM, tier: 'ADVANCED' },
    { name: "Grand Chest", cost: 3, requirements: { [StatType.SMARTS]: 12 }, description: "Epic Loot inside.", specialRules: { reward: 'LOOT_DROP' }, imageUrl: ASSETS.GRAND_CHEST, tier: 'ADVANCED' },
    { name: "Chimera", cost: 5, requirements: { [StatType.MUSCLE]: 9, [StatType.KNOWLEDGE]: 9 }, description: "Lion, Goat, Snake.", specialRules: { accumulatesDamage: true }, imageUrl: ASSETS.CHIMERA, tier: 'ADVANCED' },
    { name: "Sphinx's Gym", cost: 4, requirements: { [StatType.MUSCLE]: 6, [StatType.SMARTS]: 6 }, description: "Brain and brawn.", imageUrl: ASSETS.SPHINX_GYM, tier: 'ADVANCED' },
    { name: "Beauty Contest", cost: 4, requirements: { [StatType.LOOKS]: 12 }, description: "Very judgey.", imageUrl: ASSETS.BEAUTY_CONTEST, tier: 'ADVANCED' },
    { name: "Marathon", cost: 4, requirements: { [StatType.FORTITUDE]: 6, [StatType.AGILITY]: 6 }, description: "Endurance run.", imageUrl: ASSETS.MARATHON, tier: 'ADVANCED' },
    { name: "Debate Club", cost: 4, requirements: { [StatType.SMARTS]: 6, [StatType.KNOWLEDGE]: 6 }, description: "Logic trap.", imageUrl: ASSETS.DEBATE_CLUB, tier: 'ADVANCED' },
    { name: "Triathlon", cost: 5, requirements: { [StatType.MUSCLE]: 6, [StatType.AGILITY]: 6, [StatType.FORTITUDE]: 6 }, description: "Ultimate test.", specialRules: { resetsOnLeave: true }, imageUrl: ASSETS.TRIATHLON, tier: 'ADVANCED' },
    { name: "Chess Boxing", cost: 4, requirements: { [StatType.MUSCLE]: 6, [StatType.SMARTS]: 6 }, description: "Punch then pawn.", imageUrl: ASSETS.CHESS_BOXING, tier: 'ADVANCED' },
    { name: "Mud Pit Wrestling", cost: 4, requirements: { [StatType.MUSCLE]: 6, [StatType.AGILITY]: 3, [StatType.FORTITUDE]: 3 }, description: "Slippery fight.", imageUrl: ASSETS.MUD_PIT_WRESTLING, tier: 'ADVANCED' },
    { name: "Laser Grid", cost: 4, requirements: { [StatType.AGILITY]: 9, [StatType.SMARTS]: 3 }, description: "Don't touch.", imageUrl: ASSETS.LASER_GRID, tier: 'ADVANCED' },
    { name: "Bard Off", cost: 4, requirements: { [StatType.LOOKS]: 6, [StatType.KNOWLEDGE]: 6 }, description: "Sing battle.", imageUrl: ASSETS.BARD_OFF, tier: 'ADVANCED' },
    { name: "Arm Wrestling", cost: 4, requirements: { [StatType.MUSCLE]: 9, [StatType.FORTITUDE]: 6 }, description: "Over the top.", imageUrl: ASSETS.ARM_WRESTLING, tier: 'ADVANCED' },
    { name: "Spiked Wall", cost: 4, requirements: { [StatType.MUSCLE]: 6, [StatType.AGILITY]: 6 }, description: "Closing in.", specialRules: { preventsRetreat: true }, imageUrl: ASSETS.SPIKED_WALL, tier: 'ADVANCED' },
    { name: "Medusa", cost: 5, requirements: { [StatType.FORTITUDE]: 9, [StatType.AGILITY]: 6 }, description: "Don't look.", imageUrl: ASSETS.MEDUSA, tier: 'ADVANCED' },
    { name: "Hydra", cost: 5, requirements: { [StatType.MUSCLE]: 9, [StatType.FORTITUDE]: 6 }, description: "Cut one head...", specialRules: { accumulatesDamage: true }, imageUrl: ASSETS.HYDRA, tier: 'ADVANCED' },
    { name: "Cerberus", cost: 5, requirements: { [StatType.MUSCLE]: 15 }, description: "Three heads.", imageUrl: ASSETS.CERBERUS, tier: 'ADVANCED' },
    
    { name: "Beholder", cost: 6, requirements: { [StatType.SMARTS]: 12, [StatType.KNOWLEDGE]: 6 }, description: "Don't meet its gaze.", specialRules: { accumulatesDamage: true }, imageUrl: ASSETS.BEHOLDER, tier: 'ADVANCED' },
    { name: "The Tarrasque", cost: 8, requirements: { [StatType.MUSCLE]: 15, [StatType.FORTITUDE]: 15 }, description: "The world-eater.", specialRules: { accumulatesDamage: true, reward: 'LOOT_DROP' }, imageUrl: ASSETS.TARRASQUE, tier: 'ADVANCED' },
    { name: "Archmage's Test", cost: 5, requirements: { [StatType.KNOWLEDGE]: 9, [StatType.SMARTS]: 9 }, description: "A final exam.", imageUrl: ASSETS.ARCHMAGE_TEST, tier: 'ADVANCED' },
    { name: "God of Beauty", cost: 5, requirements: { [StatType.LOOKS]: 18 }, description: "Simply divine.", specialRules: { reward: 'LOOT_DROP' }, imageUrl: ASSETS.GOD_OF_BEAUTY, tier: 'ADVANCED' },
    { name: "Titan's Gauntlet", cost: 6, requirements: { [StatType.FORTITUDE]: 12, [StatType.MUSCLE]: 6 }, description: "A test of pure will.", imageUrl: ASSETS.TITANS_GAUNTLET, tier: 'ADVANCED' },
    { name: "Acrobat's Finale", cost: 5, requirements: { [StatType.AGILITY]: 18 }, description: "The final performance.", imageUrl: ASSETS.ACROBATS_FINALE, tier: 'ADVANCED' },
    { name: "Deal with a Devil", cost: 4, requirements: { [StatType.SMARTS]: 12, [StatType.LOOKS]: 6 }, description: "Read the fine print.", specialRules: { preventsRetreat: true }, imageUrl: ASSETS.DEAL_DEVIL, tier: 'ADVANCED' },
    { name: "Djinni's Wish", cost: 4, requirements: { [StatType.KNOWLEDGE]: 12, [StatType.LOOKS]: 6 }, description: "Be careful what you wish for.", imageUrl: ASSETS.DJINNI_WISH, tier: 'ADVANCED' },
    { name: "Living Wall", cost: 5, requirements: { [StatType.MUSCLE]: 12, [StatType.FORTITUDE]: 6 }, description: "The walls are closing in!", specialRules: { accumulatesDamage: true, preventsRetreat: true }, imageUrl: ASSETS.LIVING_WALL, tier: 'ADVANCED' },
    { name: "The Great Library", cost: 4, requirements: { [StatType.KNOWLEDGE]: 18 }, description: "Find the forbidden tome.", imageUrl: ASSETS.GREAT_LIBRARY, tier: 'ADVANCED' },
    { name: "Dragon's Hoard", cost: 4, requirements: { [StatType.AGILITY]: 12, [StatType.LOOKS]: 6 }, description: "Don't wake the beast.", specialRules: { reward: 'LOOT_DROP' }, imageUrl: ASSETS.DRAGON_HOARD, tier: 'ADVANCED' },
    { name: "Mind Flayer", cost: 6, requirements: { [StatType.SMARTS]: 18 }, description: "It wants your brain.", imageUrl: ASSETS.MIND_FLAYER, tier: 'ADVANCED' },
    { name: "Elemental Chaos", cost: 5, requirements: { [StatType.FORTITUDE]: 6, [StatType.KNOWLEDGE]: 6, [StatType.AGILITY]: 6 }, description: "A storm of magic.", specialRules: { resetsOnLeave: true }, imageUrl: ASSETS.ELEMENTAL_CHAOS, tier: 'ADVANCED' },
    { name: "Rakshasa", cost: 5, requirements: { [StatType.LOOKS]: 12, [StatType.SMARTS]: 6 }, description: "A charming deceiver.", imageUrl: ASSETS.RAKSHASA, tier: 'ADVANCED' },
    { name: "Arch-Lich's Phylactery", cost: 6, requirements: { [StatType.KNOWLEDGE]: 15, [StatType.FORTITUDE]: 6 }, description: "Destroy his soul cage.", specialRules: { reward: 'LOOT_DROP' }, imageUrl: ASSETS.PHYLACTERY, tier: 'ADVANCED' },
    { name: "Giant's Forge", cost: 5, requirements: { [StatType.MUSCLE]: 12, [StatType.FORTITUDE]: 6 }, description: "Incredibly hot.", imageUrl: ASSETS.GIANTS_FORGE, tier: 'ADVANCED' },
    { name: "Assassin's Gauntlet", cost: 5, requirements: { [StatType.AGILITY]: 12, [StatType.SMARTS]: 6 }, description: "Full of hidden traps.", specialRules: { preventsRetreat: true }, imageUrl: ASSETS.ASSASSINS_GAUNTLET, tier: 'ADVANCED' },
    { name: "The Abyss", cost: 6, requirements: { [StatType.FORTITUDE]: 18 }, description: "Don't fall in.", imageUrl: ASSETS.ABYSS, tier: 'ADVANCED' },
    { name: "Royal Court", cost: 4, requirements: { [StatType.LOOKS]: 12, [StatType.KNOWLEDGE]: 6 }, description: "Impress the king.", imageUrl: ASSETS.ROYAL_COURT, tier: 'ADVANCED' },
    { name: "War Elephant", cost: 5, requirements: { [StatType.MUSCLE]: 18 }, description: "It's an elephant.", specialRules: { accumulatesDamage: true }, imageUrl: ASSETS.WAR_ELEPHANT, tier: 'ADVANCED' },
];


// Combine all cards
export const OBSTACLE_DECK: Omit<ObstacleCard, 'id'>[] = [
    ...BASIC_CARDS,
    ...NEUTRAL_CARDS,
    ...ADVANCED_CARDS
];
