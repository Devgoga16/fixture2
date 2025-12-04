import { apiCall } from "@/config/api";
import { TeamPlayersResponse } from "@shared/api";

export interface DelegateTeamsResponse {
  success: boolean;
  delegado: {
    phone: string;
    name: string;
  };
  totalTeams: number;
  teams: Array<{
    id: string;
    name: string;
    position: number;
    delegadoNombre: string;
    delegadoTelefono: string;
    tournament: {
      id: string;
      name: string;
      status: string;
    };
    players: Array<{
      id: string;
      fullName: string;
      dni: string;
      createdAt: string;
    }>;
    playersCount: number;
    createdAt: string;
    updatedAt: string;
  }>;
}

/**
 * Get delegate teams
 */
export async function getDelegateTeams(phone: string): Promise<DelegateTeamsResponse> {
  return apiCall<DelegateTeamsResponse>(`/delegado/teams?phone=${phone}`);
}

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
export async function searchDNI(dni: string): Promise<{
  fullName: string;
  dni: string;
  firstName: string;
  lastName: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  nombres: string;
  tipoDocumento: string;
  raw: any;
}> {
  return apiCall(`/dni/${dni}`);
}

/**
 * Update team delegado
 */
export async function updateTeamDelegado(
  teamId: string,
  delegadoNombre: string,
  delegadoTelefono: string
): Promise<{
  success: boolean;
  message: string;
  team: {
    id: string;
    name: string;
    delegado: {
      nombre: string;
      telefono: string;
    };
    tournament: {
      id: string;
      name: string;
    };
    updatedAt: string;
  };
}> {
  return apiCall(`/teams/${teamId}/delegado`, {
    method: "PUT",
    body: JSON.stringify({ delegadoNombre, delegadoTelefono }),
  });
}
