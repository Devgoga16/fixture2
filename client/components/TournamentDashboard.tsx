import { useState } from "react";
import {
  Bracket,
  Match,
  Team,
  updateMatchResult,
} from "@/lib/tournament";
import { BracketDisplay } from "./BracketDisplay";
import { MatchResultDialog } from "./MatchResultDialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RotateCcw, Trophy, Users, Loader, Home, Activity, Calendar, Award, Lock, Unlock } from "lucide-react";
import { updateMatchResult as updateMatchResultAPI, resetTournament } from "@/services/tournament";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface TournamentDashboardProps {
  teams: Team[];
  teamSize: number;
  tournamentId: string;
  bracket: Bracket;
  onBracketUpdate: (bracket: Bracket) => void;
  onReset: () => void;
}

export function TournamentDashboard({
  teams,
  teamSize,
  tournamentId,
  bracket: initialBracket,
  onBracketUpdate,
  onReset,
}: TournamentDashboardProps) {
  const [bracket, setBracket] = useState<Bracket>(initialBracket);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleMatchClick = (match: Match) => {
    // Only allow editing in admin mode
    if (!isAdminMode) {
      toast({
        title: "Modo lectura",
        description: "Activa el modo administrador para editar resultados",
        variant: "default",
      });
      return;
    }

    if (match.team1 && match.team2) {
      setSelectedMatch(match);
      setDialogOpen(true);
    }
  };

  const handleSaveResult = async (score1: number, score2: number) => {
    if (!selectedMatch) return;

    try {
      setIsSaving(true);

      const response = await updateMatchResultAPI(
        tournamentId,
        selectedMatch.id,
        { score1, score2 },
      );

      const newBracket = response.bracket;
      setBracket(newBracket);
      onBracketUpdate(newBracket);

      toast({
        title: "Resultado guardado",
        description: "El resultado ha sido guardado correctamente",
      });

      setDialogOpen(false);
      setSelectedMatch(null);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "No se pudo guardar el resultado",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetTournament = async () => {
    if (!confirm("¿Estás seguro de que deseas reiniciar el torneo?")) return;

    try {
      setIsResetting(true);

      await resetTournament(tournamentId);

      toast({
        title: "Torneo reiniciado",
        description: "El torneo ha sido reiniciado correctamente",
      });

      onReset();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "No se pudo reiniciar el torneo",
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
    }
  };

  const completedMatches = bracket.rounds
    .flat()
    .filter((m) => m.completed).length;
  const totalMatches = bracket.rounds.flat().length;
  const finalMatch = bracket.rounds[bracket.rounds.length - 1]?.[0];
  const champion = finalMatch?.completed ? finalMatch.winner : null;

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
        <div className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
                    <Trophy className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl md:text-2xl font-bold text-slate-900">
                      Torneo de Eliminación
                    </h1>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                      <span>{teamSize} equipos</span>
                      <span>•</span>
                      <span>{completedMatches}/{totalMatches} partidos</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Admin Mode Toggle */}
                <Button
                  onClick={() => setIsAdminMode(!isAdminMode)}
                  variant={isAdminMode ? "default" : "outline"}
                  size="sm"
                  className={`gap-2 ${isAdminMode
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                      : "text-slate-600 hover:text-blue-600 hover:border-blue-400"
                    }`}
                >
                  {isAdminMode ? (
                    <>
                      <Unlock className="w-4 h-4" />
                      <span className="hidden sm:inline">Admin</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span className="hidden sm:inline">Lectura</span>
                    </>
                  )}
                </Button>

                <Button
                  onClick={() => navigate("/")}
                  variant="ghost"
                  size="sm"
                  className="text-slate-600 hover:text-blue-600"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Inicio
                </Button>
              </div>
            </div>

            {/* Mode indicator banner */}
            {isAdminMode && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-3 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg"
              >
                <p className="text-xs text-blue-700 flex items-center gap-2">
                  <Unlock className="w-3 h-3" />
                  <span className="font-semibold">Modo Administrador:</span>
                  <span>Puedes editar resultados y gestionar el torneo</span>
                </p>
              </motion.div>
            )}

            {/* Champion */}
            {champion && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-4 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-md">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">
                      Campeón
                    </p>
                    <p className="text-xl md:text-2xl font-black text-slate-900">
                      {champion.name}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Progress */}
            {!champion && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-600">Progreso</span>
                  <span className="text-xs font-bold text-blue-600">
                    {Math.round((completedMatches / totalMatches) * 100)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(completedMatches / totalMatches) * 100}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 relative z-10 space-y-6">
        {/* Bracket Card */}
        <Card className="border border-slate-200/60 shadow-md glass overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200/60 bg-white/60 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              Fixture
            </h2>
            {!isAdminMode && (
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Lock className="w-3 h-3" />
                <span>Solo lectura</span>
              </div>
            )}
          </div>
          <div className="p-4 overflow-x-auto custom-scrollbar bg-white/40">
            <BracketDisplay
              bracket={bracket}
              onMatchClick={handleMatchClick}
              isAdminMode={isAdminMode}
            />
          </div>
        </Card>

        {/* Teams */}
        <Card className="border border-slate-200/60 shadow-md glass overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200/60 bg-white/60">
            <h2 className="text-lg font-bold text-slate-900">
              Equipos ({teams.length})
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {teams.map((team, idx) => (
                <div
                  key={team.id}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-white/60 hover:bg-white border border-transparent hover:border-blue-200 transition-all group"
                >
                  <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold group-hover:bg-blue-500 group-hover:text-white transition-colors">
                    {idx + 1}
                  </div>
                  <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">
                    {team.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <MatchResultDialog
        match={selectedMatch}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSaveResult}
        isSaving={isSaving}
      />

      {/* Footer */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 text-center relative z-10">
        <p className="text-xs text-slate-400">
          Powered by <span className="font-semibold text-blue-600">Unify</span>
        </p>
      </div>
    </div>
  );
}
