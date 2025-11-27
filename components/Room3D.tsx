
import React, { useEffect, useState, useRef } from 'react';
import { RoomObstacle, StatType, Player, Room, HeroClass } from '../types';
import { Lock, Key, RefreshCw, Link2, Skull, Shield, Zap, Book, Cross, Axe, Music, User } from 'lucide-react';
import { STAT_BG_COLORS, RED_KEY_ID, ITEM_REGISTRY, MOVEMENT_DELAY } from '../constants';

interface Room3DProps {
  room: Room;
  allPlayers: Player[]; // Need all players to calculate who is entering/leaving
  map: Record<string, Room>; // Need map to determine directions
  obstacles: RoomObstacle[];
  isExit: boolean;
  isStart: boolean;
  items?: string[];
  className?: string;
}

const CLASS_ICONS: Record<HeroClass, React.ElementType> = {
    [HeroClass.FIGHTER]: Shield,
    [HeroClass.ROGUE]: Zap,
    [HeroClass.WIZARD]: Book,
    [HeroClass.CLERIC]: Cross,
    [HeroClass.BARBARIAN]: Axe,
    [HeroClass.BARD]: Music,
};

export const Room3D: React.FC<Room3DProps> = ({ room, allPlayers, map, obstacles, isExit, isStart, items = [], className }) => {
  const [now, setNow] = useState(Date.now());
  const animationRef = useRef<number>();

  useEffect(() => {
    const loop = () => {
      setNow(Date.now());
      animationRef.current = requestAnimationFrame(loop);
    };
    animationRef.current = requestAnimationFrame(loop);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  // Map Logic
  const cx = room.x;
  const cy = room.y;
  
  // Connections
  const hasNorth = room.connections.includes(`${cx},${cy-1}`);
  const hasSouth = room.connections.includes(`${cx},${cy+1}`);
  const hasEast = room.connections.includes(`${cx+1},${cy}`);
  const hasWest = room.connections.includes(`${cx-1},${cy}`);

  // Calculate Player Positions
  const renderPlayers = allPlayers.map(p => {
      // 1. Player is IN this room
      if (p.currentRoomId === room.id) {
          if (p.isMoving) {
              // They are ENTERING this room (Logic: current is set instantly, animation catches up)
              // They come FROM previousRoomId
              if (!p.previousRoomId) return null; // Should not happen if moving
              const prev = map[p.previousRoomId];
              if (!prev) return null;

              // Progress 0 = At Door/Previous, 1 = Center
              const remaining = Math.max(0, p.moveUnlockTime - now);
              const progress = 1 - (remaining / MOVEMENT_DELAY);
              
              let startX = 50;
              let startY = 50;
              
              if (prev.y < cy) { startY = -20; } // From North
              else if (prev.y > cy) { startY = 120; } // From South
              else if (prev.x < cx) { startX = -20; } // From West
              else if (prev.x > cx) { startX = 120; } // From East

              const currentX = startX + (50 - startX) * progress;
              const currentY = startY + (50 - startY) * progress;

              return { ...p, x: currentX, y: currentY, opacity: progress < 0.1 ? progress * 10 : 1 };
          } else {
              // Standing in room (Jitter slightly based on ID hash to prevent stacking)
              const offset = (parseInt(p.id.slice(-2), 16) % 20) - 10; 
              return { ...p, x: 50 + offset, y: 50 + offset, opacity: 1 };
          }
      }
      
      // 2. Player LEFT this room (isMoving AND previousRoomId == thisRoom)
      if (p.previousRoomId === room.id && p.isMoving) {
          // They are LEAVING this room
          // They go TO currentRoomId
          const next = map[p.currentRoomId];
          if (!next) return null;

          const remaining = Math.max(0, p.moveUnlockTime - now);
          const progress = 1 - (remaining / MOVEMENT_DELAY);

          let targetX = 50;
          let targetY = 50;

          if (next.y < cy) { targetY = -20; } // To North
          else if (next.y > cy) { targetY = 120; } // To South
          else if (next.x < cx) { targetX = -20; } // To West
          else if (next.x > cx) { targetX = 120; } // To East

          const currentX = 50 + (targetX - 50) * progress;
          const currentY = 50 + (targetY - 50) * progress;

          return { ...p, x: currentX, y: currentY, opacity: 1 };
      }

      return null;
  }).filter(Boolean) as (Player & { x: number, y: number, opacity: number })[];

  return (
    <div className={`relative w-full overflow-hidden bg-slate-950 flex items-center justify-center ${className || 'h-64 md:h-80'}`}>
      
      {/* Scrollable Container Wrapper for Map centering */}
      <div className="relative w-[300px] h-[300px] shrink-0">
          
          {/* Hallways (Drawn first to be behind walls) */}
          {hasNorth && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-[100px] bg-slate-800 border-l-2 border-r-2 border-slate-700"></div>}
          {hasSouth && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-[100px] bg-slate-800 border-l-2 border-r-2 border-slate-700"></div>}
          {hasWest && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-16 w-[100px] bg-slate-800 border-t-2 border-b-2 border-slate-700"></div>}
          {hasEast && <div className="absolute right-0 top-1/2 -translate-y-1/2 h-16 w-[100px] bg-slate-800 border-t-2 border-b-2 border-slate-700"></div>}

          {/* Central Room */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-slate-900 border-4 border-slate-600 shadow-2xl relative">
              
              {/* Floor Pattern */}
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-700 via-slate-900 to-black"></div>
              {isStart && <div className="absolute inset-0 border-4 border-green-900/50 flex items-center justify-center"><span className="text-green-800 font-retro opacity-20 text-2xl -rotate-45">START</span></div>}
              {isExit && <div className="absolute inset-0 border-4 border-yellow-900/50 flex items-center justify-center"><span className="text-yellow-600 font-retro opacity-20 text-2xl -rotate-45">EXIT</span></div>}

              {/* Items on Floor */}
              {items.length > 0 && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="flex gap-2 -translate-y-8">
                          {items.map((itemId, idx) => {
                              const def = ITEM_REGISTRY[itemId];
                              return (
                                  <div key={`${itemId}-${idx}`} className="w-6 h-6 animate-bounce">
                                      <img src={def?.imageUrl} className="w-full h-full [image-rendering:pixelated]" />
                                  </div>
                              )
                          })}
                      </div>
                  </div>
              )}

              {/* Encounter / Obstacles */}
              {obstacles.length > 0 ? (
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                      {obstacles.map((obs) => (
                          <div key={obs.id} className="relative w-24 h-24 flex items-center justify-center">
                              {/* Sprite */}
                              <img 
                                  src={obs.card.imageUrl} 
                                  className="w-full h-full object-contain [image-rendering:pixelated] drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] z-10" 
                              />
                              
                              {/* Status Indicators */}
                              <div className="absolute -top-2 -right-2 flex flex-col gap-1 z-20">
                                  {obs.card.keyRequirement && <div className="bg-black/50 p-1 rounded-full border border-red-500"><Lock className="w-3 h-3 text-red-500" /></div>}
                                  {obs.card.specialRules?.preventsRetreat && <div className="bg-black/50 p-1 rounded-full border border-red-500"><Link2 className="w-3 h-3 text-red-500" /></div>}
                                  {obs.card.specialRules?.resetsOnLeave && <div className="bg-black/50 p-1 rounded-full border border-purple-500"><RefreshCw className="w-3 h-3 text-purple-500" /></div>}
                              </div>

                              {/* Progress Overlay (if multiple requirements) */}
                              {!obs.card.keyRequirement && !obs.isDefeated && (
                                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-0.5">
                                      {Object.keys(obs.card.requirements).map((stat, i) => (
                                          <div key={i} className={`w-2 h-2 rounded-full ${STAT_BG_COLORS[stat as StatType]}`}></div>
                                      ))}
                                  </div>
                              )}
                          </div>
                      ))}
                  </div>
              ) : (
                  // If clear, show safe icon?
                  null
              )}

              {/* Players */}
              <div className="absolute inset-0 pointer-events-none z-20 overflow-visible">
                  {renderPlayers.map(p => {
                      const Icon = p.heroClass ? CLASS_ICONS[p.heroClass] : User;
                      return (
                          <div 
                              key={p.id} 
                              className="absolute w-8 h-8 -ml-4 -mt-4 flex flex-col items-center justify-center transition-opacity duration-100"
                              style={{ 
                                  left: `${p.x}%`, 
                                  top: `${p.y}%`,
                                  opacity: p.opacity
                              }}
                          >
                              <div className={`w-8 h-8 rounded-full bg-slate-900 border-2 ${p.role === 'DM' ? 'border-red-500' : 'border-blue-400'} flex items-center justify-center shadow-lg relative`}>
                                  <Icon className="w-5 h-5 text-slate-200" />
                                  <div className="absolute -bottom-1 w-2 h-2 bg-green-500 rounded-full border border-black animate-pulse"></div>
                              </div>
                              <div className="bg-black/70 px-1 rounded text-[6px] text-white mt-1 whitespace-nowrap">{p.name}</div>
                          </div>
                      )
                  })}
              </div>

          </div>
      </div>

      {/* Vignette Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.8)_100%)]"></div>
    </div>
  );
};
