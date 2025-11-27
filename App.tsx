
import React, { useState, useEffect, useRef } from 'react';
import { GameState, Player, PlayerRole, HeroClass, RoomObstacle, StatType, NetworkMessage, GameAction, Room, Die } from './types';
import { generateMap, drawCard, rollDie, getRandomLoot, generateDraftDie, generateDraftCards, generateStarterDice, createCardInstance } from './utils/gameLogic';
import { GAME_DURATION, PREGAME_DURATION, RESOURCE_TICK_INTERVAL, CARD_DRAW_INTERVAL, MOVEMENT_DELAY, CLASS_BONUS, REROLL_COOLDOWN, RED_KEY_ID, ITEM_REGISTRY, SUPERCHARGE_COOLDOWN, SUPERCHARGE_DURATION, OBSTACLE_DECK } from './constants';
import { Lobby } from './components/Lobby';
import { DungeonMasterView } from './components/DungeonMasterView';
import { HeroView } from './components/HeroView';
import { PregameView } from './components/PregameView';
import Peer from 'peerjs';

const INITIAL_STATE: GameState = {
  status: 'LOBBY',
  timer: GAME_DURATION,
  dmResources: 8,
  dmHand: [],
  dmDeck: [],
  dmDraftOptions: [],
  dmDeckPointer: 0,
  players: [],
  map: {},
  localPlayerId: null,
  lastResourceTick: Date.now(),
  lastCardDrawTick: Date.now(),
  lastSuperChargeTime: 0,
};

export default function App() {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const [isHost, setIsHost] = useState(false);
  const [peerId, setPeerId] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [peerStatus, setPeerStatus] = useState<'INITIALIZING' | 'CONNECTED' | 'RECONNECTING' | 'ERROR'>('INITIALIZING');
  
  // Network Refs
  const peerRef = useRef<any>(null);
  const connectionsRef = useRef<any[]>([]); 
  const hostConnectionRef = useRef<any>(null); 
  const isPeerInitialized = useRef(false); 
  
  // Profile Ref
  const tempProfileRef = useRef<Partial<Player>>({});

  // --- Game Loop (Host Only) ---
  useEffect(() => {
    if (!isHost) return;
    if (gameState.status !== 'PLAYING' && gameState.status !== 'PREGAME') return;

    const interval = setInterval(() => {
      setGameState(prev => {
        const now = Date.now();
        const newState: GameState = JSON.parse(JSON.stringify(prev));

        newState.timer = prev.timer - 1;

        if (newState.status === 'PREGAME') {
            if (newState.timer <= 0) {
                // Force Start
                 newState.status = 'PLAYING';
                 newState.timer = GAME_DURATION;
                 newState.lastResourceTick = now;
                 newState.lastCardDrawTick = now;
                 newState.dmDeckPointer = 0;
                 // Fill DM hand
                 while(newState.dmHand.length < 3) {
                     if (newState.dmDeck.length > 0) {
                         const template = newState.dmDeck[newState.dmDeckPointer % newState.dmDeck.length];
                         newState.dmHand.push(createCardInstance(template));
                         newState.dmDeckPointer++;
                     } else {
                         newState.dmHand.push(drawCard(GAME_DURATION));
                     }
                 }
                 // Auto-roll dice on start
                 newState.players.forEach(p => {
                    if (p.role === PlayerRole.HERO) {
                        resolveAutoResources(p);
                    }
                 });
            } else {
                // Check readiness
                if (newState.players.every(p => p.isReady)) {
                    newState.status = 'PLAYING';
                    newState.timer = GAME_DURATION;
                    newState.lastResourceTick = now;
                    newState.lastCardDrawTick = now;
                    newState.dmDeckPointer = 0;
                    while(newState.dmHand.length < 3) {
                         if (newState.dmDeck.length > 0) {
                             const template = newState.dmDeck[newState.dmDeckPointer % newState.dmDeck.length];
                             newState.dmHand.push(createCardInstance(template));
                             newState.dmDeckPointer++;
                         } else {
                             newState.dmHand.push(drawCard(GAME_DURATION));
                         }
                     }
                    // Auto-roll dice on start
                    newState.players.forEach(p => {
                       if (p.role === PlayerRole.HERO) {
                           resolveAutoResources(p);
                       }
                    });
                }
            }
            broadcastState(newState);
            return newState;
        }

        // PLAYING LOOP
        if (newState.timer <= 0) {
            newState.status = 'VICTORY_DM';
            newState.timer = 0;
            broadcastState(newState);
            return newState;
        }

        if (now - prev.lastResourceTick > RESOURCE_TICK_INTERVAL) {
            newState.dmResources = Math.min(10, newState.dmResources + 1);
            newState.lastResourceTick = now;
        }

        if (now - prev.lastCardDrawTick > CARD_DRAW_INTERVAL) {
            // Draw from DM Deck sequentially
            if (newState.dmDeck.length > 0) {
                 const template = newState.dmDeck[newState.dmDeckPointer % newState.dmDeck.length];
                 newState.dmHand.push(createCardInstance(template));
                 newState.dmDeckPointer++;
            } else {
                 newState.dmHand.push(drawCard(newState.timer));
            }
            newState.lastCardDrawTick = now;
        }
        
        Object.values(newState.map).forEach((room: any) => {
            const playersInRoom = newState.players.some((p: Player) => p.currentRoomId === room.id);
            if (!playersInRoom) {
                room.activeObstacles.forEach((obs: RoomObstacle) => {
                    if (obs.card.specialRules?.resetsOnLeave && obs.isDefeated) {
                        obs.isDefeated = false;
                        obs.currentSuccesses = {};
                        obs.permanentSuccesses = {};
                    }
                });
            }
            // Cleanup recent successes (>2s)
            if (room.recentSuccesses) {
                room.recentSuccesses = room.recentSuccesses.filter((t: number) => now - t < 2000);
            }
        });

        newState.players = newState.players.map((p: Player) => {
            if (p.isMoving && p.moveUnlockTime <= now) {
                return { ...p, isMoving: false };
            }
            return p;
        });

        broadcastState(newState);
        return newState;
    });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState.status, isHost]);


  // --- Networking ---
  const initPeer = () => {
    if (peerRef.current) return;
    
    setPeerStatus('INITIALIZING');
    const peer = new Peer(undefined, {
      pingInterval: 5000 
    }); 
    peerRef.current = peer;
    
    peer.on('open', (id: string) => {
      console.log('My peer ID is: ' + id);
      setPeerId(id);
      setPeerStatus('CONNECTED');
      setConnectionError(null);
    });

    peer.on('error', (err: any) => {
        console.error("PeerJS Error:", err);
        
        // Ignore lost connection errors to allow auto-reconnect logic to work without blocking UI
        if (err.type === 'network' || err.type === 'server-error' || err.type === 'socket-error' || err.type === 'disconnected' || (err.message && err.message.includes('Lost connection'))) {
             console.warn("Connection lost, attempting auto-reconnect in background...");
             return;
        }

        // Peer Unavailable is common when joining bad IDs
        if (err.type === 'peer-unavailable') {
             setConnectionError(`Game Code not found. Check the ID.`);
             setPeerStatus('ERROR');
             return;
        }

        setConnectionError(`Network Error: ${err.type || err.message || 'Unknown'}`);
        setPeerStatus('ERROR');
    });

    peer.on('disconnected', () => {
        console.log("Peer disconnected from server. Attempting reconnect...");
        if (peer && !peer.destroyed) {
            setTimeout(() => {
                 if (peer && !peer.destroyed) peer.reconnect();
            }, 1000);
        }
    });

    peer.on('connection', (conn: any) => {
      console.log("Incoming connection from:", conn.peer);
      
      conn.on('data', (data: NetworkMessage) => {
        if (data.type === 'JOIN_REQUEST') {
          handlePlayerJoin(data.payload);
        } else if (data.type === 'ACTION') {
          handleGameAction(data.payload);
        }
      });
      
      conn.on('open', () => {
        connectionsRef.current = connectionsRef.current.filter(c => c.peer !== conn.peer);
        connectionsRef.current.push(conn);
        conn.send({ type: 'SYNC_STATE', payload: gameState });
      });
    });
  };

  const connectToHost = (hostId: string) => {
    if (peerRef.current && !peerRef.current.destroyed) {
        const conn = peerRef.current.connect(hostId);
        hostConnectionRef.current = conn;

        const timeout = setTimeout(() => {
            if (!conn.open) {
                alert("Connection timed out. Host may be offline or ID is incorrect.");
                conn.close();
            }
        }, 5000);

        conn.on('open', () => {
             clearTimeout(timeout);
             const tempProfile = tempProfileRef.current;
             const joinReq: Player = {
                 id: peerRef.current.id,
                 name: tempProfile.name || 'Unknown Hero',
                 role: tempProfile.role || PlayerRole.HERO,
                 heroClass: tempProfile.heroClass,
                 currentRoomId: '0,0',
                 previousRoomId: null,
                 visitedRooms: ['0,0'],
                 dicePool: [],
                 inventory: [],
                 isMoving: false,
                 moveUnlockTime: 0,
                 lastRerollTime: 0,
                 upgradePoints: 0,
                 obstaclesDefeatedCount: 0,
                 draftStep: 0,
                 draftDieOptions: [],
                 isReady: false,
                 gold: 0,
                 exp: 0,
                 level: 1
             };
             conn.send({ type: 'JOIN_REQUEST', payload: joinReq });
        });

        conn.on('data', (data: NetworkMessage) => {
            if (data.type === 'SYNC_STATE') {
                setGameState(prev => ({
                    ...data.payload,
                    localPlayerId: peerRef.current.id 
                }));
            }
        });

        conn.on('error', (err: any) => {
            clearTimeout(timeout);
            console.error("Connection error:", err);
            alert(`Could not connect to host: ${err.type || 'Unknown Error'}`);
        });
        
        conn.on('close', () => {
            alert("Disconnected from host.");
            window.location.reload();
        });
    } else {
        alert("Network not ready. Please wait.");
    }
  };

  useEffect(() => {
    if (!isPeerInitialized.current) {
        initPeer();
        isPeerInitialized.current = true;
    }
  }, []);

  const broadcastState = (state: GameState) => {
    connectionsRef.current.forEach(conn => {
        if (conn.open) conn.send({ type: 'SYNC_STATE', payload: state });
    });
  };

  const handlePlayerJoin = (newPlayer: Player) => {
    setGameState(prev => {
        let playerToAdd = { ...newPlayer };
        // Late join logic
        if (prev.status !== 'LOBBY') {
            const startRoom = Object.values(prev.map as Record<string, Room>).find(r => r.isStart);
            playerToAdd.currentRoomId = startRoom?.id || '0,0';
            playerToAdd.visitedRooms = [playerToAdd.currentRoomId];
            if (playerToAdd.role === PlayerRole.HERO) {
                playerToAdd.dicePool = generateStarterDice();
                // Late joiners get a couple balanced draft dice without selection
                playerToAdd.dicePool.push(generateDraftDie(`d2-late`, 0));
                playerToAdd.dicePool.push(generateDraftDie(`d3-late`, 1));
                playerToAdd.inventory = ['ITEM_SCROLL']; 
            }
        }

        const filteredPlayers = prev.players.filter(p => p.id !== newPlayer.id);
        const newState = {
            ...prev,
            players: [...filteredPlayers, playerToAdd]
        };
        
        broadcastState(newState);
        return newState;
    });
  };

  const handleGameAction = (action: GameAction) => {
    setGameState(prev => {
        const newState = processGameAction(prev, action);
        if (isHost) broadcastState(newState);
        return newState;
    });
  };

  // Helper to auto-use gold/exp dice and reroll them recursively
  const resolveAutoResources = (player: Player) => {
      let madeChanges = true;
      let iterations = 0;
      // Prevent infinite loop
      while (madeChanges && iterations < 10) {
          madeChanges = false;
          iterations++;
          
          player.dicePool.forEach(die => {
              if (die.lockedToObstacleId) return; // Don't touch locked dice

              if (die.currentValue === StatType.GOLD) {
                  player.gold = (player.gold || 0) + 1;
                  die.currentValue = rollDie(die.faces[Math.floor(Math.random() * 6)]);
                  madeChanges = true;
              } else if (die.currentValue === StatType.EXP) {
                  player.exp = (player.exp || 0) + 1;
                  if (player.exp >= 5) {
                      player.exp -= 5;
                      player.level++;
                      player.upgradePoints++;
                  }
                  die.currentValue = rollDie(die.faces[Math.floor(Math.random() * 6)]);
                  madeChanges = true;
              }
          });
      }
  };

  const recalculateRoomObstacles = (room: Room, allPlayers: Player[], now: number) => {
      const playersHere = allPlayers.filter(p => p.currentRoomId === room.id);
      
      room.activeObstacles.forEach(obs => {
          if (obs.isDefeated) return;
          if (obs.card.keyRequirement) return;

          // Store prev state to detect increase
          const previousSuccesses = { ...obs.currentSuccesses };

          obs.currentSuccesses = { ...obs.permanentSuccesses };

          const requiredStats = Object.keys(obs.card.requirements) as StatType[];
          let anyIncrease = false;
          
          requiredStats.forEach(stat => {
              let statPower = obs.currentSuccesses[stat] || 0;
              
              playersHere.forEach(p => {
                 p.dicePool.forEach(d => {
                     if (d.lockedToObstacleId === obs.id && d.currentValue === stat) {
                         const faceIndex = d.faces.indexOf(d.currentValue);
                         let diePower = d.multipliers[faceIndex] || 1;
                         
                         if (p.heroClass && CLASS_BONUS[p.heroClass] === d.currentValue) {
                             diePower *= 2; 
                         }

                         p.inventory.forEach(itemId => {
                             const def = ITEM_REGISTRY[itemId];
                             if (def?.bonusStat === d.currentValue) diePower += (def.bonusAmount || 0);
                         });
                         
                         statPower += diePower;
                     }
                 });
              });
              
              obs.currentSuccesses[stat] = statPower;
              if (statPower > (previousSuccesses[stat] || 0)) {
                  anyIncrease = true;
              }
          });

          if (anyIncrease) {
              room.recentSuccesses = room.recentSuccesses || [];
              room.recentSuccesses.push(now);
          }

          const isSupercharged = room.superChargeUnlockTime > now;
          const allMet = requiredStats.every(stat => {
              const current = obs.currentSuccesses[stat] || 0;
              let needed = obs.card.requirements[stat] || 0;
              if (isSupercharged) needed *= 2;
              return current >= needed;
          });

          if (allMet) {
              obs.isDefeated = true;
              
              playersHere.forEach(p => {
                  p.dicePool.forEach(d => {
                      if (d.lockedToObstacleId === obs.id) d.lockedToObstacleId = null;
                  });
              });

              if (obs.card.specialRules?.reward === 'LOOT_DROP') room.items.push(getRandomLoot());
          }
      });
  };

  const processGameAction = (state: GameState, action: GameAction): GameState => {
      const draft: GameState = JSON.parse(JSON.stringify(state));
      const now = Date.now();
      const getRoom = (id: string) => draft.map[id];

      if (action.type === 'START_GAME') {
          draft.status = 'PREGAME';
          draft.timer = PREGAME_DURATION;
          draft.map = generateMap();
          
          // Setup DM Draft Options (Start with Basic)
          draft.dmDraftOptions = generateDraftCards('BASIC', 3);
          draft.dmDeck = [];
          draft.dmDeckPointer = 0;

          const startRoom = Object.values(draft.map as Record<string, Room>).find(r => r.isStart);
          draft.players.forEach(p => {
              p.currentRoomId = startRoom?.id || '0,0';
              p.visitedRooms = [p.currentRoomId];
              p.isReady = false;
              p.gold = 0;
              p.exp = 0;
              p.level = 1;
              
              if (p.role === PlayerRole.HERO) {
                  p.dicePool = generateStarterDice(); // 1 balanced die
                  p.inventory = ['ITEM_SCROLL']; 
                  p.draftStep = 0;
                  // First draft options (Power 0)
                  p.draftDieOptions = [
                      generateDraftDie('draft-1', 0),
                      generateDraftDie('draft-2', 0),
                      generateDraftDie('draft-3', 0)
                  ];
              }
          });
      }
      else if (action.type === 'DRAFT_DIE') {
          const player = draft.players.find(p => p.id === action.playerId);
          if (player && player.role === PlayerRole.HERO && !player.isReady) {
               const selectedDie = player.draftDieOptions[action.dieIndex];
               if (selectedDie) {
                   const newDie = { ...selectedDie, id: `die-${player.id}-${player.draftStep}-${now}` };
                   player.dicePool.push(newDie);
                   player.draftStep++;
                   
                   // Prepare next step
                   if (player.draftStep < 2) { // Now only 2 draft steps (Total 3 dice)
                       const powerLevel = player.draftStep; // 0 or 1
                       player.draftDieOptions = [
                          generateDraftDie('draft-1', powerLevel),
                          generateDraftDie('draft-2', powerLevel),
                          generateDraftDie('draft-3', powerLevel)
                       ];
                   } else {
                       player.draftDieOptions = [];
                       player.isReady = true; 
                   }
               }
          }
      }
      else if (action.type === 'DRAFT_CARD') {
          if (!isHost) return draft; 
          
          if (draft.dmDeck.length < 10) {
              const selectedCard = draft.dmDraftOptions[action.cardIndex];
              if (selectedCard) {
                  draft.dmDeck.push(selectedCard);
                  const count = draft.dmDeck.length;
                  
                  if (count < 10) {
                      let tier: 'BASIC' | 'NEUTRAL' | 'ADVANCED' = 'BASIC';
                      if (count >= 4) tier = 'NEUTRAL';
                      if (count >= 7) tier = 'ADVANCED';
                      draft.dmDraftOptions = generateDraftCards(tier, 3);
                  } else {
                      draft.dmDraftOptions = [];
                      const dm = draft.players.find(p => p.role === PlayerRole.DM);
                      if (dm) dm.isReady = true;
                  }
              }
          }
      }
      else if (action.type === 'PLAYER_READY') {
          const player = draft.players.find(p => p.id === action.playerId);
          if (player) player.isReady = true;
      }
      else if (action.type === 'RESET_LOBBY') {
          draft.status = 'LOBBY';
          draft.timer = GAME_DURATION;
          draft.dmResources = 8;
          draft.dmHand = [];
          draft.dmDeck = [];
          draft.dmDeckPointer = 0;
          draft.map = {};
          draft.lastSuperChargeTime = 0;
          draft.players.forEach(p => {
              p.currentRoomId = '0,0';
              p.previousRoomId = null;
              p.visitedRooms = [];
              p.dicePool = [];
              p.inventory = [];
              p.isMoving = false;
              p.moveUnlockTime = 0;
              p.lastRerollTime = 0;
              p.upgradePoints = 0;
              p.obstaclesDefeatedCount = 0;
              p.draftStep = 0;
              p.draftDieOptions = [];
              p.isReady = false;
              p.gold = 0;
              p.exp = 0;
              p.level = 1;
          });
      }
      else if (action.type === 'SUPER_CHARGE_ROOM') {
          const room = getRoom(action.roomId);
          if (room && now - draft.lastSuperChargeTime > SUPERCHARGE_COOLDOWN) {
              room.superChargeUnlockTime = now + SUPERCHARGE_DURATION;
              draft.lastSuperChargeTime = now;
          }
      }
      else if (action.type === 'ESCAPE_DUNGEON') {
          const player = draft.players.find(p => p.id === action.playerId);
          if (player && !player.isMoving) {
              const room = getRoom(player.currentRoomId);
              if (room.isExit && room.activeObstacles.every(o => o.isDefeated)) {
                  draft.status = 'VICTORY_HERO';
              }
          }
      }
      else if (action.type === 'MOVE') {
          const player = draft.players.find(p => p.id === action.playerId);
          if (player && !player.isMoving && player.role === PlayerRole.HERO) {
              const currentRoom = getRoom(player.currentRoomId);
              const [x, y] = currentRoom.id.split(',').map(Number);
              let nextId = '';
              if (action.direction === 'N') nextId = `${x},${y-1}`;
              if (action.direction === 'S') nextId = `${x},${y+1}`;
              if (action.direction === 'E') nextId = `${x+1},${y}`;
              if (action.direction === 'W') nextId = `${x-1},${y}`;

              if (currentRoom.connections.includes(nextId)) {
                  player.isMoving = true;
                  player.moveUnlockTime = now + MOVEMENT_DELAY;
                  player.dicePool.forEach(d => d.lockedToObstacleId = null);
                  recalculateRoomObstacles(currentRoom, draft.players, now);
                  player.previousRoomId = player.currentRoomId;
                  player.currentRoomId = nextId;
                  if (!player.visitedRooms.includes(nextId)) {
                      player.visitedRooms.push(nextId);
                  }
              }
          }
      }
      else if (action.type === 'USE_DIE') {
          const player = draft.players.find(p => p.id === action.playerId);
          const room = player ? getRoom(player.currentRoomId) : null;
          if (player && room && !player.isMoving) {
              const die = player.dicePool[action.dieIndex];
              // Removed manual GOLD/EXP check here because it's now automatic. 
              // But keep safety check in case race condition.
              if (die && (die.currentValue === StatType.GOLD || die.currentValue === StatType.EXP)) {
                   // Let auto-resolve handle it at end of function
              } else {
                  const obstacle = room.activeObstacles.find(o => o.id === action.obstacleId);
                  
                  if (die && obstacle && !obstacle.isDefeated) {
                      const faceIndex = die.faces.indexOf(die.currentValue);
                      const multiplier = die.multipliers[faceIndex] || 1;
                      
                      if (obstacle.card.specialRules?.accumulatesDamage) {
                          const requiredAmount = obstacle.card.requirements[die.currentValue];
                          if (requiredAmount && requiredAmount > 0) {
                              let hitPower = multiplier;
                              if (player.heroClass && CLASS_BONUS[player.heroClass] === die.currentValue) {
                                  hitPower *= 2; 
                              }
                              player.inventory.forEach(itemId => {
                                  const def = ITEM_REGISTRY[itemId];
                                  if (def?.bonusStat === die.currentValue) hitPower += (def.bonusAmount || 0);
                              });
                              const prev = obstacle.permanentSuccesses[die.currentValue] || 0;
                              obstacle.permanentSuccesses[die.currentValue] = prev + hitPower;
                              
                              // Register visual success for accumulation
                              room.recentSuccesses = room.recentSuccesses || [];
                              room.recentSuccesses.push(now);
                          }
                          die.currentValue = rollDie(die.faces[Math.floor(Math.random() * 6)]);
                          // After rolling, check for resources
                          resolveAutoResources(player);
                      } else {
                          die.lockedToObstacleId = obstacle.id;
                      }
                      recalculateRoomObstacles(room, draft.players, now);
                  }
              }
          }
      }
      else if (action.type === 'UNLOCK_DIE') {
          const player = draft.players.find(p => p.id === action.playerId);
          if (player) {
              const die = player.dicePool[action.dieIndex];
              if (die.lockedToObstacleId) {
                  die.lockedToObstacleId = null;
                  const room = getRoom(player.currentRoomId);
                  recalculateRoomObstacles(room, draft.players, now);
              }
          }
      }
      else if (action.type === 'REROLL') {
          const player = draft.players.find(p => p.id === action.playerId);
          if (player && now - player.lastRerollTime >= REROLL_COOLDOWN) {
              player.dicePool.forEach(die => {
                  if (!die.lockedToObstacleId) {
                      die.currentValue = rollDie(die.faces[Math.floor(Math.random() * 6)]);
                  }
              });
              player.lastRerollTime = now;
              // Check new rolls
              resolveAutoResources(player);
          }
      }
      else if (action.type === 'UPGRADE_DIE') {
          const player = draft.players.find(p => p.id === action.playerId);
          // Ensure upgrading die index 0 only
          if (player && player.upgradePoints > 0 && action.dieIndex === 0) {
              const die = player.dicePool[action.dieIndex];
              // Also ensure we don't upgrade special faces (GOLD/EXP)
              const face = die.faces[action.faceIndex];
              if (die && die.multipliers[action.faceIndex] === 1 && face !== StatType.GOLD && face !== StatType.EXP) { 
                  die.multipliers[action.faceIndex] = 2;
                  player.upgradePoints--;
              }
          }
      }
      else if (action.type === 'PICKUP_ITEM') {
          const player = draft.players.find(p => p.id === action.playerId);
          const room = player ? getRoom(player.currentRoomId) : null;
          if (player && room) {
              const itemIndex = room.items.indexOf(action.itemId);
              if (itemIndex > -1) {
                  const itemId = room.items.splice(itemIndex, 1)[0];
                  player.inventory.push(itemId);
                  const def = ITEM_REGISTRY[itemId];
                  if (def?.grantsExtraDie) {
                      player.dicePool.push(generateDraftDie(`die-tool-${player.id}-${now}`, 0)); // Level 0 extra die
                      resolveAutoResources(player);
                  }
              }
          }
      }
      else if (action.type === 'BUY_ITEM') {
          const player = draft.players.find(p => p.id === action.playerId);
          if (player) {
              const def = ITEM_REGISTRY[action.itemId];
              if (def && player.gold >= def.price) {
                  player.gold -= def.price;
                  player.inventory.push(action.itemId);
                  if (def.grantsExtraDie) {
                      player.dicePool.push(generateDraftDie(`die-tool-${player.id}-${now}`, 0));
                      resolveAutoResources(player);
                  }
              }
          }
      }
      else if (action.type === 'DROP_ITEM') {
          const player = draft.players.find(p => p.id === action.playerId);
          const room = player ? getRoom(player.currentRoomId) : null;
          if (player && room) {
               const idx = player.inventory.indexOf(action.itemId);
               if (idx > -1) {
                   player.inventory.splice(idx, 1);
                   room.items.push(action.itemId);
                   const def = ITEM_REGISTRY[action.itemId];
                   if (def?.grantsExtraDie && player.dicePool.length > 3) { // > 3 because base is 3 now
                       player.dicePool.pop(); 
                   }
               }
          }
      }
      else if (action.type === 'USE_ITEM') {
          const player = draft.players.find(p => p.id === action.playerId);
          if (player) {
              const idx = player.inventory.indexOf(action.itemId);
              if (idx > -1) {
                  const def = ITEM_REGISTRY[action.itemId];
                  if (def?.effectType === 'TELEPORT') {
                      player.inventory.splice(idx, 1);
                      const startRoom = Object.values(draft.map).find((r: any) => r.isStart);
                      if (startRoom) {
                          player.currentRoomId = startRoom.id;
                          player.isMoving = false;
                          player.moveUnlockTime = 0;
                          player.dicePool.forEach(d => d.lockedToObstacleId = null);
                      }
                  } 
                  else if (def?.effectType === 'TELEPORT_OTHERS') {
                      player.inventory.splice(idx, 1);
                      draft.players.forEach(otherP => {
                          if (otherP.id !== player.id && otherP.role === PlayerRole.HERO) {
                              otherP.currentRoomId = player.currentRoomId;
                              otherP.isMoving = false;
                              otherP.moveUnlockTime = 0;
                              otherP.dicePool.forEach(d => d.lockedToObstacleId = null);
                          }
                      });
                  }
                  else if (def?.effectType === 'GRANT_UPGRADE') {
                      player.inventory.splice(idx, 1);
                      player.upgradePoints += 1;
                  }
                  else if (def?.effectType === 'NUKE_OBSTACLE' && def.targetStat) {
                      const room = getRoom(player.currentRoomId);
                      if (room) {
                          room.activeObstacles.forEach(obs => {
                              if (!obs.isDefeated && obs.card.requirements[def.targetStat!]) {
                                  obs.isDefeated = true;
                              }
                          });
                          recalculateRoomObstacles(room, draft.players, now);
                      }
                      player.inventory.splice(idx, 1);
                  }
              }
          }
      }
      else if (action.type === 'UNLOCK_OBSTACLE') {
          const player = draft.players.find(p => p.id === action.playerId);
          const room = player ? getRoom(player.currentRoomId) : null;
          if (player && room) {
              const obs = room.activeObstacles.find(o => o.id === action.obstacleId);
              if (obs && obs.card.keyRequirement && player.inventory.includes(obs.card.keyRequirement)) {
                  obs.isDefeated = true;
              }
          }
      }
      else if (action.type === 'DM_PLACE_TRAP') {
          const card = draft.dmHand.find(c => c.id === action.cardId);
          const room = getRoom(action.roomId);
          const playersInRoom = draft.players.filter(p => p.currentRoomId === action.roomId);
          if (card && room && draft.dmResources >= card.cost && playersInRoom.length === 0 && room.activeObstacles.length === 0) {
              draft.dmResources -= card.cost;
              draft.dmHand = draft.dmHand.filter(c => c.id !== action.cardId);
              const newObstacle: RoomObstacle = {
                  id: `obs-${now}`, card, currentSuccesses: {}, permanentSuccesses: {}, isDefeated: false
              };
              room.activeObstacles.push(newObstacle);
              
              // Replenish Hand from Deck sequentially
              while(draft.dmHand.length < 3) {
                  if (draft.dmDeck.length > 0) {
                      const template = draft.dmDeck[draft.dmDeckPointer % draft.dmDeck.length];
                      draft.dmHand.push(createCardInstance(template));
                      draft.dmDeckPointer++;
                  } else {
                      draft.dmHand.push(drawCard(draft.timer));
                  }
              }
          }
      }
      else if (action.type === 'UPDATE_PLAYER') {
          const pIndex = draft.players.findIndex(p => p.id === action.playerId);
          if (pIndex !== -1) {
              const currentName = draft.players[pIndex].name;
              draft.players[pIndex] = { ...draft.players[pIndex], ...action.data };
              if (!action.data.name) {
                  draft.players[pIndex].name = currentName;
              }
          }
      }

      return draft;
  };

  const handleHostGame = (name: string) => {
    setIsHost(true);
    const hostPlayer: Player = {
        id: peerId!, name, role: PlayerRole.HERO, heroClass: HeroClass.FIGHTER, currentRoomId: '0,0',
        previousRoomId: null, visitedRooms: ['0,0'], dicePool: [], inventory: [], isMoving: false,
        moveUnlockTime: 0, lastRerollTime: 0, upgradePoints: 0, obstaclesDefeatedCount: 0,
        draftStep: 0, draftDieOptions: [], isReady: false, gold: 0, exp: 0, level: 1
    };
    setGameState(prev => ({
        ...prev, players: [hostPlayer], localPlayerId: peerId!
    }));
  };

  const dispatchAction = (action: GameAction) => {
    if (isHost) {
        handleGameAction(action);
    } else {
        if (hostConnectionRef.current) {
            hostConnectionRef.current.send({ type: 'ACTION', payload: action });
        }
    }
  };
  
  const renderConnectionStatus = () => {
      switch (peerStatus) {
        case 'INITIALIZING':
          return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-slate-200 font-mono gap-4">
              <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
              <div>INITIALIZING NETWORK...</div>
            </div>
          );
        case 'RECONNECTING':
          return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-yellow-400 font-mono gap-4">
              <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
              <div>CONNECTION INTERRUPTED. RECONNECTING...</div>
            </div>
          );
        case 'ERROR':
           return (
              <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-red-400 font-mono gap-4 p-4 text-center">
                  <div className="text-2xl">CONNECTION ERROR</div>
                  <div>{connectionError}</div>
                  <button 
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-slate-800 border border-slate-600 hover:bg-slate-700 text-white mt-4"
                  >
                      RETRY CONNECTION
                  </button>
              </div>
          );
        case 'CONNECTED':
            return null; // Render the main app
      }
  };

  const connectionStatusUI = renderConnectionStatus();
  if (connectionStatusUI) return connectionStatusUI;


  return (
    <>
      {gameState.status === 'LOBBY' && (
        <Lobby 
          players={gameState.players}
          localPlayerId={gameState.localPlayerId}
          gameId={peerId}
          isHost={isHost}
          onHostGame={handleHostGame}
          onJoinGame={connectToHost}
          onUpdatePlayer={(data) => {
              if (data.name) tempProfileRef.current.name = data.name;
              if (gameState.localPlayerId) {
                  dispatchAction({ type: 'UPDATE_PLAYER', playerId: gameState.localPlayerId, data });
              }
          }}
          onStartGame={() => dispatchAction({ type: 'START_GAME' })}
        />
      )}

      {gameState.status === 'PREGAME' && gameState.localPlayerId && (
          <PregameView 
             gameState={gameState}
             localPlayer={gameState.players.find(p => p.id === gameState.localPlayerId)!}
             onDraftDie={(idx) => dispatchAction({ type: 'DRAFT_DIE', playerId: gameState.localPlayerId!, dieIndex: idx })}
             onDraftCard={(idx) => dispatchAction({ type: 'DRAFT_CARD', cardIndex: idx })}
             onReady={() => dispatchAction({ type: 'PLAYER_READY', playerId: gameState.localPlayerId! })}
          />
      )}

      {(gameState.status === 'PLAYING' || gameState.status.includes('VICTORY')) && (
          gameState.localPlayerId && gameState.players.find(p => p.id === gameState.localPlayerId)?.role === PlayerRole.DM ? (
             <DungeonMasterView 
                gameState={gameState} 
                onPlaceCard={(card, roomId) => dispatchAction({ type: 'DM_PLACE_TRAP', cardId: card.id, roomId })}
                onSupercharge={(roomId) => dispatchAction({ type: 'SUPER_CHARGE_ROOM', roomId })}
             />
          ) : (
             gameState.localPlayerId && (
                 <HeroView 
                    gameState={gameState} 
                    player={gameState.players.find(p => p.id === gameState.localPlayerId)!}
                    onMove={(dir) => dispatchAction({ type: 'MOVE', playerId: gameState.localPlayerId!, direction: dir })}
                    onRoll={(obsId, dieIdx) => dispatchAction({ type: 'USE_DIE', playerId: gameState.localPlayerId!, obstacleId: obsId, dieIndex: dieIdx })}
                    onUnlock={(dieIdx) => dispatchAction({ type: 'UNLOCK_DIE', playerId: gameState.localPlayerId!, dieIndex: dieIdx })}
                    onReroll={() => dispatchAction({ type: 'REROLL', playerId: gameState.localPlayerId! })}
                    onUpgrade={(dieIdx, faceIdx) => dispatchAction({ type: 'UPGRADE_DIE', playerId: gameState.localPlayerId!, dieIndex: dieIdx, faceIndex: faceIdx })}
                    onPickup={(itemId) => dispatchAction({ type: 'PICKUP_ITEM', playerId: gameState.localPlayerId!, itemId })}
                    onDrop={(itemId) => dispatchAction({ type: 'DROP_ITEM', playerId: gameState.localPlayerId!, itemId })}
                    onUseItem={(itemId) => dispatchAction({ type: 'USE_ITEM', playerId: gameState.localPlayerId!, itemId })}
                    onBuyItem={(itemId) => dispatchAction({ type: 'BUY_ITEM', playerId: gameState.localPlayerId!, itemId })}
                    onUnlockObstacle={(obsId) => dispatchAction({ type: 'UNLOCK_OBSTACLE', playerId: gameState.localPlayerId!, obstacleId: obsId })}
                    onEscape={() => dispatchAction({ type: 'ESCAPE_DUNGEON', playerId: gameState.localPlayerId! })}
                 />
             )
          )
      )}

      {gameState.status.includes('VICTORY') && (
          <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center pointer-events-none">
              <div className="bg-slate-900 border-4 border-yellow-500 p-8 text-center animate-bounce-slow pointer-events-auto">
                  <h1 className="text-4xl md:text-6xl text-yellow-400 font-retro mb-4">GAME OVER</h1>
                  <h2 className="text-2xl text-white mb-8">
                      {gameState.status === 'VICTORY_HERO' ? 'HEROES ESCAPED!' : 'THE DUNGEON CLAIMS ALL!'}
                  </h2>
                  <div className="flex gap-4 justify-center">
                    <button 
                        onClick={() => dispatchAction({ type: 'RESET_LOBBY' })} 
                        className="bg-yellow-600 text-black px-6 py-3 font-bold uppercase hover:bg-yellow-500 border-2 border-yellow-400"
                    >
                        PLAY AGAIN
                    </button>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="bg-slate-700 text-white px-6 py-3 font-bold uppercase hover:bg-slate-600 border-2 border-slate-500"
                    >
                        MAIN MENU
                    </button>
                  </div>
              </div>
          </div>
      )}
    </>
  );
}
