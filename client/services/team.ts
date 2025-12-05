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

export interface TeamMatch {
  id: string;
  tournament: {
    id: string;
    name: string;
    status: string;
  };
  round: number;
  roundName: string;
  position: number;
  team1: {
    id: string;
    name: string;
    isMyTeam: boolean;
  };
  team2: {
    id: string;
    name: string;
    isMyTeam: boolean;
  };
  score1: number | null;
  score2: number | null;
  winner: any;
  goals: any[];
  yellowCards: any[];
  status: "created" | "scheduled" | "in_progress" | "finished";
  scheduledTime: string | null;
  completed: boolean;
  result: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TeamMatchesResponse {
  success: boolean;
  teamId: string;
  totalMatches: number;
  matches: TeamMatch[];
}

/**
 * Get team matches for delegates
 */
export async function getTeamMatches(teamId: string): Promise<TeamMatchesResponse> {
  return apiCall<TeamMatchesResponse>(`/matches/team/${teamId}`);
}

export interface Player {
  id: string;
  fullName: string;
  dni: string;
  createdAt: string;
}

export interface GoalRecord {
  id: string;
  player: {
    id: string;
    fullName: string;
    dni: string;
  };
  createdAt: string;
}

export interface YellowCardRecord {
  id: string;
  player: {
    id: string;
    fullName: string;
    dni: string;
  };
  createdAt: string;
}

export interface TeamDetails {
  id: string;
  name: string;
  position: number;
  score: number | null;
  delegado: {
    nombre: string | null;
    telefono: string | null;
  };
  players: Player[];
  playersCount: number;
  goals: GoalRecord[];
  yellowCards: YellowCardRecord[];
}

export interface MatchDetailsResponse {
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
    status: "created" | "scheduled" | "in_progress" | "finished";
    scheduledTime: string | null;
    completed: boolean;
    result: string | null;
    sport?: number;
    sets?: Array<{
      id: string;
      set: number;
      score1: number;
      score2: number;
      status: "in_progress" | "finished";
    }>;
    myTeam: TeamDetails;
    rivalTeam: TeamDetails;
    createdAt: string;
    updatedAt: string;
  };
}

/**
 * Get match details for delegates
 */
export async function getMatchDetails(matchId: string, teamId: string): Promise<MatchDetailsResponse> {
  return apiCall<MatchDetailsResponse>(`/matches/${matchId}/details/${teamId}`);
}

