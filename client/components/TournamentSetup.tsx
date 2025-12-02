import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Team, calculatePreliminaryRound } from "@/lib/tournament";
import { Trash2, Loader, Trophy, Users, Settings } from "lucide-react";
import { createTournament, TournamentData } from "@/services/tournament";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

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
          error instanceof Error ? error.message : "No se pudo crear el torneo",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const canStart = teams.length === teamCount;

  return (
    <div className="min-h-screen bg-background text-foreground p-6 flex flex-col items-center relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/fondotorneo.jpg"
          alt="Background"
          className="w-full h-full object-cover opacity-15"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/90 via-slate-50/90 to-white/90"></div>
      </div>

      <div className="max-w-5xl w-full relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center p-3 bg-blue-50 rounded-full mb-4 ring-1 ring-blue-100">
            <Trophy className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-2 text-gradient-gold drop-shadow-sm">
            Gestor de Torneo
          </h1>
          <p className="text-slate-500 text-lg">
            Configura tu torneo de eliminación directa
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-8 h-full glass border-0 shadow-xl flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Settings className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">Configuración</h2>
              </div>

              <div className="space-y-6 flex-1">
                <div>
                  <label className="text-sm font-medium text-slate-500 mb-2 block">
                    Número de equipos (2-128)
                  </label>
                  <Input
                    type="number"
                    min="2"
                    max="128"
                    value={teamCountInput}
                    onChange={(e) => handleTeamCountChange(e.target.value)}
                    className="text-lg font-bold h-12 bg-white border-slate-200 focus:border-blue-500 text-slate-800"
                  />
                </div>

                <div className="pt-2">
                  <p className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">
                    Atajos rápidos
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {[4, 8, 16, 32].map((size) => (
                      <button
                        key={size}
                        onClick={() => handleTeamCountChange(String(size))}
                        className={`py-2 px-3 rounded-lg font-bold text-sm transition-all duration-200 border ${teamCount === size
                            ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                          }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {preliminary.preliminaryMatches > 0 && (
                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl">
                    <p className="text-sm text-amber-800">
                      <span className="font-bold text-amber-600">Fase Previa:</span> Se
                      necesitarán{" "}
                      <span className="font-bold text-amber-600">
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

                <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl mt-auto">
                  <p className="text-sm text-blue-800">
                    <span className="font-bold text-blue-600">Estructura:</span> {teamCount}{" "}
                    equipos
                    {preliminary.preliminaryMatches > 0
                      ? ` → ${preliminary.preliminaryMatches} fase${preliminary.preliminaryMatches !== 1 ? "s" : ""} previa → `
                      : " → "}
                    Bracket de {teamCount - preliminary.preliminaryMatches * 2}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-8 h-full glass border-0 shadow-xl flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Users className="w-5 h-5 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">
                  Equipos <span className="text-slate-400 text-lg font-normal ml-2">({teams.length}/{teamCount})</span>
                </h2>
              </div>

              <div className="space-y-4 flex-1 flex flex-col">
                <div className="flex-1 flex flex-col">
                  <label className="text-sm font-medium text-slate-500 mb-2 block">
                    Ingresa los nombres (uno por línea)
                  </label>
                  <textarea
                    placeholder={`Equipo 1\nEquipo 2\nEquipo 3\n...`}
                    value={teamInputText}
                    onChange={(e) => handleTeamInputChange(e.target.value)}
                    className="flex-1 w-full p-4 rounded-xl bg-white border border-slate-200 text-slate-800 placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                  />
                </div>

                {teams.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <p className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">
                      Equipos agregados
                    </p>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                      {teams.map((team, idx) => (
                        <div
                          key={team.id}
                          className="flex items-center justify-between bg-slate-50 p-3 rounded-lg group hover:bg-slate-100 transition border border-transparent hover:border-slate-200"
                        >
                          <span className="font-medium text-slate-700">
                            <span className="text-slate-400 mr-3 text-sm">#{idx + 1}</span>
                            {team.name}
                          </span>
                          <button
                            onClick={() => removeTeam(team.id)}
                            className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition p-1 hover:bg-red-50 rounded"
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
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 flex justify-center"
        >
          <Button
            onClick={handleStart}
            disabled={!canStart || isLoading}
            size="lg"
            className={`px-12 py-8 text-lg font-bold rounded-xl transition-all duration-300 flex items-center gap-3 ${canStart && !isLoading
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-2xl hover:shadow-blue-200 hover:scale-105"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
          >
            {isLoading && <Loader className="w-6 h-6 animate-spin" />}
            {isLoading
              ? "Creando Torneo..."
              : canStart
                ? "Iniciar Torneo"
                : `Faltan ${teamCount - teams.length} equipo${teamCount - teams.length !== 1 ? "s" : ""}`}
          </Button>
        </motion.div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <p className="text-sm text-slate-400">
            Powered by <span className="font-semibold text-blue-600">Unify</span>
          </p>
        </div>
      </div>
    </div>
  );
}
