export type TournamentCategory =
  | "MD_A"
  | "MD_B"
  | "XD_A"
  | "XD_B"
  | "WD_OPEN";

export const CATEGORY_LABELS: Record<TournamentCategory, string> = {
  MD_A: "Men's Doubles - Class A",
  MD_B: "Men's Doubles - Class B",
  XD_A: "Mixed Doubles - Class A",
  XD_B: "Mixed Doubles - Class B",
  WD_OPEN: "Women's Doubles - Open",
};

export const CATEGORY_SHORT: Record<TournamentCategory, string> = {
  MD_A: "MD (A)",
  MD_B: "MD (B)",
  XD_A: "XD (A)",
  XD_B: "XD (B)",
  WD_OPEN: "WD (Open)",
};

export type MatchRound =
  | "Group Match"
  | "Round of 32"
  | "Round of 16"
  | "Quarter-Final"
  | "Semi-Final"
  | "Final";

export type MatchStage = "round_robin" | "knockout";

export interface SetScore {
  teamA: number;
  teamB: number;
}

export interface BaseMatch {
  matchId: string;
  category: TournamentCategory;
  round: MatchRound;
  stage: MatchStage;
  groupName?: string;
  teamA: string;
  teamB: string;
  isSemiOrFinal: boolean;
  courtNumber?: number | null;
  scheduledTime: string;
}

export interface ScheduledMatch extends BaseMatch {
  status: "scheduled";
}

export interface OngoingMatch extends BaseMatch {
  status: "ongoing";
  courtNumber: number;
  currentSet: 1 | 2 | 3;
  setScores: SetScore[];
  currentScore: SetScore;
  servingTeam: "teamA" | "teamB";
  servingCourtSide: "right" | "left";
  startTime: string;
  lastUpdated: string;
  isDeuce: boolean;
  isGamePoint?: "teamA" | "teamB" | null;
  isMatchPoint?: "teamA" | "teamB" | null;
}

export interface FinishedMatch extends BaseMatch {
  status: "finished";
  courtNumber: number | null;
  finalScores: SetScore[];
  winnerTeam: string;
  completedAt: string;
  finishReason?: "normal" | "walkover" | "retired";
}

export type Match = ScheduledMatch | OngoingMatch | FinishedMatch;

export interface TeamStanding {
  team: string;
  category: TournamentCategory;
  groupName?: string;
  played: number;
  won: number;
  lost: number;
  setsWon: number;
  setsLost: number;
  setDifferential: number;
  pointsWon: number;
  pointsLost: number;
  pointDifferential: number;
  rank?: number;
}

export interface CourtAssignment {
  courtNumber: number;
  currentMatchId: string | null;
}

export interface TournamentState {
  version: number;
  lastEventId: number;
  isConfigured: boolean;
  categoryTeams?: Record<TournamentCategory, string[]>;
  matches: Match[];
  courts: CourtAssignment[];
  retentionQueueHeld: boolean;
  lastUpdated: string;
}

export type MatchAction =
  | { type: "AWARD_POINT"; matchId: string; team: "teamA" | "teamB" }
  | { type: "SUBTRACT_POINT"; matchId: string; team: "teamA" | "teamB" }
  | { type: "SWITCH_SERVER"; matchId: string }
  | { type: "START_MATCH"; matchId: string; courtNumber: number }
  | { type: "REASSIGN_COURT"; matchId: string; newCourtNumber: number }
  | { type: "WALKOVER"; matchId: string; winner: "teamA" | "teamB"; reason: "walkover" | "retired" }
  | { type: "FAST_FINISH_MATCH"; matchId: string }
  | { type: "RESTORE_STATE"; state: TournamentState }
  | { type: "TOGGLE_RETENTION_QUEUE"; held: boolean }
  | { type: "CONFIGURE_AND_START_TOURNAMENT"; categoryTeams: Record<TournamentCategory, string[]> }
  | { type: "RESET_TO_SETUP" }
  | { type: "RESET_TOURNAMENT" };

export interface SyncMutation {
  id: string;
  timestamp: number;
  action: MatchAction;
  synced: boolean;
}
