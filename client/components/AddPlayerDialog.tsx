import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Search, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { searchDNI, addPlayers } from "@/services/team";

interface AddPlayerDialogProps {
  open: boolean;
  onClose: () => void;
  teamId: string;
  onPlayerAdded: () => void;
}

interface DNIResponse {
  nombre: string;
  numeroDocumento: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  nombres: string;
}

export function AddPlayerDialog({
  open,
  onClose,
  teamId,
  onPlayerAdded,
}: AddPlayerDialogProps) {
  const [dni, setDni] = useState("");
  const [fullName, setFullName] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [dniFound, setDniFound] = useState(false);
  const { toast } = useToast();

  const handleSearchDNI = async () => {
    if (!dni || dni.length !== 8) {
      toast({
        title: "DNI inválido",
        description: "Por favor ingresa un DNI de 8 dígitos",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSearching(true);
      const response = await fetch(
        `/api/dni/search?numero=${dni}`
      );

      if (!response.ok) {
        throw new Error("No se pudo consultar el DNI");
      }

      const data: DNIResponse = await response.json();
      
      // Construir nombre completo
      const fullNameValue = `${data.apellidoPaterno} ${data.apellidoMaterno} ${data.nombres}`.trim();
      setFullName(fullNameValue);
      setDniFound(true);

      toast({
        title: "DNI encontrado",
        description: "Datos obtenidos correctamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "No se pudo consultar el DNI",
        variant: "destructive",
      });
      setFullName("");
      setDniFound(false);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSave = async () => {
    if (!dni || !fullName) {
      toast({
        title: "Datos incompletos",
        description: "Por favor completa todos los campos",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSaving(true);
      await addPlayers(teamId, [{ fullName, dni }]);

      toast({
        title: "Jugador agregado",
        description: "El jugador ha sido registrado correctamente",
      });

      // Resetear formulario
      setDni("");
      setFullName("");
      setDniFound(false);
      onPlayerAdded();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "No se pudo agregar el jugador",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setDni("");
    setFullName("");
    setDniFound(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Agregar Jugador
          </DialogTitle>
          <DialogDescription>
            Ingresa el DNI del jugador para buscar sus datos
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* DNI Input */}
          <div className="space-y-2">
            <Label htmlFor="dni">Número de Documento (DNI)</Label>
            <div className="flex gap-2">
              <Input
                id="dni"
                type="text"
                placeholder="12345678"
                value={dni}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 8);
                  setDni(value);
                  setDniFound(false);
                  setFullName("");
                }}
                maxLength={8}
                disabled={isSearching || isSaving}
                className="flex-1"
              />
              <Button
                type="button"
                onClick={handleSearchDNI}
                disabled={!dni || dni.length !== 8 || isSearching || isSaving}
                className="gap-2"
              >
                {isSearching ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Buscando...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Buscar
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-slate-500">
              Ingresa 8 dígitos y presiona Buscar
            </p>
          </div>

          {/* Full Name Input */}
          <div className="space-y-2">
            <Label htmlFor="fullName">Nombre Completo</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Nombre completo del jugador"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={!dniFound || isSaving}
              className={dniFound ? "bg-green-50" : ""}
            />
            <p className="text-xs text-slate-500">
              {dniFound
                ? "Datos obtenidos automáticamente"
                : "Busca el DNI primero para obtener el nombre"}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={!dni || !fullName || isSaving}
            className="gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                Agregar Jugador
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
