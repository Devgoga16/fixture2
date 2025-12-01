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
import { RotateCcw, Trophy, Users, Loader } from "lucide-react";
import { updateMatchResult as updateMatchResultAPI, resetTournament } from "@/services/tournament";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

  const handleMatchClick = (match: Match) => {
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
      setSelectedMatch(null);

      toast({
        title: "Resultado guardado",
        description: "El resultado ha sido guardado correctamente",
      });
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

  // Calculate tournament statistics
  const completedMatches = bracket.rounds
    .flat()
    .filter((m) => m.completed).length;
  const totalMatches = bracket.rounds.flat().length;
  const finalMatch = bracket.rounds[bracket.rounds.length - 1]?.[0];
  const champion = finalMatch?.completed ? finalMatch.winner : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-0 md:mb-6">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-1 md:mb-2 truncate">
                Torneo de Eliminación Directa
              </h1>
              <p className="text-sm md:text-base text-gray-600 truncate">
                {teamSize} equipos - {totalMatches} partidos en total
              </p>
            </div>
            <Button
              onClick={onReset}
              variant="outline"
              className="gap-2 flex-shrink-0"
              size="sm"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Nuevo Torneo</span>
              <span className="sm:hidden">Nuevo</span>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
            <Card className="p-3 md:p-4 border-0 bg-gradient-to-br from-blue-50 to-blue-100">
              <p className="text-xs md:text-sm text-gray-600 mb-1">Equipos</p>
              <p className="text-2xl md:text-3xl font-bold text-blue-600">
                {teamSize}
              </p>
            </Card>
            <Card className="p-3 md:p-4 border-0 bg-gradient-to-br from-purple-50 to-purple-100">
              <p className="text-xs md:text-sm text-gray-600 mb-1 line-clamp-2">
                Partidos
              </p>
              <p className="text-2xl md:text-3xl font-bold text-purple-600">
                {completedMatches}/{totalMatches}
              </p>
            </Card>
            <Card className="p-3 md:p-4 border-0 bg-gradient-to-br from-emerald-50 to-emerald-100">
              <p className="text-xs md:text-sm text-gray-600 mb-1">Progreso</p>
              <p className="text-2xl md:text-3xl font-bold text-emerald-600">
                {Math.round((completedMatches / totalMatches) * 100)}%
              </p>
            </Card>
            <Card className="p-3 md:p-4 border-0 bg-gradient-to-br from-amber-50 to-amber-100">
              <p className="text-xs md:text-sm text-gray-600 mb-1">Fase</p>
              <p className="text-2xl md:text-3xl font-bold text-amber-600">
                {!champion ? `${bracket.rounds.length}` : "✓"}
              </p>
            </Card>
          </div>

          {/* Champion */}
          {champion && (
            <div className="mt-6 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 rounded-lg p-6 shadow-lg">
              <div className="flex items-center gap-4">
                <Trophy className="w-8 h-8 text-amber-900 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-amber-900 uppercase">
                    🎉 ¡Torneo Completado!
                  </p>
                  <p className="text-3xl font-bold text-amber-900">
                    {champion.name}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-8">
        <Card className="border-0 shadow-lg bg-white overflow-hidden">
          <div className="p-4 md:p-6 border-b border-gray-200">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2 md:gap-3">
              <Trophy className="w-5 md:w-6 h-5 md:h-6 text-amber-500" />
              Fixture del Torneo
            </h2>
          </div>
          <BracketDisplay bracket={bracket} onMatchClick={handleMatchClick} />
        </Card>

        {/* Teams List */}
        <div className="mt-8 grid md:grid-cols-2 gap-8">
          {/* All Teams */}
          <Card className="border-0 shadow-lg p-6 bg-white">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Equipos ({teams.length})
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {teams.map((team, idx) => (
                <div
                  key={team.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-150 transition"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white flex items-center justify-center font-bold text-sm">
                    {idx + 1}
                  </div>
                  <span className="font-medium text-gray-900">{team.name}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Instructions */}
          <Card className="border-0 shadow-lg p-6 bg-white">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Instrucciones
            </h3>
            <div className="space-y-4 text-gray-700">
              <div>
                <p className="font-semibold text-blue-600 mb-1">
                  1. Revisa el Fixture
                </p>
                <p className="text-sm">
                  Todos los partidos están organizados en rondas.
                </p>
              </div>
              <div>
                <p className="font-semibold text-blue-600 mb-1">
                  2. Ingresa Resultados
                </p>
                <p className="text-sm">
                  Haz clic en un partido para agregar los puntajes.
                </p>
              </div>
              <div>
                <p className="font-semibold text-blue-600 mb-1">
                  3. Avanza Ganadores
                </p>
                <p className="text-sm">
                  El ganador avanza automáticamente a la siguiente ronda.
                </p>
              </div>
              <div>
                <p className="font-semibold text-blue-600 mb-1">
                  4. ¡Decide el Campeón!
                </p>
                <p className="text-sm">
                  Cuando se complete la final, tendrás un campeón.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Match Result Dialog */}
      <MatchResultDialog
        match={selectedMatch}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSaveResult}
      />
    </div>
  );
}
