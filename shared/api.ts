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
  status: "created" | "scheduled" | "in_progress" | "finished";
  scheduledTime: string | null;
}

export interface Bracket {
  rounds: Match[][];
  totalTeams: number;
}

export interface TournamentData {
  id: string;
  name: string;
  status: "draft" | "in_progress" | "completed";
  totalTeams: number;
  teams: Team[];
  bracket: Bracket;
  createdAt: string;
  updatedAt: string;
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

/**
 * Tournament list item from GET /api/tournaments
 */
export interface TournamentListItem {
  id: string;
  name: string;
  status: "draft" | "in_progress" | "completed";
  totalTeams: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Player types
 */
export interface Player {
  id: string;
  fullName: string;
  dni: string;
  createdAt: string;
}

export interface TeamPlayersResponse {
  team: {
    id: string;
    name: string;
    position: number;
    delegado: {
      nombre: string | null;
      telefono: string | null;
    };
    tournament: {
      id: string;
      name: string;
      status: string;
    };
    createdAt: string;
    updatedAt: string;
  };
  players: Player[];
  totalPlayers: number;
}
