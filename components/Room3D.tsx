
import React from 'react';
import { RoomObstacle, StatType } from '../types';
import { Monster, Lock, Skull, Ghost, RefreshCw, Link2, Key } from 'lucide-react';
import { STAT_COLORS, STAT_BG_COLORS, RED_KEY_ID, ITEM_REGISTRY } from '../constants';
import { ASSETS } from '../assets';

interface Room3DProps {
  obstacles: RoomObstacle[];
  isExit: boolean;
  isStart: boolean;
  items?: string[];
  className?: string;
}

export const Room3D: React.FC<Room3DProps> = ({ obstacles, isExit, isStart, items = [], className }) => {
  return (
    <div className={`relative w-full overflow-hidden bg-black perspective-container ${className || 'h-64 md:h-80'}`}>
      {/* Ceiling */}
      <div className="absolute top-0 w-full h-1/2 bg-gradient-to-b from-slate-900 to-slate-800 border-b border-slate-900/50"></div>
      {/* Floor */}
      <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-b from-slate-900 to-slate-950 grid-floor"></div>
      
      {/* 3D Room Container */}
      <div className="absolute inset-0 preserve-3d flex items-center justify-center">
        
        {/* Back Wall (Simulated) */}
        <div className="w-48 h-48 md:w-64 md:h-64 bg-slate-800 border-8 border-slate-700 shadow-2xl flex flex-col items-center justify-center relative z-10 transform scale-90">
            {isExit && (
                <div className="text-yellow-400 animate-pulse text-center">
                    <div className="text-4xl font-retro">EXIT</div>
                    <div className="w-20 h-32 bg-yellow-900/50 border-4 border-yellow-500 mx-auto mt-2"></div>
                </div>
            )}
            {isStart && !isExit && (
                <div className="text-green-600 opacity-50 text-4xl font-retro">ENTRY</div>
            )}
            {!isStart && !isExit && (
                 <div className="w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/brick-wall.png')]"></div>
            )}
        </div>

        {/* Side Walls (Pseudo) */}
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-slate-950 to-slate-800 border-r border-slate-700 transform skew-y-12 origin-top-left z-20"></div>
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-slate-950 to-slate-800 border-l border-slate-700 transform -skew-y-12 origin-top-right z-20"></div>

        {/* Floor Items */}
        {items.length > 0 && (
            <div className="absolute bottom-12 z-25 flex gap-4 animate-bounce-slow">
                {items.map((itemId, idx) => {
                    const def = ITEM_REGISTRY[itemId];
                    return (
                        <div key={`${itemId}-${idx}`} className="w-8 h-8 md:w-12 md:h-12 drop-shadow-[0_0_10px_rgba(255,255,0,0.5)]">
                            {def ? (
                                <img src={def.imageUrl} alt={def.name} className="w-full h-full [image-rendering:pixelated]" />
                            ) : (
                                <div className="w-full h-full bg-yellow-500 rounded-full"></div>
                            )}
                        </div>
                    )
                })}
            </div>
        )}

        {/* Obstacles Overlay */}
        {obstacles.length > 0 && (
          <div className="absolute z-30 flex gap-4 items-end justify-center bottom-4 md:bottom-8">
            {obstacles.map(obs => {
                const requirements = Object.entries(obs.card.requirements) as [StatType, number][];
                
                return (
                  <div key={obs.id} className="animate-bounce-slow flex flex-col items-center">
                     {/* HP Bar (Only for non-key obstacles) */}
                     {!obs.card.keyRequirement && (
                         <div className="bg-slate-900/80 p-2 rounded-lg border-2 border-red-500 mb-2 backdrop-blur-sm min-w-[80px]">
                            <span className="text-xs text-red-300 block text-center mb-1 font-retro">{obs.card.name}</span>
                            <div className="flex flex-col gap-1">
                                {requirements.map(([stat, required]) => {
                                    const current = obs.currentSuccesses[stat] || 0;
                                    return (
                                        <div key={stat} className="flex gap-1 justify-center items-center">
                                             <div className={`w-2 h-2 rounded-full ${STAT_BG_COLORS[stat]}`}></div>
                                             {Array.from({length: required}).map((_, i) => (
                                                 <div key={i} className={`w-3 h-3 rounded-sm border border-slate-600 ${i < current ? STAT_BG_COLORS[stat] : 'bg-slate-800'}`}></div>
                                             ))}
                                        </div>
                                    )
                                })}
                            </div>
                         </div>
                     )}
                     {obs.card.keyRequirement && (
                         <div className="bg-slate-900/80 p-1 px-2 rounded border border-red-500 mb-2 text-[10px] text-red-300 flex items-center gap-1">
                             <Key className="w-3 h-3" /> Locked
                         </div>
                     )}
                     
                     {/* Sprite Container */}
                     <div className="w-32 h-32 relative group">
                        {/* Badge Indicators */}
                        <div className="absolute -top-4 -right-4 flex flex-col gap-1">
                            {obs.card.specialRules?.preventsRetreat && (
                                <div className="bg-red-900 border border-red-500 p-1 rounded-full" title="No Escape">
                                    <Link2 className="w-4 h-4 text-red-200" />
                                </div>
                            )}
                            {obs.card.specialRules?.resetsOnLeave && (
                                <div className="bg-purple-900 border border-purple-500 p-1 rounded-full" title="Regenerates">
                                    <RefreshCw className="w-4 h-4 text-purple-200" />
                                </div>
                            )}
                        </div>
    
                        {/* Image */}
                        {obs.card.imageUrl ? (
                            <img 
                                src={obs.card.imageUrl} 
                                alt={obs.card.name} 
                                className="w-full h-full object-contain [image-rendering:pixelated] drop-shadow-[0_0_10px_rgba(255,0,0,0.5)]"
                            />
                        ) : (
                             <div className="w-full h-full bg-red-900/20 border-2 border-red-500/50 flex items-center justify-center rounded-md">
                                <Skull className="text-red-500 w-16 h-16 animate-pulse" />
                             </div>
                        )}
                     </div>
                  </div>
                );
            })}
          </div>
        )}
      </div>

      {/* Retro Overlay Scanlines */}
      <div className="absolute inset-0 scanline z-40"></div>
    </div>
  );
};
