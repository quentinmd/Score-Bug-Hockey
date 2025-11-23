
import React, { useState, useEffect, useCallback } from 'react';
import { L1ScoreBug } from './components/L1ScoreBug';
import { ControlPanel } from './components/ControlPanel';
import { Team, MatchTime, Card, CardType } from './types';
import { v4 as uuidv4 } from 'uuid'; // Usually we'd import this, but using simple random ID for this env

// Simple ID generator if uuid not available
const generateId = () => Math.random().toString(36).substr(2, 9);

const INITIAL_HOME: Team = {
  id: 'home',
  name: 'Lille M.H.C',
  shortName: 'Lille',
  triCode: 'LIL',
  primaryColor: '#e11d48',
  score: 0,
  isHome: true,
  cards: []
};

const INITIAL_AWAY: Team = {
  id: 'away',
  name: 'CA Montrouge 92',
  shortName: 'Montrouge',
  triCode: 'CAM',
  primaryColor: '#f97316',
  score: 0,
  isHome: false,
  cards: []
};

const App: React.FC = () => {
  const [homeTeam, setHomeTeam] = useState<Team>(INITIAL_HOME);
  const [awayTeam, setAwayTeam] = useState<Team>(INITIAL_AWAY);
  const [isVisible, setIsVisible] = useState(true);
  
  // Timer State
  const [timerRunning, setTimerRunning] = useState(false);
  const [isPenaltyCorner, setIsPenaltyCorner] = useState(false); // New state for PC
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [matchPeriod, setMatchPeriod] = useState<MatchTime['period']>('1MT');

  // Main Timer Logic (Includes Card Decrement)
  useEffect(() => {
    let interval: number;
    
    // Only run if Timer is ON AND NOT in Penalty Corner mode (PC stops clock in indoor)
    if (timerRunning && !isPenaltyCorner) {
      interval = window.setInterval(() => {
        // 1. Update Match Time
        setSecondsElapsed(prev => prev + 1);

        // 2. Update Home Cards
        setHomeTeam(prev => ({
            ...prev,
            cards: prev.cards.map(c => {
                if (c.type === 'RED') return c; // Red doesn't expire
                if (c.timeLeft <= 0) return c; // Already done
                return { ...c, timeLeft: c.timeLeft - 1 };
            }).filter(c => c.type === 'RED' || c.timeLeft > 0) // Remove expired
        }));

        // 3. Update Away Cards
        setAwayTeam(prev => ({
            ...prev,
            cards: prev.cards.map(c => {
                if (c.type === 'RED') return c;
                if (c.timeLeft <= 0) return c;
                return { ...c, timeLeft: c.timeLeft - 1 };
            }).filter(c => c.type === 'RED' || c.timeLeft > 0)
        }));

      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning, isPenaltyCorner]);

  const getMatchTime = useCallback((): MatchTime => {
    const minutes = Math.floor(secondsElapsed / 60);
    const seconds = secondsElapsed % 60;
    
    let extraTime = undefined;
    // Basic rules for display
    if (matchPeriod === '1MT' && minutes >= 20) extraTime = 0; // Indoor is often 20min halves
    if (matchPeriod === '2MT' && minutes >= 40) extraTime = 0;

    return {
      minutes,
      seconds,
      period: matchPeriod,
      extraTime
    };
  }, [secondsElapsed, matchPeriod]);

  // Handlers
  const handleScoreUpdate = (teamId: string, delta: number) => {
    if (teamId === 'home') {
      setHomeTeam(prev => ({ ...prev, score: Math.max(0, prev.score + delta) }));
    } else {
      setAwayTeam(prev => ({ ...prev, score: Math.max(0, prev.score + delta) }));
    }
  };

  const handleTeamUpdate = (teamId: string, field: keyof Team, value: string) => {
    const updateFn = (prev: Team) => ({ ...prev, [field]: value });
    if (teamId === 'home') setHomeTeam(updateFn);
    else setAwayTeam(updateFn);
  };

  const handleAddCard = (teamId: string, type: CardType, durationMinutes: number) => {
    const newCard: Card = {
        id: generateId(),
        type,
        initialDuration: durationMinutes * 60,
        timeLeft: durationMinutes * 60
    };

    const updateFn = (prev: Team) => ({ ...prev, cards: [...prev.cards, newCard] });
    if (teamId === 'home') setHomeTeam(updateFn);
    else setAwayTeam(updateFn);
  };

  const handleRemoveCard = (teamId: string) => {
      // Remove the oldest card or specific logic? Let's remove the last added for simplicity or clear all?
      // For this UI, let's just clear the last one (Undo style)
      const updateFn = (prev: Team) => {
          const newCards = [...prev.cards];
          newCards.pop();
          return { ...prev, cards: newCards };
      };
      if (teamId === 'home') setHomeTeam(updateFn);
      else setAwayTeam(updateFn);
  }

  const handleResetTimer = () => {
    setSecondsElapsed(0);
    setTimerRunning(false);
    setIsPenaltyCorner(false);
    setMatchPeriod('1MT');
    // Also reset cards? Maybe. Let's keep cards for now unless page refresh.
    setHomeTeam(prev => ({ ...prev, cards: [] }));
    setAwayTeam(prev => ({ ...prev, cards: [] }));
  };

  return (
    <div className="relative w-full h-screen bg-neutral-900 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1577416412292-766dde4b8f52?q=80&w=2070&auto=format&fit=crop" 
          alt="Hockey Field Background" 
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
      </div>

      <L1ScoreBug 
        homeTeam={homeTeam} 
        awayTeam={awayTeam} 
        matchTime={getMatchTime()} 
        show={isVisible}
      />

      <ControlPanel 
        homeTeam={homeTeam}
        awayTeam={awayTeam}
        matchTime={getMatchTime()}
        timerRunning={timerRunning}
        isPenaltyCorner={isPenaltyCorner}
        onUpdateScore={handleScoreUpdate}
        onUpdateTeam={handleTeamUpdate}
        onToggleTimer={() => setTimerRunning(!timerRunning)}
        onTogglePenaltyCorner={() => setIsPenaltyCorner(!isPenaltyCorner)}
        onResetTimer={handleResetTimer}
        onToggleVisibility={() => setIsVisible(!isVisible)}
        isVisible={isVisible}
        onSetPeriod={setMatchPeriod}
        onAddCard={handleAddCard}
        onRemoveCard={handleRemoveCard}
      />
      
      <div className="fixed bottom-2 right-4 text-white/30 text-xs font-mono select-none">
        INDOOR HOCKEY BROADCAST SYSTEM v2.2
      </div>
    </div>
  );
};

export default App;
