export type Role = 'WK' | 'BAT' | 'AR' | 'BOWL';
export type Team = 'KK' | 'LQ' | 'IU' | 'PZ' | 'MS' | 'QG';
export type UserRole = 'PLAYER' | 'ADMIN';
export type MatchStatus = 'SCHEDULED' | 'LOCKED' | 'LIVE' | 'FINALIZED';
export type ViewType = 'DASHBOARD' | 'ARENA' | 'LEADERBOARD' | 'REWARDS' | 'ADMIN_DASHBOARD' | 'PROTOCOL' | 'MATCH' | 'SCORE' | 'TREASURY';

export interface CricketPlayer {
  id: string;
  name: string;
  team: Team;
  role: Role;
  credits: number;
  selPct: number;
  fantasyPoints: number;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  squadName: string;
  totalPoints: number;
  change: number;
  isCurrentUser: boolean;
}

export interface Squad {
  players: CricketPlayer[];
  captainId: string | null;
  viceCaptainId: string | null;
}

export interface AppState {
  activeView: ViewType;
  userRole: UserRole;
  squad: Squad;
  wireBalance: number;
  matchStatus: MatchStatus;
  livePointsTick: number;
  leaderboard: LeaderboardEntry[];
  selectedPlayerId: string | null;
}
