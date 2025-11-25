

import { Room, ObstacleCard, StatType, RoomObstacle } from '../types';
import { OBSTACLE_DECK, MAP_SIZE, RED_KEY_ID, RED_DOOR_CARD, LOOT_TABLE, GAME_DURATION } from '../constants';

const getFilteredDeck = (gameTimer?: number): Omit<ObstacleCard, 'id'>[] => {
    if (gameTimer === undefined) return OBSTACLE_DECK; // Fallback
    
    // Timer counts DOWN from GAME_DURATION (300) to 0
    const timeElapsed = GAME_DURATION - gameTimer;
    
    // First 2 minutes (0-120s elapsed): Basic Only
    // Next 2 minutes (120-240s elapsed): Basic + Neutral
    // Last minute (240s+ elapsed): All (Advanced unlocked)
    
    // Actually, let's make it looser:
    // Timer > 240 (First minute): Basic
    // Timer > 120 (Mid game): Basic + Neutral
    // Timer <= 120 (Late game): All
    
    if (gameTimer > 240) {
        return OBSTACLE_DECK.filter(c => c.tier === 'BASIC');
    } else if (gameTimer > 120) {
        return OBSTACLE_DECK.filter(c => c.tier === 'BASIC' || c.tier === 'NEUTRAL');
    } else {
        return OBSTACLE_DECK;
    }
}

export const drawCard = (gameTimer: number = 0): ObstacleCard => {
  const deck = getFilteredDeck(gameTimer);
  const template = deck[Math.floor(Math.random() * deck.length)];
  return {
    ...template,
    id: `card-${Date.now()}-${Math.random()}`
  };
};

export const getRandomLoot = (): string => {
    return LOOT_TABLE[Math.floor(Math.random() * LOOT_TABLE.length)];
};

// BFS to find path
const findPath = (map: Record<string, Room>, startId: string, endId: string): string[] | null => {
    const queue: { id: string, path: string[] }[] = [{ id: startId, path: [startId] }];
    const visited = new Set<string>([startId]);

    while (queue.length > 0) {
        const { id, path } = queue.shift()!;
        
        if (id === endId) return path;

        for (const neighborId of map[id].connections) {
            if (!visited.has(neighborId)) {
                visited.add(neighborId);
                queue.push({ id: neighborId, path: [...path, neighborId] });
            }
        }
    }
    return null;
}

export const generateMap = (): Record<string, Room> => {
  const map: Record<string, Room> = {};
  const size = MAP_SIZE;
  
  // Initialize grid
  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      const id = `${x},${y}`;
      map[id] = {
        id,
        x,
        y,
        isStart: false,
        isExit: false,
        connections: [],
        activeObstacles: [],
        items: []
      };
    }
  }

  // Recursive Backtracker for Maze Generation
  const visited = new Set<string>();
  const stack: string[] = [];
  const startX = Math.floor(Math.random() * size);
  const startY = Math.floor(Math.random() * size);
  const startId = `${startX},${startY}`;
  
  stack.push(startId);
  visited.add(startId);

  while (stack.length > 0) {
    const currentId = stack[stack.length - 1];
    const [cx, cy] = currentId.split(',').map(Number);
    
    // Get unvisited neighbors
    const neighbors = [
      { nx: cx, ny: cy - 1 }, // N
      { nx: cx, ny: cy + 1 }, // S
      { nx: cx + 1, ny: cy }, // E
      { nx: cx - 1, ny: cy }  // W
    ].filter(n => 
      n.nx >= 0 && n.nx < size && n.ny >= 0 && n.ny < size && 
      !visited.has(`${n.nx},${n.ny}`)
    );

    if (neighbors.length > 0) {
      const chosen = neighbors[Math.floor(Math.random() * neighbors.length)];
      const nextId = `${chosen.nx},${chosen.ny}`;
      
      // Connect current and chosen (remove wall)
      map[currentId].connections.push(nextId);
      map[nextId].connections.push(currentId);
      
      visited.add(nextId);
      stack.push(nextId);
    } else {
      stack.pop();
    }
  }

  // Set Start
  map[startId].isStart = true;
  
  // Set Exit - Must be at least distance X from start
  const allIds = Object.keys(map);
  let exitId = startId;
  let attempts = 0;
  while (attempts < 100) {
      const randId = allIds[Math.floor(Math.random() * allIds.length)];
      const [rx, ry] = randId.split(',').map(Number);
      const dist = Math.abs(rx - startX) + Math.abs(ry - startY);
      if (dist > size) { // Minimum Manhattan distance
          exitId = randId;
          break;
      }
      attempts++;
  }
  // If fails (unlikely), default to opposite corner of start
  if (exitId === startId) {
      exitId = `${(startX + size/2)%size}, ${(startY + size/2)%size}`; // Safe fallback
  }
  map[exitId].isExit = true;


  // Braiding: Add a few extra connections so it's not a perfect tree
  const braidingFactor = Math.floor(size * 1.5);
  for (let i = 0; i < braidingFactor; i++) {
      const x = Math.floor(Math.random() * size);
      const y = Math.floor(Math.random() * size);
      const id = `${x},${y}`;
      
      const neighbors = [
        { nx: x + 1, ny: y },
        { nx: x, ny: y + 1 } 
      ];
      
      for (const n of neighbors) {
          if (n.nx < size && n.ny < size) {
              const nid = `${n.nx},${n.ny}`;
              if (!map[id].connections.includes(nid)) {
                   map[id].connections.push(nid);
                   map[nid].connections.push(id);
                   break;
              }
          }
      }
  }

  // Populate random rooms with standard obstacles (Basic/Neutral only)
  // Filter deck for initial generation
  const initialDeck = OBSTACLE_DECK.filter(c => c.tier === 'BASIC' || c.tier === 'NEUTRAL');
  
  Object.values(map).forEach(room => {
    if (!room.isStart && Math.random() < 0.3) {
      const template = initialDeck[Math.floor(Math.random() * initialDeck.length)];
      const card = { ...template, id: `card-init-${Date.now()}-${Math.random()}` };
      const obstacle: RoomObstacle = {
        id: `obs-init-${room.id}-${Math.random()}`,
        card,
        currentSuccesses: {},
        permanentSuccesses: {},
        isDefeated: false
      };
      room.activeObstacles.push(obstacle);
    }
  });

  // --- KEY & DOOR PLACEMENT LOGIC ---
  
  // 1. Place Key in a random room (not Start, not Exit preferably)
  const possibleKeyRooms = allIds.filter(id => id !== startId && id !== exitId);
  const keyRoomId = possibleKeyRooms[Math.floor(Math.random() * possibleKeyRooms.length)];
  map[keyRoomId].items.push(RED_KEY_ID);

  // 2. Find path from Start to Key
  const pathStartToKey = findPath(map, startId, keyRoomId);
  const keyPathSet = new Set(pathStartToKey || []);

  // 3. Place Door in a random room that is NOT in the Start->Key path.
  // This ensures players can fetch the key without being blocked by the door.
  const validDoorRooms = allIds.filter(id => !keyPathSet.has(id));
  
  if (validDoorRooms.length > 0) {
      const doorRoomId = validDoorRooms[Math.floor(Math.random() * validDoorRooms.length)];
      const redDoor: RoomObstacle = {
          id: `obs-red-door`,
          card: { ...RED_DOOR_CARD, id: `card-red-door` },
          currentSuccesses: {},
          permanentSuccesses: {},
          isDefeated: false
      };
      map[doorRoomId].activeObstacles.push(redDoor);
  }

  return map;
};

export const rollDie = (dieFace: StatType): StatType => {
    return dieFace; 
};