import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft, 
  Clock, 
  Trophy, 
  Users, 
  Calendar,
  Loader2,
  Shield,
  Target
} from "lucide-react";
import { getMatchDetails, MatchDetailsResponse } from "@/services/team";

export function MatchDetails() {
  const { matchId, teamId } = useParams<{ matchId: string; teamId: string }>();
  const navigate = useNavigate();
  const [matchData, setMatchData] = useState<MatchDetailsResponse["match"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMatchDetails();
  }, [matchId, teamId]);

  const loadMatchDetails = async () => {
    if (!matchId || !teamId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await getMatchDetails(matchId, teamId);
      setMatchData(data.match);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar los detalles del partido");
    } finally {
      setLoading(false);
    }
  };

  const formatScheduledTime = (isoString: string): string => {
    const date = new Date(isoString);
    const day = date.getUTCDate();
    const month = date.toLocaleString("es-ES", { month: "short", timeZone: "UTC" });
    let hours = date.getUTCHours();
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${month} ${day}, ${hours}:${minutes} ${ampm}`;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      created: { label: "Creado", className: "bg-slate-100 text-slate-700" },
      scheduled: { label: "Programado", className: "bg-purple-100 text-purple-700" },
      in_progress: { label: "En Juego", className: "bg-orange-100 text-orange-700" },
      finished: { label: "Finalizado", className: "bg-emerald-100 text-emerald-700" },
    };
    const config = statusConfig[status] || statusConfig.created;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getPlayerGoalsCount = (playerId: string, goals: any[]) => {
    return goals.filter(goal => goal.player.id === playerId).length;
  };

  const getPlayerYellowCardsCount = (playerId: string, cards: any[]) => {
    return cards.filter(card => card.player.id === playerId).length;
  };

  const calculateVolleyballScore = () => {
    if (!matchData?.sets) return { myTeamSets: 0, rivalTeamSets: 0 };
    
    let myTeamSets = 0;
    let rivalTeamSets = 0;
    
    matchData.sets.forEach(set => {
      if (set.status === "finished") {
        if (set.score1 > set.score2) {
          myTeamSets++;
        } else if (set.score2 > set.score1) {
          rivalTeamSets++;
        }
      }
    });
    
    return { myTeamSets, rivalTeamSets };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !matchData) {
    return (
      <div className="container mx-auto p-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-red-600">{error || "Partido no encontrado"}</p>
            <Button onClick={() => navigate(-1)} className="mt-4 mx-auto block">
              Volver
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Detalles del Partido</h1>
              <p className="text-slate-600 mt-1">
                {matchData.tournament.name} - {matchData.roundName}
              </p>
            </div>
            {getStatusBadge(matchData.status)}
          </div>
        </div>

        {/* Match Info Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              Información del Partido
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {matchData.scheduledTime && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-purple-600" />
                <span className="font-medium">Programado:</span>
                <span className="text-slate-600">{formatScheduledTime(matchData.scheduledTime)}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="font-medium">Estado:</span>
              <span className="text-slate-600">
                {matchData.status === "in_progress" ? "En progreso" : 
                 matchData.status === "finished" ? "Finalizado" :
                 matchData.status === "scheduled" ? "Programado" : "Pendiente"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Score Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Marcador</CardTitle>
          </CardHeader>
          <CardContent>
            {matchData.sport === 2 ? (
              // Volleyball scoring
              <div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center mb-6">
                  {/* My Team */}
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Shield className="h-5 w-5 text-blue-600" />
                      <p className="text-sm text-slate-600">Mi Equipo</p>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-4">
                      {matchData.myTeam?.name || "Equipo 1"}
                    </h3>
                    <div className="text-5xl font-bold text-blue-600">
                      {calculateVolleyballScore().myTeamSets}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Sets</p>
                  </div>

                  {/* VS */}
                  <div className="text-center">
                    <span className="text-4xl font-black text-slate-300">VS</span>
                  </div>

                  {/* Rival Team */}
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Target className="h-5 w-5 text-indigo-600" />
                      <p className="text-sm text-slate-600">Rival</p>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-4">
                      {matchData.rivalTeam?.name || "Equipo 2"}
                    </h3>
                    <div className="text-5xl font-bold text-indigo-600">
                      {calculateVolleyballScore().rivalTeamSets}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Sets</p>
                  </div>
                </div>

                {/* Sets Detail */}
                {matchData.sets && matchData.sets.length > 0 && (
                  <div className="mt-6 pt-6 border-t">
                    <h4 className="text-sm font-semibold text-slate-700 mb-3">Detalle por Sets</h4>
                    <div className="space-y-2">
                      {matchData.sets.map((set) => (
                        <div key={set.id} className="flex items-center justify-between bg-slate-50 rounded-lg p-3">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-slate-600">Set {set.set}</span>
                            <Badge className={set.status === "finished" ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-700"}>
                              {set.status === "finished" ? "Finalizado" : "En Progreso"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-lg font-bold text-blue-600">{set.score1}</span>
                            <span className="text-slate-400">-</span>
                            <span className="text-lg font-bold text-indigo-600">{set.score2}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Football scoring
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                {/* My Team */}
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <p className="text-sm text-slate-600">Mi Equipo</p>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-4">
                    {matchData.myTeam?.name || "Equipo 1"}
                  </h3>
                  <div className="text-5xl font-bold text-blue-600">
                    {matchData.myTeam?.score ?? "-"}
                  </div>
                </div>

                {/* VS */}
                <div className="text-center">
                  <span className="text-4xl font-black text-slate-300">VS</span>
                </div>

                {/* Rival Team */}
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Target className="h-5 w-5 text-indigo-600" />
                    <p className="text-sm text-slate-600">Rival</p>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-4">
                    {matchData.rivalTeam?.name || "Equipo 2"}
                  </h3>
                  <div className="text-5xl font-bold text-indigo-600">
                    {matchData.rivalTeam?.score ?? "-"}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Teams Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* My Team Details */}
          <Card>
            <CardHeader className="bg-blue-50">
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                {matchData.myTeam?.name || "Equipo 1"}
              </CardTitle>
              <CardDescription>
                {matchData.myTeam?.playersCount || 0} jugadores
                {matchData.myTeam?.goals && matchData.myTeam.goals.length > 0 && ` • ${matchData.myTeam.goals.length} goles`}
                {matchData.myTeam?.yellowCards && matchData.myTeam.yellowCards.length > 0 && ` • ${matchData.myTeam.yellowCards.length} amarillas`}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-2">
                {matchData.myTeam?.players && matchData.myTeam.players.map((player, idx) => {
                  const goals = getPlayerGoalsCount(player.id, matchData.myTeam?.goals || []);
                  const yellowCards = getPlayerYellowCardsCount(player.id, matchData.myTeam?.yellowCards || []);
                  
                  return (
                    <div
                      key={player.id}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-slate-400">#{idx + 1}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-slate-900">{player.fullName}</p>
                            {goals > 0 && (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300 text-xs">
                                ⚽ {goals}
                              </Badge>
                            )}
                            {yellowCards > 0 && (
                              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300 text-xs">
                                🟨 {yellowCards}
                              </Badge>
                            )}
                            {yellowCards >= 2 && (
                              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300 text-xs">
                                🟥 Expulsado
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-slate-500">DNI: {player.dni}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Rival Team Details */}
          <Card>
            <CardHeader className="bg-indigo-50">
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-indigo-600" />
                {matchData.rivalTeam?.name || "Equipo 2"}
              </CardTitle>
              <CardDescription>
                {matchData.rivalTeam?.playersCount || 0} jugadores
                {matchData.rivalTeam?.goals && matchData.rivalTeam.goals.length > 0 && ` • ${matchData.rivalTeam.goals.length} goles`}
                {matchData.rivalTeam?.yellowCards && matchData.rivalTeam.yellowCards.length > 0 && ` • ${matchData.rivalTeam.yellowCards.length} amarillas`}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-2">
                {matchData.rivalTeam?.players && matchData.rivalTeam.players.map((player, idx) => {
                  const goals = getPlayerGoalsCount(player.id, matchData.rivalTeam?.goals || []);
                  const yellowCards = getPlayerYellowCardsCount(player.id, matchData.rivalTeam?.yellowCards || []);
                  
                  return (
                    <div
                      key={player.id}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-slate-400">#{idx + 1}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-slate-900">{player.fullName}</p>
                            {goals > 0 && (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300 text-xs">
                                ⚽ {goals}
                              </Badge>
                            )}
                            {yellowCards > 0 && (
                              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300 text-xs">
                                🟨 {yellowCards}
                              </Badge>
                            )}
                            {yellowCards >= 2 && (
                              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300 text-xs">
                                🟥 Expulsado
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
