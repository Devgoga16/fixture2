import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Team, calculatePreliminaryRound } from "@/lib/tournament";
import { Trash2, Loader } from "lucide-react";
import { createTournament, TournamentData } from "@/services/tournament";
import { useToast } from "@/hooks/use-toast";

interface TournamentSetupProps {
  onTournamentStart: (
    teams: Team[],
    size: number,
    tournamentData: TournamentData,
  ) => void;
}

export function TournamentSetup({ onTournamentStart }: TournamentSetupProps) {
  const [teamCount, setTeamCount] = useState<number>(8);
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamInputText, setTeamInputText] = useState("");
  const [teamCountInput, setTeamCountInput] = useState<string>("8");
  const [isLoading, setIsLoading] = useState(false);

  const preliminary = calculatePreliminaryRound(teamCount);

  const handleTeamCountChange = (value: string) => {
    setTeamCountInput(value);
    const num = parseInt(value) || 0;
    if (num > 0 && num <= 128) {
      setTeamCount(num);
      setTeams([]);
      setTeamInputText("");
    }
  };

  const handleTeamInputChange = (value: string) => {
    setTeamInputText(value);

    const teamNames = value
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .slice(0, teamCount);

    const newTeams = teamNames.map((name, idx) => ({
      id: `team-${idx}`,
      name,
    }));

    setTeams(newTeams);
  };

  const removeTeam = (id: string) => {
    const updatedTeams = teams.filter((t) => t.id !== id);
    setTeams(updatedTeams);

    const updatedText = updatedTeams.map((t) => t.name).join("\n");
    setTeamInputText(updatedText);
  };

  const { toast } = useToast();

  const handleStart = async () => {
    if (teams.length !== teamCount) return;

    try {
      setIsLoading(true);

      const tournamentData = await createTournament({
        name: `Torneo ${new Date().toLocaleDateString()}`,
        teams: teams.map((t) => ({ name: t.name })),
      });

      toast({
        title: "Torneo creado",
        description: "Tu torneo ha sido creado exitosamente",
      });

      onTournamentStart(teams, teamCount, tournamentData);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "No se pudo crear el torneo",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const canStart = teams.length === teamCount;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Gestor de Torneo
          </h1>
          <p className="text-gray-600 text-lg">
            Configura tu torneo de eliminación directa
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="p-8 border-0 shadow-lg bg-white">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              1. Cantidad de Equipos
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Número de equipos (2-128)
                </label>
                <Input
                  type="number"
                  min="2"
                  max="128"
                  value={teamCountInput}
                  onChange={(e) => handleTeamCountChange(e.target.value)}
                  className="text-lg font-bold h-12 border-2"
                />
              </div>

              <div className="pt-4">
                <p className="text-xs font-semibold text-gray-600 mb-3 uppercase">
                  Atajos rápidos
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {[4, 8, 16, 32].map((size) => (
                    <button
                      key={size}
                      onClick={() => handleTeamCountChange(String(size))}
                      className={`py-2 px-3 rounded-lg font-bold text-sm transition-all duration-200 ${
                        teamCount === size
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {preliminary.preliminaryMatches > 0 && (
                <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded mt-4">
                  <p className="text-sm text-amber-800">
                    <span className="font-bold">Fase Previa:</span> Se
                    necesitarán{" "}
                    <span className="font-bold">
                      {preliminary.preliminaryMatches}
                    </span>{" "}
                    partido{preliminary.preliminaryMatches !== 1 ? "s" : ""} en
                    la fase previa.{" "}
                    {preliminary.byes > 0
                      ? `${preliminary.byes} equipo${preliminary.byes !== 1 ? "s" : ""} descansará${preliminary.byes !== 1 ? "n" : ""} en esa ronda.`
                      : ""}
                  </p>
                </div>
              )}

              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                <p className="text-sm text-blue-800">
                  <span className="font-bold">Estructura:</span> {teamCount}{" "}
                  equipos
                  {preliminary.preliminaryMatches > 0
                    ? ` → ${preliminary.preliminaryMatches} fase${preliminary.preliminaryMatches !== 1 ? "s" : ""} previa → `
                    : " → "}
                  Bracket de {teamCount - preliminary.preliminaryMatches * 2}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-8 border-0 shadow-lg bg-white flex flex-col">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              2. Equipos ({teams.length}/{teamCount})
            </h2>

            <div className="space-y-4 flex-1 flex flex-col">
              <div className="flex-1 flex flex-col">
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Ingresa los nombres de los equipos (uno por línea)
                </label>
                <textarea
                  placeholder={`Equipo 1
Equipo 2
Equipo 3
...`}
                  value={teamInputText}
                  onChange={(e) => handleTeamInputChange(e.target.value)}
                  className="flex-1 p-4 border-2 border-gray-200 rounded-lg font-medium text-gray-800 resize-none focus:border-blue-500 focus:outline-none placeholder-gray-400"
                />
              </div>

              {teams.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs font-semibold text-gray-600 mb-3 uppercase">
                    Equipos agregados
                  </p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {teams.map((team, idx) => (
                      <div
                        key={team.id}
                        className="flex items-center justify-between bg-gray-50 p-3 rounded-lg group hover:bg-gray-100 transition"
                      >
                        <span className="font-medium text-gray-800">
                          <span className="text-gray-500 mr-3">#{idx + 1}</span>
                          {team.name}
                        </span>
                        <button
                          onClick={() => removeTeam(team.id)}
                          className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        <div className="mt-12 flex justify-center">
          <Button
            onClick={handleStart}
            disabled={!canStart || isLoading}
            size="lg"
            className={`px-12 py-6 text-lg font-bold rounded-lg transition-all duration-200 flex items-center gap-2 ${
              canStart && !isLoading
                ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-2xl hover:scale-105"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {isLoading && <Loader className="w-5 h-5 animate-spin" />}
            {isLoading
              ? "Creando Torneo..."
              : canStart
                ? "Iniciar Torneo"
                : `Faltan ${teamCount - teams.length} equipo${teamCount - teams.length !== 1 ? "s" : ""}`}
          </Button>
        </div>
      </div>
    </div>
  );
}
