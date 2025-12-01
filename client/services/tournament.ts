import { apiCall } from "@/config/api";
import {
  Team,
  Bracket,
  Match,
  TournamentData,
  CreateTournamentRequest,
  UpdateMatchRequest,
} from "@shared/api";

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
