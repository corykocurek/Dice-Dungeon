import React, { useState } from 'react';
import { HeroClass, PlayerRole, Player, StatType } from '../types';
import { RetroButton, Panel } from './RetroComponents';
import { Shield, Zap, Book, Cross, Users, Copy, Radio, ArrowRight, Library, Search, ChevronLeft, Axe, Music, Brain } from 'lucide-react';
import { ITEM_REGISTRY, OBSTACLE_DECK, STAT_COLORS, STAT_BG_COLORS } from '../constants';
import { ASSETS } from '../assets';

interface LobbyProps {
  players: Player[];
  localPlayerId: string | null;
  gameId?: string;
  isHost: boolean;
  onHostGame: (name: string) => void;
  onJoinGame: (hostId: string) => void;
  onUpdatePlayer: (role: PlayerRole, heroClass?: HeroClass, name?: string) => void;
  onStartGame: () => void;
}

export const Lobby: React.FC<LobbyProps> = ({ 
  players, 
  localPlayerId, 
  gameId, 
  isHost, 
  onHostGame, 
  onJoinGame,
  onUpdatePlayer,
  onStartGame
}) => {
  const [view, setView] = useState<'MENU' | 'HOST_SETUP' | 'JOINING' | 'ROOM' | 'ARCHIVES'>('MENU');
  const [joinCode, setJoinCode] = useState('');
  const [name, setName] = useState('');
  
  // Archives State
  const [archiveTab, setArchiveTab] = useState<'ITEMS' | 'OBSTACLES'>('ITEMS');
  
  // Local selection state for when in the room
  const [selectedRole, setSelectedRole] = useState<PlayerRole>(PlayerRole.HERO);
  const [selectedClass, setSelectedClass] = useState<HeroClass>(HeroClass.FIGHTER);
  const [isConnecting, setIsConnecting] = useState(false);

  // If we have a local player ID and players list is populated, we are in the room
  React.useEffect(() => {
    if (localPlayerId && players.length > 0) {
      setView('ROOM');
      setIsConnecting(false);
    }
  }, [localPlayerId, players]);

  const heroClasses = [
    { type: HeroClass.FIGHTER, icon: Shield, bonus: "x2 Muscle" },
    { type: HeroClass.ROGUE, icon: Zap, bonus: "x2 Agility" },
    { type: HeroClass.WIZARD, icon: Book, bonus: "x2 Knowledge" },
    { type: HeroClass.CLERIC, icon: Cross, bonus: "x2 Smarts" },
    { type: HeroClass.BARBARIAN, icon: Axe, bonus: "x2 Fortitude" },
    { type: HeroClass.BARD, icon: Music, bonus: "x2 Looks" },
  ];

  const handleUpdate = () => {
    onUpdatePlayer(selectedRole, selectedClass, name || `Player ${Math.floor(Math.random()*1000)}`);
  };

  const copyToClipboard = () => {
    if (gameId) navigator.clipboard.writeText(gameId);
  };

  if (view === 'MENU') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 gap-6 animate-in fade-in duration-500">
        
        {/* LOGO OPTIONS PREVIEW - TEMPORARY FOR SELECTION */}
        <div className="flex flex-wrap justify-center gap-8 mb-4">
            <div className="flex flex-col items-center gap-2">
                <div className="w-24 h-24 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                    <img src={ASSETS.LOGO_OPTION_1} className="w-full h-full [image-rendering:pixelated]" alt="Logo 1" />
                </div>
                <span className="text-[10px] text-slate-500">OPTION 1</span>
            </div>
            <div className="flex flex-col items-center gap-2">
                <div className="w-24 h-24 drop-shadow-[0_0_15px_rgba(255,0,0,0.3)]">
                    <img src={ASSETS.LOGO_OPTION_2} className="w-full h-full [image-rendering:pixelated]" alt="Logo 2" />
                </div>
                <span className="text-[10px] text-slate-500">OPTION 2</span>
            </div>
            <div className="flex flex-col items-center gap-2">
                <div className="w-24 h-24 drop-shadow-[0_0_15px_rgba(255,255,0,0.3)]">
                    <img src={ASSETS.LOGO_OPTION_3} className="w-full h-full [image-rendering:pixelated]" alt="Logo 3" />
                </div>
                <span className="text-[10px] text-slate-500">OPTION 3</span>
            </div>
        </div>

        <h1 className="text-4xl md:text-6xl text-yellow-400 font-retro text-center drop-shadow-[4px_4px_0_rgba(0,0,0,1)]">
          DICE DUNGEON
        </h1>
        <div className="flex flex-col gap-4 w-full max-w-md">
            <div className="flex gap-4">
                <RetroButton className="flex-1 py-8 text-xl" onClick={() => setView('HOST_SETUP')}>
                    CREATE GAME
                </RetroButton>
                <RetroButton className="flex-1 py-8 text-xl" variant="outline" onClick={() => setView('JOINING')}>
                    JOIN GAME
                </RetroButton>
            </div>
            <RetroButton 
                className="py-4 text-lg flex items-center justify-center gap-2" 
                variant="outline" 
                onClick={() => setView('ARCHIVES')}
            >
                <Library className="w-5 h-5" /> ARCHIVES
            </RetroButton>
        </div>
      </div>
    );
  }

  if (view === 'ARCHIVES') {
      const items = Object.values(ITEM_REGISTRY);
      const obstacles = OBSTACLE_DECK;

      return (
          <div className="flex flex-col items-center justify-center min-h-screen p-4 gap-4">
              <Panel title="Dungeon Archives" className="w-full max-w-4xl h-[80vh] flex flex-col">
                  {/* Header & Tabs */}
                  <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-4">
                      <div className="flex gap-2">
                          <RetroButton 
                              variant={archiveTab === 'ITEMS' ? 'primary' : 'outline'}
                              onClick={() => setArchiveTab('ITEMS')}
                          >
                              ITEMS ({items.length})
                          </RetroButton>
                          <RetroButton 
                              variant={archiveTab === 'OBSTACLES' ? 'primary' : 'outline'}
                              onClick={() => setArchiveTab('OBSTACLES')}
                          >
                              OBSTACLES ({obstacles.length})
                          </RetroButton>
                      </div>
                      <RetroButton variant="danger" onClick={() => setView('MENU')} className="px-3">
                          <ChevronLeft className="w-4 h-4" /> BACK
                      </RetroButton>
                  </div>

                  {/* Content Area */}
                  <div className="flex-1 overflow-y-auto pr-2">
                      {archiveTab === 'ITEMS' && (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {items.map((item) => (
                                  <div key={item.id} className="bg-slate-800 border border-slate-600 p-2 flex gap-3 items-start hover:border-yellow-500 transition-colors">
                                      <div className="w-12 h-12 bg-black border border-slate-700 shrink-0">
                                          <img src={item.imageUrl} alt={item.name} className="w-full h-full [image-rendering:pixelated]" />
                                      </div>
                                      <div className="flex flex-col">
                                          <span className="text-yellow-400 font-bold text-sm">{item.name}</span>
                                          <span className="text-xs text-slate-400 italic mb-1">{item.description}</span>
                                          <div className="flex flex-wrap gap-1 mt-auto">
                                              {item.bonusStat && (
                                                  <span className={`text-[10px] px-1 rounded border bg-slate-900 ${STAT_COLORS[item.bonusStat]}`}>
                                                      +{item.bonusAmount} {item.bonusStat}
                                                  </span>
                                              )}
                                              {item.grantsExtraDie && (
                                                  <span className="text-[10px] px-1 rounded border border-blue-500 text-blue-300 bg-blue-900/30">
                                                      +1 DICE
                                                  </span>
                                              )}
                                              {item.effectType && (
                                                  <span className="text-[10px] px-1 rounded border border-purple-500 text-purple-300 bg-purple-900/30">
                                                      {item.effectType.replace('_', ' ')}
                                                  </span>
                                              )}
                                          </div>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      )}

                      {archiveTab === 'OBSTACLES' && (
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                              {obstacles.map((obs, idx) => (
                                  <div key={idx} className="bg-slate-800 border border-slate-600 p-2 flex flex-col gap-2 relative hover:border-red-500 transition-colors group">
                                      <div className="w-full aspect-square bg-black border border-slate-700 relative overflow-hidden">
                                          <img src={obs.imageUrl} alt={obs.name} className="w-full h-full object-contain [image-rendering:pixelated]" />
                                          {obs.tier && (
                                              <span className={`absolute top-1 right-1 text-[8px] px-1 rounded font-bold
                                                  ${obs.tier === 'BASIC' ? 'bg-slate-600 text-white' : ''}
                                                  ${obs.tier === 'NEUTRAL' ? 'bg-blue-600 text-white' : ''}
                                                  ${obs.tier === 'ADVANCED' ? 'bg-purple-600 text-white border border-purple-400' : ''}
                                              `}>
                                                  {obs.tier}
                                              </span>
                                          )}
                                      </div>
                                      <div className="flex flex-col gap-1">
                                          <div className="flex justify-between items-start">
                                              <span className="text-slate-200 font-bold text-xs leading-tight">{obs.name}</span>
                                              <span className="text-[10px] bg-red-900 text-red-200 px-1 rounded">{obs.cost} Mana</span>
                                          </div>
                                          <div className="flex flex-col gap-0.5 mt-1">
                                              {(Object.entries(obs.requirements) as [StatType, number][]).map(([stat, req]) => (
                                                  <div key={stat} className="flex gap-1 items-center bg-black/40 p-0.5 px-1 rounded">
                                                      <div className={`w-1.5 h-1.5 rounded-full ${STAT_BG_COLORS[stat]}`}></div>
                                                      <span className="text-[10px] text-white">{req} {stat}</span>
                                                  </div>
                                              ))}
                                          </div>
                                          <span className="text-[10px] text-slate-500 italic leading-tight mt-1">{obs.description}</span>
                                          
                                          {/* Special Badges */}
                                          <div className="flex flex-wrap gap-1 mt-1">
                                              {obs.specialRules?.accumulatesDamage && <span className="text-[8px] border border-yellow-600 text-yellow-500 px-1 rounded">HP</span>}
                                              {obs.specialRules?.preventsRetreat && <span className="text-[8px] border border-red-600 text-red-500 px-1 rounded">NO ESCAPE</span>}
                                              {obs.specialRules?.reward && <span className="text-[8px] border border-green-600 text-green-500 px-1 rounded">LOOT</span>}
                                          </div>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      )}
                  </div>
              </Panel>
          </div>
      );
  }

  if (view === 'HOST_SETUP') {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 gap-6">
          <Panel title="Host Game" className="w-full max-w-md flex flex-col gap-4">
            <div>
              <label className="text-xs uppercase text-slate-400">Your Name</label>
              <input 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-800 border-2 border-slate-600 p-2 text-slate-200 font-mono focus:border-yellow-400 outline-none"
                placeholder="Enter name..."
              />
            </div>
            <div className="flex gap-2">
              <RetroButton variant="outline" onClick={() => setView('MENU')}>Back</RetroButton>
              <RetroButton 
                className="flex-1" 
                disabled={!name}
                onClick={() => {
                  onHostGame(name);
                }}
              >
                CREATE LOBBY
              </RetroButton>
            </div>
          </Panel>
        </div>
    );
  }

  if (view === 'JOINING') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 gap-6">
        <Panel title="Join Game" className="w-full max-w-md flex flex-col gap-4">
          <div>
            <label className="text-xs uppercase text-slate-400">Enter Game Code (Peer ID)</label>
            <input 
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              className="w-full bg-slate-800 border-2 border-slate-600 p-2 text-slate-200 font-mono focus:border-yellow-400 outline-none"
              placeholder="e.g. 1234-abcd..."
            />
          </div>
          <div>
            <label className="text-xs uppercase text-slate-400">Your Name</label>
            <input 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-800 border-2 border-slate-600 p-2 text-slate-200 font-mono focus:border-yellow-400 outline-none"
              placeholder="Enter name..."
            />
          </div>
          <div className="flex gap-2">
            <RetroButton variant="outline" onClick={() => setView('MENU')}>Back</RetroButton>
            <RetroButton 
              className="flex-1" 
              disabled={!joinCode || !name || isConnecting}
              onClick={() => {
                setIsConnecting(true);
                onUpdatePlayer(PlayerRole.HERO, HeroClass.FIGHTER, name);
                onJoinGame(joinCode);
                // Timeout to reset connecting state if it fails silently
                setTimeout(() => setIsConnecting(false), 15000);
              }}
            >
              {isConnecting ? 'CONNECTING...' : 'CONNECT'}
            </RetroButton>
          </div>
        </Panel>
      </div>
    );
  }

  // Room View (Shared for Host and Joiner once connected)
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 gap-6">
      
      {/* Game Code Display */}
      {gameId && (
        <div className="bg-slate-800 p-4 border-2 border-yellow-500/50 rounded flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase text-slate-400">Game ID</span>
            <span className="font-mono text-xl text-yellow-400">{gameId}</span>
          </div>
          <button onClick={copyToClipboard} className="p-2 hover:bg-slate-700 rounded transition-colors" title="Copy ID">
            <Copy className="w-5 h-5 text-slate-300" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
        
        {/* Configuration Panel */}
        <Panel title="Character Setup" className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase text-slate-400">Role</label>
            <div className="flex gap-2">
              <RetroButton 
                variant={selectedRole === PlayerRole.HERO ? 'success' : 'outline'}
                onClick={() => setSelectedRole(PlayerRole.HERO)}
                className="flex-1"
              >
                HERO
              </RetroButton>
              <RetroButton 
                variant={selectedRole === PlayerRole.DM ? 'danger' : 'outline'}
                onClick={() => setSelectedRole(PlayerRole.DM)}
                className="flex-1"
              >
                DM
              </RetroButton>
            </div>
          </div>

          {selectedRole === PlayerRole.HERO && (
            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase text-slate-400">Class</label>
              <div className="grid grid-cols-3 gap-2">
                {heroClasses.map((c) => (
                  <button
                    key={c.type}
                    onClick={() => setSelectedClass(c.type)}
                    className={`p-3 border-2 transition-all flex flex-col items-center gap-2 ${
                      selectedClass === c.type 
                        ? 'bg-slate-700 border-yellow-400 text-yellow-100' 
                        : 'bg-slate-800 border-slate-600 text-slate-400 hover:bg-slate-750'
                    }`}
                  >
                    <c.icon className="w-5 h-5" />
                    <span className="text-[10px] uppercase font-bold text-center leading-tight">{c.type}</span>
                    <span className="text-[8px] text-green-400 text-center leading-tight">{c.bonus}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <RetroButton onClick={handleUpdate} className="mt-auto">
            UPDATE CHARACTER
          </RetroButton>
        </Panel>

        {/* Players List */}
        <Panel title="Lobby Members" className="flex flex-col h-full min-h-[400px]">
          <div className="flex-1 flex flex-col gap-2 overflow-y-auto">
            {players.length === 0 && <div className="text-slate-500 italic text-center p-4">Waiting for players...</div>}
            {players.map(p => (
              <div key={p.id} className="bg-slate-900 border border-slate-700 p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-full absolute left-0 top-0 bottom-0 ${p.role === PlayerRole.DM ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-200">
                      {p.name} {p.id === localPlayerId ? '(You)' : ''}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      {p.role === PlayerRole.DM ? 'Dungeon Master' : `Hero - ${p.heroClass}`}
                    </span>
                  </div>
                </div>
                {p.role === PlayerRole.DM ? <Users className="text-red-500 w-4 h-4" /> : <Users className="text-blue-500 w-4 h-4" />}
              </div>
            ))}
          </div>

          {isHost && (
            <div className="mt-4 pt-4 border-t border-slate-700">
               <RetroButton 
                  className="w-full py-4 text-xl animate-pulse" 
                  onClick={onStartGame}
                  disabled={players.length < 1} // Allow 1 for testing, ideally 2+
               >
                 START GAME
               </RetroButton>
            </div>
          )}
          {!isHost && (
             <div className="mt-4 text-center text-slate-500 text-sm animate-pulse">
               Waiting for Host to start...
             </div>
          )}
        </Panel>

      </div>
    </div>
  );
};