import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Team, Bracket } from "@/lib/tournament";
import { TournamentSetup } from "@/components/TournamentSetup";
import { TournamentDashboard } from "@/components/TournamentDashboard";
import type { TournamentData } from "@/services/tournament";
import { getTournament } from "@/services/tournament";
import { isOrganizer } from "@/services/auth";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function TournamentView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [tournament, setTournament] = useState<{
    teams: Team[];
    size: number;
    id: string;
    bracket: Bracket;
  } | null>(null);
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState<string | null>(null);

  // Determinar si está en modo edición (solo organizadores pueden editar)
  const isEditMode = isOrganizer();

  useEffect(() => {
    if (id) {
      loadTournament(id);
    }
  }, [id]);

  const loadTournament = async (tournamentId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTournament(tournamentId);
      setTournament({
        teams: data.teams,
        size: data.totalTeams,
        id: data.id,
        bracket: data.bracket,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar el torneo");
    } finally {
      setLoading(false);
    }
  };

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
    navigate("/");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-8">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={() => id && loadTournament(id)}>Reintentar</Button>
            <Button variant="outline" onClick={() => navigate("/")}>Volver al inicio</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!tournament) {
    return <TournamentSetup onTournamentStart={handleTournamentStart} />;
  }

  return (
    <TournamentDashboard
      teams={tournament.teams}
      teamSize={tournament.size}
      tournamentId={tournament.id}
      bracket={tournament.bracket}
      onBracketUpdate={handleBracketUpdate}
      onReset={handleReset}
      isEditMode={isEditMode}
    />
  );
}
