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

interface MatchResultDialogProps {
  match: Match | null;
  open: boolean;
  onClose: () => void;
  onSave: (score1: number, score2: number) => void;
}

export function MatchResultDialog({
  match,
  open,
  onClose,
  onSave,
}: MatchResultDialogProps) {
  const [score1, setScore1] = useState<string>("");
  const [score2, setScore2] = useState<string>("");

  useEffect(() => {
    if (match) {
      setScore1(match.score1 !== null ? String(match.score1) : "");
      setScore2(match.score2 !== null ? String(match.score2) : "");
    }
  }, [match, open]);

  const handleSave = () => {
    const s1 = parseInt(score1) || 0;
    const s2 = parseInt(score2) || 0;
    onSave(s1, s2);
    onClose();
  };

  if (!match) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ingresa el Resultado del Partido</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-6">
          {/* Team 1 */}
          <Card className="p-4 border-0 bg-blue-50">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-2">Equipo 1</p>
                <p className="font-bold text-lg text-gray-900">
                  {match.team1?.name || "Por definir"}
                </p>
              </div>
              <Input
                type="number"
                min="0"
                max="99"
                value={score1}
                onChange={(e) => setScore1(e.target.value)}
                className="w-20 text-center text-2xl font-bold h-16 border-2 border-blue-300"
                placeholder="0"
              />
            </div>
          </Card>

          {/* VS */}
          <div className="flex justify-center">
            <span className="text-2xl font-bold text-gray-400">VS</span>
          </div>

          {/* Team 2 */}
          <Card className="p-4 border-0 bg-purple-50">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-2">Equipo 2</p>
                <p className="font-bold text-lg text-gray-900">
                  {match.team2?.name || "Por definir"}
                </p>
              </div>
              <Input
                type="number"
                min="0"
                max="99"
                value={score2}
                onChange={(e) => setScore2(e.target.value)}
                className="w-20 text-center text-2xl font-bold h-16 border-2 border-purple-300"
                placeholder="0"
              />
            </div>
          </Card>

          {/* Winner Preview */}
          {score1 !== "" && score2 !== "" && (
            <Card className="p-4 border-0 bg-green-50">
              <p className="text-sm text-gray-600 mb-2">Ganador</p>
              <p className="font-bold text-lg text-green-700">
                {parseInt(score1) > parseInt(score2)
                  ? match.team1?.name
                  : match.team2?.name}
              </p>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg"
          >
            Guardar Resultado
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
