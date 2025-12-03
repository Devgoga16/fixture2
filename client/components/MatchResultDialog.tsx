import { useState, useEffect } from "react";
import { Match } from "@/lib/tournament";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2, Trophy, Bell, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface MatchResultDialogProps {
  match: Match | null;
  open: boolean;
  onClose: () => void;
  onSave: (score1: number, score2: number) => Promise<void>;
  onOpenNotifications?: () => void;
  isSaving?: boolean;
}

export function MatchResultDialog({
  match,
  open,
  onClose,
  onSave,
  onOpenNotifications,
  isSaving = false,
}: MatchResultDialogProps) {
  const [score1, setScore1] = useState<string>("");
  const [score2, setScore2] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    if (match) {
      setScore1(match.score1 !== null ? String(match.score1) : "");
      setScore2(match.score2 !== null ? String(match.score2) : "");
    }
  }, [match, open]);

  const handleSave = async () => {
    const s1 = parseInt(score1) || 0;
    const s2 = parseInt(score2) || 0;
    await onSave(s1, s2);
  };

  const handleViewTeam = (teamId: string) => {
    onClose();
    navigate(`/team/${teamId}/players`);
  };

  if (!match) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-xl border-slate-200 text-slate-900">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center text-slate-800">Ingresa el Resultado</DialogTitle>
        </DialogHeader>

        {onOpenNotifications && (
          <div className="pb-2">
            <Button
              onClick={onOpenNotifications}
              variant="outline"
              className="w-full gap-2 border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
              disabled={isSaving}
            >
              <Bell className="w-4 h-4" />
              Enviar Notificaciones
            </Button>
          </div>
        )}

        <div className="space-y-6 py-6">
          {/* Team 1 */}
          <Card className="p-4 border-0 bg-blue-50 shadow-sm group cursor-pointer hover:bg-blue-100 transition-colors">
            <div className="flex items-center gap-4">
              <div 
                className="flex-1"
                onClick={() => match.team1 && handleViewTeam(match.team1.id)}
              >
                <p className="text-sm text-slate-500 mb-2">Equipo 1</p>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-lg text-slate-900">
                    {match.team1?.name || "Por definir"}
                  </p>
                  {match.team1 && (
                    <Users className="w-4 h-4 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
              </div>
              <Input
                type="number"
                min="0"
                max="99"
                value={score1}
                onChange={(e) => setScore1(e.target.value)}
                className="w-20 text-center text-2xl font-bold h-16 border-2 border-slate-200 bg-white focus:border-blue-500 text-slate-900"
                placeholder="0"
                disabled={isSaving}
              />
            </div>
          </Card>

          {/* VS */}
          <div className="flex justify-center">
            <span className="text-2xl font-black text-slate-300">VS</span>
          </div>

          {/* Team 2 */}
          <Card className="p-4 border-0 bg-indigo-50 shadow-sm group cursor-pointer hover:bg-indigo-100 transition-colors">
            <div className="flex items-center gap-4">
              <div 
                className="flex-1"
                onClick={() => match.team2 && handleViewTeam(match.team2.id)}
              >
                <p className="text-sm text-slate-500 mb-2">Equipo 2</p>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-lg text-slate-900">
                    {match.team2?.name || "Por definir"}
                  </p>
                  {match.team2 && (
                    <Users className="w-4 h-4 text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
              </div>
              <Input
                type="number"
                min="0"
                max="99"
                value={score2}
                onChange={(e) => setScore2(e.target.value)}
                className="w-20 text-center text-2xl font-bold h-16 border-2 border-slate-200 bg-white focus:border-indigo-500 text-slate-900"
                placeholder="0"
                disabled={isSaving}
              />
            </div>
          </Card>

          {/* Winner Preview */}
          {score1 !== "" && score2 !== "" && (
            <Card className="p-4 border border-emerald-200 bg-emerald-50">
              <div className="flex items-center gap-3">
                <Trophy className="w-5 h-5 text-emerald-600" />
                <div>
                  <p className="text-sm text-emerald-700 mb-1">Ganador</p>
                  <p className="font-bold text-lg text-emerald-800">
                    {parseInt(score1) > parseInt(score2)
                      ? match.team1?.name
                      : parseInt(score2) > parseInt(score1)
                        ? match.team2?.name
                        : "Empate"}
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} disabled={isSaving} className="border-slate-200 hover:bg-slate-50 hover:text-slate-900">
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              "Guardar Resultado"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
