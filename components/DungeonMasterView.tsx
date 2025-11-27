
import React, { useEffect, useState } from 'react';
import { GameState, Room, ObstacleCard, Player, StatType, HeroClass, PlayerRole } from '../types';
import { Panel, RetroButton, ProgressBar } from './RetroComponents';
import { MAP_SIZE, OBSTACLE_DECK, STAT_COLORS, RED_KEY_ID, RED_DOOR_CARD, RESOURCE_TICK_INTERVAL, SUPERCHARGE_COOLDOWN, SUPERCHARGE_DURATION } from '../constants';
import { Lock, User, Eye, X, Key, DoorOpen, Ban, RefreshCw, Sword, Gift, Shield, Zap, Book, Cross, Axe, Music, Brain, Flame, Check } from 'lucide-react';

interface DMProps {
  gameState: GameState;
  onPlaceCard: (card: ObstacleCard, roomId: string) => void;
  onSupercharge: (roomId: string) => void;
}

const CLASS_ICONS: Record<HeroClass, React.ElementType> = {
    [HeroClass.FIGHTER]: Shield,
    [HeroClass.ROGUE]: Zap,
    [HeroClass.WIZARD]: Book,
    [HeroClass.CLERIC]: Cross,
    [HeroClass.BARBARIAN]: Axe,
    [HeroClass.BARD]: Music,
};

export const DungeonMasterView: React.FC<DMProps> = ({ gameState, onPlaceCard, onSupercharge }) => {
  const [selectedCardId, setSelectedCardId] = React.useState<string | null>(null);
  const [inspectRoomId, setInspectRoomId] = React.useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(Date.now());
  
  // Use a Ref to hold the latest game state for the animation loop
  const gameStateRef = React.useRef(gameState);
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);
  
  // Tweening State for Mana
  const [visualMana, setVisualMana] = useState(gameState.dmResources);

  useEffect(() => {
      let frameId: number;
      
      const animate = () => {
          const currentState = gameStateRef.current;
          const now = Date.now();
          setCurrentTime(now);
          const elapsed = now - currentState.lastResourceTick;
          
          // Calculate speed based on active generators
          let activeGenerators = 0;
          Object.values(currentState.map as Record<string, Room>).forEach(room => {
              room.activeObstacles.forEach(obs => {
                  if (!obs.isDefeated && obs.card.specialRules?.manaGeneration) {
                      activeGenerators++;
                  }
              });
          });
          const speedMultiplier = 1 + (activeGenerators * 0.10);
          const effectiveInterval = RESOURCE_TICK_INTERVAL / speedMultiplier;

          const fraction = Math.min(1, Math.max(0, elapsed / effectiveInterval));
          
          const currentResources = currentState.dmResources;
          
          if (currentResources >= 10) {
              setVisualMana(10);
          } else {
              setVisualMana(currentResources + fraction);
          }
          
          frameId = requestAnimationFrame(animate);
      };

      frameId = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(frameId);
  }, []); 


  const handleRoomClick = (roomId: string) => {
    if (selectedCardId) {
        const card = gameState.dmHand.find(c => c.id === selectedCardId);
        if (card) {
            onPlaceCard(card, roomId);
            setSelectedCardId(null);
            setInspectRoomId(null); 
        }
    } else {
        setInspectRoomId(prev => prev === roomId ? null : roomId);
    }
  };

  const inspectedRoom = inspectRoomId ? gameState.map[inspectRoomId] : null;

  // Sort rooms for correct grid rendering (Row-major: Y then X)
  const sortedRooms = Object.values(gameState.map).sort((a: Room, b: Room) => {
      if (a.y !== b.y) return a.y - b.y;
      return a.x - b.x;
  });

  // Supercharge Cooldown
  const superchargeCooldownRemaining = Math.max(0, SUPERCHARGE_COOLDOWN - (currentTime - gameState.lastSuperChargeTime));
  const canSupercharge = superchargeCooldownRemaining <= 0;

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-200">
        {/* Header */}
        <header className="h-16 bg-red-950 border-b-4 border-red-900 flex items-center justify-between px-4 sticky top-0 z-50">
            <h2 className="text-xl font-retro text-red-500 hidden md:block">DUNGEON MASTER</h2>
            <div className="font-mono text-xl text-red-300">
                TIME: {Math.floor(gameState.timer / 60)}:{(gameState.timer % 60).toString().padStart(2, '0')}
            </div>
            <div className="flex items-center gap-4">
                <div className="text-right">
                    <div className="text-xs text-red-400 uppercase">MANA</div>
                    <div className="text-2xl font-mono text-yellow-400">{gameState.dmResources}/10</div>
                </div>
                <div className="w-24 md:w-32">
                    <ProgressBar value={visualMana} max={10} color="bg-yellow-500" animate={false} transition={false} />
                </div>
            </div>
        </header>

        <div className="flex-1 flex flex-col md:flex-row h-[calc(100vh-4rem)]">
            {/* Map Area */}
            <div className="flex-1 bg-black p-4 flex items-center justify-center relative overflow-auto shadow-inner">
                 <div className="grid gap-0 border border-slate-900" style={{ gridTemplateColumns: `repeat(${MAP_SIZE}, minmax(0, 1fr))` }}>
                    {sortedRooms.map((room: Room) => {
                        const playersInRoom = gameState.players.filter(p => p.currentRoomId === room.id && p.role !== PlayerRole.DM);
                        const hasTraps = room.activeObstacles.length > 0;
                        const hasKey = room.items.includes(RED_KEY_ID);
                        const hasRedDoor = room.activeObstacles.some(o => o.card.keyRequirement === RED_KEY_ID);
                        const isSupercharged = room.superChargeUnlockTime > currentTime;
                        const recentActivity = room.recentSuccesses && room.recentSuccesses.length > 0;
                        const isManaGen = room.activeObstacles.some(o => o.card.specialRules?.manaGeneration && !o.isDefeated);
                        
                        const x = room.x;
                        const y = room.y;
                        const hasNorth = room.connections.includes(`${x},${y-1}`);
                        const hasSouth = room.connections.includes(`${x},${y+1}`);
                        const hasEast = room.connections.includes(`${x+1},${y}`);
                        const hasWest = room.connections.includes(`${x-1},${y}`);

                        const isSelected = inspectRoomId === room.id;
                        
                        const isBlocked = playersInRoom.length > 0 || hasTraps;

                        let roomBg = "bg-slate-800";
                        if (room.isStart) roomBg = "bg-green-900";
                        if (room.isExit) roomBg = "bg-yellow-900";
                        
                        const corridorColor = "bg-slate-800";

                        return (
                            <button
                                key={room.id}
                                onClick={() => handleRoomClick(room.id)}
                                disabled={selectedCardId ? isBlocked : false} 
                                className={`
                                    w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 
                                    relative outline-none bg-black
                                    ${selectedCardId && !isBlocked ? 'hover:bg-red-900/10 cursor-crosshair' : ''}
                                    ${selectedCardId && isBlocked ? 'cursor-not-allowed opacity-50' : ''}
                                `}
                            >
                                <div className="absolute inset-0 border border-slate-900/50 pointer-events-none z-0"></div>
                                
                                {hasNorth && <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[30%] h-[60%] ${corridorColor} z-10`}></div>}
                                {hasSouth && <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-[30%] h-[60%] ${corridorColor} z-10`}></div>}
                                {hasWest && <div className={`absolute left-0 top-1/2 -translate-y-1/2 h-[30%] w-[60%] ${corridorColor} z-10`}></div>}
                                {hasEast && <div className={`absolute right-0 top-1/2 -translate-y-1/2 h-[30%] w-[60%] ${corridorColor} z-10`}></div>}

                                <div className={`
                                    absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                                    w-[70%] h-[70%] z-20 rounded-sm transition-colors flex items-center justify-center overflow-hidden
                                    ${roomBg}
                                    ${hasTraps && !isBlocked ? 'border border-red-500' : ''}
                                    ${isSelected ? 'ring-2 ring-yellow-400' : ''}
                                    ${isSupercharged ? 'ring-2 ring-purple-500 animate-pulse' : ''}
                                    ${isManaGen && !isSelected ? 'ring-2 ring-cyan-400 shadow-[0_0_10px_#0ff]' : ''}
                                `}>
                                    {room.isStart && playersInRoom.length === 0 && <span className="text-[6px] sm:text-[8px] font-bold text-green-300">START</span>}
                                    {room.isExit && playersInRoom.length === 0 && <span className="text-[6px] sm:text-[8px] font-bold text-yellow-300">EXIT</span>}
                                    
                                    {/* DM Map: Show Obstacle Sprite */}
                                    {hasTraps && playersInRoom.length === 0 && (
                                        <div className="absolute inset-0 flex items-center justify-center opacity-80">
                                            {room.activeObstacles.map(obs => (
                                                <img 
                                                    key={obs.id} 
                                                    src={obs.card.imageUrl} 
                                                    className="w-full h-full object-contain [image-rendering:pixelated]"
                                                    alt="Trap"
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
                                     <div className="absolute top-0.5 left-0.5 text-[6px] text-slate-500 font-mono leading-none opacity-50">{x},{y}</div>
                                     {hasKey && <Key className="absolute top-0.5 right-0.5 w-2.5 h-2.5 md:w-3 md:h-3 text-yellow-400 fill-yellow-400 animate-pulse" />}
                                     {hasRedDoor && !hasKey && <DoorOpen className="absolute top-0.5 right-0.5 w-2.5 h-2.5 md:w-3 md:h-3 text-red-500 fill-red-900" />}

                                     {playersInRoom.length > 0 && (
                                         <div className="flex gap-0.5 flex-wrap justify-center items-center max-w-[80%] bg-black/40 rounded p-0.5 backdrop-blur-sm border border-white/20">
                                             {playersInRoom.map(p => {
                                                 const Icon = p.heroClass ? CLASS_ICONS[p.heroClass] : User;
                                                 return (
                                                     <div key={p.id} className="relative group" title={p.name}>
                                                         <Icon className="w-3 h-3 md:w-4 md:h-4 text-blue-300 drop-shadow-sm" />
                                                     </div>
                                                 );
                                             })}
                                         </div>
                                     )}
                                     
                                     {/* Activity Checkmark */}
                                     {recentActivity && (
                                         <div className="absolute -top-1 -right-1 z-50 animate-bounce">
                                             <div className="bg-green-500 rounded-full p-0.5 border border-white shadow">
                                                 <Check className="w-3 h-3 text-white" />
                                             </div>
                                         </div>
                                     )}
                                </div>
                                
                                {selectedCardId && isBlocked && (
                                    <div className="absolute inset-0 bg-red-900/30 z-40 flex items-center justify-center">
                                        <Ban className="text-red-500 w-4 h-4" />
                                    </div>
                                )}
                            </button>
                        );
                    })}
                 </div>
            </div>

            {/* Side Panel */}
            <div className="w-full md:w-80 bg-slate-900 border-t-4 md:border-t-0 md:border-l-4 border-slate-700 flex flex-col shrink-0 overflow-y-scroll">
                <div className="p-4 flex flex-col gap-4 min-h-full">
                
                {/* INSPECTION MODE */}
                {inspectedRoom && (
                    <div className="bg-slate-800 border-2 border-yellow-500/50 p-3 flex flex-col gap-3 animate-in slide-in-from-right shrink-0">
                        <div className="flex justify-between items-center border-b border-slate-700 pb-2">
                            <div className="text-sm font-bold text-yellow-400">ROOM {inspectedRoom.id}</div>
                            <button onClick={() => setInspectRoomId(null)}><X className="w-4 h-4 text-slate-400 hover:text-white"/></button>
                        </div>
                        
                        {/* Supercharge Button */}
                        <RetroButton 
                            variant="danger" 
                            className="w-full text-xs py-1"
                            disabled={!canSupercharge}
                            onClick={() => onSupercharge(inspectedRoom.id)}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <Flame className="w-4 h-4" />
                                {canSupercharge ? 'SUPERCHARGE' : `RECHARGING (${Math.ceil(superchargeCooldownRemaining / 1000)}s)`}
                            </div>
                        </RetroButton>

                        {/* Players Here */}
                        {gameState.players.filter(p => p.currentRoomId === inspectedRoom.id && p.role !== PlayerRole.DM).length > 0 && (
                            <div className="space-y-1">
                                <div className="text-[10px] uppercase text-slate-500">Heroes</div>
                                {gameState.players.filter(p => p.currentRoomId === inspectedRoom.id && p.role !== PlayerRole.DM).map(p => (
                                    <div key={p.id} className="flex items-center gap-2 text-xs text-blue-300 bg-blue-900/20 p-1 rounded border border-blue-800">
                                        {p.heroClass && React.createElement(CLASS_ICONS[p.heroClass], { className: "w-3 h-3" })}
                                        <span>{p.name}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Obstacles */}
                        <div className="space-y-2">
                            <div className="text-[10px] uppercase text-slate-500">Obstacles</div>
                            {inspectedRoom.activeObstacles.length === 0 && <div className="text-xs text-slate-600 italic">Empty</div>}
                            {inspectedRoom.activeObstacles.map(obs => (
                                <div key={obs.id} className={`p-2 rounded border ${obs.isDefeated ? 'bg-green-900/30 border-green-700' : 'bg-red-900/30 border-red-700'}`}>
                                    <div className="flex justify-between text-xs font-bold">
                                        <span className="text-slate-200">{obs.card.name}</span>
                                        <span className={obs.isDefeated ? 'text-green-400' : 'text-red-400'}>
                                            {obs.isDefeated ? 'CLEARED' : 'ACTIVE'}
                                        </span>
                                    </div>
                                    {!obs.isDefeated && !obs.card.keyRequirement && (
                                         <div className="mt-1 flex gap-1 items-center flex-wrap text-[10px] text-slate-400">
                                             {(Object.entries(obs.card.requirements) as [StatType, number][]).map(([stat, req]) => (
                                                  <div key={stat} className="flex gap-1 items-center bg-black/40 px-1 rounded">
                                                      <span className={`${STAT_COLORS[stat]}`}>{stat}:</span>
                                                      <span>{obs.currentSuccesses[stat] || 0}/{inspectedRoom.superChargeUnlockTime > currentTime ? req*2 : req}</span>
                                                  </div>
                                             ))}
                                         </div>
                                    )}
                                    {obs.card.keyRequirement && (
                                        <div className="mt-1 text-[10px] text-yellow-500">Requires: {obs.card.keyRequirement}</div>
                                    )}

                                    {(obs.card.specialRules && Object.keys(obs.card.specialRules).length > 0) && (
                                        <div className="flex flex-wrap gap-1 mt-1 pt-1 border-t border-slate-700/30">
                                            {obs.card.specialRules.accumulatesDamage && <div className="flex items-center gap-0.5 bg-yellow-900/50 px-1.5 py-0.5 rounded border border-yellow-700 text-[9px] text-yellow-200 font-bold"><Sword className="w-3 h-3" /> HP</div>}
                                            {obs.card.specialRules.preventsRetreat && <div className="flex items-center gap-0.5 bg-red-900/50 px-1.5 py-0.5 rounded border border-red-700 text-[9px] text-red-200 font-bold"><Ban className="w-3 h-3" /> NO ESCAPE</div>}
                                            {obs.card.specialRules.resetsOnLeave && <div className="flex items-center gap-0.5 bg-purple-900/50 px-1.5 py-0.5 rounded border border-purple-700 text-[9px] text-purple-200 font-bold"><RefreshCw className="w-3 h-3" /> REGEN</div>}
                                            {obs.card.specialRules.reward && <div className="flex items-center gap-0.5 bg-green-900/50 px-1.5 py-0.5 rounded border border-green-700 text-[9px] text-green-200 font-bold"><Gift className="w-3 h-3" /> LOOT</div>}
                                            {obs.card.specialRules.manaGeneration && <div className="flex items-center gap-0.5 bg-cyan-900/50 px-1.5 py-0.5 rounded border border-cyan-700 text-[9px] text-cyan-200 font-bold"><Zap className="w-3 h-3" /> MANA</div>}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Items */}
                        <div className="space-y-2">
                             <div className="text-[10px] uppercase text-slate-500">Items</div>
                             {inspectedRoom.items.length === 0 && <div className="text-xs text-slate-600 italic">None</div>}
                             {inspectedRoom.items.map(item => (
                                 <div key={item} className="flex items-center gap-2 text-xs bg-slate-700 px-2 py-1 rounded text-slate-300 border border-slate-600">
                                    {item === RED_KEY_ID && <Key className="w-3 h-3 text-red-500" />}
                                    {item}
                                 </div>
                             ))}
                        </div>
                        
                        <div className="mt-2">
                             <RetroButton className="w-full text-xs py-1" variant="outline" onClick={() => setInspectRoomId(null)}>Close Inspector</RetroButton>
                        </div>
                    </div>
                )}

                {/* HAND MODE (Always Visible) */}
                <div className="flex-1">
                    <h3 className="text-sm font-bold uppercase text-slate-400 border-b border-slate-700 pb-2 mb-2">Trap Deck</h3>
                    
                    {gameState.dmHand.length === 0 && (
                        <div className="text-slate-600 text-center italic text-sm mt-10">Drawing cards...</div>
                    )}
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-4">
                        {gameState.dmHand.map(card => {
                            const canAfford = gameState.dmResources >= card.cost;
                            const isSelected = selectedCardId === card.id;

                            return (
                                <div 
                                    key={card.id}
                                    onClick={() => canAfford && setSelectedCardId(isSelected ? null : card.id)}
                                    className={`
                                        relative p-2 border-2 transition-all cursor-pointer flex flex-row md:flex-col gap-2
                                        ${isSelected ? 'bg-red-900 border-red-400 translate-x-1 md:translate-x-2 shadow-lg shadow-red-900/50' : 'bg-slate-800 border-slate-600'}
                                        ${!canAfford ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:border-slate-400'}
                                    `}
                                >
                                    {/* Image - Left on mobile, Top on desktop */}
                                    <div className="w-16 h-16 md:w-full md:h-32 bg-black border border-slate-700 shrink-0 relative">
                                        <img src={card.imageUrl} className="w-full h-full object-contain [image-rendering:pixelated]" />
                                        <div className="absolute top-1 right-1 text-[8px] bg-slate-700 text-white px-1 rounded md:hidden">{card.cost}</div>
                                    </div>

                                    <div className="flex-1 flex flex-col">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="font-bold text-sm text-slate-200 leading-tight">{card.name}</span>
                                            <div className="hidden md:flex gap-1 items-center">
                                                {card.tier === 'ADVANCED' && <span className="text-[8px] bg-purple-900 text-purple-200 px-1 rounded">ADV</span>}
                                                {card.tier === 'NEUTRAL' && <span className="text-[8px] bg-blue-900 text-blue-200 px-1 rounded">MID</span>}
                                                <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${canAfford ? 'bg-yellow-600 text-white' : 'bg-red-900 text-red-300'}`}>
                                                    {card.cost}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <div className="text-[10px] text-slate-400 mb-1 leading-tight">{card.description}</div>
                                        
                                        <div className="flex flex-wrap gap-1 mt-auto">
                                            {(Object.entries(card.requirements) as [StatType, number][]).map(([stat, req]) => (
                                                <div key={stat} className="text-[9px] uppercase font-mono bg-black/30 px-1 rounded text-slate-300 border border-slate-700">
                                                    {req} {stat}
                                                </div>
                                            ))}
                                        </div>

                                        {(card.specialRules && Object.keys(card.specialRules).length > 0) && (
                                            <div className="flex flex-wrap gap-1 mt-1 pt-1 border-t border-slate-700/50">
                                                {card.specialRules.accumulatesDamage && <div className="flex items-center gap-0.5 bg-yellow-900/50 px-1 rounded border border-yellow-700 text-[8px] text-yellow-200 font-bold"><Sword className="w-3 h-3" /> HP</div>}
                                                {card.specialRules.preventsRetreat && <div className="flex items-center gap-0.5 bg-red-900/50 px-1 rounded border border-red-700 text-[8px] text-red-200 font-bold"><Ban className="w-3 h-3" /> NO ESCAPE</div>}
                                                {card.specialRules.resetsOnLeave && <div className="flex items-center gap-0.5 bg-purple-900/50 px-1 rounded border border-purple-700 text-[8px] text-purple-200 font-bold"><RefreshCw className="w-3 h-3" /> REGEN</div>}
                                                {card.specialRules.reward && <div className="flex items-center gap-0.5 bg-green-900/50 px-1 rounded border border-green-700 text-[8px] text-green-200 font-bold"><Gift className="w-3 h-3" /> LOOT</div>}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                
                </div>
            </div>
        </div>
    </div>
  );
};
