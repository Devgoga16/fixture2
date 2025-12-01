import { useState } from "react";
import { Team } from "@/lib/tournament";
import { TournamentSetup } from "@/components/TournamentSetup";
import { TournamentDashboard } from "@/components/TournamentDashboard";

export default function Index() {
  const [tournament, setTournament] = useState<{
    teams: Team[];
    size: number;
  } | null>(null);

  const handleTournamentStart = (teams: Team[], size: number) => {
    setTournament({ teams, size });
  };

  const handleReset = () => {
    setTournament(null);
  };

  if (!tournament) {
    return <TournamentSetup onTournamentStart={handleTournamentStart} />;
  }

  return (
    <TournamentDashboard
      teams={tournament.teams}
      teamSize={tournament.size}
      onReset={handleReset}
    />
  );
}
