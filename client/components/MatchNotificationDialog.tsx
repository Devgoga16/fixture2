import { useState } from "react";
import { Match } from "@/lib/tournament";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Bell, Users, Clock, Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiCall } from "@/config/api";

interface MatchNotificationDialogProps {
  match: Match | null;
  open: boolean;
  onClose: () => void;
}

type NotificationType = "next_match" | "starting_soon" | "winner_announcement";

interface SendNotificationRequest {
  notificationType: NotificationType;
}

export function MatchNotificationDialog({
  match,
  open,
  onClose,
}: MatchNotificationDialogProps) {
  const [selectedType, setSelectedType] = useState<NotificationType | null>(null);
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const notificationTypes = [
    {
      id: "next_match" as NotificationType,
      title: "Próximo Partido",
      description: "Avisa que son el próximo en jugar y les pide acercarse a mesa para validación de jugadores.",
      icon: Users,
      color: "bg-blue-50 border-blue-200 hover:bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      id: "starting_soon" as NotificationType,
      title: "Comienza en 5 Minutos",
      description: "Alerta urgente que el partido comienza en 5 minutos y les pide dirigirse a la cancha.",
      icon: Clock,
      color: "bg-amber-50 border-amber-200 hover:bg-amber-100",
      iconColor: "text-amber-600",
    },
    {
      id: "winner_announcement" as NotificationType,
      title: "Anuncio del Ganador",
      description: "Comunica y felicita al ganador del partido.",
      icon: Trophy,
      color: "bg-emerald-50 border-emerald-200 hover:bg-emerald-100",
      iconColor: "text-emerald-600",
      disabled: !match?.completed,
    },
  ];

  const handleSendNotification = async () => {
    if (!selectedType || !match) return;

    try {
      setIsSending(true);
      
      await apiCall<void>(`/matches/${match.id}/notify`, {
        method: "POST",
        body: JSON.stringify({ notificationType: selectedType } as SendNotificationRequest),
      });

      const typeInfo = notificationTypes.find((t) => t.id === selectedType);
      
      toast({
        title: "Notificación enviada",
        description: `Se ha enviado la notificación: ${typeInfo?.title}`,
      });

      onClose();
      setSelectedType(null);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "No se pudo enviar la notificación",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  if (!match) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-white/95 backdrop-blur-xl border-slate-200 text-slate-900">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl font-bold text-slate-800">
                Enviar Notificación
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-500">
                {match.team1?.name || "TBD"} vs {match.team2?.name || "TBD"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 py-4">
          <p className="text-sm font-medium text-slate-600 mb-4">
            Selecciona el tipo de notificación que deseas enviar:
          </p>
          
          {notificationTypes.map((type) => (
            <Card
              key={type.id}
              className={`p-4 border-2 cursor-pointer transition-all ${
                type.disabled
                  ? "opacity-50 cursor-not-allowed bg-slate-50"
                  : selectedType === type.id
                    ? "border-blue-500 bg-blue-50 shadow-md"
                    : type.color
              }`}
              onClick={() => !type.disabled && setSelectedType(type.id)}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-lg ${
                    selectedType === type.id
                      ? "bg-blue-500"
                      : type.disabled
                        ? "bg-slate-200"
                        : "bg-white"
                  } flex items-center justify-center flex-shrink-0 shadow-sm`}
                >
                  <type.icon
                    className={`w-6 h-6 ${
                      selectedType === type.id
                        ? "text-white"
                        : type.disabled
                          ? "text-slate-400"
                          : type.iconColor
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3
                    className={`font-semibold mb-1 ${
                      type.disabled ? "text-slate-400" : "text-slate-800"
                    }`}
                  >
                    {type.title}
                  </h3>
                  <p
                    className={`text-sm ${
                      type.disabled ? "text-slate-400" : "text-slate-600"
                    }`}
                  >
                    {type.description}
                  </p>
                  {type.disabled && (
                    <p className="text-xs text-slate-400 mt-2 italic">
                      Solo disponible cuando el partido ha finalizado
                    </p>
                  )}
                </div>
                {selectedType === type.id && !type.disabled && (
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSending}
            className="border-slate-200 hover:bg-slate-50 hover:text-slate-900"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSendNotification}
            disabled={isSending || !selectedType}
            className="bg-blue-600 text-white hover:bg-blue-700 gap-2"
          >
            {isSending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Bell className="w-4 h-4" />
                Enviar Notificación
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
