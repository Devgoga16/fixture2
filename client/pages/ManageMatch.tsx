import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  ArrowLeft, 
  Clock, 
  Trophy, 
  Users, 
  Play, 
  Pause, 
  CheckCircle, 
  Bell,
  Calendar,
  Loader2,
  Save,
  Phone,
  UserCircle,
  Edit
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { MatchNotificationDialog } from "@/components/MatchNotificationDialog";
import { 
  getFullMatch, 
  startMatch, 
  pauseMatch, 
  updateMatchScore, 
  finishMatch,
  updateMatchSchedule,
  type FullMatchResponse
} from "@/services/tournament";

export default function ManageMatch() {
  const { tournamentId, matchId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [matchData, setMatchData] = useState<FullMatchResponse["match"] | null>(null);
  const [score1, setScore1] = useState<string>("");
  const [score2, setScore2] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [notificationDialogOpen, setNotificationDialogOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [updatingSchedule, setUpdatingSchedule] = useState(false);

  useEffect(() => {
    loadMatchData();
  }, [matchId]);

  const loadMatchData = async () => {
    if (!matchId) return;

    try {
      setLoading(true);
      const data = await getFullMatch(matchId!);
      setMatchData(data.match);
      setScore1(data.match.score1?.toString() || "");
      setScore2(data.match.score2?.toString() || "");
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cargar la información del partido",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartMatch = async () => {
    try {
      setActionLoading("start");
      await startMatch(matchId!);
      toast({
        title: "Partido iniciado",
        description: "El partido ha comenzado",
      });
      await loadMatchData();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo iniciar el partido",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handlePauseMatch = async () => {
    try {
      setActionLoading("pause");
      await pauseMatch(matchId!);
      toast({
        title: "Partido pausado",
        description: "El partido ha sido pausado",
      });
      await loadMatchData();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo pausar el partido",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleFinishMatch = async () => {
    try {
      setSaving(true);
      const s1 = parseInt(score1) || 0;
      const s2 = parseInt(score2) || 0;
      await finishMatch(tournamentId!, matchId!, s1, s2);
      toast({
        title: "Partido finalizado",
        description: "El resultado ha sido guardado",
      });
      navigate(`/tournament/${tournamentId}`);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo finalizar el partido",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateScore = async () => {
    try {
      setSaving(true);
      const s1 = parseInt(score1) || 0;
      const s2 = parseInt(score2) || 0;
      await updateMatchScore(matchId!, s1, s2);
      toast({
        title: "Marcador actualizado",
        description: "El marcador se ha guardado correctamente",
      });
      await loadMatchData();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo actualizar el marcador",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSendNotification = async () => {
    try {
      setActionLoading("notify");
      // TODO: POST /api/matches/{matchId}/notify
      toast({
        title: "Notificación enviada",
        description: "Los delegados han sido notificados",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo enviar la notificación",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleOpenScheduleDialog = () => {
    if (matchData?.scheduledTime) {
      const date = new Date(matchData.scheduledTime);
      const dateStr = date.toISOString().split('T')[0];
      const timeStr = date.toTimeString().slice(0, 5);
      setScheduledDate(dateStr);
      setScheduledTime(timeStr);
    } else {
      setScheduledDate("");
      setScheduledTime("");
    }
    setScheduleDialogOpen(true);
  };

  const handleUpdateSchedule = async () => {
    if (!scheduledDate || !scheduledTime) return;

    try {
      setUpdatingSchedule(true);
      const isoString = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();
      await updateMatchSchedule(matchId!, isoString);
      toast({
        title: "Hora actualizada",
        description: "La hora del partido se ha actualizado correctamente",
      });
      setScheduleDialogOpen(false);
      await loadMatchData();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo actualizar la hora",
        variant: "destructive",
      });
    } finally {
      setUpdatingSchedule(false);
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
      completed: { label: "Finalizado", className: "bg-emerald-100 text-emerald-700" },
    };
    const config = statusConfig[status] || statusConfig.created;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!matchData) {
    return (
      <div className="container mx-auto p-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Partido no encontrado</p>
            <Button onClick={() => navigate(-1)} className="mt-4 mx-auto block">
              Volver
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const winner = score1 && score2 ? (
    parseInt(score1) > parseInt(score2) ? matchData.team1 : 
    parseInt(score2) > parseInt(score1) ? matchData.team2 : 
    null
  ) : null;
  
  const team1Players = matchData.team1?.players || [];
  const team2Players = matchData.team2?.players || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(`/tournament/${tournamentId}`)}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al Fixture
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Gestión de Partido</h1>
              <p className="text-slate-600 mt-1">
                {matchData.tournament.name} - {matchData.roundName}
              </p>
            </div>
            {matchData.status && getStatusBadge(matchData.status)}
          </div>
        </div>

        {/* Match Info Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-500" />
                Información del Partido
              </CardTitle>
              <Button
                size="sm"
                variant="outline"
                onClick={handleOpenScheduleDialog}
                className="gap-2"
              >
                <Edit className="h-4 w-4" />
                Cambiar Hora
              </Button>
            </div>
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
                 matchData.status === "completed" ? "Finalizado" :
                 matchData.status === "scheduled" ? "Programado" : "Pendiente"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Delegados Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <UserCircle className="h-5 w-5 text-indigo-600" />
                Delegados
              </CardTitle>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setNotificationDialogOpen(true)}
                className="gap-2"
              >
                <Bell className="h-4 w-4" />
                Notificar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Delegado Team 1 */}
              <div className="space-y-2">
                <h3 className="font-semibold text-slate-900">
                  {matchData.team1?.name || "Equipo 1"}
                </h3>
                {matchData.team1?.delegado?.nombre ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <UserCircle className="h-4 w-4" />
                      <span>{matchData.team1.delegado.nombre}</span>
                    </div>
                    {matchData.team1.delegado.telefono && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Phone className="h-4 w-4" />
                        <span>{matchData.team1.delegado.telefono}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">Sin delegado asignado</p>
                )}
              </div>

              {/* Delegado Team 2 */}
              <div className="space-y-2">
                <h3 className="font-semibold text-slate-900">
                  {matchData.team2?.name || "Equipo 2"}
                </h3>
                {matchData.team2?.delegado?.nombre ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <UserCircle className="h-4 w-4" />
                      <span>{matchData.team2.delegado.nombre}</span>
                    </div>
                    {matchData.team2.delegado.telefono && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Phone className="h-4 w-4" />
                        <span>{matchData.team2.delegado.telefono}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">Sin delegado asignado</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Acciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              {matchData.status !== "in_progress" && matchData.status !== "completed" ? (
                <Button
                  onClick={handleStartMatch}
                  disabled={actionLoading !== null}
                  className="bg-green-600 hover:bg-green-700 min-w-[200px]"
                >
                  {actionLoading === "start" ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="mr-2 h-4 w-4" />
                  )}
                  Iniciar Partido
                </Button>
              ) : matchData.status === "in_progress" ? (
                <Button
                  onClick={handleFinishMatch}
                  disabled={saving || !score1 || !score2}
                  className="bg-emerald-600 hover:bg-emerald-700 min-w-[200px]"
                >
                  {saving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="mr-2 h-4 w-4" />
                  )}
                  Finalizar Partido
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>

        {/* Score Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Marcador</CardTitle>
            <CardDescription>Actualiza el marcador del partido en tiempo real</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              {/* Team 1 */}
              <div className="text-center">
                <p className="text-sm text-slate-600 mb-2">Equipo 1</p>
                <h3 className="text-xl font-bold text-slate-900 mb-4">
                  {matchData.team1?.name || "Por definir"}
                </h3>
                <Input
                  type="number"
                  min="0"
                  max="99"
                  value={score1}
                  onChange={(e) => setScore1(e.target.value)}
                  className="text-center text-3xl font-bold h-16"
                  placeholder="0"
                  disabled={matchData.status === "completed"}
                />
              </div>

              {/* VS */}
              <div className="text-center">
                <span className="text-4xl font-black text-slate-300">VS</span>
                {winner && (
                  <div className="mt-4 flex flex-col items-center">
                    <Trophy className="h-8 w-8 text-amber-500 mb-2" />
                    <p className="text-sm font-medium text-slate-600">Ganador</p>
                    <p className="text-lg font-bold text-slate-900">{winner.name}</p>
                  </div>
                )}
              </div>

              {/* Team 2 */}
              <div className="text-center">
                <p className="text-sm text-slate-600 mb-2">Equipo 2</p>
                <h3 className="text-xl font-bold text-slate-900 mb-4">
                  {matchData.team2?.name || "Por definir"}
                </h3>
                <Input
                  type="number"
                  min="0"
                  max="99"
                  value={score2}
                  onChange={(e) => setScore2(e.target.value)}
                  className="text-center text-3xl font-bold h-16"
                  placeholder="0"
                  disabled={matchData.status === "completed"}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              {matchData.status === "in_progress" && (
                <Button
                  onClick={handleUpdateScore}
                  disabled={saving || !score1 || !score2}
                  variant="outline"
                  className="flex-1"
                >
                  {saving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Guardar Marcador
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Teams Players */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Team 1 Players */}
          {matchData.team1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  {matchData.team1.name}
                </CardTitle>
                <CardDescription>{team1Players.length} jugadores</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {team1Players.length > 0 ? (
                    team1Players.map((player, idx) => (
                      <div
                        key={player.id}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-slate-400">#{idx + 1}</span>
                          <div>
                            <p className="font-medium text-slate-900">{player.fullName}</p>
                            <p className="text-xs text-slate-500">DNI: {player.dni}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-slate-400 py-8">
                      No hay jugadores registrados
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Team 2 Players */}
          {matchData.team2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-indigo-600" />
                  {matchData.team2.name}
                </CardTitle>
                <CardDescription>{team2Players.length} jugadores</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {team2Players.length > 0 ? (
                    team2Players.map((player, idx) => (
                      <div
                        key={player.id}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-slate-400">#{idx + 1}</span>
                          <div>
                            <p className="font-medium text-slate-900">{player.fullName}</p>
                            <p className="text-xs text-slate-500">DNI: {player.dni}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-slate-400 py-8">
                      No hay jugadores registrados
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Match Notification Dialog */}
      <MatchNotificationDialog
        match={matchData ? {
          id: matchData.id,
          round: matchData.round,
          position: matchData.position,
          team1: matchData.team1,
          team2: matchData.team2,
          score1: matchData.score1,
          score2: matchData.score2,
          winner: matchData.winner,
          status: matchData.status,
          scheduledTime: matchData.scheduledTime,
          completed: matchData.completed
        } : null}
        open={notificationDialogOpen}
        onClose={() => setNotificationDialogOpen(false)}
      />

      {/* Schedule Dialog */}
      <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar Hora del Partido</DialogTitle>
            <DialogDescription>
              Programa o modifica la fecha y hora del partido
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="date">Fecha</Label>
              <Input
                id="date"
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Hora</Label>
              <Input
                id="time"
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setScheduleDialogOpen(false)}
              disabled={updatingSchedule}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleUpdateSchedule}
              disabled={updatingSchedule || !scheduledDate || !scheduledTime}
            >
              {updatingSchedule ? (
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
