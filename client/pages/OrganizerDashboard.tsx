import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trophy, LogOut, ChevronRight, Crown, Users, Calendar, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { getUserData, logout, isAuthenticated } from "@/services/auth";
import { getTournaments } from "@/services/tournament";
import type { TournamentListItem } from "@shared/api";

export default function OrganizerDashboard() {
  const [tournaments, setTournaments] = useState<TournamentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [organizerName, setOrganizerName] = useState("Organizador");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Verificar autenticación
    if (!isAuthenticated()) {
      toast({
        title: "Sesión no válida",
        description: "Por favor inicia sesión",
        variant: "destructive",
      });
      navigate("/organizer-login");
      return;
    }

    // Obtener datos del usuario
    const userData = getUserData();
    if (userData) {
      setOrganizerName(userData.name);
    }

    loadOrganizerTournaments();
  }, []);

  const loadOrganizerTournaments = async () => {
    try {
      setLoading(true);
      const data = await getTournaments();
      setTournaments(data);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "No se pudieron cargar los torneos",
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

  const getSportColor = (sport: string) => {
    const sportLower = sport.toLowerCase();
    return sportLower.includes("futbol") || sportLower.includes("fútbol")
      ? "bg-emerald-100 text-emerald-700 border-emerald-200"
      : "bg-orange-100 text-orange-700 border-orange-200";
  };

  const getStatusBadge = (status: TournamentListItem["status"]) => {
    const statusConfig = {
      draft: { label: "Borrador", className: "bg-slate-100 text-slate-600 border-slate-200" },
      in_progress: { label: "En curso", className: "bg-blue-100 text-blue-700 border-blue-200" },
      completed: { label: "Finalizado", className: "bg-green-100 text-green-700 border-green-200" },
    };
    const config = statusConfig[status];
    return (
      <Badge variant="outline" className={`${config.className} border font-medium`}>
        {config.label}
      </Badge>
    );
  };

  const getSportEmoji = (sport: string) => {
    const sportLower = sport.toLowerCase();
    return sportLower.includes("futbol") || sportLower.includes("fútbol") ? "⚽" : "🏐";
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

  const statsData = [
    {
      label: "Total Torneos",
      value: tournaments.length,
      icon: Trophy,
      color: "from-amber-500 to-orange-600",
    },
    {
      label: "En Curso",
      value: tournaments.filter((t) => t.status === "in_progress").length,
      icon: Calendar,
      color: "from-blue-500 to-indigo-600",
    },
    {
      label: "Total Equipos",
      value: tournaments.reduce((acc, t) => acc + t.totalTeams, 0),
      icon: Users,
      color: "from-emerald-500 to-green-600",
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/fondotorneo.jpg"
          alt="Background"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-amber-100/90 via-orange-50/90 to-slate-100/90"></div>
      </div>

      <div className="relative z-10 container mx-auto p-4 md:p-8 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
                <Crown className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800">Panel de Organizador</h1>
                <p className="text-slate-500">Bienvenido, {organizerName}</p>
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

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {statsData.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-500 mb-1">{stat.label}</p>
                        <p className="text-4xl font-bold text-slate-800">{stat.value}</p>
                      </div>
                      <div className={`w-16 h-16 bg-gradient-to-br ${stat.color} rounded-full flex items-center justify-center opacity-20`}>
                        <stat.icon className="h-8 w-8 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Create Tournament Button */}
          <Button
            onClick={() => navigate("/new")}
            className="w-full md:w-auto bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Plus className="mr-2 h-5 w-5" />
            Crear Nuevo Torneo
          </Button>
        </motion.div>

        {/* Tournaments List */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
          {tournaments.length === 0 ? (
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="bg-slate-100 p-6 rounded-full mb-4">
                  <Trophy className="h-12 w-12 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                  No tienes torneos creados
                </h3>
                <p className="text-slate-500 text-center max-w-md mb-6">
                  Comienza creando tu primer torneo y gestiona todos los aspectos de la competencia.
                </p>
                <Button
                  onClick={() => navigate("/new")}
                  className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Crear Torneo
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-slate-800 mb-4">Mis Torneos</h2>
              {tournaments.map((tournament) => (
                <motion.div key={tournament.id} variants={item}>
                  <Card
                    className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 group"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-4">
                        <div 
                          className="flex-1 cursor-pointer"
                          onClick={() => navigate(`/tournament/${tournament.id}`)}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-3xl">{getSportEmoji(tournament.name)}</span>
                            <CardTitle className="text-xl font-bold text-slate-800 group-hover:text-amber-600 transition-colors">
                              {tournament.name}
                            </CardTitle>
                          </div>
                          <CardDescription className="flex items-center gap-2 text-slate-500">
                            <Calendar className="h-3 w-3" />
                            Creado el {formatDate(tournament.createdAt)}
                          </CardDescription>
                        </div>
                        <div className="flex flex-col gap-2 items-end">
                          {getStatusBadge(tournament.status)}
                          <Badge
                            variant="outline"
                            className={`${getSportColor(tournament.name)} border font-medium`}
                          >
                            {tournament.name.toLowerCase().includes("futbol") || tournament.name.toLowerCase().includes("fútbol") ? "Fútbol" : "Voley"}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Users className="h-4 w-4 text-amber-500" />
                          <span className="font-medium">{tournament.totalTeams} equipos</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 group-hover:translate-x-1 transition-all gap-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/tournament/${tournament.id}`);
                          }}
                        >
                          Administrar Torneo
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
          <Card className="bg-amber-50/50 backdrop-blur-sm border-amber-100">
            <CardContent className="p-4">
              <p className="text-sm text-amber-800">
                <strong>Nota:</strong> Como organizador, tienes control total sobre la gestión de torneos,
                equipos, delegados y resultados de partidos.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
