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
 * Search DNI information directly from APIs.net.pe
 */
export async function searchDNI(numero: string): Promise<{
  nombre: string;
  numeroDocumento: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  nombres: string;
}> {
  const response = await fetch(`https://api.apis.net.pe/v1/dni?numero=${numero}`, {
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${import.meta.env.VITE_DNI_API_TOKEN}`,
    },
  });

  if (!response.ok) {
    throw new Error('No se pudo consultar el DNI');
  }

  return response.json();
}
