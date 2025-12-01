import { useState } from "react";
import { Bracket, Match, getRoundName } from "@/lib/tournament";
import { Card } from "@/components/ui/card";
import { ChevronRight, ChevronDown } from "lucide-react";

interface BracketDisplayProps {
  bracket: Bracket;
  onMatchClick: (match: Match) => void;
}

export function BracketDisplay({ bracket, onMatchClick }: BracketDisplayProps) {
  // Determine if the first round is preliminary
  const isPreliminary = bracket.rounds[0]?.[0]?.round === -1;

  // Track which phases are expanded (all expanded by default)
  const [expandedPhases, setExpandedPhases] = useState<Set<number>>(
    new Set(bracket.rounds.map((_, idx) => idx))
  );

  const togglePhase = (roundIdx: number) => {
    const newExpanded = new Set(expandedPhases);
    if (newExpanded.has(roundIdx)) {
      newExpanded.delete(roundIdx);
    } else {
      newExpanded.add(roundIdx);
    }
    setExpandedPhases(newExpanded);
  };

  const roundNames = bracket.rounds.map((_, idx) => {
    if (isPreliminary) {
      // For preliminary round
      if (idx === 0) return "Fase Previa";
      // For main bracket rounds, adjust the round number
      const mainRoundNum = idx - 1;
      const mainRoundsCount = bracket.rounds.length - 1;
      return getRoundName(mainRoundNum, mainRoundsCount);
    } else {
      // No preliminary round
      return getRoundName(idx, bracket.rounds.length);
    }
  });

  return (
    <div className="overflow-x-auto pb-6">
      <div className="min-w-full flex gap-6 p-6">
        {bracket.rounds.map((round, roundIdx) => {
          const isExpanded = expandedPhases.has(roundIdx);

          return (
            <div key={roundIdx} className="flex-none">
              <button
                onClick={() => togglePhase(roundIdx)}
                className="mb-4 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <div className="flex-1 text-center">
                  <h3 className="text-sm font-bold text-gray-700">
                    {roundNames[roundIdx]}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {round.length} partido{round.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <ChevronDown
                    className={`w-4 h-4 text-gray-600 transition-transform ${
                      isExpanded ? "rotate-0" : "-rotate-90"
                    }`}
                  />
                </div>
              </button>

              {isExpanded && (
                <div
                  className="space-y-6 flex flex-col justify-center"
                  style={{
                    minHeight: `${Math.max(400, round.length * 120)}px`,
                  }}
                >
                  {round.map((match, matchIdx) => (
                    <MatchCard
                      key={match.id}
                      match={match}
                      onClick={() => onMatchClick(match)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface MatchCardProps {
  match: Match;
  onClick: () => void;
}

function MatchCard({ match, onClick }: MatchCardProps) {
  const isComplete = match.completed;

  return (
    <Card
      onClick={onClick}
      className={`cursor-pointer transition-all duration-200 border-2 hover:shadow-lg ${
        isComplete
          ? "border-green-200 bg-green-50"
          : match.team1 && match.team2
            ? "border-blue-200 bg-white hover:border-blue-400"
            : "border-gray-200 bg-gray-50"
      }`}
    >
      <div className="p-3 md:p-4 min-w-52 md:min-w-64">
        {/* Team 1 */}
        <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3 pb-2 md:pb-3 border-b">
          {match.team1 ? (
            <>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm md:text-base truncate">
                  {match.team1.name}
                </p>
              </div>
              {isComplete && (
                <span
                  className={`font-bold text-base md:text-lg flex-shrink-0 ${
                    match.winner?.id === match.team1.id
                      ? "text-green-600"
                      : "text-gray-400"
                  }`}
                >
                  {match.score1}
                </span>
              )}
            </>
          ) : (
            <span className="text-gray-400 italic text-xs md:text-sm">
              Por definir
            </span>
          )}
        </div>

        {/* Team 2 */}
        <div className="flex items-center gap-2 md:gap-3">
          {match.team2 ? (
            <>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm md:text-base truncate">
                  {match.team2.name}
                </p>
              </div>
              {isComplete && (
                <span
                  className={`font-bold text-base md:text-lg flex-shrink-0 ${
                    match.winner?.id === match.team2.id
                      ? "text-green-600"
                      : "text-gray-400"
                  }`}
                >
                  {match.score2}
                </span>
              )}
            </>
          ) : (
            <span className="text-gray-400 italic text-xs md:text-sm">
              Por definir
            </span>
          )}
        </div>

        {/* Status */}
        {!isComplete && match.team1 && match.team2 && (
          <div className="flex items-center justify-center mt-2 md:mt-3 pt-2 md:pt-3 border-t text-xs font-medium text-blue-600 gap-1">
            <ChevronRight className="w-3 h-3" />
            <span className="hidden md:inline">
              Haz clic para ingresar resultado
            </span>
            <span className="md:hidden">Haz clic</span>
          </div>
        )}

        {isComplete && (
          <div className="mt-2 md:mt-3 pt-2 md:pt-3 border-t text-center">
            <p className="text-xs font-bold text-green-600">✓ Completado</p>
          </div>
        )}
      </div>
    </Card>
  );
}
