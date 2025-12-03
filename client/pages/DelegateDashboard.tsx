import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users, Trophy, LogOut, ChevronRight, Shield, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { getDelegateTeams, DelegateTeamsResponse } from "@/services/team";
import { getUserData, isAuthenticated, logout } from "@/services/auth";

type Team = DelegateTeamsResponse["teams"][0];

export default function DelegateDashboard() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [delegateName, setDelegateName] = useState("Delegado");
  const [delegatePhone, setDelegatePhone] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check authentication
    if (!isAuthenticated()) {
      toast({
        title: "Sesión no válida",
        description: "Por favor inicia sesión",
        variant: "destructive",
      });
      navigate("/delegate-login");
      return;
    }

    // Get user data and load teams
    const userData = getUserData();
    if (userData) {
      setDelegateName(userData.name);
      setDelegatePhone(userData.phone);
      // Load teams with phone directly
      loadDelegateTeams(userData.phone);
    }
  }, []);

  const loadDelegateTeams = async (phone: string) => {
    if (!phone) return;

    try {
      setLoading(true);
      const response = await getDelegateTeams(phone);
      setTeams(response.teams);
      setDelegateName(response.delegado.name);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "No se pudieron cargar los equipos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión correctamente",
    });
    navigate("/");
  };

  const getSportFromName = (name: string) => {
    const nameLower = name.toLowerCase();
    return nameLower.includes("futbol") || nameLower.includes("fútbol") ? "futbol" : "voley";
  };

  const getSportColor = (tournamentName: string) => {
    const sport = getSportFromName(tournamentName);
    return sport === "futbol"
      ? "bg-emerald-100 text-emerald-700 border-emerald-200"
      : "bg-orange-100 text-orange-700 border-orange-200";
  };

  const getSportEmoji = (tournamentName: string) => {
    const sport = getSportFromName(tournamentName);
    return sport === "futbol" ? "⚽" : "🏐";
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
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/fondotorneo.jpg"
          alt="Background"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100/90 via-indigo-50/90 to-slate-100/90"></div>
      </div>

      <div className="relative z-10 container mx-auto p-4 md:p-8 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800">Panel de Delegado</h1>
                <p className="text-slate-500">Bienvenido, {delegateName}</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <LogOut className="h-4 w-4" />
              Cerrar Sesión
            </Button>
          </div>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Equipos Asignados</p>
                  <p className="text-4xl font-bold text-slate-800">{teams.length}</p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-indigo-600/20 rounded-full flex items-center justify-center">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Teams List */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
          {teams.length === 0 ? (
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="bg-slate-100 p-6 rounded-full mb-4">
                  <Trophy className="h-12 w-12 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                  No tienes equipos asignados
                </h3>
                <p className="text-slate-500 text-center max-w-md">
                  Aún no se te ha asignado ningún equipo. Contacta con el organizador del torneo.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-slate-800 mb-4">Mis Equipos</h2>
              {teams.map((team) => (
                <motion.div key={team.id} variants={item}>
                  <Card
                    className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
                    onClick={() => navigate(`/team/${team.id}/players`)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-3xl">{getSportEmoji(team.tournament.name)}</span>
                            <CardTitle className="text-xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                              {team.name}
                            </CardTitle>
                          </div>
                          <CardDescription className="space-y-1">
                            <div className="flex items-center gap-2 text-slate-500">
                              <Trophy className="h-3 w-3" />
                              {team.tournament.name}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                              <Calendar className="h-3 w-3" />
                              Creado: {formatDate(team.createdAt)}
                            </div>
                          </CardDescription>
                        </div>
                        <Badge
                          variant="outline"
                          className={`${getSportColor(team.tournament.name)} border font-medium`}
                        >
                          {getSportFromName(team.tournament.name) === "futbol" ? "Fútbol" : "Voley"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Users className="h-4 w-4 text-blue-500" />
                          <span className="font-medium">{team.playersCount} {team.playersCount === 1 ? "jugador" : "jugadores"}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 group-hover:translate-x-1 transition-all gap-2"
                        >
                          Gestionar Jugadores
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </>
          )}
        </motion.div>

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <Card className="bg-blue-50/50 backdrop-blur-sm border-blue-100">
            <CardContent className="p-4">
              <p className="text-sm text-blue-800">
                <strong>Nota:</strong> Como delegado, puedes gestionar los jugadores de tus equipos asignados.
                Si necesitas ayuda, contacta al organizador del torneo.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
