import { CricketPlayer, LeaderboardEntry } from '@/types/index';

export const CRICKET_PLAYERS: CricketPlayer[] = [
  // KK Team
  { id: 'kk_1', name: 'Ishan Kishan', team: 'KK', role: 'WK', credits: 9.5, selPct: 87, fantasyPoints: 0 },
  { id: 'kk_2', name: 'Mukesh Choudhary', team: 'KK', role: 'BOWL', credits: 8.5, selPct: 62, fantasyPoints: 0 },
  { id: 'kk_3', name: 'Rohit Sharma', team: 'KK', role: 'BAT', credits: 10.5, selPct: 95, fantasyPoints: 0 },
  { id: 'kk_4', name: 'Suryakumar Yadav', team: 'KK', role: 'BAT', credits: 9.0, selPct: 88, fantasyPoints: 0 },

  // LQ Team
  { id: 'lq_1', name: 'Sanju Samson', team: 'LQ', role: 'WK', credits: 9.0, selPct: 79, fantasyPoints: 0 },
  { id: 'lq_2', name: 'Yuzvendra Chahal', team: 'LQ', role: 'BOWL', credits: 8.0, selPct: 71, fantasyPoints: 0 },
  { id: 'lq_3', name: 'Jos Buttler', team: 'LQ', role: 'BAT', credits: 9.5, selPct: 85, fantasyPoints: 0 },
  { id: 'lq_4', name: 'Riyan Parag', team: 'LQ', role: 'BAT', credits: 7.5, selPct: 64, fantasyPoints: 0 },

  // IU Team
  { id: 'iu_1', name: 'MS Dhoni', team: 'IU', role: 'WK', credits: 10.0, selPct: 92, fantasyPoints: 0 },
  { id: 'iu_2', name: 'Ravichandran Ashwin', team: 'IU', role: 'BOWL', credits: 8.5, selPct: 77, fantasyPoints: 0 },
  { id: 'iu_3', name: 'Ruturaj Gaikwad', team: 'IU', role: 'BAT', credits: 8.5, selPct: 83, fantasyPoints: 0 },
  { id: 'iu_4', name: 'Shivam Dube', team: 'IU', role: 'AR', credits: 7.0, selPct: 58, fantasyPoints: 0 },

  // PZ Team
  { id: 'pz_1', name: 'Rishabh Pant', team: 'PZ', role: 'WK', credits: 9.5, selPct: 91, fantasyPoints: 0 },
  { id: 'pz_2', name: 'Axar Patel', team: 'PZ', role: 'AR', credits: 8.0, selPct: 72, fantasyPoints: 0 },
  { id: 'pz_3', name: 'David Warner', team: 'PZ', role: 'BAT', credits: 9.0, selPct: 84, fantasyPoints: 0 },
  { id: 'pz_4', name: 'Marco Jansen', team: 'PZ', role: 'AR', credits: 7.5, selPct: 61, fantasyPoints: 0 },

  // MS Team
  { id: 'ms_1', name: 'Jasprit Bumrah', team: 'MS', role: 'BOWL', credits: 9.5, selPct: 89, fantasyPoints: 0 },
  { id: 'ms_2', name: 'Hardik Pandya', team: 'MS', role: 'AR', credits: 8.5, selPct: 86, fantasyPoints: 0 },
  { id: 'ms_3', name: 'Virat Kohli', team: 'MS', role: 'BAT', credits: 10.5, selPct: 96, fantasyPoints: 0 },
  { id: 'ms_4', name: 'Akash Madhwal', team: 'MS', role: 'BOWL', credits: 7.0, selPct: 52, fantasyPoints: 0 },

  // QG Team
  { id: 'qg_1', name: 'KL Rahul', team: 'QG', role: 'WK', credits: 9.0, selPct: 81, fantasyPoints: 0 },
  { id: 'qg_2', name: 'Mohammed Shami', team: 'QG', role: 'BOWL', credits: 8.5, selPct: 75, fantasyPoints: 0 },
  { id: 'qg_3', name: 'Sunrisers Hyderabad', team: 'QG', role: 'BAT', credits: 8.0, selPct: 73, fantasyPoints: 0 },
  { id: 'qg_4', name: 'Mayank Agarwal', team: 'QG', role: 'BAT', credits: 7.5, selPct: 68, fantasyPoints: 0 },
];

export const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, userId: 'user_1', userName: 'CryptoLord', squadName: 'Dragon Riders', totalPoints: 2145, change: 2, isCurrentUser: false },
  { rank: 2, userId: 'user_2', userName: 'Web3Pro', squadName: 'Elite Squad', totalPoints: 2098, change: 1, isCurrentUser: false },
  { rank: 3, userId: 'current_user', userName: 'You', squadName: 'My Arena', totalPoints: 1987, change: 3, isCurrentUser: true },
  { rank: 4, userId: 'user_4', userName: 'NFTNinja', squadName: 'Metaverse Team', totalPoints: 1956, change: -1, isCurrentUser: false },
  { rank: 5, userId: 'user_5', userName: 'BlockChain', squadName: 'Chain Gang', totalPoints: 1923, change: 4, isCurrentUser: false },
  { rank: 6, userId: 'user_6', userName: 'DeFiDegen', squadName: 'Yield Farmers', totalPoints: 1891, change: 0, isCurrentUser: false },
  { rank: 7, userId: 'user_7', userName: 'VaultKeeper', squadName: 'Safe House', totalPoints: 1834, change: -2, isCurrentUser: false },
  { rank: 8, userId: 'user_8', userName: 'TokenMaster', squadName: 'Golden Coins', totalPoints: 1812, change: 5, isCurrentUser: false },
];

export const TEAM_COLORS: Record<string, string> = {
  KK: 'bg-blue-600',
  LQ: 'bg-pink-600',
  IU: 'bg-yellow-600',
  PZ: 'bg-purple-600',
  MS: 'bg-red-600',
  QG: 'bg-orange-600',
};

export const ROLE_LABELS: Record<string, string> = {
  WK: 'Wicket Keeper',
  BAT: 'Batter',
  AR: 'All-rounder',
  BOWL: 'Bowler',
};
