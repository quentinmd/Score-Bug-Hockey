import React, { useEffect, useState, useRef } from 'react';
import { Team, MatchTime, Card } from '../types';

interface L1ScoreBugProps {
  homeTeam: Team;
  awayTeam: Team;
  matchTime: MatchTime;
  show: boolean;
}

// Composant pour le chiffre du score avec effet 3D Flip
const AnimatedNumber = ({ value }: { value: number }) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [flip, setFlip] = useState(false);

  useEffect(() => {
    if (value !== displayValue) {
      setFlip(true);
      const timer = setTimeout(() => {
        setDisplayValue(value);
        setFlip(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [value, displayValue]);

  return (
    <div className="perspective-container w-10 h-8 flex justify-center items-center">
      <div className={`text-2xl font-semibold transition-all duration-500 transform-style-3d ${flip ? 'rotate-x-90 opacity-50' : 'rotate-x-0 opacity-100'}`}>
        {value}
      </div>
    </div>
  );
};

// Composant pour afficher un carton individuel
const CardDisplay = ({ card }: { card: Card }) => {
    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    let bgClass = '';
    let textClass = '';

    switch (card.type) {
        case 'GREEN': bgClass = 'bg-[#009036]'; textClass = 'text-white'; break; // Vert Hockey
        case 'YELLOW': bgClass = 'bg-[#fbbf24]'; textClass = 'text-black'; break;
        case 'RED': bgClass = 'bg-[#dc2626]'; textClass = 'text-white'; break;
    }

    return (
        <div className={`h-full aspect-square ${bgClass} flex items-center justify-center ml-0.5 animate-flip-in relative overflow-hidden shadow-sm border-l border-white/10`}>
            {card.type !== 'RED' ? (
                 <span className={`text-[10px] font-bold leading-none ${textClass} font-mono tracking-tighter`}>
                    {formatTime(card.timeLeft)}
                 </span>
            ) : (
                <div className="w-2 h-2 bg-white rounded-full"></div> // Red card indicator
            )}
        </div>
    );
};

export const L1ScoreBug: React.FC<L1ScoreBugProps> = ({ homeTeam, awayTeam, matchTime, show }) => {
  const [displayHomeScore, setDisplayHomeScore] = useState(homeTeam.score);
  const [displayAwayScore, setDisplayAwayScore] = useState(awayTeam.score);
  const [goalState, setGoalState] = useState<'NONE' | 'HOME' | 'AWAY'>('NONE');
  
  // Name Display Logic (Full vs Short)
  const [showFullNames, setShowFullNames] = useState(true);

  // Trigger name transition on mount/show
  useEffect(() => {
      if (show) {
          setShowFullNames(true);
          const timer = setTimeout(() => {
              setShowFullNames(false);
          }, 6000); // 6 seconds delay
          return () => clearTimeout(timer);
      }
  }, [show]);

  const prevHomeScore = useRef(homeTeam.score);
  const prevAwayScore = useRef(awayTeam.score);

  useEffect(() => {
    if (homeTeam.score > prevHomeScore.current) {
      triggerGoalSequence('HOME', homeTeam.score);
      prevHomeScore.current = homeTeam.score;
    } 
    else if (awayTeam.score > prevAwayScore.current) {
      triggerGoalSequence('AWAY', awayTeam.score);
      prevAwayScore.current = awayTeam.score;
    } 
    else if (homeTeam.score < prevHomeScore.current) {
        setDisplayHomeScore(homeTeam.score);
        prevHomeScore.current = homeTeam.score;
    }
    else if (awayTeam.score < prevAwayScore.current) {
        setDisplayAwayScore(awayTeam.score);
        prevAwayScore.current = awayTeam.score;
    }
  }, [homeTeam.score, awayTeam.score]);

  const triggerGoalSequence = (team: 'HOME' | 'AWAY', newScore: number) => {
    setGoalState(team);
    setTimeout(() => {
      if (team === 'HOME') setDisplayHomeScore(newScore);
      else setDisplayAwayScore(newScore);
    }, 1500);
    setTimeout(() => {
      setGoalState('NONE');
    }, 4500);
  };

  // --- CALCUL DYNAMIQUE DE LA LARGEUR (Pixel-Perfect) ---
  const LAYOUT_PADDING = 10; // Réduit pour être plus compact
  const SCORE_AREA_WIDTH = 50; 
  const CARD_WIDTH = 40; 
  
  // Largeur moyenne d'un caractère (Ajusté pour être serré)
  const CHAR_WIDTH_LONG = 8; 
  const CHAR_WIDTH_SHORT = 11; 

  // Gestion des cartons
  const maxCards = Math.max(homeTeam.cards.length, awayTeam.cards.length);
  const cardsExtraWidth = maxCards * CARD_WIDTH;

  // Calcul Longueur Noms
  const longNameLen = Math.max(homeTeam.name.length, awayTeam.name.length);
  const shortNameLen = Math.max((homeTeam.shortName || homeTeam.triCode).length, (awayTeam.shortName || awayTeam.triCode).length);

  // Calcul Largeurs Totales requises
  const requiredWidthLong = (longNameLen * CHAR_WIDTH_LONG) + SCORE_AREA_WIDTH + LAYOUT_PADDING + cardsExtraWidth;
  const requiredWidthShort = (shortNameLen * CHAR_WIDTH_SHORT) + SCORE_AREA_WIDTH + LAYOUT_PADDING + cardsExtraWidth;

  const finalLongWidth = Math.max(requiredWidthLong, 130); 
  const finalShortWidth = Math.max(requiredWidthShort, 110); 

  const currentWidthVal = showFullNames ? finalLongWidth : finalShortWidth;
  const currentWidth = `${currentWidthVal}px`;

  return (
    <div className="fixed top-8 left-8 select-none filter drop-shadow-xl z-50">
      <div className="flex flex-col relative">
        
        {/* TOP ROW (Logo + Scores) */}
        <div className="flex relative z-30 h-20">
            {/* Logo Layer (Z-40) - Anchor */}
            {/* Changed translateY to -250% to ensure it fully clears screen and shadows */}
            <div 
                className={`w-20 bg-white flex items-center justify-center relative overflow-hidden border-r border-gray-200 shrink-0 z-40 transition-transform duration-700 ease-broadcast ${show ? 'translate-y-0' : '-translate-y-[250%]'}`}
                style={{ transitionDelay: show ? '0ms' : '900ms' }}
            >
                <img 
                    src="https://upload.wikimedia.org/wikipedia/fr/5/58/Logo_F%C3%A9d%C3%A9ration_Fran%C3%A7aise_Hockey_2020.svg"
                    alt="FF Hockey"
                    className="w-14 h-14 object-contain z-10 relative"
                />
            </div>

            {/* Scores Layer (Z-30) - Wipes out from Logo */}
            {/* Added strict transition delays to wait for logo */}
            <div 
                className={`relative z-30 overflow-hidden transition-[width] duration-700 ease-broadcast`}
                style={{ 
                    width: show ? currentWidth : '0px',
                    transitionDelay: show ? '600ms' : '400ms'
                }}
            >
                 {/* Inner Container fixed to calculated width to prevent squashing during wipe */}
                 <div style={{ width: currentWidth }} className="flex flex-col h-full absolute top-0 left-0 transition-all duration-1000 ease-broadcast">
                    
                    {/* Home Row */}
                    <div className={`flex-1 flex items-center justify-between text-white relative transition-colors duration-300 border-b border-white/5 ${goalState === 'HOME' ? 'bg-[#0a4d2e]' : 'bg-[#1a1a1a]'}`}>
                        {goalState === 'HOME' && <div className="absolute inset-0 bg-white/20 animate-goal-bg z-0"></div>}
                        
                        <div className="pl-3 font-bold tracking-wide uppercase z-10 flex-1 flex items-center h-full overflow-hidden whitespace-nowrap">
                            {goalState === 'HOME' ? (
                                <span className="text-[#F4C430] font-black italic tracking-widest animate-goal-text text-xl">BUT !!!</span>
                            ) : (
                                <div className="flex flex-col justify-center h-full w-full">
                                    <span className={`truncate transition-all duration-1000 ${showFullNames ? 'text-sm' : 'text-lg'}`}>
                                        {showFullNames ? homeTeam.name : (homeTeam.shortName || homeTeam.triCode)}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center h-full z-10 shrink-0 ml-2">
                            <AnimatedNumber value={displayHomeScore} />
                            <div className="h-full w-2 shadow-[inset_1px_0_4px_rgba(0,0,0,0.5)]" style={{ backgroundColor: homeTeam.primaryColor }}></div>
                            
                            {/* Penalty Cards */}
                            <div className="flex h-full bg-[#121212]">
                                {homeTeam.cards.map(card => <CardDisplay key={card.id} card={card} />)}
                            </div>
                        </div>
                    </div>

                    {/* Away Row */}
                    <div className={`flex-1 flex items-center justify-between text-white relative transition-colors duration-300 ${goalState === 'AWAY' ? 'bg-[#0a4d2e]' : 'bg-[#262626]'}`}>
                        {goalState === 'AWAY' && <div className="absolute inset-0 bg-white/20 animate-goal-bg z-0"></div>}

                        <div className="pl-3 font-bold tracking-wide uppercase z-10 flex-1 flex items-center h-full overflow-hidden whitespace-nowrap">
                            {goalState === 'AWAY' ? (
                                <span className="text-[#F4C430] font-black italic tracking-widest animate-goal-text text-xl">BUT !!!</span>
                            ) : (
                                <div className="flex flex-col justify-center h-full w-full">
                                    <span className={`truncate transition-all duration-1000 ${showFullNames ? 'text-sm' : 'text-lg'}`}>
                                        {showFullNames ? awayTeam.name : (awayTeam.shortName || awayTeam.triCode)}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center h-full z-10 shrink-0 ml-2">
                            <AnimatedNumber value={displayAwayScore} />
                            <div className="h-full w-2 shadow-[inset_1px_0_4px_rgba(0,0,0,0.5)]" style={{ backgroundColor: awayTeam.primaryColor }}></div>

                            {/* Penalty Cards */}
                            <div className="flex h-full bg-[#121212]">
                                {awayTeam.cards.map(card => <CardDisplay key={card.id} card={card} />)}
                            </div>
                        </div>
                    </div>
                 </div>
            </div>
        </div>

        {/* BOTTOM ROW (Timer) - Layer Z-20 */}
        {/* Added strict staggering. Intro: Wait 1200ms. Outro: Instant (0ms). */}
        {/* Moves BEHIND scores (negative translate Y) and fades in */}
        <div 
            className={`z-20 relative transition-all duration-500 ease-broadcast ${show ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}
            style={{ 
                transitionDelay: show ? '1200ms' : '0ms',
                marginTop: '-1px' // Slight overlap to fix pixel gaps
            }}
        >
            <div className="flex items-center h-9 w-fit shadow-lg">
                <div className="bg-white text-black px-3 h-full flex items-center justify-center text-xs font-black uppercase min-w-[45px]">
                    {matchTime.period}
                </div>
                
                <div className="bg-[#0f172a] px-3 h-full flex items-center justify-center text-white font-extrabold text-lg tabular-nums tracking-tighter min-w-[70px]">
                    {matchTime.minutes.toString().padStart(2, '0')}:{matchTime.seconds.toString().padStart(2, '0')}
                </div>

                {matchTime.extraTime && matchTime.extraTime > 0 && (
                    <div className="bg-[#eab308] text-black px-2 h-full flex items-center justify-center font-bold text-sm">
                    +{matchTime.extraTime}
                    </div>
                )}
            </div>
        </div>

      </div>
    </div>
  );
};