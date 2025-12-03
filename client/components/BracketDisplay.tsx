import { useState } from "react";
import { Bracket, Match, getRoundName } from "@/lib/tournament";
import { Card } from "@/components/ui/card";
import { ChevronRight, ChevronDown } from "lucide-react";

interface BracketDisplayProps {
  bracket: Bracket;
  onMatchClick: (match: Match) => void;
  isAdminMode?: boolean;
}

export function BracketDisplay({ bracket, onMatchClick, isAdminMode = true }: BracketDisplayProps) {
  const isPreliminary = bracket.rounds[0]?.[0]?.round === -1;

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
      if (idx === 0) return "Fase Previa";
      const mainRoundNum = idx - 1;
      const mainRoundsCount = bracket.rounds.length - 1;
      return getRoundName(mainRoundNum, mainRoundsCount);
    } else {
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
                className="mb-4 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer group"
              >
                <div className="flex-1 text-center">
                  <h3 className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">
                    {roundNames[roundIdx]}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {round.length} partido{round.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? "rotate-0" : "-rotate-90"
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
                      isAdminMode={isAdminMode}
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
  isAdminMode?: boolean;
}

function MatchCard({ match, onClick, isAdminMode = true }: MatchCardProps) {
  const isComplete = match.completed;
  const canPlay = match.team1 && match.team2 && !isComplete;
  const isPending = !match.team1 || !match.team2;

  return (
    <Card
      onClick={onClick}
      className={`cursor-pointer transition-all duration-200 ${isComplete
        ? "border-2 border-emerald-400 bg-emerald-50/50 hover:border-emerald-500 hover:shadow-lg"
        : canPlay
          ? "border-2 border-blue-400 bg-blue-50/30 hover:border-blue-500 hover:shadow-lg hover:bg-blue-50/50"
          : "border border-slate-200 bg-slate-50/50 cursor-default"
        }`}
    >
      <div className="p-4 min-w-56 md:min-w-64">
        {/* Match Status Badge */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {isComplete ? (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-100 rounded-md">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span className="text-xs font-bold text-emerald-700">Finalizado</span>
              </div>
            ) : canPlay ? (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-100 rounded-md">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-bold text-blue-700">Pendiente</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-100 rounded-md">
                <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                <span className="text-xs font-bold text-slate-500">Esperando</span>
              </div>
            )}
          </div>

          {canPlay && (
            <ChevronRight className="w-4 h-4 text-blue-500" />
          )}
        </div>

        {/* Team 1 */}
        <div className={`flex items-center justify-between p-3 rounded-lg mb-2 ${isComplete && match.winner?.id === match.team1?.id
          ? "bg-emerald-100/80 border-2 border-emerald-300"
          : "bg-white/60 border border-slate-200"
          }`}>
          {match.team1 ? (
            <>
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {isComplete && match.winner?.id === match.team1.id && (
                  <span className="text-base flex-shrink-0">🏆</span>
                )}
                <p className={`font-semibold text-sm truncate ${isComplete && match.winner?.id === match.team1.id
                  ? "text-emerald-800"
                  : "text-slate-800"
                  }`}>
                  {match.team1.name}
                </p>
              </div>
              {isComplete && (
                <span className={`font-black text-xl ml-2 ${match.winner?.id === match.team1.id
                  ? "text-emerald-700"
                  : "text-slate-400"
                  }`}>
                  {match.score1}
                </span>
              )}
            </>
          ) : (
            <span className="text-slate-400 italic text-sm">
              Ganador por definir
            </span>
          )}
        </div>

        {/* VS Divider */}
        <div className="flex items-center justify-center my-2">
          <div className="flex-1 h-px bg-slate-200"></div>
          <span className="px-3 text-xs font-bold text-slate-400">VS</span>
          <div className="flex-1 h-px bg-slate-200"></div>
        </div>

        {/* Team 2 */}
        <div className={`flex items-center justify-between p-3 rounded-lg ${isComplete && match.winner?.id === match.team2?.id
          ? "bg-emerald-100/80 border-2 border-emerald-300"
          : "bg-white/60 border border-slate-200"
          }`}>
          {match.team2 ? (
            <>
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {isComplete && match.winner?.id === match.team2.id && (
                  <span className="text-base flex-shrink-0">🏆</span>
                )}
                <p className={`font-semibold text-sm truncate ${isComplete && match.winner?.id === match.team2.id
                  ? "text-emerald-800"
                  : "text-slate-800"
                  }`}>
                  {match.team2.name}
                </p>
              </div>
              {isComplete && (
                <span className={`font-black text-xl ml-2 ${match.winner?.id === match.team2.id
                  ? "text-emerald-700"
                  : "text-slate-400"
                  }`}>
                  {match.score2}
                </span>
              )}
            </>
          ) : (
            <span className="text-slate-400 italic text-sm">
              Ganador por definir
            </span>
          )}
        </div>

        {/* Action hint */}
        {canPlay && isAdminMode && (
          <div className="mt-3 pt-3 border-t border-blue-200">
            <p className="text-xs text-center font-medium text-blue-600">
              Toca para ingresar resultado
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
