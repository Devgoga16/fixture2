import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { TeamPlayersResponse } from "@shared/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, Users, Loader2, User, UserPlus, Phone, UserCircle, Edit, Plus, Calendar, Clock, Trophy, MessageCircle } from "lucide-react";
import { AddPlayerDialog } from "@/components/AddPlayerDialog";
import { getTeamPlayers, updateTeamDelegado, getTeamMatches, TeamMatchesResponse } from "@/services/team";
import { isOrganizer, isDelegate } from "@/services/auth";
import { useToast } from "@/hooks/use-toast";
import { apiCall } from "@/config/api";

export function TeamPlayers() {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [data, setData] = useState<TeamPlayersResponse | null>(null);
  const [matches, setMatches] = useState<TeamMatchesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addPlayerDialogOpen, setAddPlayerDialogOpen] = useState(false);
  const [delegadoDialogOpen, setDelegadoDialogOpen] = useState(false);
  const [delegadoNombre, setDelegadoNombre] = useState("");
  const [delegadoTelefono, setDelegadoTelefono] = useState("");
  const [savingDelegado, setSavingDelegado] = useState(false);
  const [sendingWelcome, setSendingWelcome] = useState(false);
  const canEdit = isOrganizer();
  const isDelegateUser = isDelegate();

  useEffect(() => {
    loadPlayers();
    if (isDelegateUser) {
      loadMatches();
    }
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

  const loadMatches = async () => {
    if (!teamId) return;

    try {
      const matchesData = await getTeamMatches(teamId);
      setMatches(matchesData);
    } catch (err) {
      console.error("Error loading matches:", err);
    }
  };

  const handleOpenDelegadoDialog = () => {
    if (data?.team.delegado) {
      setDelegadoNombre(data.team.delegado.nombre || "");
      setDelegadoTelefono(data.team.delegado.telefono || "");
    }
    setDelegadoDialogOpen(true);
  };

  const handleSaveDelegado = async () => {
    if (!teamId) return;

    try {
      setSavingDelegado(true);
      await updateTeamDelegado(teamId, delegadoNombre, delegadoTelefono);
      toast({
        title: "Delegado actualizado",
        description: "La información del delegado se ha guardado correctamente",
      });
      setDelegadoDialogOpen(false);
      await loadPlayers();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "No se pudo guardar la información",
        variant: "destructive",
      });
    } finally {
      setSavingDelegado(false);
    }
  };

  const handleSendWelcome = async () => {
    if (!data?.team.delegado.telefono) {
      toast({
        title: "Error",
        description: "El delegado no tiene un teléfono registrado",
        variant: "destructive",
      });
      return;
    }

    try {
      setSendingWelcome(true);
      const response = await apiCall<{
        success: boolean;
        message: string;
        sentTo: {
          phone: string;
          name: string;
          team: string;
          tournament: string;
        };
      }>("/auth/send-welcome-message", {
        method: "POST",
        body: JSON.stringify({
          phone: data.team.delegado.telefono,
        }),
      });

      toast({
        title: "Mensaje enviado",
        description: `Mensaje de bienvenida enviado a ${response.sentTo.name}`,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "No se pudo enviar el mensaje",
        variant: "destructive",
      });
    } finally {
      setSendingWelcome(false);
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
                  {data.team.name}
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
        {/* Delegado Card */}
        <Card className="border border-slate-200/60 shadow-md overflow-hidden bg-white/80 backdrop-blur-sm mb-6">
          <CardHeader className="bg-white/60 border-b border-slate-200/60">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <UserCircle className="w-5 h-5 text-indigo-600" />
                Delegado
              </CardTitle>
              {canEdit && (
                <Button
                  onClick={handleOpenDelegadoDialog}
                  size="sm"
                  variant="outline"
                  className="gap-2"
                >
                  {data.team.delegado.nombre ? (
                    <>
                      <Edit className="w-4 h-4" />
                      Editar
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Agregar
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {data.team.delegado.nombre ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <UserCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">{data.team.delegado.nombre}</p>
                    {data.team.delegado.telefono && (
                      <div className="flex items-center gap-1.5 text-sm text-slate-600 mt-1">
                        <Phone className="w-3.5 h-3.5" />
                        <span>{data.team.delegado.telefono}</span>
                      </div>
                    )}
                  </div>
                </div>
                {canEdit && data.team.delegado.telefono && (
                  <Button
                    onClick={handleSendWelcome}
                    disabled={sendingWelcome}
                    size="sm"
                    variant="outline"
                    className="w-full gap-2"
                  >
                    {sendingWelcome ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <MessageCircle className="w-4 h-4" />
                        Dar la Bienvenida
                      </>
                    )}
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <UserCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">Sin delegado asignado</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Matches Section */}
        {isDelegateUser && matches && matches.matches.length > 0 && (
          <Card className="border border-slate-200/60 shadow-md overflow-hidden bg-white/80 backdrop-blur-sm mt-6">
            <CardHeader className="bg-white/60 border-b border-slate-200/60">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Trophy className="w-5 h-5 text-amber-600" />
                Partidos del Equipo
              </CardTitle>
              <CardDescription>
                {matches.totalMatches} {matches.totalMatches === 1 ? "partido" : "partidos"}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {matches.matches.map((match) => (
                  <div
                    key={match.id}
                    className="p-4 rounded-lg border border-slate-200 bg-white hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                    onClick={() => navigate(`/match/${match.id}/team/${teamId}`)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {match.roundName}
                        </Badge>
                        {match.status === "in_progress" && (
                          <Badge className="bg-orange-100 text-orange-700 text-xs">
                            En Juego
                          </Badge>
                        )}
                        {match.status === "finished" && (
                          <Badge className="bg-emerald-100 text-emerald-700 text-xs">
                            Finalizado
                          </Badge>
                        )}
                        {match.status === "scheduled" && (
                          <Badge className="bg-purple-100 text-purple-700 text-xs">
                            Programado
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-slate-500">{match.tournament.name}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className={`flex-1 text-right ${match.team1?.isMyTeam ? "font-bold" : ""}`}>
                        <p className="text-sm">{match.team1?.name || "TBD"}</p>
                      </div>
                      
                      <div className="px-6 text-center">
                        <div className="flex items-center gap-3">
                          {match.score1 !== null && match.score2 !== null ? (
                            <>
                              <span className="text-2xl font-bold text-slate-900">{match.score1}</span>
                              <span className="text-slate-400">-</span>
                              <span className="text-2xl font-bold text-slate-900">{match.score2}</span>
                            </>
                          ) : (
                            <span className="text-slate-400 text-sm">vs</span>
                          )}
                        </div>
                        {match.scheduledTime && (
                          <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                            <Clock className="w-3 h-3" />
                            <span>
                              {new Date(match.scheduledTime).toLocaleDateString("es-ES", {
                                day: "2-digit",
                                month: "short",
                                timeZone: "UTC"
                              })}{" "}
                              {new Date(match.scheduledTime).toLocaleTimeString("es-ES", {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                                timeZone: "UTC"
                              })}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className={`flex-1 text-left ${match.team2?.isMyTeam ? "font-bold" : ""}`}>
                        <p className="text-sm">{match.team2?.name || "TBD"}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

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

      {/* Edit Delegado Dialog */}
      <Dialog open={delegadoDialogOpen} onOpenChange={setDelegadoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {data?.team.delegado.nombre ? "Editar Delegado" : "Agregar Delegado"}
            </DialogTitle>
            <DialogDescription>
              Ingresa los datos del delegado del equipo
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre completo</Label>
              <Input
                id="nombre"
                placeholder="Ej: Juan Pérez"
                value={delegadoNombre}
                onChange={(e) => setDelegadoNombre(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono (opcional)</Label>
              <Input
                id="telefono"
                placeholder="Ej: 987654321"
                value={delegadoTelefono}
                onChange={(e) => setDelegadoTelefono(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDelegadoDialogOpen(false)}
              disabled={savingDelegado}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveDelegado}
              disabled={savingDelegado || !delegadoNombre.trim()}
            >
              {savingDelegado ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
