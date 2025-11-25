

import React, { useEffect, useState } from 'react';
import { GameState, Room, ObstacleCard, Player, StatType } from '../types';
import { Panel, RetroButton, ProgressBar } from './RetroComponents';
import { MAP_SIZE, OBSTACLE_DECK, STAT_COLORS, RED_KEY_ID, RED_DOOR_CARD, RESOURCE_TICK_INTERVAL } from '../constants';
import { Lock, User, Eye, X, Key, DoorOpen, Ban, RefreshCw, Sword, Gift } from 'lucide-react';

interface DMProps {
  gameState: GameState;
  onPlaceCard: (card: ObstacleCard, roomId: string) => void;
}

export const DungeonMasterView: React.FC<DMProps> = ({ gameState, onPlaceCard }) => {
  const [selectedCardId, setSelectedCardId] = React.useState<string | null>(null);
  const [inspectRoomId, setInspectRoomId] = React.useState<string | null>(null);
  
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
          // Use the ref to get the absolute latest state logic
          const currentState = gameStateRef.current;
          
          const now = Date.now();
          const elapsed = now - currentState.lastResourceTick;
          const fraction = Math.min(1, Math.max(0, elapsed / RESOURCE_TICK_INTERVAL));
          
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
  }, []); // Run once on mount, loop reads from ref


  const handleRoomClick = (roomId: string) => {
    if (selectedCardId) {
        // If a card is selected, try to place it
        const card = gameState.dmHand.find(c => c.id === selectedCardId);
        if (card) {
            onPlaceCard(card, roomId);
            setSelectedCardId(null);
            setInspectRoomId(null); // Clear inspection if we placed
        }
    } else {
        // Otherwise, inspect the room
        setInspectRoomId(prev => prev === roomId ? null : roomId);
    }
  };

  const inspectedRoom = inspectRoomId ? gameState.map[inspectRoomId] : null;

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
                    {Object.values(gameState.map).map((room: Room) => {
                        const playersInRoom = gameState.players.filter(p => p.currentRoomId === room.id);
                        const hasTraps = room.activeObstacles.length > 0;
                        const hasKey = room.items.includes(RED_KEY_ID);
                        const hasRedDoor = room.activeObstacles.some(o => o.card.keyRequirement === RED_KEY_ID);
                        
                        // Connections
                        const x = room.x;
                        const y = room.y;
                        const hasNorth = room.connections.includes(`${x},${y-1}`);
                        const hasSouth = room.connections.includes(`${x},${y+1}`);
                        const hasEast = room.connections.includes(`${x+1},${y}`);
                        const hasWest = room.connections.includes(`${x-1},${y}`);

                        const isSelected = inspectRoomId === room.id;
                        
                        // Cannot place if: Players here OR already has a trap
                        const isBlocked = playersInRoom.length > 0 || hasTraps;

                        return (
                            <button
                                key={room.id}
                                onClick={() => handleRoomClick(room.id)}
                                disabled={selectedCardId && isBlocked} 
                                className={`
                                    w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 
                                    relative transition-all group outline-none
                                    ${selectedCardId && !isBlocked ? 'hover:bg-red-900/20 cursor-crosshair' : ''}
                                    ${selectedCardId && isBlocked ? 'bg-red-900/10 cursor-not-allowed opacity-50' : ''}
                                    ${!selectedCardId && !isBlocked ? 'hover:bg-slate-900/50' : ''}
                                `}
                            >
                                {/* Grid Lines (Faint) */}
                                <div className="absolute inset-0 border border-slate-900/50 pointer-events-none z-20"></div>

                                {/* PATH CONNECTIONS - Extended significantly to ensure overlaps and prevent gaps */}
                                {/* Using z-0 to be behind the center node but on top of base bg */}
                                <div className="absolute inset-0 pointer-events-none z-0">
                                    {hasNorth && <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[60%] h-[60%] bg-slate-800"></div>}
                                    {hasSouth && <div className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-[60%] h-[60%] bg-slate-800"></div>}
                                    {hasWest && <div className="absolute left-[-10%] top-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-slate-800"></div>}
                                    {hasEast && <div className="absolute right-[-10%] top-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-slate-800"></div>}
                                </div>

                                {/* CENTER NODE (ROOM) - Solid background to cover intersection of lines */}
                                <div className={`
                                    absolute inset-1.5 rounded-sm flex items-center justify-center z-10 transition-colors
                                    ${room.isStart ? 'bg-green-900 border border-green-700' : 
                                      room.isExit ? 'bg-yellow-900 border border-yellow-700' : 
                                      'bg-slate-800'}
                                    ${isSelected ? 'ring-2 ring-yellow-400 bg-slate-700' : ''}
                                `}>
                                    {/* Coordinates */}
                                    <div className="absolute top-0 left-0.5 text-[6px] md:text-[8px] text-slate-500 font-mono leading-none">{x},{y}</div>
                                    
                                    {/* Key Indicator */}
                                    {hasKey && (
                                        <div className="absolute top-0 right-0 p-0.5 z-20 animate-pulse">
                                            <Key className="w-3 h-3 md:w-4 md:h-4 text-yellow-400 fill-yellow-400" />
                                        </div>
                                    )}

                                    {/* Red Door Indicator */}
                                    {hasRedDoor && !hasKey && (
                                        <div className="absolute top-0 right-0 p-0.5 z-20">
                                            <DoorOpen className="w-3 h-3 md:w-4 md:h-4 text-red-500 fill-red-900" />
                                        </div>
                                    )}

                                    {/* Players */}
                                    {playersInRoom.length > 0 && (
                                        <div className="flex items-center justify-center gap-1 flex-wrap">
                                            {playersInRoom.map(p => (
                                                <div key={p.id} className="w-2 h-2 md:w-3 md:h-3 bg-blue-400 rounded-full border border-white shadow-sm" title={p.name}></div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Traps */}
                                    {hasTraps && playersInRoom.length === 0 && (
                                        <div className="absolute bottom-1 right-1 flex gap-0.5 flex-wrap justify-end max-w-full">
                                            {room.activeObstacles.map(obs => (
                                                 <div key={obs.id} className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-sm ${obs.isDefeated ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                            ))}
                                        </div>
                                    )}
                                    
                                    {/* Start/Exit Label */}
                                    {room.isStart && playersInRoom.length === 0 && <span className="text-[8px] font-bold text-green-300">START</span>}
                                    {room.isExit && playersInRoom.length === 0 && <span className="text-[8px] font-bold text-yellow-300">EXIT</span>}
                                </div>
                            </button>
                        );
                    })}
                 </div>
            </div>

            {/* Side Panel: Hand AND Room Inspection */}
            {/* Added overflow-y-scroll to always show scrollbar track to prevent jumping */}
            <div className="w-full md:w-80 bg-slate-900 border-t-4 md:border-t-0 md:border-l-4 border-slate-700 flex flex-col shrink-0 overflow-y-scroll">
                <div className="p-4 flex flex-col gap-4 min-h-full">
                
                {/* INSPECTION MODE */}
                {inspectedRoom && (
                    <div className="bg-slate-800 border-2 border-yellow-500/50 p-3 flex flex-col gap-3 animate-in slide-in-from-right shrink-0">
                        <div className="flex justify-between items-center border-b border-slate-700 pb-2">
                            <div className="text-sm font-bold text-yellow-400">ROOM {inspectedRoom.id}</div>
                            <button onClick={() => setInspectRoomId(null)}><X className="w-4 h-4 text-slate-400 hover:text-white"/></button>
                        </div>
                        
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
                                                      <span>{obs.currentSuccesses[stat] || 0}/{req}</span>
                                                  </div>
                                             ))}
                                         </div>
                                    )}
                                    {obs.card.keyRequirement && (
                                        <div className="mt-1 text-[10px] text-yellow-500">Requires: {obs.card.keyRequirement}</div>
                                    )}

                                    {/* Special Rules Badges */}
                                    {(obs.card.specialRules && Object.keys(obs.card.specialRules).length > 0) && (
                                        <div className="flex flex-wrap gap-1 mt-1 pt-1 border-t border-slate-700/30">
                                            {obs.card.specialRules.accumulatesDamage && (
                                                <div className="flex items-center gap-0.5 bg-yellow-900/50 px-1.5 py-0.5 rounded border border-yellow-700 text-[9px] text-yellow-200 font-bold">
                                                    <Sword className="w-3 h-3" /> HP
                                                </div>
                                            )}
                                            {obs.card.specialRules.preventsRetreat && (
                                                <div className="flex items-center gap-0.5 bg-red-900/50 px-1.5 py-0.5 rounded border border-red-700 text-[9px] text-red-200 font-bold">
                                                    <Ban className="w-3 h-3" /> NO ESCAPE
                                                </div>
                                            )}
                                            {obs.card.specialRules.resetsOnLeave && (
                                                <div className="flex items-center gap-0.5 bg-purple-900/50 px-1.5 py-0.5 rounded border border-purple-700 text-[9px] text-purple-200 font-bold">
                                                    <RefreshCw className="w-3 h-3" /> REGEN
                                                </div>
                                            )}
                                            {obs.card.specialRules.reward && (
                                                <div className="flex items-center gap-0.5 bg-green-900/50 px-1.5 py-0.5 rounded border border-green-700 text-[9px] text-green-200 font-bold">
                                                    <Gift className="w-3 h-3" /> LOOT
                                                </div>
                                            )}
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
                                        relative p-3 border-2 transition-all cursor-pointer
                                        ${isSelected ? 'bg-red-900 border-red-400 translate-x-1 md:translate-x-2 shadow-lg shadow-red-900/50' : 'bg-slate-800 border-slate-600'}
                                        ${!canAfford ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:border-slate-400'}
                                    `}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="font-bold text-sm text-slate-200">{card.name}</span>
                                        <div className="flex gap-1 items-center">
                                            {card.tier === 'ADVANCED' && <span className="text-[8px] bg-purple-900 text-purple-200 px-1 rounded">ADV</span>}
                                            {card.tier === 'NEUTRAL' && <span className="text-[8px] bg-blue-900 text-blue-200 px-1 rounded">MID</span>}
                                            <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${canAfford ? 'bg-yellow-600 text-white' : 'bg-red-900 text-red-300'}`}>
                                                {card.cost}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-[10px] text-slate-400 mb-2">{card.description}</div>
                                    <div className="flex flex-wrap gap-1">
                                        {(Object.entries(card.requirements) as [StatType, number][]).map(([stat, req]) => (
                                             <div key={stat} className="text-[10px] uppercase font-mono bg-black/30 px-1.5 py-0.5 rounded text-slate-300 border border-slate-700">
                                                 {req} {stat}
                                             </div>
                                        ))}
                                    </div>

                                    {/* Special Rules Badges */}
                                    {(card.specialRules && Object.keys(card.specialRules).length > 0) && (
                                        <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-slate-700/50">
                                            {card.specialRules.accumulatesDamage && (
                                                <div className="flex items-center gap-0.5 bg-yellow-900/50 px-1.5 py-0.5 rounded border border-yellow-700 text-[9px] text-yellow-200 font-bold">
                                                    <Sword className="w-3 h-3" /> HP
                                                </div>
                                            )}
                                            {card.specialRules.preventsRetreat && (
                                                <div className="flex items-center gap-0.5 bg-red-900/50 px-1.5 py-0.5 rounded border border-red-700 text-[9px] text-red-200 font-bold">
                                                    <Ban className="w-3 h-3" /> NO ESCAPE
                                                </div>
                                            )}
                                            {card.specialRules.resetsOnLeave && (
                                                <div className="flex items-center gap-0.5 bg-purple-900/50 px-1.5 py-0.5 rounded border border-purple-700 text-[9px] text-purple-200 font-bold">
                                                    <RefreshCw className="w-3 h-3" /> REGEN
                                                </div>
                                            )}
                                            {card.specialRules.reward && (
                                                <div className="flex items-center gap-0.5 bg-green-900/50 px-1.5 py-0.5 rounded border border-green-700 text-[9px] text-green-200 font-bold">
                                                    <Gift className="w-3 h-3" /> LOOT
                                                </div>
                                            )}
                                        </div>
                                    )}
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