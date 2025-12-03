import { useEffect, useState } from "react";
import { TournamentListItem } from "@shared/api";
import { getTournaments } from "@/services/tournament";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trophy, Calendar, Users, ArrowRight, Shield, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export function TournamentSelector() {
  const [tournaments, setTournaments] = useState<TournamentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadTournaments();
  }, []);

  const loadTournaments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTournaments();
      setTournaments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar los torneos");
    } finally {
      setLoading(false);
    }
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

  if (error) {
    return (
      <div className="container mx-auto p-8 flex items-center justify-center min-h-screen">
        <Card className="border-destructive/50 bg-destructive/5 max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
            <CardDescription className="text-destructive/80">{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={loadTournaments} className="w-full">
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center p-4 md:p-8 overflow-hidden bg-background selection:bg-primary/20">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/fondotorneo.jpg"
          alt="Background"
          className="w-full h-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100/80 via-indigo-50/80 to-slate-100/80"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-200/40 via-transparent to-transparent"></div>
      </div>

      <div className="max-w-7xl w-full relative z-10">
        {/* Action Buttons - Top Right */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute top-4 right-4 flex gap-3"
        >
          <Button
            onClick={() => navigate("/organizer-login")}
            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Crown className="mr-2 h-4 w-4" />
            Soy Organizador
          </Button>
          <Button
            onClick={() => navigate("/delegate-login")}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Shield className="mr-2 h-4 w-4" />
            Soy Delegado
          </Button>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20 pt-10"
        >
          <div className="inline-block mb-8 relative group">
            <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl group-hover:bg-blue-500/30 transition-all duration-500"></div>
            <div className="relative bg-white p-4 rounded-full border border-slate-100 shadow-2xl">
              <img
                src="/images/iacymcomaslogo.jpg"
                alt="IACYM Logo"
                className="h-32 w-32 object-contain rounded-full"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    parent.innerHTML = '<div class="h-32 w-32 flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 rounded-full"><svg class="h-16 w-16 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m0 0v2m0-2h2m-2 0H10m-4-7h.01M6 9h.01m7.99 0h.01M18 9h.01M7.5 19.5L7 21l-1-1m11-1l.5 1.5 1-1M12 5a9 9 0 110 18 9 9 0 010-18z"></path></svg></div>';
                  }
                }}
              />
            </div>
          </div>

          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <span className="text-slate-900 drop-shadow-sm">UNIDOS</span>
            <span className="text-gradient-gold drop-shadow-sm">EN</span>
            <span className="text-slate-900 drop-shadow-sm">CRISTO</span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-500 font-light tracking-widest uppercase">
            Fixture Oficial 2025
          </p>
        </motion.div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Fútbol Section */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-8"
          >
            <div className="relative group overflow-hidden rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/80 via-emerald-900/20 to-transparent z-10"></div>
              <img
                src="/images/futbol.jpg"
                alt="Fútbol"
                className="w-full h-64 object-cover transform group-hover:scale-110 transition-transform duration-700"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.classList.add('bg-gradient-to-br', 'from-emerald-500', 'to-green-600');
                }}
              />
              <div className="absolute bottom-0 left-0 p-8 z-20">
                <div className="flex items-center gap-4 mb-2">
                  <span className="text-4xl drop-shadow-lg">⚽</span>
                  <h2 className="text-4xl font-black text-white tracking-tight drop-shadow-lg">FÚTBOL</h2>
                </div>
                <div className="h-1 w-20 bg-emerald-400 rounded-full shadow-lg"></div>
              </div>
            </div>

            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid gap-4"
            >
              {tournaments
                .filter((t) => t.name.toLowerCase().includes("futbol") || t.name.toLowerCase().includes("fútbol"))
                .map((tournament) => (
                  <motion.div key={tournament.id} variants={item}>
                    <Card
                      className="glass glass-hover group cursor-pointer border-l-4 border-l-emerald-500 hover:border-l-emerald-600 transition-all duration-300"
                      onClick={() => navigate(`/tournament/${tournament.id}`)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-4">
                          <CardTitle className="text-lg font-bold text-slate-800 group-hover:text-emerald-600 transition-colors">
                            {tournament.name}
                          </CardTitle>
                          {getStatusBadge(tournament.status)}
                        </div>
                        <CardDescription className="flex items-center gap-2 text-slate-500">
                          <Calendar className="h-3 w-3" />
                          {formatDate(tournament.createdAt)}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Users className="h-4 w-4 text-emerald-500" />
                            <span>{tournament.totalTeams} equipos</span>
                          </div>
                          <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 group-hover:translate-x-1 transition-all">
                            Ver Fixture <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              {tournaments.filter((t) => t.name.toLowerCase().includes("futbol") || t.name.toLowerCase().includes("fútbol")).length === 0 && (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                  <p className="text-slate-400 font-medium">No hay torneos de fútbol activos</p>
                </div>
              )}
            </motion.div>
          </motion.div>

          {/* Voley Section */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-8"
          >
            <div className="relative group overflow-hidden rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-t from-orange-900/80 via-orange-900/20 to-transparent z-10"></div>
              <img
                src="/images/voley.jpeg"
                alt="Voley"
                className="w-full h-64 object-cover transform group-hover:scale-110 transition-transform duration-700"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.classList.add('bg-gradient-to-br', 'from-orange-500', 'to-amber-600');
                }}
              />
              <div className="absolute bottom-0 left-0 p-8 z-20">
                <div className="flex items-center gap-4 mb-2">
                  <span className="text-4xl drop-shadow-lg">🏐</span>
                  <h2 className="text-4xl font-black text-white tracking-tight drop-shadow-lg">VOLEY</h2>
                </div>
                <div className="h-1 w-20 bg-orange-400 rounded-full shadow-lg"></div>
              </div>
            </div>

            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid gap-4"
            >
              {tournaments
                .filter((t) => t.name.toLowerCase().includes("voley") || t.name.toLowerCase().includes("vóley") || t.name.toLowerCase().includes("voleibol"))
                .map((tournament) => (
                  <motion.div key={tournament.id} variants={item}>
                    <Card
                      className="glass glass-hover group cursor-pointer border-l-4 border-l-orange-500 hover:border-l-orange-600 transition-all duration-300"
                      onClick={() => navigate(`/tournament/${tournament.id}`)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-4">
                          <CardTitle className="text-lg font-bold text-slate-800 group-hover:text-orange-600 transition-colors">
                            {tournament.name}
                          </CardTitle>
                          {getStatusBadge(tournament.status)}
                        </div>
                        <CardDescription className="flex items-center gap-2 text-slate-500">
                          <Calendar className="h-3 w-3" />
                          {formatDate(tournament.createdAt)}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Users className="h-4 w-4 text-orange-500" />
                            <span>{tournament.totalTeams} equipos</span>
                          </div>
                          <Button variant="ghost" size="sm" className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 group-hover:translate-x-1 transition-all">
                            Ver Fixture <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              {tournaments.filter((t) => t.name.toLowerCase().includes("voley") || t.name.toLowerCase().includes("vóley") || t.name.toLowerCase().includes("voleibol")).length === 0 && (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                  <p className="text-slate-400 font-medium">No hay torneos de voley activos</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        </div>

        {/* Empty State Global */}
        {tournaments.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-20"
          >
            <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-lg max-w-2xl mx-auto">
              <CardContent className="flex flex-col items-center justify-center py-20">
                <div className="bg-blue-50 p-6 rounded-full mb-6 ring-1 ring-blue-100">
                  <Trophy className="h-16 w-16 text-blue-500" />
                </div>
                <h3 className="text-3xl font-bold mb-3 text-slate-800">No hay torneos disponibles</h3>
                <p className="text-slate-500 text-lg mb-6">
                  Sé el primero en crear una competencia
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Footer */}
        <div className="mt-32 text-center pb-8">
          <p className="text-sm text-slate-400 font-medium">
            Powered by <span className="font-bold text-blue-600">Unify</span>
          </p>
        </div>
      </div>
    </div>
  );
}
