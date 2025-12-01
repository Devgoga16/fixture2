import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Team, TeamSize, calculatePreliminaryRound } from "@/lib/tournament";
import { Trash2, Plus } from "lucide-react";

interface TournamentSetupProps {
  onTournamentStart: (teams: Team[], size: TeamSize) => void;
}

export function TournamentSetup({ onTournamentStart }: TournamentSetupProps) {
  const [teamCount, setTeamCount] = useState<TeamSize>(8);
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamName, setTeamName] = useState("");

  const teamOptions: TeamSize[] = [4, 8, 16, 32];
  const preliminary = calculatePreliminaryRound(teamCount);

  const addTeam = () => {
    if (teamName.trim() && teams.length < teamCount) {
      setTeams([...teams, { id: `team-${Date.now()}`, name: teamName }]);
      setTeamName("");
    }
  };

  const removeTeam = (id: string) => {
    setTeams(teams.filter(t => t.id !== id));
  };

  const handleStart = () => {
    if (teams.length === teamCount) {
      onTournamentStart(teams, teamCount);
    }
  };

  const canStart = teams.length === teamCount;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Gestor de Torneo
          </h1>
          <p className="text-gray-600 text-lg">Configura tu torneo de eliminación directa</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Team Size Selection */}
          <Card className="p-8 border-0 shadow-lg bg-white">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">1. Cantidad de Equipos</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              {teamOptions.map((size) => (
                <button
                  key={size}
                  onClick={() => {
                    setTeamCount(size);
                    setTeams([]);
                  }}
                  className={`py-4 px-6 rounded-lg font-bold text-lg transition-all duration-200 ${
                    teamCount === size
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-105"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>

            {preliminary.preliminaryMatches > 0 && (
              <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded">
                <p className="text-sm text-amber-800">
                  <span className="font-bold">Información:</span> Se necesitarán {preliminary.preliminaryMatches} partidos en la fase previa. {preliminary.byes} equipo{preliminary.byes !== 1 ? "s" : ""} descansarán.
                </p>
              </div>
            )}
          </Card>

          {/* Teams Input */}
          <Card className="p-8 border-0 shadow-lg bg-white">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">2. Equipos ({teams.length}/{teamCount})</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Nombre del equipo"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addTeam()}
                  disabled={teams.length >= teamCount}
                  className="flex-1"
                />
                <Button
                  onClick={addTeam}
                  disabled={teams.length >= teamCount || !teamName.trim()}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
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
          </Card>
        </div>

        {/* Start Button */}
        <div className="mt-12 flex justify-center">
          <Button
            onClick={handleStart}
            disabled={!canStart}
            size="lg"
            className={`px-12 py-6 text-lg font-bold rounded-lg transition-all duration-200 ${
              canStart
                ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-2xl hover:scale-105"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {canStart ? "Iniciar Torneo" : `Faltan ${teamCount - teams.length} equipo(s)`}
          </Button>
        </div>
      </div>
    </div>
  );
}
