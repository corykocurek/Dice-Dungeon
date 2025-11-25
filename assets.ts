
// Helper to create SVG Data URI
const HEADER = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' shape-rendering='crispEdges'>";
const FOOTER = "</svg>";

const r = (x: number, y: number, w: number, h: number, c: string) => 
  `<rect x='${x}' y='${y}' width='${w}' height='${h}' fill='${c.replace('#', '%23')}'/>`;

export const ASSETS = {
  // 1. SPIKED PIT: Dark hole with grey spikes
  SPIKED_PIT: HEADER +
    r(0,0,16,16,'#1a1a1a') + // bg
    r(2,8,2,8,'#444') + r(6,8,2,8,'#444') + r(10,8,2,8,'#444') + // spike bases
    r(3,4,1,4,'#888') + r(7,4,1,4,'#888') + r(11,4,1,4,'#888') + // spike tips
    r(0,14,16,2,'#000') + // bottom shadow
    FOOTER,

  // 2. ORC GUARD: Green skin, red eyes, helmet
  ORC_GUARD: HEADER + 
    r(0,0,16,16,'#2a2a2a') + // bg
    r(4,4,8,8,'#4a6') + // face
    r(4,2,8,3,'#555') + // helmet top
    r(3,4,1,4,'#555') + r(12,4,1,4,'#555') + // helmet sides
    r(5,6,2,2,'#d00') + r(9,6,2,2,'#d00') + // eyes
    r(5,10,6,1,'#000') + r(5,9,1,1,'#fff') + r(10,9,1,1,'#fff') + // teeth
    FOOTER,

  // 3. RUNE TRAP: Glowing magical rune
  RUNE_TRAP: HEADER +
    r(0,0,16,16,'#1a1020') + // bg
    r(2,2,12,12,'#2a2030') + // floor
    r(4,4,2,8,'#0ff') + r(10,4,2,8,'#0ff') + r(4,8,8,2,'#0ff') + // H shape rune
    r(2,2,2,2,'#08f') + r(12,2,2,2,'#08f') + r(2,12,2,2,'#08f') + r(12,12,2,2,'#08f') + // corners
    FOOTER,

  // 4. POISON GAS: Green bubbles
  POISON_GAS: HEADER + 
    r(0,0,16,16,'#102010') + // bg
    r(2,8,4,4,'#4d4') + r(3,9,1,1,'#afa') + // bubble 1
    r(8,4,5,5,'#4d4') + r(10,5,2,1,'#afa') + // bubble 2
    r(10,11,3,3,'#4d4') + // bubble 3
    r(0,0,16,16,'#0f03') + // haze overlay
    FOOTER,

  // 5. SPHINX RIDDLE: Gold pyramid/face
  SPHINX: HEADER +
    r(0,0,16,16,'#432') + // bg sand
    r(3,6,10,10,'#cb2') + // base
    r(4,4,8,8,'#fd0') + // head
    r(2,4,2,8,'#22a') + r(12,4,2,8,'#22a') + // headdress sides
    r(4,2,8,2,'#22a') + // headdress top
    r(6,7,1,2,'#000') + r(9,7,1,2,'#000') + // eyes
    FOOTER,

  // 6. SIREN: Blue/Pink mermaid scale pattern
  SIREN: HEADER + 
    r(0,0,16,16,'#002') + // bg water
    r(4,2,8,8,'#fba') + // face
    r(2,2,2,10,'#f0a') + r(12,2,2,10,'#f0a') + // hair
    r(5,6,2,2,'#00f') + r(9,6,2,2,'#00f') + // eyes
    r(6,10,4,1,'#a00') + // lips
    r(4,12,8,4,'#0aa') + // scales
    FOOTER,

  // 7. LOCKED DOOR: Wood door with gold lock
  LOCKED_DOOR: HEADER + 
    r(0,0,16,16,'#111') + // bg
    r(2,1,12,15,'#642') + // wood
    r(2,3,12,1,'#431') + r(2,12,12,1,'#431') + // iron bands
    r(6,6,4,5,'#fb0') + // lock body
    r(7,5,2,2,'#fb0') + // lock shackle
    r(7,8,2,2,'#000') + // keyhole
    FOOTER,

  // 8. HEAVY BOULDER: Grey round rock
  BOULDER: HEADER + 
    r(0,0,16,16,'#222') + // bg
    r(4,2,8,12,'#777') + // vertical mass
    r(2,4,12,8,'#777') + // horizontal mass
    r(4,4,8,8,'#999') + // highlight center
    r(10,4,2,2,'#ccc') + // shine
    FOOTER,

  // 9. ANCIENT CURSE: Purple skull
  ANCIENT_CURSE: HEADER + 
    r(0,0,16,16,'#102') + // bg
    r(4,2,8,8,'#dce') + // skull top
    r(5,10,6,4,'#dce') + // jaw
    r(5,5,2,3,'#305') + r(9,5,2,3,'#305') + // eyes
    r(7,9,2,2,'#305') + // nose
    r(0,0,16,16,'#80f3') + // aura
    FOOTER,

  // 10. WEB TRAP: Spider web pattern
  WEB_TRAP: HEADER +
    r(0,0,16,16,'#111') + // bg
    r(0,0,16,16,'#000') + // dark corners
    r(2,2,12,12,'#222') + // tunnel
    r(0,0,16,1,'#eee') + r(0,15,16,1,'#eee') + // top/bottom lines
    r(0,0,1,16,'#eee') + r(15,0,1,16,'#eee') + // side lines
    r(0,0,16,16,'#fff1') + // faint cross
    r(4,4,8,8,'#fff') + r(5,5,6,6,'#000') + // center hole
    r(6,2,1,4,'#fff') + r(9,2,1,4,'#fff') + // hanging threads
    FOOTER,

  // 11. TREASURE CHEST: Wooden chest with gold trim
  TREASURE_CHEST: HEADER +
    r(0,4,16,12,'#1a1a1a') + // bg shadow
    r(2,6,12,8,'#853') + // wood body
    r(2,6,12,2,'#da4') + // gold lid rim
    r(7,8,2,2,'#da4') + // lock
    r(1,6,1,8,'#532') + r(14,6,1,8,'#532') + // sides
    FOOTER,

  // 12. TROLL: Large blueish monster
  TROLL: HEADER +
    r(2,4,12,12,'#234') + // bg
    r(4,2,8,6,'#457') + // head
    r(2,8,12,8,'#457') + // body
    r(5,4,2,2,'#fb0') + r(9,4,2,2,'#fb0') + // eyes
    r(5,10,6,1,'#fff') + // teeth
    r(1,8,2,6,'#346') + r(13,8,2,6,'#346') + // arms
    FOOTER,

  // 13. RED KEY
  KEY_RED: HEADER +
    r(6,2,4,4,'#f00') + // bow
    r(7,3,2,2,'#111') + // hole
    r(7,6,2,8,'#f00') + // shaft
    r(9,10,2,1,'#f00') + // tooth 1
    r(9,12,2,1,'#f00') + // tooth 2
    FOOTER,

  // 14. RED LOCKED DOOR
  DOOR_RED: HEADER + 
    r(0,0,16,16,'#100') + // bg
    r(2,1,12,15,'#511') + // wood
    r(2,3,12,1,'#300') + r(2,12,12,1,'#300') + // iron bands
    r(6,6,4,5,'#f00') + // lock body
    r(7,5,2,2,'#f00') + // lock shackle
    r(7,8,2,2,'#000') + // keyhole
    FOOTER,

  // 15. MAGIC BOOK (Knowledge)
  ITEM_BOOK: HEADER +
    r(3,2,10,12,'#408') + // cover
    r(4,3,8,10,'#fff') + // pages
    r(5,4,6,1,'#000') + r(5,6,6,1,'#000') + r(5,8,6,1,'#000') + // text
    r(2,2,2,12,'#60a') + // spine
    FOOTER,

  // 16. IRON SWORD (Muscle)
  ITEM_SWORD: HEADER +
    r(6,10,4,2,'#640') + // guard
    r(7,12,2,3,'#420') + // grip
    r(7,15,2,1,'#888') + // pommel
    r(7,1,2,10,'#ccc') + // blade
    r(8,1,1,10,'#fff') + // shine
    FOOTER,

  // 17. THIEVES TOOLS (Extra Die/Tools)
  ITEM_TOOLS: HEADER + 
    r(2,4,4,8,'#444') + // tool roll
    r(3,2,2,4,'#aaa') + // pick 1
    r(8,3,6,1,'#888') + r(13,3,1,4,'#888') + // wrench
    r(8,10,6,2,'#630') + // hammer handle
    r(13,9,3,4,'#889') + // hammer head
    FOOTER,

  // 18. WIZARD STAFF (Smarts)
  ITEM_STAFF: HEADER +
    r(10,2,4,12,'#642') + // shaft
    r(9,1,6,3,'#a80') + // head piece
    r(11,1,2,2,'#f0f') + // gem
    FOOTER,

  // 19. ELVEN BOOTS (Agility)
  ITEM_BOOTS: HEADER +
    r(2,8,6,6,'#282') + r(10,8,4,6,'#282') + // boots
    r(2,8,6,2,'#4a4') + r(10,8,4,2,'#4a4') + // cuff
    r(0,12,2,2,'#cb2') + // toe curl
    FOOTER,
    
  // 20. SHIELD (Fortitude)
  ITEM_SHIELD: HEADER +
    r(3,2,10,12,'#888') + // silver body
    r(3,2,10,2,'#444') + r(3,12,10,2,'#444') + // rims
    r(6,4,4,8,'#a00') + // cross emblem
    FOOTER,
    
  // 21. SCROLL (Teleport/Summon)
  SCROLL: HEADER +
    r(2,3,12,10,'#ecb') + // paper
    r(3,3,10,10,'#fed') + // paper inner
    r(2,2,12,2,'#cba') + // top roll
    r(2,12,12,2,'#cba') + // bottom roll
    r(6,6,4,4,'#09f') + // rune
    r(6,6,1,1,'#0ff') + // rune shine
    FOOTER,

  // 22. POTION (Generic)
  POTION: HEADER +
    r(6,2,4,4,'#ccc') + // neck
    r(4,6,8,8,'#eee') + // body
    r(5,7,6,6,'#f00') + // liquid
    r(7,7,2,2,'#faa') + // bubble
    FOOTER,

  // 23. BOMB (Generic)
  BOMB: HEADER +
    r(4,4,8,8,'#222') + // body
    r(7,2,2,2,'#666') + // fuse holder
    r(8,0,2,2,'#ea0') + // spark
    r(5,5,2,2,'#444') + // shine
    FOOTER,
    
  // 24. CHARM (Necklace)
  CHARM: HEADER +
    r(2,2,12,8,'#da4') + // chain loop
    r(2,4,12,10,'#0000') + // transparent middle
    r(6,8,4,4,'#0f0') + // gem
    FOOTER,

  // 25. MONSTER (Generic A - Slime)
  MONSTER_SLIME: HEADER +
    r(2,10,12,6,'#4d4') + 
    r(4,8,8,2,'#4d4') +
    r(4,10,2,2,'#000') + r(10,10,2,2,'#000') +
    FOOTER,
    
  // 26. MONSTER (Generic B - Ghost)
  MONSTER_GHOST: HEADER +
    r(2,2,12,12,'#fff') + 
    r(4,4,2,2,'#000') + r(10,4,2,2,'#000') +
    r(2,14,12,2,'#000') + // fade
    FOOTER,
    
  // 27. MONSTER (Generic C - Bat)
  MONSTER_BAT: HEADER +
    r(6,6,4,4,'#222') + // body
    r(0,4,6,4,'#222') + r(10,4,6,4,'#222') + // wings
    r(5,7,2,1,'#f00') + r(9,7,2,1,'#f00') + // eyes
    FOOTER,
};
