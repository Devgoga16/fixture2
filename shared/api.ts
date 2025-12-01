/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

/**
 * Tournament types
 */
export interface Team {
  id: string;
  name: string;
}

export interface Match {
  id: string;
  round: number;
  position: number;
  team1: Team | null;
  team2: Team | null;
  score1: number | null;
  score2: number | null;
  winner: Team | null;
  completed: boolean;
}

export interface Bracket {
  rounds: Match[][];
  totalTeams: number;
}

export interface TournamentData {
  id: string;
  name: string;
  status: "draft" | "in_progress" | "completed";
  total_teams: number;
  teams: Team[];
  bracket: Bracket;
  created_at: string;
  updated_at: string;
}

export interface CreateTournamentRequest {
  name: string;
  teams: Array<{ name: string }>;
}

export interface UpdateMatchRequest {
  score1: number;
  score2: number;
}

export interface UpdateMatchResponse {
  bracket: Bracket;
  match: Match;
}
