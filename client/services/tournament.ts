import { apiCall } from "@/config/api";
import { Team, Bracket, Match } from "@/lib/tournament";

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
 * Get a tournament by ID
 */
export async function getTournament(id: string): Promise<TournamentData> {
  return apiCall<TournamentData>(`/tournaments/${id}`);
}

/**
 * List all tournaments
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
): Promise<{
  bracket: Bracket;
  match: Match;
}> {
  return apiCall(`/tournaments/${tournamentId}/matches/${matchId}`, {
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
