import { useState, useEffect } from "react";
import { Team, Bracket } from "@/lib/tournament";
import { TournamentSetup } from "@/components/TournamentSetup";
import { TournamentDashboard } from "@/components/TournamentDashboard";
import { TournamentData } from "@/services/tournament";
import { useToast } from "@/hooks/use-toast";

export default function Index() {
  const [tournament, setTournament] = useState<{
    teams: Team[];
    size: number;
    id: string;
    bracket: Bracket;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleTournamentStart = async (
    teams: Team[],
    size: number,
    tournamentData: TournamentData,
  ) => {
    setTournament({
      teams,
      size,
      id: tournamentData.id,
      bracket: tournamentData.bracket,
    });
  };

  const handleBracketUpdate = (bracket: Bracket) => {
    if (tournament) {
      setTournament({ ...tournament, bracket });
    }
  };

  const handleReset = () => {
    setTournament(null);
  };

  if (!tournament) {
    return (
      <TournamentSetup
        onTournamentStart={handleTournamentStart}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
      />
    );
  }

  return (
    <TournamentDashboard
      teams={tournament.teams}
      teamSize={tournament.size}
      tournamentId={tournament.id}
      bracket={tournament.bracket}
      onBracketUpdate={handleBracketUpdate}
      onReset={handleReset}
    />
  );
}
