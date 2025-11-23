
export type CardType = 'GREEN' | 'YELLOW' | 'RED';

export interface Card {
  id: string;
  type: CardType;
  timeLeft: number; // in seconds
  initialDuration: number; // to calculate progress if needed
}

export interface Team {
  id: string;
  name: string;      // Full name (e.g. Paris Saint-Germain)
  shortName: string; // Short name for display after intro (e.g. Paris)
  triCode: string;   // Broadcast code (e.g. PSG)
  primaryColor: string; // Jersey color indicator
  score: number;
  isHome: boolean;
  cards: Card[];
}

export interface MatchTime {
  minutes: number;
  seconds: number;
  period: '1MT' | '2MT' | 'MT' | 'FIN';
  extraTime?: number;
}
