import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Team, calculatePreliminaryRound } from "@/lib/tournament";
import { Trash2, Plus } from "lucide-react";

interface TournamentSetupProps {
  onTournamentStart: (teams: Team[], size: number) => void;
}

export function TournamentSetup({ onTournamentStart }: TournamentSetupProps) {
  const [teamCount, setTeamCount] = useState<number>(8);
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamName, setTeamName] = useState("");
  const [teamCountInput, setTeamCountInput] = useState<string>("8");

  const preliminary = calculatePreliminaryRound(teamCount);

  const handleTeamCountChange = (value: string) => {
    setTeamCountInput(value);
    const num = parseInt(value) || 0;
    if (num > 0 && num <= 128) {
      setTeamCount(num);
      setTeams([]);
    }
  };

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

              {/* Quick buttons */}
              <div className="pt-4">
                <p className="text-xs font-semibold text-gray-600 mb-3 uppercase">Atajos rápidos</p>
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

              {/* Preliminary Round Info */}
              {preliminary.preliminaryMatches > 0 && (
                <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded mt-4">
                  <p className="text-sm text-amber-800">
                    <span className="font-bold">Fase Previa:</span> Se necesitarán <span className="font-bold">{preliminary.preliminaryMatches}</span> partido{preliminary.preliminaryMatches !== 1 ? "s" : ""} en la fase previa. {preliminary.byes > 0 ? `${preliminary.byes} equipo${preliminary.byes !== 1 ? "s" : ""} descansará${preliminary.byes !== 1 ? "n" : ""} en esa ronda.` : ""}
                  </p>
                </div>
              )}

              {/* Bracket info */}
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                <p className="text-sm text-blue-800">
                  <span className="font-bold">Estructura:</span> {teamCount} equipos{preliminary.preliminaryMatches > 0 ? ` → ${preliminary.preliminaryMatches} fase${preliminary.preliminaryMatches !== 1 ? "s" : ""} previa → ` : " → "}Bracket de {teamCount - preliminary.preliminaryMatches * 2}
                </p>
              </div>
            </div>
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
            {canStart ? "Iniciar Torneo" : `Faltan ${teamCount - teams.length} equipo${teamCount - teams.length !== 1 ? "s" : ""}`}
          </Button>
        </div>
      </div>
    </div>
  );
}
