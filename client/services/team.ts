import { apiCall } from "@/config/api";
import { TeamPlayersResponse } from "@shared/api";

/**
 * Get team players
 */
export async function getTeamPlayers(teamId: string): Promise<TeamPlayersResponse> {
  return apiCall<TeamPlayersResponse>(`/teams/${teamId}/players`);
}

/**
 * Add players to a team
 */
export async function addPlayers(
  teamId: string,
  players: Array<{ fullName: string; dni: string }>
): Promise<void> {
  return apiCall<void>(`/teams/${teamId}/players`, {
    method: "POST",
    body: JSON.stringify({ players }),
  });
}

/**
 * Search DNI information
 */
export async function searchDNI(numero: string): Promise<{
  nombre: string;
  numeroDocumento: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  nombres: string;
}> {
  return apiCall(`/dni/search?numero=${numero}`);
}
