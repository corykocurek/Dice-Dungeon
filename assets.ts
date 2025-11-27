

// Helper to create SVG Data URI
const HEADER = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' shape-rendering='crispEdges'>";
const FOOTER = "</svg>";

const r = (x: number, y: number, w: number, h: number, c: string) => 
  `<rect x='${x}' y='${y}' width='${w}' height='${h}' fill='${c.replace('#', '%23')}'/>`;

export const ASSETS = {
  // --- LOGO OPTIONS ---
  LOGO_OPTION_1: HEADER + r(8,0,8,8,'#e00') + r(0,4,8,8,'#fa0') + r(8,8,8,8,'#00e') + r(0,4,1,8,'#fff') + r(8,0,1,16,'#fff') + r(0,4,16,1,'#fff') + r(4,7,2,2,'#fff') + r(11,3,2,2,'#fff') + r(11,11,2,2,'#fff') + FOOTER,
  LOGO_OPTION_2: HEADER + r(2,2,12,14,'#444') + r(4,6,8,10,'#000') + r(1,14,14,2,'#222') + r(3,2,1,12,'#777') + r(12,2,1,12,'#777') + r(0,6,2,4,'#a50') + r(14,6,2,4,'#a50') + r(0,4,2,2,'#fa0') + r(14,4,2,2,'#fa0') + r(1,3,1,1,'#fb0') + r(15,3,1,1,'#fb0') + r(6,8,2,2,'#a00') + r(8,8,2,2,'#a00') + FOOTER,
  LOGO_OPTION_3: HEADER + r(2,2,12,12,'#eee') + r(2,2,12,1,'#ccc') + r(2,2,1,12,'#ccc') + r(4,8,8,6,'#000') + r(4,4,2,2,'#000') + r(10,4,2,2,'#000') + r(2,14,12,2,'#333') + r(6,10,1,2,'#500') + r(9,10,1,2,'#500') + FOOTER,

  // --- ITEMS ---
  KEY_RED: HEADER + r(6,2,4,4,'#f00') + r(7,3,2,2,'#111') + r(7,6,2,8,'#f00') + r(9,10,2,1,'#f00') + r(9,12,2,1,'#f00') + FOOTER,
  ITEM_BOOK: HEADER + r(3,2,10,12,'#408') + r(4,3,8,10,'#fff') + r(5,4,6,1,'#000') + r(5,6,6,1,'#000') + r(5,8,6,1,'#000') + r(2,2,2,12,'#60a') + FOOTER,
  ITEM_SWORD: HEADER + r(6,10,4,2,'#640') + r(7,12,2,3,'#420') + r(7,15,2,1,'#888') + r(7,1,2,10,'#ccc') + r(8,1,1,10,'#fff') + FOOTER,
  ITEM_TOOLS: HEADER + r(2,4,4,8,'#444') + r(3,2,2,4,'#aaa') + r(8,3,6,1,'#888') + r(13,3,1,4,'#888') + r(8,10,6,2,'#630') + r(13,9,3,4,'#889') + FOOTER,
  ITEM_STAFF: HEADER + r(10,2,4,12,'#642') + r(9,1,6,3,'#a80') + r(11,1,2,2,'#f0f') + FOOTER,
  ITEM_BOOTS: HEADER + r(2,8,6,6,'#282') + r(10,8,4,6,'#282') + r(2,8,6,2,'#4a4') + r(10,8,4,2,'#4a4') + r(0,12,2,2,'#cb2') + FOOTER,
  ITEM_SHIELD: HEADER + r(3,2,10,12,'#888') + r(3,2,10,2,'#444') + r(3,12,10,2,'#444') + r(6,4,4,8,'#a00') + FOOTER,
  SCROLL: HEADER + r(2,3,12,10,'#ecb') + r(3,3,10,10,'#fed') + r(2,2,12,2,'#cba') + r(2,12,12,2,'#cba') + r(6,6,4,4,'#09f') + r(6,6,1,1,'#0ff') + FOOTER,
  POTION: HEADER + r(6,2,4,4,'#ccc') + r(4,6,8,8,'#eee') + r(5,7,6,6,'#f00') + r(7,7,2,2,'#faa') + FOOTER,
  BOMB: HEADER + r(4,4,8,8,'#222') + r(7,2,2,2,'#666') + r(8,0,2,2,'#ea0') + r(5,5,2,2,'#444') + FOOTER,
  CHARM: HEADER + r(2,2,12,8,'#da4') + r(2,4,12,10,'#0000') + r(6,8,4,4,'#0f0') + FOOTER,

  // --- STAT ICONS ---
  ICON_MUSCLE: HEADER + r(4,6,8,8,'#fff') + r(2,8,2,4,'#fff') + r(12,8,2,4,'#fff') + r(6,2,4,4,'#fff') + FOOTER, // Flexed arm shape
  ICON_AGILITY: HEADER + r(2,8,8,4,'#fff') + r(4,4,8,4,'#fff') + r(8,2,4,2,'#fff') + r(2,8,2,2,'#fff') + FOOTER, // Wing/Boot
  ICON_FORTITUDE: HEADER + r(3,2,10,10,'#fff') + r(3,12,5,2,'#fff') + r(8,12,5,2,'#fff') + r(5,5,6,6,'#000') + FOOTER, // Shield
  ICON_KNOWLEDGE: HEADER + r(2,4,12,8,'#fff') + r(8,4,1,8,'#000') + r(3,5,4,2,'#000') + r(9,5,4,2,'#000') + FOOTER, // Book
  ICON_SMARTS: HEADER + r(6,2,4,6,'#fff') + r(4,4,8,4,'#fff') + r(6,10,4,2,'#fff') + r(6,13,4,1,'#fff') + FOOTER, // Lightbulb
  ICON_LOOKS: HEADER + r(2,6,12,4,'#fff') + r(3,7,3,2,'#000') + r(10,7,3,2,'#000') + r(8,12,2,1,'#fff') + FOOTER, // Mask/Eyes

  // --- GENERIC MONSTERS (Fallbacks) ---
  MONSTER_SLIME: HEADER + r(2,10,12,6,'#4d4') + r(4,8,8,2,'#4d4') + r(4,10,2,2,'#000') + r(10,10,2,2,'#000') + FOOTER,
  MONSTER_GHOST: HEADER + r(2,2,12,12,'#fff') + r(4,4,2,2,'#000') + r(10,4,2,2,'#000') + r(2,14,12,2,'#000') + FOOTER,
  MONSTER_BAT: HEADER + r(6,6,4,4,'#222') + r(0,4,6,4,'#222') + r(10,4,6,4,'#222') + r(5,7,2,1,'#f00') + r(9,7,2,1,'#f00') + FOOTER,

  // --- SPECIAL DOORS ---
  LOCKED_DOOR: HEADER + r(0,0,16,16,'#111') + r(2,1,12,15,'#642') + r(2,3,12,1,'#431') + r(2,12,12,1,'#431') + r(6,6,4,5,'#fb0') + r(7,5,2,2,'#fb0') + r(7,8,2,2,'#000') + FOOTER,
  DOOR_RED: HEADER + r(0,0,16,16,'#100') + r(2,1,12,15,'#511') + r(2,3,12,1,'#300') + r(2,12,12,1,'#300') + r(6,6,4,5,'#f00') + r(7,5,2,2,'#f00') + r(7,8,2,2,'#000') + FOOTER,

  // --- BASIC OBSTACLES (30) ---
  WEB_TRAP: HEADER + r(0,0,16,16,'#111') + r(4,4,8,8,'#fff') + r(6,2,1,4,'#fff') + r(9,2,1,4,'#fff') + FOOTER,
  GOBLIN_SCOUT: HEADER + r(4,4,8,8,'#482') + r(4,6,2,2,'#f00') + r(10,6,2,2,'#f00') + r(6,10,4,2,'#000') + FOOTER,
  LOOSE_ROCKS: HEADER + r(4,2,8,4,'#666') + r(2,8,4,4,'#555') + r(10,10,4,4,'#777') + FOOTER,
  SIMPLE_RIDDLE: HEADER + r(2,2,12,12,'#da4') + r(6,4,4,8,'#000') + r(6,4,4,2,'#000') + r(6,10,2,2,'#000') + FOOTER, // Question mark-ish
  HEAVY_BOX: HEADER + r(2,4,12,10,'#853') + r(2,4,12,1,'#da4') + r(2,13,12,1,'#da4') + r(2,4,1,10,'#da4') + r(13,4,1,10,'#da4') + FOOTER,
  ORC_GUARD: HEADER + r(4,4,8,8,'#4a6') + r(4,2,8,3,'#555') + r(5,6,2,2,'#d00') + r(9,6,2,2,'#d00') + r(5,10,6,1,'#fff') + FOOTER,
  POISON_GAS: HEADER + r(2,8,4,4,'#4d4') + r(8,4,5,5,'#4d4') + r(10,11,3,3,'#4d4') + r(0,0,16,16,'#0f03') + FOOTER,
  SIREN: HEADER + r(4,2,8,8,'#fba') + r(2,2,2,10,'#f0a') + r(12,2,2,10,'#f0a') + r(4,12,8,4,'#0aa') + FOOTER,
  BOULDER: HEADER + r(2,2,12,12,'#777') + r(4,4,4,4,'#999') + FOOTER,
  TRIPWIRE: HEADER + r(0,14,2,2,'#555') + r(14,14,2,2,'#555') + r(2,14,12,1,'#ccc') + FOOTER,
  SLEEPING_GUARD: HEADER + r(4,6,8,6,'#44a') + r(4,4,8,2,'#fba') + r(10,2,4,4,'#fff') + r(12,3,2,2,'#000') + FOOTER, // Zzz bubble
  WEAK_WALL: HEADER + r(0,0,16,16,'#555') + r(2,2,4,4,'#333') + r(8,8,4,4,'#333') + r(6,4,1,8,'#000') + FOOTER,
  ANNOYING_PIXIE: HEADER + r(6,6,4,4,'#fba') + r(2,4,4,4,'#0ff') + r(10,4,4,4,'#0ff') + FOOTER,
  SUDOKU_PUZZLE: HEADER + r(2,2,12,12,'#fff') + r(2,6,12,1,'#000') + r(2,10,12,1,'#000') + r(6,2,1,12,'#000') + r(10,2,1,12,'#000') + FOOTER,
  ENDURANCE_TEST: HEADER + r(2,2,12,12,'#a00') + r(4,4,8,8,'#f00') + r(6,6,4,4,'#fff') + FOOTER,
  GREASED_FLOOR: HEADER + r(0,10,16,6,'#333') + r(2,12,4,2,'#0ff') + r(8,11,4,2,'#0ff') + FOOTER,
  HYPNOTIC_PATTERN: HEADER + r(0,0,16,16,'#000') + r(2,2,12,12,'#f0f') + r(4,4,8,8,'#0f0') + r(6,6,4,4,'#fff') + FOOTER,
  CHARISMA_CHECK: HEADER + r(4,2,8,8,'#fba') + r(4,4,2,2,'#00f') + r(10,4,2,2,'#00f') + r(6,8,4,2,'#f00') + FOOTER, // Smiley face
  ANCIENT_LEVER: HEADER + r(6,10,4,4,'#555') + r(7,4,2,8,'#840') + r(6,2,4,4,'#a00') + FOOTER,
  BAD_SMELL: HEADER + r(4,10,8,4,'#420') + r(4,4,2,4,'#0f0') + r(8,2,2,6,'#0f0') + r(12,6,2,4,'#0f0') + FOOTER, // Green wavy lines
  KOBOLD_THIEF: HEADER + r(4,6,8,8,'#a40') + r(2,8,2,4,'#a40') + r(12,8,2,4,'#a40') + r(6,8,4,2,'#000') + FOOTER,
  MAGIC_MOUTH: HEADER + r(2,2,12,12,'#204') + r(4,8,8,4,'#f0f') + r(6,10,4,2,'#000') + FOOTER,
  FLEX_OFF: HEADER + r(2,4,4,8,'#ca8') + r(10,4,4,8,'#ca8') + r(6,8,4,4,'#ca8') + FOOTER, // Flexing arms
  STARING_CONTEST: HEADER + r(2,6,6,4,'#fff') + r(8,6,6,4,'#fff') + r(4,7,2,2,'#000') + r(10,7,2,2,'#000') + FOOTER,
  PRESSURE_PLATE: HEADER + r(2,12,12,2,'#555') + r(4,11,8,1,'#777') + FOOTER,
  LOGICAL_FALLACY: HEADER + r(2,2,12,12,'#000') + r(4,4,2,8,'#fff') + r(4,10,8,2,'#fff') + FOOTER, // L shape
  FORGOTTEN_LORE: HEADER + r(4,2,8,12,'#421') + r(5,4,6,8,'#da4') + FOOTER, // Book
  THICK_MUD: HEADER + r(0,10,16,6,'#531') + r(2,8,4,2,'#531') + r(10,9,4,2,'#531') + FOOTER,
  ANNOYING_GHOST: HEADER + r(4,4,8,8,'#fff') + r(4,12,2,2,'#fff') + r(10,12,2,2,'#fff') + r(6,6,1,1,'#000') + r(9,6,1,1,'#000') + r(7,9,2,1,'#000') + FOOTER,

  // --- NEUTRAL OBSTACLES (34) ---
  SPIKED_PIT: HEADER + r(0,0,16,16,'#1a1a1a') + r(2,8,2,8,'#444') + r(6,8,2,8,'#444') + r(10,8,2,8,'#444') + r(3,4,1,4,'#888') + r(7,4,1,4,'#888') + r(11,4,1,4,'#888') + FOOTER,
  RUNE_TRAP: HEADER + r(0,0,16,16,'#1a1020') + r(4,4,2,8,'#0ff') + r(10,4,2,8,'#0ff') + r(4,8,8,2,'#0ff') + FOOTER,
  SPHINX: HEADER + r(3,6,10,10,'#cb2') + r(4,4,8,8,'#fd0') + r(2,4,2,8,'#22a') + r(12,4,2,8,'#22a') + FOOTER,
  ANCIENT_CURSE: HEADER + r(4,2,8,8,'#dce') + r(5,10,6,4,'#dce') + r(5,5,2,3,'#305') + r(9,5,2,3,'#305') + FOOTER,
  TREASURE_CHEST: HEADER + r(2,6,12,8,'#853') + r(2,6,12,2,'#da4') + r(7,8,2,2,'#da4') + FOOTER,
  MIMIC: HEADER + r(2,6,12,8,'#853') + r(2,6,12,2,'#da4') + r(2,8,12,2,'#fff') + r(2,9,12,1,'#000') + FOOTER, // Chest with teeth
  LOCKED_GRIMOIRE: HEADER + r(3,2,10,12,'#204') + r(6,6,4,4,'#fb0') + FOOTER,
  DODGEBALL_TEAM: HEADER + r(2,6,4,4,'#f00') + r(6,8,4,4,'#f00') + r(10,6,4,4,'#f00') + FOOTER,
  BODYGUARD: HEADER + r(4,2,8,12,'#000') + r(6,4,4,2,'#fba') + r(6,6,4,1,'#000') + FOOTER, // Suit and glasses
  POISONED_DARTS: HEADER + r(2,4,4,2,'#0f0') + r(6,8,4,2,'#0f0') + r(10,4,4,2,'#0f0') + FOOTER,
  HAUNTED_MIRROR: HEADER + r(4,2,8,12,'#888') + r(5,3,6,10,'#ccf') + r(6,4,2,2,'#fff') + FOOTER,
  OGRE: HEADER + r(4,4,8,10,'#674') + r(2,6,2,6,'#674') + r(12,6,2,6,'#674') + r(6,6,4,2,'#000') + FOOTER,
  BLADE_PENDULUM: HEADER + r(7,0,2,12,'#888') + r(4,12,8,4,'#ccc') + FOOTER,
  DOPPELGANGER: HEADER + r(4,2,8,8,'#888') + r(6,4,1,1,'#f00') + r(9,4,1,1,'#f00') + FOOTER, // Shadowy figure
  CORROSIVE_SLIME: HEADER + r(2,10,12,6,'#dd0') + r(4,8,8,2,'#dd0') + r(4,10,2,2,'#000') + FOOTER, // Yellow slime
  CULTIST_CHANTER: HEADER + r(4,4,8,10,'#404') + r(6,4,4,4,'#000') + FOOTER, // Robed figure
  MINOTAUR: HEADER + r(4,4,8,8,'#642') + r(2,2,2,4,'#ccc') + r(12,2,2,4,'#ccc') + r(6,8,2,2,'#000') + FOOTER, // Horns
  HARPY_FLOCK: HEADER + r(2,4,4,4,'#a88') + r(8,2,4,4,'#a88') + r(6,8,4,4,'#a88') + FOOTER,
  FIRE_WALL: HEADER + r(0,4,16,12,'#f40') + r(2,2,12,12,'#fb0') + r(4,0,8,16,'#ff0') + FOOTER,
  GOLEM_SENTRY: HEADER + r(4,2,8,8,'#888') + r(4,10,8,6,'#666') + r(6,4,4,2,'#0f0') + FOOTER,
  FLOODING_ROOM: HEADER + r(0,8,16,8,'#00f') + r(0,6,16,2,'#aaf') + FOOTER,
  LESSER_DEMON: HEADER + r(4,4,8,8,'#a00') + r(2,2,2,4,'#000') + r(12,2,2,4,'#000') + r(5,6,2,2,'#fb0') + FOOTER,
  CURSED_IDOL: HEADER + r(6,4,4,8,'#084') + r(6,4,4,2,'#f00') + FOOTER,
  GILDED_CHEST: HEADER + r(2,6,12,8,'#fd0') + r(2,6,12,2,'#fff') + FOOTER,
  GARGOYLE: HEADER + r(4,4,8,8,'#778') + r(0,4,4,4,'#778') + r(12,4,4,4,'#778') + FOOTER, // Wings
  ILLUSIONARY_WALL: HEADER + r(0,0,16,16,'#555') + r(6,6,4,4,'#666') + FOOTER,
  FEAST_HALL: HEADER + r(0,10,16,6,'#630') + r(2,8,12,2,'#fff') + r(4,6,2,2,'#f00') + r(10,6,2,2,'#aa0') + FOOTER, // Table with food
  QUICK_SAND: HEADER + r(0,0,16,16,'#da4') + r(4,4,8,8,'#cb2') + r(7,7,2,2,'#000') + FOOTER,
  NECROMANCER_PUZZLE: HEADER + r(2,2,12,12,'#102') + r(6,6,4,4,'#0f0') + r(2,2,2,2,'#fff') + r(12,2,2,2,'#fff') + FOOTER,
  BANSHEE_WAIL: HEADER + r(4,2,8,10,'#eef') + r(6,4,4,6,'#000') + FOOTER, // Screaming mouth
  BANDIT_AMBUSH: HEADER + r(2,4,4,8,'#222') + r(10,4,4,8,'#222') + r(6,8,4,4,'#500') + FOOTER,

  // --- ADVANCED OBSTACLES (40) ---
  TROLL: HEADER + r(2,4,12,12,'#234') + r(4,2,8,6,'#457') + r(2,8,12,8,'#457') + r(5,4,2,2,'#fb0') + FOOTER,
  LICH_KING: HEADER + r(4,2,8,8,'#eee') + r(5,10,6,6,'#204') + r(6,2,4,2,'#fb0') + r(6,5,2,2,'#0f0') + r(8,5,2,2,'#0f0') + FOOTER,
  DRAGON: HEADER + r(4,4,8,8,'#a00') + r(2,8,2,4,'#a00') + r(12,8,2,4,'#a00') + r(6,12,4,4,'#a00') + r(5,5,2,2,'#fb0') + r(9,5,2,2,'#fb0') + FOOTER,
  MIRROR_MAZE: HEADER + r(0,0,16,16,'#cef') + r(2,2,1,14,'#fff') + r(6,2,1,14,'#fff') + r(10,2,1,14,'#fff') + r(14,2,1,14,'#fff') + FOOTER,
  LAVA_FLOOR: HEADER + r(0,0,16,16,'#a00') + r(2,2,12,2,'#fb0') + r(2,6,12,2,'#fb0') + r(2,10,12,2,'#fb0') + r(2,14,12,2,'#fb0') + FOOTER,
  VAMPIRE_LORD: HEADER + r(4,2,8,8,'#fba') + r(2,2,2,6,'#000') + r(12,2,2,6,'#000') + r(4,6,2,1,'#f00') + r(10,6,2,1,'#f00') + FOOTER,
  IRON_GOLEM: HEADER + r(2,2,12,12,'#aaa') + r(6,4,4,2,'#f00') + r(4,8,8,4,'#555') + FOOTER,
  GRAND_CHEST: HEADER + r(0,4,16,12,'#404') + r(2,6,12,8,'#606') + r(2,6,12,2,'#fd0') + r(7,8,2,2,'#fd0') + FOOTER,
  CHIMERA: HEADER + r(2,4,4,6,'#da4') + r(6,4,4,6,'#482') + r(10,4,4,6,'#800') + FOOTER, // 3 heads
  SPHINX_GYM: HEADER + r(4,4,8,8,'#da4') + r(2,4,2,4,'#555') + r(12,4,2,4,'#555') + FOOTER, // Dumbbells
  BEAUTY_CONTEST: HEADER + r(2,2,12,12,'#f0f') + r(4,4,8,8,'#fff') + r(6,6,4,4,'#fba') + FOOTER,
  MARATHON: HEADER + r(0,8,16,2,'#fff') + r(2,6,2,2,'#00f') + r(8,6,2,2,'#00f') + r(14,6,2,2,'#00f') + FOOTER,
  DEBATE_CLUB: HEADER + r(2,2,4,4,'#fba') + r(10,2,4,4,'#fba') + r(6,4,4,2,'#fff') + FOOTER, // Bubbles
  TRIATHLON: HEADER + r(2,2,4,4,'#00f') + r(6,2,4,4,'#0f0') + r(10,2,4,4,'#f00') + FOOTER,
  CHESS_BOXING: HEADER + r(2,2,6,6,'#fff') + r(8,2,6,6,'#000') + r(2,8,6,6,'#000') + r(8,8,6,6,'#fff') + r(6,6,4,4,'#f00') + FOOTER,
  MUD_PIT_WRESTLING: HEADER + r(0,0,16,16,'#642') + r(4,4,8,8,'#421') + r(2,6,2,4,'#fba') + r(12,6,2,4,'#fba') + FOOTER,
  LASER_GRID: HEADER + r(0,0,16,16,'#000') + r(0,4,16,1,'#f00') + r(0,8,16,1,'#f00') + r(0,12,16,1,'#f00') + r(4,0,1,16,'#f00') + r(8,0,1,16,'#f00') + r(12,0,1,16,'#f00') + FOOTER,
  BARD_OFF: HEADER + r(6,2,4,8,'#840') + r(4,10,8,4,'#840') + r(7,2,2,12,'#000') + FOOTER, // Guitar
  ARM_WRESTLING: HEADER + r(2,8,6,4,'#ca8') + r(8,8,6,4,'#fba') + r(6,6,4,4,'#f00') + FOOTER,
  SPIKED_WALL: HEADER + r(0,0,4,16,'#555') + r(12,0,4,16,'#555') + r(4,2,2,12,'#888') + r(10,2,2,12,'#888') + FOOTER,
  MEDUSA: HEADER + r(4,4,8,8,'#484') + r(2,2,12,4,'#0f0') + r(5,6,2,2,'#f00') + r(9,6,2,2,'#f00') + FOOTER,
  HYDRA: HEADER + r(6,8,4,8,'#084') + r(2,4,2,4,'#084') + r(6,2,4,6,'#084') + r(12,4,2,4,'#084') + FOOTER,
  CERBERUS: HEADER + r(2,4,4,6,'#222') + r(6,2,4,8,'#222') + r(10,4,4,6,'#222') + r(3,5,1,1,'#f00') + r(7,3,1,1,'#f00') + r(11,5,1,1,'#f00') + FOOTER,
  BEHOLDER: HEADER + r(4,4,8,8,'#a4a') + r(6,6,4,4,'#fff') + r(7,7,2,2,'#000') + r(2,2,2,2,'#fff') + r(12,2,2,2,'#fff') + r(2,12,2,2,'#fff') + r(12,12,2,2,'#fff') + FOOTER,
  TARRASQUE: HEADER + r(2,6,12,8,'#a84') + r(2,4,4,2,'#ccc') + r(10,4,4,2,'#ccc') + r(6,2,4,4,'#a84') + FOOTER,
  ARCHMAGE_TEST: HEADER + r(2,2,12,12,'#408') + r(6,6,4,4,'#fff') + r(0,0,4,4,'#0ff') + r(12,0,4,4,'#0ff') + FOOTER,
  GOD_OF_BEAUTY: HEADER + r(4,2,8,8,'#fd8') + r(2,2,12,4,'#fe2') + r(0,0,16,16,'#ff03') + FOOTER,
  TITANS_GAUNTLET: HEADER + r(4,2,8,12,'#da4') + r(4,2,8,2,'#fff') + r(6,6,4,4,'#00f') + FOOTER,
  ACROBATS_FINALE: HEADER + r(2,12,12,2,'#f00') + r(8,2,1,10,'#fff') + r(4,6,8,2,'#fff') + FOOTER, // Tightrope
  DEAL_DEVIL: HEADER + r(4,2,8,10,'#ecb') + r(6,10,4,2,'#a00') + r(6,8,4,1,'#000') + FOOTER, // Contract
  DJINNI_WISH: HEADER + r(4,8,8,6,'#da4') + r(2,2,12,6,'#0af') + FOOTER, // Lamp smoke
  LIVING_WALL: HEADER + r(0,0,16,16,'#644') + r(2,4,4,2,'#000') + r(10,4,4,2,'#000') + r(4,10,8,2,'#000') + FOOTER, // Face in wall
  GREAT_LIBRARY: HEADER + r(2,2,12,12,'#421') + r(4,4,8,2,'#fff') + r(4,7,8,2,'#fff') + r(4,10,8,2,'#fff') + FOOTER, // Bookshelves
  DRAGON_HOARD: HEADER + r(2,6,12,8,'#fd0') + r(6,4,4,4,'#a00') + FOOTER, // Gold pile + dragon eye
  MIND_FLAYER: HEADER + r(4,2,8,8,'#a4a') + r(6,6,4,8,'#a4a') + r(5,5,2,2,'#fff') + r(9,5,2,2,'#fff') + FOOTER,
  ELEMENTAL_CHAOS: HEADER + r(2,2,6,6,'#f00') + r(8,2,6,6,'#00f') + r(2,8,6,6,'#0f0') + r(8,8,6,6,'#ff0') + FOOTER,
  RAKSHASA: HEADER + r(4,2,8,8,'#da8') + r(2,2,2,4,'#da8') + r(12,2,2,4,'#da8') + r(6,4,4,2,'#0f0') + FOOTER, // Tiger man
  PHYLACTERY: HEADER + r(6,6,4,4,'#404') + r(6,6,4,1,'#fff') + r(6,9,4,1,'#fff') + r(6,6,1,4,'#fff') + r(9,6,1,4,'#fff') + FOOTER, // Soul gem
  GIANTS_FORGE: HEADER + r(2,6,12,8,'#444') + r(4,2,8,4,'#f40') + FOOTER, // Anvil + fire
  ASSASSINS_GAUNTLET: HEADER + r(2,2,12,12,'#111') + r(0,8,4,1,'#fff') + r(12,4,4,1,'#fff') + r(6,12,1,4,'#fff') + FOOTER, // Knives
  ABYSS: HEADER + r(0,0,16,16,'#000') + r(6,6,4,4,'#102') + FOOTER,
  ROYAL_COURT: HEADER + r(6,4,4,4,'#da4') + r(4,2,8,2,'#fb0') + r(2,8,12,8,'#a02') + FOOTER, // Crown and robes
  WAR_ELEPHANT: HEADER + r(2,4,12,8,'#888') + r(2,4,4,6,'#888') + r(0,8,2,4,'#fff') + FOOTER, // Trunk/tusks
};
