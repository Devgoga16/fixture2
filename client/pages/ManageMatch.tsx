import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  Edit,
  CircleDot,
  Square,
  Plus,
  X
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
  recordGoal,
  recordYellowCard,
  saveSet,
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
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [notificationDialogOpen, setNotificationDialogOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [updatingSchedule, setUpdatingSchedule] = useState(false);
  
  // Volleyball sets state
  const [sets, setSets] = useState<Array<{ id?: string; set: number; score1: string; score2: string; status?: string }>>([
    { set: 1, score1: "0", score2: "0" },
  ]);
  
  const [confirmGoalDialog, setConfirmGoalDialog] = useState<{
    open: boolean;
    playerId: string;
    playerName: string;
    teamId: string;
    teamName: string;
  } | null>(null);
  const [confirmYellowCardDialog, setConfirmYellowCardDialog] = useState<{
    open: boolean;
    playerId: string;
    playerName: string;
    teamId: string;
    teamName: string;
  } | null>(null);

  useEffect(() => {
    loadMatchData();
  }, [matchId]);

  const loadMatchData = async (isRefresh = false) => {
    if (!matchId) return;

    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const data = await getFullMatch(matchId!);
      setMatchData(data.match);
      setScore1(data.match.score1?.toString() || "");
      setScore2(data.match.score2?.toString() || "");
      
      // Load sets for volleyball
      if (data.match.sport === 2 && data.match.sets && data.match.sets.length > 0) {
        setSets(data.match.sets.map(set => ({
          id: set.id,
          set: set.set,
          score1: set.score1.toString(),
          score2: set.score2.toString(),
          status: set.status
        })));
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cargar la información del partido",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
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
      await loadMatchData(true);
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
      await loadMatchData(true);
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
      
      if (matchData?.sport === 2) {
        // Volleyball: calculate sets won and send sets data
        const { team1Sets, team2Sets } = calculateVolleyballScore();
        const parsedSets = sets.map(set => ({
          set: set.set,
          score1: parseInt(set.score1) || 0,
          score2: parseInt(set.score2) || 0
        }));
        await finishMatch(tournamentId!, matchId!, team1Sets, team2Sets, parsedSets);
      } else {
        // Football: use regular scores
        const s1 = parseInt(score1) || 0;
        const s2 = parseInt(score2) || 0;
        await finishMatch(tournamentId!, matchId!, s1, s2);
      }
      
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
      
      if (matchData?.sport === 2) {
        // Volleyball: calculate sets won and send sets data
        const { team1Sets, team2Sets } = calculateVolleyballScore();
        const parsedSets = sets.map(set => ({
          set: set.set,
          score1: parseInt(set.score1) || 0,
          score2: parseInt(set.score2) || 0
        }));
        await updateMatchScore(matchId!, team1Sets, team2Sets, parsedSets);
      } else {
        // Football: use regular scores
        const s1 = parseInt(score1) || 0;
        const s2 = parseInt(score2) || 0;
        await updateMatchScore(matchId!, s1, s2);
      }
      
      toast({
        title: "Marcador actualizado",
        description: "El marcador se ha guardado correctamente",
      });
      await loadMatchData(true);
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
      await loadMatchData(true);
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

  const handleRecordGoal = async (playerId: string, teamId: string) => {
    if (!confirmGoalDialog) return;
    
    try {
      const result = await recordGoal(matchId!, playerId, teamId);
      toast({
        title: "¡Gol registrado!",
        description: `${result.goal.playerId.fullName} - Total en partido: ${result.totalGoalsInMatch}`,
      });
      await loadMatchData(true);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo registrar el gol",
        variant: "destructive",
      });
    } finally {
      setConfirmGoalDialog(null);
    }
  };

  const handleRecordYellowCard = async (playerId: string, teamId: string) => {
    if (!confirmYellowCardDialog) return;
    
    try {
      const result = await recordYellowCard(matchId!, playerId, teamId);
      toast({
        title: "Tarjeta amarilla registrada",
        description: `${result.yellowCard.playerId.fullName} - Total en partido: ${result.totalYellowCardsInMatch}`,
      });
      await loadMatchData(true);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo registrar la tarjeta",
        variant: "destructive",
      });
    } finally {
      setConfirmYellowCardDialog(null);
    }
  };

  const openGoalConfirmation = (playerId: string, playerName: string, teamId: string, teamName: string) => {
    setConfirmGoalDialog({
      open: true,
      playerId,
      playerName,
      teamId,
      teamName,
    });
  };

  const openYellowCardConfirmation = (playerId: string, playerName: string, teamId: string, teamName: string) => {
    setConfirmYellowCardDialog({
      open: true,
      playerId,
      playerName,
      teamId,
      teamName,
    });
  };

  const getPlayerGoalsCount = (playerId: string): number => {
    if (!matchData?.goals) return 0;
    return matchData.goals.filter(goal => goal.player.id === playerId).length;
  };

  const getPlayerYellowCardsCount = (playerId: string): number => {
    if (!matchData?.yellowCards) return 0;
    return matchData.yellowCards.filter(card => card.player.id === playerId).length;
  };

  const hasRedCard = (playerId: string): boolean => {
    return getPlayerYellowCardsCount(playerId) >= 2;
  };

  // Volleyball helpers
  const addSet = () => {
    const nextSetNumber = sets.length + 1;
    if (nextSetNumber <= 5) {
      setSets([...sets, { set: nextSetNumber, score1: "0", score2: "0" }]);
    }
  };

  const removeLastSet = () => {
    if (sets.length > 1) {
      setSets(sets.slice(0, -1));
    }
  };

  const updateSetPoints = (setIndex: number, team: 'team1' | 'team2', value: string) => {
    const newSets = [...sets];
    if (team === 'team1') {
      newSets[setIndex].score1 = value;
    } else {
      newSets[setIndex].score2 = value;
    }
    setSets(newSets);
  };

  const saveSetPoints = async (setIndex: number) => {
    try {
      const setData = sets[setIndex];
      await saveSet(matchId!, {
        set: setData.set,
        score1: parseInt(setData.score1) || 0,
        score2: parseInt(setData.score2) || 0,
        status: "in_progress"
      });
      
      toast({
        title: "Puntaje guardado",
        description: `Set ${setData.set} actualizado`,
      });
      
      await loadMatchData(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar el puntaje del set",
        variant: "destructive",
      });
    }
  };

  const finishCurrentSet = async (setIndex: number) => {
    try {
      const setData = sets[setIndex];
      await saveSet(matchId!, {
        set: setData.set,
        score1: parseInt(setData.score1) || 0,
        score2: parseInt(setData.score2) || 0,
        status: "finished"
      });
      
      toast({
        title: "Set finalizado",
        description: `Set ${setData.set} completado`,
      });
      
      await loadMatchData(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo finalizar el set",
        variant: "destructive",
      });
    }
  };

  const calculateVolleyballScore = () => {
    let team1Sets = 0;
    let team2Sets = 0;
    
    sets.forEach(set => {
      // Solo contar sets que estén finalizados
      if (set.status === "finished") {
        const t1 = parseInt(set.score1) || 0;
        const t2 = parseInt(set.score2) || 0;
        if (t1 > t2) team1Sets++;
        else if (t2 > t1) team2Sets++;
      }
    });
    
    return { team1Sets, team2Sets };
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
            {refreshing ? (
              <>
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-3/4" />
              </>
            ) : (
              <>
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
              </>
            )}
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
            {refreshing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-40" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-40" />
                </div>
              </div>
            ) : (
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
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Acciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              {matchData.status !== "in_progress" && matchData.status !== "finished" ? (
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
                  disabled={
                    saving || 
                    (matchData.sport === 1 && (!score1 || !score2)) ||
                    (matchData.sport === 2 && sets.length === 0)
                  }
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
            <CardDescription>
              {matchData.sport === 2 
                ? "Actualiza el puntaje de cada set" 
                : "Actualiza el marcador del partido en tiempo real"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {matchData.sport === 2 ? (
              // Volleyball Sets UI
              <div className="space-y-4">
                {/* Sets Score Summary - Arriba */}
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div className="text-center flex-1">
                      <p className="text-sm text-slate-600 mb-1">{matchData.team1?.name || "Equipo 1"}</p>
                      <p className="text-3xl font-bold text-slate-900">
                        {calculateVolleyballScore().team1Sets}
                      </p>
                    </div>
                    <div className="px-4">
                      <span className="text-2xl font-black text-slate-300">SETS</span>
                    </div>
                    <div className="text-center flex-1">
                      <p className="text-sm text-slate-600 mb-1">{matchData.team2?.name || "Equipo 2"}</p>
                      <p className="text-3xl font-bold text-slate-900">
                        {calculateVolleyballScore().team2Sets}
                      </p>
                    </div>
                  </div>
                  {matchData.status === "finished" && winner && (
                    <div className="mt-4 flex flex-col items-center border-t pt-4">
                      <Trophy className="h-8 w-8 text-amber-500 mb-2" />
                      <p className="text-sm font-medium text-slate-600">Ganador</p>
                      <p className="text-lg font-bold text-slate-900">{winner.name}</p>
                    </div>
                  )}
                </div>

                {/* Puntajes de cada set - Abajo */}
                {sets.map((set, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-slate-700">Set {set.set}</h4>
                        {set.status === "finished" ? (
                          <Badge className="bg-emerald-100 text-emerald-700 text-xs">
                            Finalizado
                          </Badge>
                        ) : (
                          <Badge className="bg-orange-100 text-orange-700 text-xs">
                            En Progreso
                          </Badge>
                        )}
                      </div>
                      {index === sets.length - 1 && sets.length > 1 && set.status !== "finished" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={removeLastSet}
                          disabled={matchData.status === "finished"}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 items-center">
                      {/* Team 1 Points */}
                      <div className="text-center">
                        <p className="text-xs text-slate-600 mb-2">
                          {matchData.team1?.name || "Equipo 1"}
                        </p>
                        {set.status === "finished" ? (
                          <div className="text-3xl font-bold text-slate-900 min-w-[60px]">
                            {set.score1 || "0"}
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const current = parseInt(set.score1) || 0;
                                if (current > 0) updateSetPoints(index, 'team1', (current - 1).toString());
                              }}
                              disabled={matchData.status === "finished" || !set.score1 || parseInt(set.score1) <= 0}
                              className="h-10 w-10 p-0"
                            >
                              <span className="text-lg">-</span>
                            </Button>
                            <div className="text-3xl font-bold text-slate-900 min-w-[60px]">
                              {set.score1 || "0"}
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const current = parseInt(set.score1) || 0;
                                updateSetPoints(index, 'team1', (current + 1).toString());
                              }}
                              disabled={matchData.status === "finished"}
                              className="h-10 w-10 p-0"
                            >
                              <span className="text-lg">+</span>
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* VS */}
                      <div className="text-center">
                        <span className="text-2xl font-black text-slate-300">-</span>
                      </div>

                      {/* Team 2 Points */}
                      <div className="text-center">
                        <p className="text-xs text-slate-600 mb-2">
                          {matchData.team2?.name || "Equipo 2"}
                        </p>
                        {set.status === "finished" ? (
                          <div className="text-3xl font-bold text-slate-900 min-w-[60px]">
                            {set.score2 || "0"}
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const current = parseInt(set.score2) || 0;
                                if (current > 0) updateSetPoints(index, 'team2', (current - 1).toString());
                              }}
                              disabled={matchData.status === "finished" || !set.score2 || parseInt(set.score2) <= 0}
                              className="h-10 w-10 p-0"
                            >
                              <span className="text-lg">-</span>
                            </Button>
                            <div className="text-3xl font-bold text-slate-900 min-w-[60px]">
                              {set.score2 || "0"}
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const current = parseInt(set.score2) || 0;
                                updateSetPoints(index, 'team2', (current + 1).toString());
                              }}
                              disabled={matchData.status === "finished"}
                              className="h-10 w-10 p-0"
                            >
                              <span className="text-lg">+</span>
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Save and Finish Set Buttons */}
                    {set.status !== "finished" && matchData.status === "in_progress" && (
                      <div className="mt-3 pt-3 border-t space-y-2">
                        <Button
                          size="sm"
                          onClick={() => saveSetPoints(index)}
                          variant="secondary"
                          className="w-full"
                        >
                          Guardar Puntajes
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => finishCurrentSet(index)}
                          variant="outline"
                          className="w-full"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Finalizar Set {set.set}
                        </Button>
                      </div>
                    )}
                    {set.status === "finished" && (
                      <div className="mt-3 pt-3 border-t">
                        <Badge className="bg-emerald-100 text-emerald-700 w-full justify-center">
                          ✓ Set Completado
                        </Badge>
                      </div>
                    )}
                  </div>
                ))}

                {/* Add Set Button */}
                {sets.length < 5 && matchData.status !== "finished" && (
                  <Button
                    onClick={addSet}
                    variant="outline"
                    className="w-full"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Agregar Set {sets.length + 1}
                  </Button>
                )}
              </div>
            ) : (
              // Football Score UI
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
                    disabled={matchData.status === "finished"}
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
                    disabled={matchData.status === "finished"}
                  />
                </div>
              </div>
            )}

            {matchData.sport === 1 && (
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
            )}
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
                {refreshing ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : (
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
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-slate-900">{player.fullName}</p>
                              {matchData.sport === 1 && getPlayerGoalsCount(player.id) > 0 && (
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300 text-xs">
                                  ⚽ {getPlayerGoalsCount(player.id)}
                                </Badge>
                              )}
                              {getPlayerYellowCardsCount(player.id) > 0 && (
                                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300 text-xs">
                                  🟨 {getPlayerYellowCardsCount(player.id)}
                                </Badge>
                              )}
                              {hasRedCard(player.id) && (
                                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300 text-xs">
                                  🟥 Expulsado
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-slate-500">DNI: {player.dni}</p>
                          </div>
                        </div>
                        {matchData.status === "in_progress" && (
                          <div className="flex items-center gap-2">
                            {matchData.sport === 1 && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0 hover:bg-green-50 hover:border-green-500"
                                title="Agregar gol"
                                onClick={() => openGoalConfirmation(player.id, player.fullName, matchData.team1!.id, matchData.team1!.name)}
                              >
                                <CircleDot className="h-4 w-4 text-green-600" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 w-8 p-0 hover:bg-yellow-50 hover:border-yellow-500"
                              title="Tarjeta amarilla"
                              onClick={() => openYellowCardConfirmation(player.id, player.fullName, matchData.team1!.id, matchData.team1!.name)}
                            >
                              <Square className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-slate-400 py-8">
                      No hay jugadores registrados
                    </p>
                  )}
                  </div>
                )}
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
                {refreshing ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : (
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
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-slate-900">{player.fullName}</p>
                              {matchData.sport === 1 && getPlayerGoalsCount(player.id) > 0 && (
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300 text-xs">
                                  ⚽ {getPlayerGoalsCount(player.id)}
                                </Badge>
                              )}
                              {getPlayerYellowCardsCount(player.id) > 0 && (
                                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300 text-xs">
                                  🟨 {getPlayerYellowCardsCount(player.id)}
                                </Badge>
                              )}
                              {hasRedCard(player.id) && (
                                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300 text-xs">
                                  🟥 Expulsado
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-slate-500">DNI: {player.dni}</p>
                          </div>
                        </div>
                        {matchData.status === "in_progress" && (
                          <div className="flex items-center gap-2">
                            {matchData.sport === 1 && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0 hover:bg-green-50 hover:border-green-500"
                                title="Agregar gol"
                                onClick={() => openGoalConfirmation(player.id, player.fullName, matchData.team2!.id, matchData.team2!.name)}
                              >
                                <CircleDot className="h-4 w-4 text-green-600" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 w-8 p-0 hover:bg-yellow-50 hover:border-yellow-500"
                              title="Tarjeta amarilla"
                              onClick={() => openYellowCardConfirmation(player.id, player.fullName, matchData.team2!.id, matchData.team2!.name)}
                            >
                              <Square className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-slate-400 py-8">
                      No hay jugadores registrados
                    </p>
                  )}
                  </div>
                )}
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

      {/* Goal Confirmation Dialog */}
      <AlertDialog open={confirmGoalDialog?.open || false} onOpenChange={(open) => !open && setConfirmGoalDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Gol</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de registrar un gol para <strong>{confirmGoalDialog?.playerName}</strong> del equipo <strong>{confirmGoalDialog?.teamName}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmGoalDialog && handleRecordGoal(confirmGoalDialog.playerId, confirmGoalDialog.teamId)}
              className="bg-green-600 hover:bg-green-700"
            >
              Confirmar Gol
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Yellow Card Confirmation Dialog */}
      <AlertDialog open={confirmYellowCardDialog?.open || false} onOpenChange={(open) => !open && setConfirmYellowCardDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Tarjeta Amarilla</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de registrar una tarjeta amarilla para <strong>{confirmYellowCardDialog?.playerName}</strong> del equipo <strong>{confirmYellowCardDialog?.teamName}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmYellowCardDialog && handleRecordYellowCard(confirmYellowCardDialog.playerId, confirmYellowCardDialog.teamId)}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              Confirmar Tarjeta
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

