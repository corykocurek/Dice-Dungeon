
import React, { useEffect, useState, useRef } from 'react';
import { GameState, Player, Room, Die, StatType, RoomObstacle, HeroClass } from '../types';
import { Room3D } from './Room3D';
import { RetroButton, Panel, ProgressBar } from './RetroComponents';
import { STAT_COLORS, STAT_BG_COLORS, STAT_ICONS, MOVEMENT_DELAY, CLASS_BONUS, REROLL_COOLDOWN, MAP_SIZE, ITEM_REGISTRY } from '../constants';
import { Dices, Activity, Map as MapIcon, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Ban, RefreshCw, Zap, Lock, Unlock, Undo2, X, Sword, SquareStack, Star, Key, Backpack, Grid3X3, ChevronDown, ChevronUp, Trash2, Info, Sparkles, CheckCircle, DoorOpen, Shield, Book, Cross, Axe, Music, User } from 'lucide-react';

interface HeroProps {
  gameState: GameState;
  player: Player;
  onMove: (direction: 'N' | 'S' | 'E' | 'W') => void;
  onRoll: (obstacleId: string, dieIndex: number) => void;
  onUnlock: (dieIndex: number) => void;
  onReroll: () => void;
  onUpgrade: (dieIndex: number, faceIndex: number) => void;
  onPickup: (itemId: string) => void;
  onDrop: (itemId: string) => void;
  onUseItem: (itemId: string) => void;
  onUnlockObstacle: (obstacleId: string) => void;
  onEscape: () => void;
}

const CLASS_ICONS: Record<HeroClass, React.ElementType> = {
    [HeroClass.FIGHTER]: Shield,
    [HeroClass.ROGUE]: Zap,
    [HeroClass.WIZARD]: Book,
    [HeroClass.CLERIC]: Cross,
    [HeroClass.BARBARIAN]: Axe,
    [HeroClass.BARD]: Music,
};

export const HeroView: React.FC<HeroProps> = ({ gameState, player, onMove, onRoll, onUnlock, onReroll, onUpgrade, onPickup, onDrop, onUseItem, onUnlockObstacle, onEscape }) => {
  const currentRoom = gameState.map[player.currentRoomId];
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const [animatingDice, setAnimatingDice] = useState<Set<number>>(new Set());
  const [showMap, setShowMap] = useState(false);
  const [expandedItemId, setExpandedItemId] = useState<number | null>(null);
  
  // Success Popup State
  const [successMsg, setSuccessMsg] = useState<{name: string, timestamp: number} | null>(null);
  const prevObstaclesRef = useRef<Record<string, boolean>>({});

  // Main Tabs: DICE vs ITEMS
  const [activeTab, setActiveTab] = useState<'DICE' | 'ITEMS'>('DICE');
  // Dice Sub-mode: ROLL vs SIDES
  const [diceMode, setDiceMode] = useState<'ROLL' | 'SIDES'>('ROLL');
  // Upgrade Mode toggle
  const [isUpgradeMode, setIsUpgradeMode] = useState(false);
  
  // Reroll Cooldown Timer
  const [rerollCooldownRemaining, setRerollCooldownRemaining] = useState(0);

  // Calculate Movement Timer
  const [moveProgress, setMoveProgress] = useState(0);
  
  // Determine travel direction
  const [travelDir, setTravelDir] = useState<'N' | 'S' | 'E' | 'W' | null>(null);

  useEffect(() => {
    let interval: any;
    if (player.isMoving) {
      if (player.previousRoomId && player.currentRoomId) {
          const [px, py] = player.previousRoomId.split(',').map(Number);
          const [cx, cy] = player.currentRoomId.split(',').map(Number);
          if (cx > px) setTravelDir('E');
          else if (cx < px) setTravelDir('W');
          else if (cy > py) setTravelDir('S');
          else if (cy < py) setTravelDir('N');
      }
      
      interval = setInterval(() => {
        const remaining = player.moveUnlockTime - Date.now();
        const elapsed = MOVEMENT_DELAY - remaining;
        const prog = Math.min(100, (elapsed / MOVEMENT_DELAY) * 100);
        setMoveProgress(prog);
      }, 100);
    } else {
      if (moveProgress !== 0) setMoveProgress(0);
      setTravelDir(null);
    }
    return () => clearInterval(interval);
  }, [player.isMoving, player.moveUnlockTime, player.currentRoomId, player.previousRoomId]);

  useEffect(() => {
      const interval = setInterval(() => {
          const diff = Date.now() - player.lastRerollTime;
          if (diff < REROLL_COOLDOWN) {
              setRerollCooldownRemaining(Math.ceil((REROLL_COOLDOWN - diff) / 1000));
          } else {
              setRerollCooldownRemaining(0);
          }
      }, 100);
      return () => clearInterval(interval);
  }, [player.lastRerollTime]);

  // Track defeated obstacles for Success Popup
  useEffect(() => {
      if (!currentRoom) return;
      
      currentRoom.activeObstacles.forEach(obs => {
          const wasDefeated = prevObstaclesRef.current[obs.id];
          if (!wasDefeated && obs.isDefeated) {
              // Just defeated!
              setSuccessMsg({ name: obs.card.name, timestamp: Date.now() });
              setTimeout(() => setSuccessMsg(null), 2000);
          }
          prevObstaclesRef.current[obs.id] = obs.isDefeated;
      });
  }, [currentRoom]);

  // Reset upgrade mode when switching tabs/modes
  useEffect(() => {
      setIsUpgradeMode(false);
  }, [diceMode, activeTab]);

  // Helpers to check adjacent rooms
  const getNeighbor = (dx: number, dy: number, room: Room) => {
    const targetId = `${room.x + dx},${room.y + dy}`;
    return room.connections.includes(targetId) ? targetId : null;
  };
  
  const activeObstacles = currentRoom.activeObstacles.filter(o => !o.isDefeated);
  const activeObstacle = activeObstacles[0]; // Primary target
  const hasObstacles = activeObstacles.length > 0;
  
  // Retreat rules
  const preventRetreat = activeObstacles.some(o => o.card.specialRules?.preventsRetreat);
  
  const canMoveGenerally = !player.isMoving && !hasObstacles;

  const handleDieInteraction = (dieIdx: number, isLocked: boolean) => {
      if (diceMode === 'SIDES') return; // No interaction in sides mode
      
      if (isLocked) {
          onUnlock(dieIdx);
          return;
      }
      
      if (!activeObstacle || activeObstacle.card.keyRequirement) return; // Cannot use dice on Key-only locks
      
      // Trigger animation
      setAnimatingDice(prev => new Set(prev).add(dieIdx));
      
      // Dispatch after animation starts
      setTimeout(() => {
          onRoll(activeObstacle.id, dieIdx);
          setCombatLog(prev => [`Used die on ${activeObstacle.card.name}!`, ...prev.slice(0, 4)]);
          
          // Clear animation
          setTimeout(() => {
               setAnimatingDice(prev => {
                   const next = new Set(prev);
                   next.delete(dieIdx);
                   return next;
               });
          }, 500);
      }, 100);
  };

  const handleRerollAll = () => {
      // Animate available dice only
      const availableIndices = new Set(player.dicePool.map((d, i) => d.lockedToObstacleId ? -1 : i).filter(i => i !== -1));
      setAnimatingDice(availableIndices);

      setTimeout(() => {
          onReroll();
          setCombatLog(prev => [`Rerolled free dice!`, ...prev.slice(0, 4)]);
          setTimeout(() => {
             setAnimatingDice(new Set());
          }, 500);
      }, 100);
  };

  const renderNavButton = (dx: number, dy: number, icon: React.ReactNode, dir: 'N'|'S'|'E'|'W') => {
      const roomForNav = (player.isMoving && player.previousRoomId) ? gameState.map[player.previousRoomId] : currentRoom;
      const target = getNeighbor(dx, dy, roomForNav);
      const isWall = !target;
      const isRetreat = target === player.previousRoomId;
      const isAllowed = !isWall && !player.isMoving && (canMoveGenerally || (isRetreat && !preventRetreat));
      
      let btnClass = "bg-slate-700 border-yellow-500 hover:bg-slate-600";
      if (isWall) btnClass = "bg-slate-800 border-slate-700 opacity-50 cursor-not-allowed";
      else if (isRetreat && hasObstacles && !preventRetreat) btnClass = "bg-blue-800 border-blue-400 hover:bg-blue-700 animate-pulse";
      else if (!isAllowed) btnClass = "bg-slate-800 border-red-900 opacity-50 cursor-not-allowed";

      return (
        <RetroButton 
            disabled={!isAllowed} 
            onClick={() => onMove(dir)}
            className={`p-0 flex items-center justify-center transition-all ${btnClass}`}
            title={isRetreat ? "Retreat!" : "Move"}
        >
            {isWall ? <Ban className="w-4 h-4 text-slate-600" /> : 
             (!isAllowed && !isWall) ? <Lock className="w-4 h-4 text-red-500" /> :
             isRetreat && hasObstacles ? <Undo2 className="w-4 h-4 text-blue-200" /> :
             icon}
        </RetroButton>
      );
  };

  const renderBigMap = () => {
      const grid = [];
      for(let y=0; y<MAP_SIZE; y++) {
          for(let x=0; x<MAP_SIZE; x++) {
              const id = `${x},${y}`;
              const room = gameState.map[id];
              const isVisited = player.visitedRooms?.includes(id);
              const isCurrent = player.currentRoomId === id;
              
              // Connections for big map
              const hasNorth = room.connections.includes(`${x},${y-1}`);
              const hasSouth = room.connections.includes(`${x},${y+1}`);
              const hasEast = room.connections.includes(`${x+1},${y}`);
              const hasWest = room.connections.includes(`${x-1},${y}`);

              const knownItem = isVisited && room.items.length > 0;
              const knownObstacle = isVisited && room.activeObstacles.some(o => !o.isDefeated);
              const otherPlayers = gameState.players.filter(p => p.currentRoomId === id && p.id !== player.id);

              grid.push(
                  <div key={id} className={`w-8 h-8 relative flex items-center justify-center border
                      ${!isVisited ? 'bg-slate-900 border-slate-800' : 
                        `bg-slate-700 ${isCurrent ? 'border-blue-500 bg-blue-900' : 'border-slate-500'}`}
                  `}>
                      {isVisited && (
                          <>
                           {hasNorth && <div className="absolute top-[-4px] w-2 h-2 bg-slate-500"></div>}
                           {hasSouth && <div className="absolute bottom-[-4px] w-2 h-2 bg-slate-500"></div>}
                           {hasEast && <div className="absolute right-[-4px] w-2 h-2 bg-slate-500"></div>}
                           {hasWest && <div className="absolute left-[-4px] w-2 h-2 bg-slate-500"></div>}
                          </>
                      )}
                      
                      {isCurrent && React.createElement(CLASS_ICONS[player.heroClass!], { className: "w-4 h-4 text-blue-300 animate-pulse" })}
                      {otherPlayers.map((p, i) => {
                          const Icon = p.heroClass ? CLASS_ICONS[p.heroClass] : User;
                          return <Icon key={i} className="w-3 h-3 text-green-400 absolute" style={{ transform: `translate(${i*3}px, ${i*3}px)`}} />;
                      })}
                      {!isCurrent && knownItem && <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>}
                      {!isCurrent && knownObstacle && <div className="w-2 h-2 bg-red-500 rounded-sm"></div>}
                  </div>
              )
          }
      }
      return grid;
  }
  
  // Render Mini-Map: Current room + immediate neighbors
  const renderMiniMap = () => {
      if (player.isMoving) return null;
      
      const cx = currentRoom.x;
      const cy = currentRoom.y;
      
      return (
          <div className="grid grid-cols-3 gap-1 bg-black/60 p-1 border border-slate-600 rounded">
             {[-1, 0, 1].map(dy => (
                 [-1, 0, 1].map(dx => {
                     const nx = cx + dx;
                     const ny = cy + dy;
                     const nid = `${nx},${ny}`;
                     const isCenter = dx===0 && dy===0;
                     const isValid = nx >= 0 && ny >= 0 && nx < MAP_SIZE && ny < MAP_SIZE;
                     
                     if (!isValid) return <div key={nid} className="w-4 h-4 bg-transparent"></div>;
                     
                     // Check connection
                     const connected = isCenter || currentRoom.connections.includes(nid);
                     const roomData = gameState.map[nid];
                     const isVisited = player.visitedRooms.includes(nid);
                     
                     // Indicators
                     const otherPlayersHere = gameState.players.filter(p => p.id !== player.id && p.currentRoomId === nid);
                     const hasItem = roomData.items.length > 0;
                     const hasObs = roomData.activeObstacles.some(o => !o.isDefeated);
                     
                     let bg = "bg-slate-900";
                     if (isCenter) bg = "bg-blue-600";
                     else if (connected && isVisited) bg = "bg-slate-600";
                     else if (connected) bg = "bg-slate-800";
                     else bg = "bg-black"; // Not connected
                     
                     return (
                         <div key={nid} className={`w-4 h-4 ${bg} flex items-center justify-center border border-black/50 text-[8px] relative`}>
                            {otherPlayersHere.map((p, i) => {
                                const Icon = p.heroClass ? CLASS_ICONS[p.heroClass] : User;
                                return <Icon key={i} className="w-2 h-2 text-green-400 absolute" style={{transform: `translate(${i*2}px, ${i*2}px)`}} />;
                            })}
                            {isVisited && hasItem && otherPlayersHere.length === 0 && <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>}
                            {isVisited && hasObs && !hasItem && otherPlayersHere.length === 0 && <div className="w-1.5 h-1.5 bg-red-500 rounded-sm"></div>}
                         </div>
                     );
                 })
             ))}
          </div>
      );
  };

  return (
    <div className="flex flex-col h-dvh bg-slate-900 text-slate-200 overflow-hidden">
      
      {/* 3D Viewport */}
      <div className="relative h-[40vh] md:flex-1 bg-black shrink-0 perspective-container">
        
        {!player.isMoving ? (
             <Room3D 
                obstacles={activeObstacles} 
                isExit={currentRoom.isExit}
                isStart={currentRoom.isStart}
                items={currentRoom.items}
                className="h-full"
            />
        ) : (
             <div className="absolute inset-0 z-10 bg-black flex flex-col items-center justify-center overflow-hidden">
                 <div className="absolute inset-0 h-1/2 -top-10 grid-ceiling opacity-40"></div>
                 <div className="absolute inset-0 h-1/2 top-1/2 grid-floor opacity-60"></div>
             </div>
        )}
        
        {/* HUD Overlay - Top */}
        <div className="absolute top-4 left-4 right-4 flex justify-between pointer-events-none z-40">
            <div className="bg-black/50 p-2 border border-slate-600 backdrop-blur-sm">
                <div className="text-yellow-400 font-retro text-sm">Room {player.currentRoomId}</div>
                {player.heroClass && <div className="text-xs text-slate-400 uppercase">{player.heroClass}</div>}
            </div>
             <div className="bg-black/50 p-2 border border-slate-600 backdrop-blur-sm">
                <div className="text-red-400 font-retro text-sm text-right">
                    {Math.floor(gameState.timer / 60)}:{(gameState.timer % 60).toString().padStart(2, '0')}
                </div>
            </div>
        </div>

        {/* Success Popup (Centered) */}
        {successMsg && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] animate-bounce-slow pointer-events-none w-[90%] max-w-sm">
                 <div className="bg-green-900/90 border-2 border-green-500 p-4 rounded-xl shadow-2xl flex items-center gap-2 justify-center backdrop-blur-md">
                     <CheckCircle className="w-8 h-8 text-green-300 shrink-0" />
                     <div className="flex flex-col overflow-hidden">
                         <span className="text-green-300 font-retro text-lg leading-tight">SUCCESS!</span>
                         <span className="text-green-100 text-xs truncate w-full">Defeated {successMsg.name}</span>
                     </div>
                 </div>
            </div>
        )}
        
        {/* Final Countdown Overlay */}
        {gameState.timer <= 5 && gameState.timer > 0 && (
             <div className="absolute inset-0 z-[70] flex items-center justify-center pointer-events-none bg-red-900/20">
                 <div className="text-[150px] font-retro text-red-500 animate-pulse drop-shadow-[4px_4px_0px_#000]">
                     {gameState.timer}
                 </div>
             </div>
        )}

        {/* HUD - Bottom Left: Mini Map */}
        {!player.isMoving && (
            <div className="absolute bottom-4 left-4 z-40">
                {renderMiniMap()}
            </div>
        )}

        {/* HUD - Center: Action Buttons (Pickup/Unlock/Escape) */}
        {!player.isMoving && (
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-2 pointer-events-auto">
                {currentRoom.isExit && activeObstacles.length === 0 && (
                    <div className="animate-pulse">
                        <RetroButton 
                            variant="success" 
                            onClick={onEscape}
                            className="shadow-2xl text-lg px-8 py-4 border-4"
                        >
                            <DoorOpen className="w-6 h-6 inline-block mr-2" />
                            ESCAPE DUNGEON!
                        </RetroButton>
                    </div>
                )}

                {currentRoom.items.length > 0 && (
                    <div className="flex flex-col items-center animate-bounce">
                        <div className="w-8 h-8 mb-1 drop-shadow-[0_0_5px_rgba(255,255,0,1)]">
                            <img src={ITEM_REGISTRY[currentRoom.items[0]]?.imageUrl} alt="Item" className="w-full h-full [image-rendering:pixelated]" />
                        </div>
                        <RetroButton 
                            variant="success" 
                            onClick={() => onPickup(currentRoom.items[0])}
                            className="shadow-lg text-xs"
                        >
                            PICK UP
                        </RetroButton>
                    </div>
                )}
                {activeObstacle?.card.keyRequirement && (
                    <RetroButton 
                        variant={player.inventory.includes(activeObstacle.card.keyRequirement) ? 'success' : 'outline'}
                        disabled={!player.inventory.includes(activeObstacle.card.keyRequirement)}
                        onClick={() => onUnlockObstacle(activeObstacle.id)}
                    >
                        {player.inventory.includes(activeObstacle.card.keyRequirement) ? 'UNLOCK DOOR' : 'NEED KEY'}
                    </RetroButton>
                )}
            </div>
        )}

        {/* Navigation Overlay - Bottom Right */}
        {!player.isMoving && (
            <div className="absolute bottom-4 right-4 z-40 bg-black/50 backdrop-blur-sm p-2 rounded border border-slate-700 shadow-xl pointer-events-auto">
                 <div className="grid grid-cols-3 gap-2 w-32 h-32">
                    <div />
                    {renderNavButton(0, -1, <ArrowUp className="w-6 h-6 text-yellow-400" />, 'N')}
                    <div />
                    
                    {renderNavButton(-1, 0, <ArrowLeft className="w-6 h-6 text-yellow-400" />, 'W')}
                    <div className="flex items-center justify-center">
                        <button onClick={() => setShowMap(true)} className="hover:bg-slate-700 p-1 rounded bg-slate-800 border border-slate-600">
                            <MapIcon className="text-blue-400 w-6 h-6" />
                        </button>
                    </div>
                    {renderNavButton(1, 0, <ArrowRight className="w-6 h-6 text-yellow-400" />, 'E')}

                    <div />
                    {renderNavButton(0, 1, <ArrowDown className="w-6 h-6 text-yellow-400" />, 'S')}
                    <div />
                </div>
            </div>
        )}

        {/* Movement Overlay */}
        {player.isMoving && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center p-8 gap-8 pointer-events-none">
                <div className="bg-slate-900/80 p-6 border-2 border-slate-500 flex flex-col items-center gap-4 backdrop-blur shadow-2xl">
                    <div className="text-2xl font-retro text-yellow-400 animate-pulse text-center drop-shadow-md">TRAVELING...</div>
                    <div className="w-64 h-6 border-2 border-slate-500 p-1 bg-black">
                        <div className="h-full bg-blue-500 transition-all duration-100" style={{ width: `${moveProgress}%` }}></div>
                    </div>
                    {travelDir && (
                         <div className="flex items-center justify-center">
                             {travelDir === 'N' && <ArrowUp className="w-12 h-12 text-yellow-400 animate-bounce" />}
                             {travelDir === 'S' && <ArrowDown className="w-12 h-12 text-yellow-400 animate-bounce" />}
                             {travelDir === 'E' && <ArrowRight className="w-12 h-12 text-yellow-400 animate-bounce" />}
                             {travelDir === 'W' && <ArrowLeft className="w-12 h-12 text-yellow-400 animate-bounce" />}
                         </div>
                    )}
                </div>
            </div>
        )}
      </div>

      {/* ENCOUNTER BAR - BETWEEN VIEWPORT AND CONTROLS */}
      {activeObstacle && !player.isMoving && (
          <div className="bg-red-900 border-t-4 border-b-4 border-red-950 p-2 shadow-inner z-30 shrink-0">
              <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-4 justify-between">
                  
                  {/* Title & Icons */}
                  <div className="flex items-center gap-3">
                        <div className="bg-black/40 p-2 rounded border border-red-500/50">
                            {activeObstacle.card.specialRules?.accumulatesDamage ? <Sword className="w-6 h-6 text-yellow-500" /> : <Lock className="w-6 h-6 text-red-500" />}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-red-200 font-retro text-sm uppercase tracking-wider">{activeObstacle.card.name}</span>
                            <div className="flex gap-2 text-[10px] text-red-300/80">
                                {activeObstacle.card.specialRules?.preventsRetreat && <span className="flex items-center gap-1"><Ban className="w-3 h-3" /> NO ESCAPE</span>}
                                {activeObstacle.card.specialRules?.resetsOnLeave && <span className="flex items-center gap-1"><RefreshCw className="w-3 h-3" /> REGENERATES</span>}
                            </div>
                        </div>
                  </div>

                  {/* Progress Bars */}
                  {!activeObstacle.card.keyRequirement ? (
                      <div className="flex-1 w-full md:w-auto grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                          {(Object.entries(activeObstacle.card.requirements) as [StatType, number][]).map(([stat, required]) => {
                                 const isSupercharged = currentRoom.superChargeUnlockTime > Date.now();
                                 const finalRequired = isSupercharged ? required * 2 : required;
                                 const current = activeObstacle.currentSuccesses[stat] || 0;
                                 return (
                                     <div key={stat} className={`flex items-center gap-2 ${isSupercharged ? 'animate-pulse' : ''}`}>
                                         <span className="text-[10px] font-bold w-16 text-right uppercase text-slate-400 tracking-tighter">{stat}</span>
                                         <div className={`w-3 h-3 rounded-full shrink-0 ${STAT_BG_COLORS[stat]}`}></div>
                                         <div className="flex-1 min-w-[60px]">
                                             <ProgressBar value={current} max={finalRequired} color="bg-green-500" />
                                         </div>
                                         <div className={`text-[10px] font-mono w-8 text-right ${isSupercharged ? 'text-purple-400' : 'text-yellow-500'}`}>{current}/{finalRequired}</div>
                                     </div>
                                 )
                           })}
                      </div>
                  ) : (
                      <div className="bg-black/40 border border-red-500 text-red-400 px-4 py-2 text-xs font-mono">
                          REQUIRES KEY: <span className="text-yellow-400">{activeObstacle.card.keyRequirement.replace('RED_', 'RED ')}</span>
                      </div>
                  )}
              </div>
          </div>
      )}

      {/* Control Panel - REVISED LAYOUT */}
      <div className="flex-1 bg-slate-900 border-t-4 border-slate-700 flex flex-col md:flex-row gap-4 p-4 overflow-hidden">
        
        {/* Left: Stats & Dice & Inventory - Prioritized on Mobile */}
        <div className="bg-slate-900 border-4 border-double border-slate-600 p-4 relative shadow-lg flex flex-col overflow-hidden shrink-0 md:w-1/2 md:shrink h-auto md:h-full">
            
            {/* Tabs */}
            <div className="flex gap-1 absolute -top-4 left-4">
                <button 
                    onClick={() => setActiveTab('DICE')}
                    className={`px-3 py-1 text-sm border-t border-l border-r font-bold transition-colors flex items-center gap-2
                        ${activeTab === 'DICE' 
                            ? 'bg-slate-900 border-slate-600 text-yellow-400 border-b-slate-900 translate-y-[1px]' 
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}
                    `}
                >
                    <Grid3X3 className="w-3 h-3" /> DICE POOL
                </button>
                <button 
                    onClick={() => setActiveTab('ITEMS')}
                    className={`px-3 py-1 text-sm border-t border-l border-r font-bold transition-colors flex items-center gap-2
                        ${activeTab === 'ITEMS' 
                            ? 'bg-slate-900 border-slate-600 text-yellow-400 border-b-slate-900 translate-y-[1px]' 
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}
                    `}
                >
                    <Backpack className="w-3 h-3" /> ITEMS 
                    {player.inventory.length > 0 && <span className="bg-red-500 text-white text-[8px] px-1 rounded-full">{player.inventory.length}</span>}
                </button>
            </div>

            {/* Tab Content: DICE */}
            {activeTab === 'DICE' && (
                <div className="flex flex-col pt-2 min-h-0 flex-1">
                    {/* Sub-mode: ROLL View */}
                    {diceMode === 'ROLL' && (
                        <div className="flex flex-row overflow-x-auto gap-2 pb-2 items-start min-h-[100px]">
                            {player.dicePool.map((die, idx) => {
                                const isLocked = !!die.lockedToObstacleId;
                                // Effective if obstacle has this req
                                const isEffective = activeObstacle && (activeObstacle.card.requirements[die.currentValue] || 0) > 0 && !isLocked;
                                const isAnimating = animatingDice.has(idx);
                                const faceIndex = die.faces.indexOf(die.currentValue);
                                const multiplier = die.multipliers[faceIndex] || 1;
                                
                                return (
                                    <div key={die.id} className={`min-w-[80px] p-2 border-2 flex flex-col items-center gap-1 transition-colors shrink-0
                                        ${isLocked ? 'bg-slate-900 border-slate-700 opacity-75' : 'bg-slate-800 border-slate-600'}
                                        ${isEffective ? 'border-yellow-400 bg-slate-750' : ''}
                                    `}>
                                        <div className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center relative 
                                            ${isLocked ? 'bg-slate-800 border-slate-600 grayscale' : STAT_COLORS[die.currentValue]} 
                                            ${isAnimating ? 'animate-tumble' : ''}`}>
                                            
                                            {isLocked && <Lock className="w-6 h-6 text-slate-400 absolute z-10" />}
                                            <div className={`w-8 h-8 rounded-full ${STAT_BG_COLORS[die.currentValue]} flex items-center justify-center overflow-hidden border border-black/20`}>
                                                <img src={STAT_ICONS[die.currentValue]} className="w-3/4 h-3/4 opacity-60 [image-rendering:pixelated]" />
                                            </div>
                                            {multiplier > 1 && (
                                                <div className="absolute -top-2 -right-2 bg-yellow-400 text-black text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border border-white">
                                                    x{multiplier}
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-[8px] uppercase text-slate-400 font-mono tracking-tighter">{die.currentValue}</div>
                                        <RetroButton 
                                            className={`w-full text-[10px] py-1 mt-auto px-1 flex justify-center items-center
                                                ${isLocked ? 'bg-slate-700 border-slate-500 hover:bg-slate-600' : ''}
                                                ${!isLocked && isEffective ? 'bg-yellow-700 border-yellow-500 text-yellow-100' : ''}
                                                ${!isLocked && !activeObstacle ? 'opacity-50 cursor-not-allowed bg-slate-800' : ''}
                                            `}
                                            disabled={!isLocked && !activeObstacle}
                                            onClick={() => handleDieInteraction(idx, isLocked)}
                                        >
                                            {isLocked ? <Unlock className="w-3 h-3" /> : 'USE'}
                                        </RetroButton>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Sub-mode: SIDES View */}
                    {diceMode === 'SIDES' && (
                        <div className="flex-1 overflow-y-auto space-y-4 pr-1 min-h-0">
                            {player.dicePool.map((die, dieIdx) => (
                                <div key={die.id} className="bg-slate-950 p-2 border border-slate-700">
                                     <div className="text-[10px] text-slate-500 mb-1">DICE {dieIdx + 1}</div>
                                     <div className="grid grid-cols-3 sm:grid-cols-6 gap-1">
                                         {die.faces.map((face, faceIdx) => {
                                             const mult = die.multipliers[faceIdx];
                                             const canUpgrade = isUpgradeMode && player.upgradePoints > 0;
                                             return (
                                                 <button 
                                                    key={faceIdx}
                                                    disabled={!canUpgrade}
                                                    onClick={() => onUpgrade(dieIdx, faceIdx)}
                                                    className={`
                                                        relative h-14 border rounded flex flex-col items-center justify-center gap-1
                                                        ${STAT_COLORS[face]}
                                                        ${canUpgrade ? 'hover:bg-slate-800 cursor-pointer ring-2 ring-yellow-400' : 'cursor-default opacity-80'}
                                                        bg-slate-900
                                                    `}
                                                 >
                                                    <div className={`w-5 h-5 rounded-full ${STAT_BG_COLORS[face]} flex items-center justify-center overflow-hidden`}>
                                                        <img src={STAT_ICONS[face]} className="w-3/4 h-3/4 opacity-50 [image-rendering:pixelated]" />
                                                    </div>
                                                    <div className="text-[6px] uppercase text-center w-full truncate">{face}</div>
                                                    {mult > 1 && <span className="absolute top-0 right-0 text-[8px] font-bold bg-yellow-500 text-black px-1 rounded-sm">x{mult}</span>}
                                                    {canUpgrade && <div className="absolute inset-0 bg-yellow-500/10 flex items-center justify-center animate-pulse">
                                                        <Star className="w-4 h-4 text-yellow-400" />
                                                    </div>}
                                                 </button>
                                             )
                                         })}
                                     </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="mt-2 pt-2 border-t border-slate-700 flex gap-2 shrink-0">
                        {diceMode === 'ROLL' ? (
                            <RetroButton 
                                className={`flex-1 flex items-center justify-center gap-2 ${rerollCooldownRemaining > 0 ? 'grayscale opacity-50' : ''}`}
                                onClick={handleRerollAll}
                                disabled={player.dicePool.every(d => d.lockedToObstacleId) || rerollCooldownRemaining > 0}
                            >
                                <RefreshCw className={`w-4 h-4 ${animatingDice.size > 0 ? 'animate-spin' : ''}`} />
                                {rerollCooldownRemaining > 0 ? `WAIT ${rerollCooldownRemaining}s` : 'REROLL'}
                            </RetroButton>
                        ) : (
                            <RetroButton 
                                className={`flex-1 flex items-center justify-center gap-2 transition-colors
                                    ${isUpgradeMode ? 'bg-yellow-700 border-yellow-500 text-yellow-100 animate-pulse' : ''}
                                    ${player.upgradePoints === 0 ? 'opacity-50 cursor-not-allowed' : ''}
                                `}
                                onClick={() => setIsUpgradeMode(!isUpgradeMode)}
                                disabled={player.upgradePoints === 0}
                            >
                                <Star className="w-4 h-4" />
                                {isUpgradeMode ? 'CANCEL UPGRADE' : `UPGRADE (${player.upgradePoints})`}
                            </RetroButton>
                        )}
                        
                        <RetroButton 
                            className="flex-none px-4 flex items-center justify-center gap-2"
                            variant="outline"
                            onClick={() => setDiceMode(prev => prev === 'ROLL' ? 'SIDES' : 'ROLL')}
                        >
                            {diceMode === 'ROLL' ? 'SIDES' : 'BACK'}
                        </RetroButton>
                    </div>
                </div>
            )}

            {/* Tab Content: ITEMS */}
            {activeTab === 'ITEMS' && (
                 <div className="flex flex-col flex-1 pt-2 overflow-y-auto min-h-0">
                    {player.inventory.length === 0 && (
                        <div className="flex-1 flex items-center justify-center text-slate-500 italic text-sm">
                            No items collected...
                        </div>
                    )}
                    <div className="space-y-2">
                        {player.inventory.map((itemId, idx) => {
                            const def = ITEM_REGISTRY[itemId];
                            const isExpanded = expandedItemId === idx;
                            return (
                                <div key={idx} className="bg-slate-800 border border-slate-600 text-slate-200 text-sm">
                                    <div 
                                        className="flex items-center gap-2 p-2 cursor-pointer hover:bg-slate-700"
                                        onClick={() => setExpandedItemId(isExpanded ? null : idx)}
                                    >
                                        <div className="w-8 h-8 bg-black border border-slate-700 flex items-center justify-center shrink-0">
                                            <img src={def?.imageUrl} alt={def?.name} className="w-full h-full [image-rendering:pixelated]" />
                                        </div>
                                        <div className="flex-1 font-mono">
                                            {def?.name}
                                        </div>
                                        {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                                    </div>
                                    
                                    {/* Expanded Details */}
                                    {isExpanded && (
                                        <div className="p-2 bg-slate-900 border-t border-slate-700 flex flex-col gap-2 animate-in slide-in-from-top-2">
                                            <p className="text-xs text-slate-400 italic">{def?.description}</p>
                                            {def?.bonusStat && (
                                                <div className="text-xs flex gap-1">
                                                    <span className="text-yellow-500">Effect:</span>
                                                    <span className={STAT_COLORS[def.bonusStat]}>+{def.bonusAmount} {def.bonusStat}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-end gap-2">
                                                {def?.effectType && (
                                                    <RetroButton 
                                                        variant="primary" 
                                                        className="text-[10px] py-1 flex gap-1 items-center"
                                                        onClick={() => {
                                                            onUseItem(itemId);
                                                            setExpandedItemId(null);
                                                        }}
                                                    >
                                                        <Sparkles className="w-3 h-3" /> USE
                                                    </RetroButton>
                                                )}
                                                <RetroButton 
                                                    variant="danger" 
                                                    className="text-[10px] py-1 flex gap-1 items-center"
                                                    onClick={() => {
                                                        onDrop(itemId);
                                                        setExpandedItemId(null);
                                                    }}
                                                >
                                                    <Trash2 className="w-3 h-3" /> DROP
                                                </RetroButton>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                 </div>
            )}
        </div>

        {/* Center: Interaction / Log */}
        <Panel className="flex flex-col relative flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto font-mono text-xs space-y-1 mb-2">
                {combatLog.length === 0 && <div className="text-slate-600 italic">It is quiet... too quiet.</div>}
                {combatLog.map((log, i) => (
                    <div key={i} className="text-slate-300 border-b border-slate-800 pb-1">&gt; {log}</div>
                ))}
            </div>
        </Panel>

      </div>

      {/* Big Map Modal */}
      {showMap && (
          <div className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4" onClick={() => setShowMap(false)}>
              <div className="bg-slate-800 p-4 border-2 border-slate-500 max-w-sm w-full" onClick={e => e.stopPropagation()}>
                  <div className="flex justify-between mb-4">
                      <h3 className="font-retro text-yellow-400">DUNGEON MAP</h3>
                      <button onClick={() => setShowMap(false)}><X className="text-slate-400" /></button>
                  </div>
                  <div className="grid gap-0 border border-slate-700 bg-black p-2" style={{ gridTemplateColumns: `repeat(${MAP_SIZE}, 1fr)` }}>
                      {renderBigMap()}
                  </div>
                  <div className="mt-4 flex gap-4 text-[10px] uppercase text-slate-400 justify-center">
                      <div className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-500 border border-blue-300"></div>You</div>
                      <div className="flex items-center gap-1"><div className="w-3 h-3 bg-green-500 border border-green-300"></div>Ally</div>
                      <div className="flex items-center gap-1"><div className="w-2 h-2 bg-yellow-500 rounded-full"></div>Item</div>
                      <div className="flex items-center gap-1"><div className="w-2 h-2 bg-red-500 rounded-sm"></div>Traps</div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
