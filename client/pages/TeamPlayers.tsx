import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { TeamPlayersResponse } from "@shared/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, Loader2, User, UserPlus } from "lucide-react";
import { AddPlayerDialog } from "@/components/AddPlayerDialog";
import { getTeamPlayers } from "@/services/team";
import { isOrganizer } from "@/services/auth";

export function TeamPlayers() {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<TeamPlayersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addPlayerDialogOpen, setAddPlayerDialogOpen] = useState(false);
  const canEdit = isOrganizer();

  useEffect(() => {
    loadPlayers();
  }, [teamId]);

  const loadPlayers = async () => {
    if (!teamId) return;

    try {
      setLoading(true);
      setError(null);
      const players = await getTeamPlayers(teamId);
      setData(players);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar los jugadores");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container mx-auto p-8">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>{error || "No se pudo cargar los datos"}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Button onClick={loadPlayers}>Reintentar</Button>
              <Button variant="outline" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/fondotorneo.jpg"
          alt="Background"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-slate-50/80 to-indigo-50/80"></div>
      </div>

      {/* Header */}
      <div className="relative z-20">
        <div className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
            <div className="flex items-center gap-4 mb-3">
              <Button
                onClick={() => navigate(-1)}
                variant="ghost"
                size="sm"
                className="text-slate-600 hover:text-blue-600"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                  {data.teamName}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {data.totalPlayers} {data.totalPlayers === 1 ? "jugador" : "jugadores"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 relative z-10">
        <Card className="border border-slate-200/60 shadow-md overflow-hidden bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-white/60 border-b border-slate-200/60">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold">Jugadores Registrados</CardTitle>
                <CardDescription>
                  Lista completa de jugadores del equipo
                </CardDescription>
              </div>
              {canEdit && (
                <Button
                  onClick={() => setAddPlayerDialogOpen(true)}
                  className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  <UserPlus className="w-4 h-4" />
                  Agregar Jugador
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {data.players.length === 0 ? (
              <div className="text-center py-12">
                <User className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No hay jugadores registrados</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.players.map((player, idx) => (
                  <div
                    key={player.id}
                    className="flex items-start gap-3 p-4 rounded-lg bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all group"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-md">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors text-sm leading-tight">
                        {player.fullName}
                      </h3>
                      <div className="space-y-1 mt-2">
                        <p className="text-xs text-slate-600">
                          <span className="font-medium">DNI:</span> {player.dni}
                        </p>
                        <p className="text-xs text-slate-500">
                          Registrado: {formatDate(player.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 text-center relative z-10">
        <p className="text-xs text-slate-400">
          Powered by <span className="font-semibold text-blue-600">Unify</span>
        </p>
      </div>

      {/* Add Player Dialog */}
      {teamId && (
        <AddPlayerDialog
          open={addPlayerDialogOpen}
          onClose={() => setAddPlayerDialogOpen(false)}
          teamId={teamId}
          onPlayerAdded={loadPlayers}
        />
      )}
    </div>
  );
}
