import { apiCall } from "@/config/api";
import {
  Team,
  Bracket,
  Match,
  TournamentData,
  TournamentListItem,
  CreateTournamentRequest,
  UpdateMatchRequest,
} from "@shared/api";

// Re-export types for convenience
export type { TournamentData, CreateTournamentRequest, UpdateMatchRequest };

export interface Player {
  id: string;
  fullName: string;
  dni: string;
  createdAt: string;
}

export interface TeamWithPlayers extends Team {
  position: number;
  delegado: {
    nombre: string | null;
    telefono: string | null;
  };
  players: Player[];
  playersCount: number;
}

export interface FullMatchResponse {
  success: boolean;
  match: {
    id: string;
    tournament: {
      id: string;
      name: string;
      status: string;
      totalTeams: number;
    };
    round: number;
    roundName: string;
    position: number;
    team1: TeamWithPlayers | null;
    team2: TeamWithPlayers | null;
    score1: number | null;
    score2: number | null;
    winner: Team | null;
    status: "created" | "scheduled" | "in_progress" | "completed";
    scheduledTime: string | null;
    completed: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

/**
 * Create a new tournament
 */
export async function createTournament(
  data: CreateTournamentRequest,
): Promise<TournamentData> {
  return apiCall<TournamentData>("/tournaments", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * List all tournaments
 */
export async function getTournaments(): Promise<TournamentListItem[]> {
  return apiCall<TournamentListItem[]>("/tournaments");
}

/**
 * Get a tournament by ID
 */
export async function getTournament(id: string): Promise<TournamentData> {
  return apiCall<TournamentData>(`/tournaments/${id}`);
}

/**
 * List all tournaments (deprecated, use getTournaments instead)
 */
export async function listTournaments(): Promise<TournamentData[]> {
  return apiCall<TournamentData[]>("/tournaments");
}

/**
 * Update a match result
 */
export async function updateMatchResult(
  tournamentId: string,
  matchId: string,
  data: UpdateMatchRequest,
) {
  return apiCall<{
    bracket: Bracket;
    match: Match;
  }>(`/tournaments/${tournamentId}/matches/${matchId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/**
 * Reset a tournament (clear all results)
 */
export async function resetTournament(
  tournamentId: string,
): Promise<TournamentData> {
  return apiCall<TournamentData>(
    `/tournaments/${tournamentId}/reset`,
    {
      method: "POST",
    },
  );
}

/**
 * Delete a tournament
 */
export async function deleteTournament(tournamentId: string): Promise<void> {
  return apiCall(`/tournaments/${tournamentId}`, {
    method: "DELETE",
  });
}

/**
 * Get full match data with players
 */
export async function getFullMatch(matchId: string): Promise<FullMatchResponse> {
  return apiCall<FullMatchResponse>(`/matches/${matchId}/full`);
}

/**
 * Start a match
 */
export async function startMatch(matchId: string): Promise<{ success: boolean; match: any }> {
  return apiCall<{ success: boolean; match: any }>(`/matches/${matchId}/status`, {
    method: "PUT",
    body: JSON.stringify({ status: "in_progress" }),
  });
}

/**
 * Pause a match
 */
export async function pauseMatch(matchId: string): Promise<{ success: boolean; match: any }> {
  return apiCall<{ success: boolean; match: any }>(`/matches/${matchId}/status`, {
    method: "PUT",
    body: JSON.stringify({ status: "scheduled" }),
  });
}

/**
 * Update match score
 */
export async function updateMatchScore(
  matchId: string,
  score1: number,
  score2: number
): Promise<{ success: boolean; match: any }> {
  return apiCall<{ success: boolean; match: any }>(`/matches/${matchId}/score`, {
    method: "PUT",
    body: JSON.stringify({ score1, score2 }),
  });
}

/**
 * Finish a match
 */
export async function finishMatch(
  tournamentId: string,
  matchId: string,
  score1: number,
  score2: number
): Promise<{ success: boolean; match: any; bracket: Bracket }> {
  return apiCall<{ success: boolean; match: any; bracket: Bracket }>(`/tournaments/${tournamentId}/matches/${matchId}`, {
    method: "PUT",
    body: JSON.stringify({ score1, score2 }),
  });
}

/**
 * Update match schedule
 */
export async function updateMatchSchedule(
  matchId: string,
  scheduledTime: string
): Promise<{ success: boolean; match: any }> {
  return apiCall<{ success: boolean; match: any }>(`/matches/${matchId}/status`, {
    method: "PUT",
    body: JSON.stringify({ 
      status: "scheduled",
      scheduledTime 
    }),
  });
}
