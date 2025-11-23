
import React, { useState } from 'react';
import { Team, MatchTime, CardType } from '../types';
import { Play, Pause, RotateCcw, Plus, Minus, MonitorPlay, Settings2, Activity, ChevronDown, OctagonAlert, Trash2 } from 'lucide-react';

interface ControlPanelProps {
  homeTeam: Team;
  awayTeam: Team;
  matchTime: MatchTime;
  timerRunning: boolean;
  isPenaltyCorner: boolean;
  onUpdateScore: (teamId: string, delta: number) => void;
  onUpdateTeam: (teamId: string, field: keyof Team, value: string) => void;
  onToggleTimer: () => void;
  onTogglePenaltyCorner: () => void;
  onResetTimer: () => void;
  onToggleVisibility: () => void;
  isVisible: boolean;
  onSetPeriod: (p: MatchTime['period']) => void;
  onAddCard: (teamId: string, type: CardType, duration: number) => void;
  onRemoveCard: (teamId: string) => void;
}

const TeamSetupInput = ({ label, team, onUpdate }: { label: string, team: Team, onUpdate: (f: keyof Team, v: string) => void }) => (
    <div className="flex flex-col space-y-2 mb-4 p-3 bg-black/20 rounded-lg border border-white/5">
        <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-blue-400 uppercase tracking-widest">{label}</span>
            
            {/* Color Input with HEX support */}
            <div className="flex items-center space-x-2">
                <span className="text-[9px] text-gray-500 uppercase">Couleur</span>
                <div className="flex items-center bg-neutral-800 rounded border border-white/10 overflow-hidden h-6">
                    <input 
                        type="color" 
                        value={team.primaryColor}
                        onChange={(e) => onUpdate('primaryColor', e.target.value)}
                        className="w-8 h-8 -ml-1 -mt-1 bg-transparent border-none cursor-pointer p-0"
                    />
                    <input 
                        type="text" 
                        value={team.primaryColor}
                        onChange={(e) => onUpdate('primaryColor', e.target.value)}
                        className="w-16 bg-transparent border-none text-[10px] text-white px-1 uppercase font-mono outline-none h-full"
                        placeholder="#RRGGBB"
                    />
                </div>
            </div>
        </div>
        <div className="space-y-3">
             <div>
                <label className="text-[9px] text-gray-400 block mb-1 uppercase">Nom Complet (Intro)</label>
                <input 
                    type="text" 
                    value={team.name}
                    onChange={(e) => onUpdate('name', e.target.value)}
                    className="bg-neutral-800 border border-white/10 rounded px-2 py-1.5 text-xs text-white focus:border-blue-500 focus:bg-neutral-700 outline-none w-full transition-colors"
                    placeholder="Ex: Lille Métropole H.C."
                />
             </div>
             <div>
                <label className="text-[9px] text-gray-400 block mb-1 uppercase">Nom Court (Jeu)</label>
                <input 
                    type="text" 
                    value={team.shortName}
                    onChange={(e) => onUpdate('shortName', e.target.value)}
                    className="bg-neutral-800 border border-white/10 rounded px-2 py-1.5 text-xs text-white focus:border-blue-500 focus:bg-neutral-700 outline-none w-full transition-colors"
                    placeholder="Ex: Lille"
                />
             </div>
        </div>
    </div>
);

const CardControls = ({ team, onAddCard, onRemoveCard }: { team: Team, onAddCard: (t: string, type: CardType, d: number) => void, onRemoveCard: (t: string) => void }) => (
    <div className="flex items-center justify-between bg-neutral-800/30 p-1.5 rounded mt-2 border border-white/5">
        <div className="flex space-x-1">
            <button onClick={() => onAddCard(team.id, 'GREEN', 2)} className="w-6 h-6 rounded bg-green-600 hover:bg-green-500 text-[10px] font-bold text-white shadow-sm flex items-center justify-center" title="Vert (2m)">2m</button>
            <button onClick={() => onAddCard(team.id, 'YELLOW', 5)} className="w-6 h-6 rounded bg-yellow-500 hover:bg-yellow-400 text-[10px] font-bold text-black shadow-sm flex items-center justify-center" title="Jaune (5m)">5m</button>
            <button onClick={() => onAddCard(team.id, 'YELLOW', 10)} className="w-6 h-6 rounded bg-yellow-600 hover:bg-yellow-500 text-[10px] font-bold text-black shadow-sm flex items-center justify-center" title="Jaune (10m)">10</button>
            <button onClick={() => onAddCard(team.id, 'RED', 0)} className="w-6 h-6 rounded bg-red-600 hover:bg-red-500 text-[10px] font-bold text-white shadow-sm flex items-center justify-center" title="Rouge">R</button>
        </div>
        <button onClick={() => onRemoveCard(team.id)} className="text-gray-500 hover:text-red-400 p-1">
            <Trash2 size={12} />
        </button>
    </div>
);

export const ControlPanel: React.FC<ControlPanelProps> = ({
  homeTeam,
  awayTeam,
  matchTime,
  timerRunning,
  isPenaltyCorner,
  onUpdateScore,
  onUpdateTeam,
  onToggleTimer,
  onTogglePenaltyCorner,
  onResetTimer,
  onToggleVisibility,
  isVisible,
  onSetPeriod,
  onAddCard,
  onRemoveCard
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<'live' | 'setup'>('live');

  if (!isExpanded) {
      return (
          <button 
            onClick={() => setIsExpanded(true)}
            className="fixed bottom-4 right-4 bg-neutral-900 border border-white/20 text-white p-3 rounded-full shadow-lg hover:bg-neutral-800 transition-all z-50 flex items-center space-x-2"
          >
              <Activity size={20} />
              <span className="text-xs font-bold pr-1">CONTROLS</span>
          </button>
      )
  }

  return (
    <div className="fixed bottom-4 right-4 w-[400px] bg-[#121212]/95 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl z-50 text-white overflow-hidden flex flex-col transition-all">
      
      {/* Header / Tabs */}
      <div className="flex items-center justify-between bg-black/40 px-3 py-2 border-b border-white/5">
         <div className="flex space-x-1 bg-neutral-800/50 p-1 rounded-lg">
            <button 
                onClick={() => setActiveTab('live')}
                className={`flex items-center space-x-1 px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${activeTab === 'live' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
            >
                <Activity size={12} />
                <span>Live</span>
            </button>
            <button 
                onClick={() => setActiveTab('setup')}
                className={`flex items-center space-x-1 px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${activeTab === 'setup' ? 'bg-neutral-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
            >
                <Settings2 size={12} />
                <span>Setup</span>
            </button>
         </div>
         <div className="flex items-center space-x-2">
            <button onClick={onToggleVisibility} title={isVisible ? "Masquer Overlay" : "Afficher Overlay"} className={`p-1.5 rounded hover:bg-white/10 ${!isVisible && 'text-red-500'}`}>
                <MonitorPlay size={16} />
            </button>
            <button onClick={() => setIsExpanded(false)} className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-white">
                <ChevronDown size={16} />
            </button>
         </div>
      </div>

      {/* Content Area */}
      <div className="p-4">
        
        {/* === LIVE TAB === */}
        {activeTab === 'live' && (
            <div className="flex flex-col space-y-4">
                
                {/* Timer Controls */}
                <div className="flex items-center justify-between bg-neutral-800/50 p-2 rounded-lg border border-white/5">
                    <div className="flex flex-col">
                         <div className={`font-mono text-xl font-bold pl-2 leading-none ${isPenaltyCorner ? 'text-red-500' : 'text-white'}`}>
                            {matchTime.minutes.toString().padStart(2, '0')}:{matchTime.seconds.toString().padStart(2, '0')}
                        </div>
                        {isPenaltyCorner && <span className="text-[9px] font-bold text-red-500 pl-2 uppercase tracking-wide animate-pulse">STOP P.C.</span>}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                         <select 
                            value={matchTime.period} 
                            onChange={(e) => onSetPeriod(e.target.value as MatchTime['period'])}
                            className="bg-neutral-900 border border-white/10 text-[10px] rounded px-1 py-1 h-8 outline-none text-gray-300"
                        >
                            <option value="1MT">1MT</option>
                            <option value="MT">MT</option>
                            <option value="2MT">2MT</option>
                            <option value="FIN">FIN</option>
                         </select>

                        <button onClick={onResetTimer} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded"><RotateCcw size={14}/></button>
                        
                        {/* PC Toggle */}
                        <button 
                            onClick={onTogglePenaltyCorner}
                            title="Arrêt Petit Corner"
                            className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${isPenaltyCorner ? 'bg-red-600 hover:bg-red-500 animate-pulse' : 'bg-neutral-700 hover:bg-neutral-600'}`}
                        >
                             <OctagonAlert size={14} />
                        </button>

                        <button 
                            onClick={onToggleTimer}
                            disabled={isPenaltyCorner}
                            className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${timerRunning && !isPenaltyCorner ? 'bg-amber-600 hover:bg-amber-500' : 'bg-green-600 hover:bg-green-500'} ${isPenaltyCorner ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {timerRunning ? <Pause size={14} fill="currentColor"/> : <Play size={14} fill="currentColor"/>}
                        </button>
                    </div>
                </div>

                {/* Score Controls */}
                <div className="grid grid-cols-2 gap-3">
                    {/* Home Control */}
                    <div className="flex flex-col bg-neutral-800/30 p-2 rounded border-l-2 border-white/10" style={{borderLeftColor: homeTeam.primaryColor}}>
                        <div className="flex justify-between items-center mb-1">
                             <div className="text-[10px] font-bold text-gray-400">{homeTeam.shortName || 'DOM'}</div>
                             <div className="text-[9px] text-gray-500">{homeTeam.name.substring(0, 10)}...</div>
                        </div>
                        <div className="flex items-center space-x-2 mb-2">
                            <button onClick={() => onUpdateScore('home', -1)} className="w-8 h-8 rounded bg-neutral-700 hover:bg-neutral-600 flex items-center justify-center"><Minus size={14}/></button>
                            <span className="text-2xl font-black w-8 text-center">{homeTeam.score}</span>
                            <button onClick={() => onUpdateScore('home', 1)} className="w-8 h-8 rounded bg-blue-600 hover:bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-900/50"><Plus size={14}/></button>
                        </div>
                        <div className="h-px bg-white/5 w-full my-1"></div>
                        <CardControls team={homeTeam} onAddCard={onAddCard} onRemoveCard={onRemoveCard} />
                    </div>

                    {/* Away Control */}
                    <div className="flex flex-col bg-neutral-800/30 p-2 rounded border-l-2 border-white/10" style={{borderLeftColor: awayTeam.primaryColor}}>
                        <div className="flex justify-between items-center mb-1">
                             <div className="text-[10px] font-bold text-gray-400">{awayTeam.shortName || 'EXT'}</div>
                             <div className="text-[9px] text-gray-500">{awayTeam.name.substring(0, 10)}...</div>
                        </div>
                        <div className="flex items-center space-x-2 mb-2">
                            <button onClick={() => onUpdateScore('away', -1)} className="w-8 h-8 rounded bg-neutral-700 hover:bg-neutral-600 flex items-center justify-center"><Minus size={14}/></button>
                            <span className="text-2xl font-black w-8 text-center">{awayTeam.score}</span>
                            <button onClick={() => onUpdateScore('away', 1)} className="w-8 h-8 rounded bg-blue-600 hover:bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-900/50"><Plus size={14}/></button>
                        </div>
                        <div className="h-px bg-white/5 w-full my-1"></div>
                        <CardControls team={awayTeam} onAddCard={onAddCard} onRemoveCard={onRemoveCard} />
                    </div>
                </div>
            </div>
        )}

        {/* === SETUP TAB === */}
        {activeTab === 'setup' && (
            <div>
                <TeamSetupInput label="Domicile" team={homeTeam} onUpdate={(f, v) => onUpdateTeam('home', f, v)} />
                <TeamSetupInput label="Extérieur" team={awayTeam} onUpdate={(f, v) => onUpdateTeam('away', f, v)} />
            </div>
        )}

      </div>
    </div>
  );
};
