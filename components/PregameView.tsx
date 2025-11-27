
import React, { useState } from 'react';
import { GameState, Player, PlayerRole, StatType, Die, ObstacleCard } from '../types';
import { RetroButton, Panel } from './RetroComponents';
import { STAT_COLORS, STAT_BG_COLORS, STAT_ICONS } from '../constants';
import { Shield, Zap, Book, Cross, Axe, Music, Check, Star, Sword, Ban, RefreshCw, Gift } from 'lucide-react';

interface PregameProps {
  gameState: GameState;
  localPlayer: Player;
  onDraftDie: (dieIndex: number) => void;
  onDraftCard: (cardIndex: number) => void;
  onReady: () => void;
}

export const PregameView: React.FC<PregameProps> = ({ gameState, localPlayer, onDraftDie, onDraftCard, onReady }) => {
  const isDM = localPlayer.role === PlayerRole.DM;
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleDraft = () => {
      if (selectedIndex !== null) {
          if (isDM) onDraftCard(selectedIndex);
          else onDraftDie(selectedIndex);
          setSelectedIndex(null);
      }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 gap-6">
      <div className="text-center animate-in fade-in zoom-in duration-500">
         <h1 className="text-4xl text-yellow-400 font-retro mb-2">PREPARE FOR BATTLE</h1>
         <div className="text-xl font-mono text-slate-300">
             TIME REMAINING: {Math.floor(gameState.timer / 60)}:{(gameState.timer % 60).toString().padStart(2, '0')}
         </div>
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Main Draft Area */}
          <Panel title={isDM ? "Draft Your Trap Deck" : "Forge Your Dice Pool"} className="min-h-[400px] flex flex-col">
              {localPlayer.isReady ? (
                  <div className="flex-1 flex flex-col items-center justify-center gap-4 text-green-400">
                      <div className="w-20 h-20 border-4 border-green-500 rounded-full flex items-center justify-center animate-pulse">
                          <Check className="w-10 h-10" />
                      </div>
                      <div className="font-retro text-xl">READY</div>
                      <div className="text-sm text-slate-400">Waiting for other players...</div>
                  </div>
              ) : (
                  <div className="flex-1 flex flex-col gap-4">
                      <div className="text-center text-slate-300 mb-4">
                          {isDM 
                             ? `Select card ${gameState.dmDeck.length + 1}/10 for your deck.` 
                             : `Select Die ${localPlayer.draftStep + 1}/2 for your pool.`}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {isDM ? (
                              gameState.dmDraftOptions.map((card, idx) => (
                                  <div key={card.id} 
                                       onClick={() => setSelectedIndex(idx)}
                                       className={`
                                            bg-slate-800 border-2 p-2 cursor-pointer transition-all flex flex-row md:flex-col gap-2 group relative
                                            ${selectedIndex === idx ? 'border-yellow-400 ring-2 ring-yellow-400/50' : 'border-slate-600 hover:border-red-500 hover:bg-slate-700'}
                                       `}>
                                       {/* Mobile: Image Left. Desktop: Image Top */}
                                       <div className="w-16 h-16 md:w-full md:aspect-square bg-black border border-slate-700 relative shrink-0">
                                            <img src={card.imageUrl} className="w-full h-full object-contain [image-rendering:pixelated]" />
                                            <div className="absolute top-1 right-1 text-[8px] bg-slate-700 text-white px-1 rounded">{card.tier}</div>
                                       </div>
                                       <div className="flex-1 flex flex-col">
                                            <div className="font-bold text-xs text-slate-200">{card.name}</div>
                                            <div className="text-[10px] text-slate-400 leading-tight line-clamp-2 md:line-clamp-none">{card.description}</div>
                                            <div className="mt-auto flex gap-1 flex-wrap pt-1">
                                                {(Object.entries(card.requirements) as [StatType, number][]).map(([stat, req]) => (
                                                    <div key={stat} className="text-[8px] bg-black/50 px-1 rounded text-slate-300 border border-slate-700">
                                                        {req} {stat}
                                                    </div>
                                                ))}
                                            </div>
                                            {/* Special Modifiers Display */}
                                            {(card.specialRules && Object.keys(card.specialRules).length > 0) && (
                                                <div className="flex flex-wrap gap-1 mt-1 pt-1 border-t border-slate-700/50">
                                                    {card.specialRules.accumulatesDamage && <div className="flex items-center gap-0.5 text-[8px] text-yellow-500"><Sword className="w-3 h-3" /></div>}
                                                    {card.specialRules.preventsRetreat && <div className="flex items-center gap-0.5 text-[8px] text-red-500"><Ban className="w-3 h-3" /></div>}
                                                    {card.specialRules.resetsOnLeave && <div className="flex items-center gap-0.5 text-[8px] text-purple-500"><RefreshCw className="w-3 h-3" /></div>}
                                                    {card.specialRules.reward && <div className="flex items-center gap-0.5 text-[8px] text-green-500"><Gift className="w-3 h-3" /></div>}
                                                </div>
                                            )}
                                       </div>
                                  </div>
                              ))
                          ) : (
                              localPlayer.draftDieOptions.map((die, idx) => (
                                  <div key={die.id}
                                       onClick={() => setSelectedIndex(idx)}
                                       className={`
                                            bg-slate-800 border-2 p-2 cursor-pointer transition-all flex flex-col items-center gap-2 group
                                            ${selectedIndex === idx ? 'border-yellow-400 ring-2 ring-yellow-400/50' : 'border-slate-600 hover:border-yellow-400 hover:bg-slate-700'}
                                       `}>
                                       
                                       {/* Compact Grid for Mobile */}
                                       <div className="w-fit mx-auto grid grid-cols-3 gap-0.5 md:gap-2 md:w-full">
                                            {die.faces.map((f, i) => (
                                                <div key={i} className="flex flex-col items-center gap-0.5">
                                                    <div className={`w-8 h-8 md:w-full md:aspect-square rounded border flex items-center justify-center relative bg-slate-900 ${STAT_COLORS[f]}`}>
                                                        <div className={`w-3/4 h-3/4 rounded-full ${STAT_BG_COLORS[f]} flex items-center justify-center shadow-inner`}>
                                                            {React.createElement(STAT_ICONS[f], { className: "w-2/3 h-2/3 text-white" })}
                                                        </div>
                                                        {die.multipliers[i] > 1 && (
                                                            <div className="absolute -top-1 -right-1 text-[8px] md:text-[10px] bg-yellow-300 text-black font-bold rounded-full w-3 h-3 md:w-4 md:h-4 flex items-center justify-center shadow-sm border border-white">
                                                                x{die.multipliers[i]}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className="text-[6px] uppercase text-slate-400 font-bold tracking-tighter md:hidden">{f}</span>
                                                    <span className="hidden md:block text-[6px] uppercase text-slate-400 font-bold tracking-tighter">{f}</span>
                                                </div>
                                            ))}
                                       </div>
                                       <div className="text-[10px] text-slate-400 font-mono mt-2">
                                           {die.multipliers.filter(m => m > 1).length > 0 ? 'Multipliers!' : 'Standard'}
                                       </div>
                                  </div>
                              ))
                          )}
                      </div>
                      
                      <div className="mt-auto pt-4 flex justify-center">
                          <RetroButton 
                            className="w-full max-w-xs py-3 text-lg" 
                            disabled={selectedIndex === null}
                            onClick={handleDraft}
                          >
                              PICK SELECTED
                          </RetroButton>
                      </div>
                  </div>
              )}
          </Panel>

          {/* Status Panel */}
          <Panel title="Squad Status" className="flex flex-col">
              <div className="flex flex-col gap-2">
                  {gameState.players.map(p => (
                      <div key={p.id} className="bg-slate-800 p-3 flex items-center justify-between border border-slate-600">
                          <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full ${p.isReady ? 'bg-green-500' : 'bg-slate-500 animate-pulse'}`}></div>
                              <span className={p.id === localPlayer.id ? "text-yellow-400 font-bold" : "text-slate-300"}>
                                  {p.name} ({p.role === 'DM' ? 'DM' : p.heroClass})
                              </span>
                          </div>
                          <div className="text-xs font-mono text-slate-400">
                              {p.isReady ? 'READY' : (p.role === 'DM' ? `Drafting Deck...` : `Drafting Dice...`)}
                          </div>
                      </div>
                  ))}
              </div>
              
              {localPlayer.isReady && (
                  <div className="mt-auto pt-4 text-center text-slate-500 animate-pulse">
                      Waiting for all players to ready up...
                  </div>
              )}
          </Panel>
      </div>
    </div>
  );
};
