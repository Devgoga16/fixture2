import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, LogIn, ArrowLeft, Crown, Send, Smartphone } from "lucide-react";
import { motion } from "framer-motion";
import { requestOTP, verifyOTP, saveAuthToken, saveUserData } from "@/services/auth";

export default function OrganizerLogin() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleRequestCode = async () => {
    if (!phoneNumber || phoneNumber.length !== 9) {
      toast({
        title: "Número inválido",
        description: "Por favor ingresa un número de celular válido de 9 dígitos",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSendingCode(true);
      const response = await requestOTP(phoneNumber);

      toast({
        title: "Código enviado",
        description: response.message || `Código enviado al +51 ${phoneNumber} por WhatsApp`,
      });

      setCodeSent(true);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "No se pudo enviar el código",
        variant: "destructive",
      });
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code || code.length !== 6) {
      toast({
        title: "Código incompleto",
        description: "Por favor ingresa el código de 6 dígitos",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsVerifying(true);
      const response = await verifyOTP(phoneNumber, code);

      // Guardar token y datos del usuario
      saveAuthToken(response.token);
      saveUserData(response.user);

      toast({
        title: "Inicio de sesión exitoso",
        description: `Bienvenido, ${response.user.name}`,
      });

      navigate("/organizer-dashboard");
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Código incorrecto",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    setCode("");
    await handleRequestCode();
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-background">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/fondotorneo.jpg"
          alt="Background"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-amber-100/90 via-orange-50/90 to-slate-100/90"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6 text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al inicio
        </Button>

        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="space-y-4 text-center pb-6">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
              <Crown className="h-8 w-8 text-white" />
            </div>
            <div>
              <CardTitle className="text-3xl font-bold text-slate-800">
                Panel de Organizador
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Ingresa tus credenciales para continuar
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            {!codeSent ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-slate-700 font-medium">
                    Número de Celular
                  </Label>
                  <div className="flex gap-2">
                    <div className="flex items-center px-3 h-11 bg-slate-100 border border-slate-300 rounded-md text-slate-600 font-medium">
                      +51
                    </div>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="987654321"
                      value={phoneNumber}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "").slice(0, 9);
                        setPhoneNumber(value);
                      }}
                      disabled={isSendingCode}
                      className="h-11 flex-1"
                      maxLength={9}
                    />
                  </div>
                  <p className="text-xs text-slate-500">
                    Ingresa tu número de celular registrado
                  </p>
                </div>

                <Button
                  type="button"
                  onClick={handleRequestCode}
                  disabled={isSendingCode || phoneNumber.length !== 9}
                  className="w-full h-11 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {isSendingCode ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Enviando código...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-5 w-5" />
                      Solicitar Código por WhatsApp
                    </>
                  )}
                </Button>

                <div className="flex items-center gap-2 text-sm text-slate-500 bg-blue-50 p-3 rounded-lg border border-blue-100">
                  <Smartphone className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  <p>
                    Recibirás un código de 6 dígitos en tu WhatsApp para verificar tu identidad
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleVerifyCode} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="code" className="text-slate-700 font-medium">
                    Código de Verificación
                  </Label>
                  <Input
                    id="code"
                    type="text"
                    placeholder="123456"
                    value={code}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                      setCode(value);
                    }}
                    disabled={isVerifying}
                    className="h-11 text-center text-2xl font-bold tracking-widest"
                    maxLength={6}
                    autoFocus
                  />
                  <p className="text-xs text-slate-500">
                    Ingresa el código enviado a +51 {phoneNumber}
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={isVerifying || code.length !== 6}
                  className="w-full h-11 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Verificando...
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-5 w-5" />
                      Verificar e Iniciar Sesión
                    </>
                  )}
                </Button>

                <div className="space-y-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleResendCode}
                    disabled={isSendingCode}
                    className="w-full text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                  >
                    {isSendingCode ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Reenviando...
                      </>
                    ) : (
                      "Reenviar código"
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setCodeSent(false);
                      setCode("");
                      setPhoneNumber("");
                    }}
                    disabled={isVerifying || isSendingCode}
                    className="w-full text-slate-600 hover:text-slate-700 hover:bg-slate-50"
                  >
                    Cambiar número
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-sm text-slate-400 mt-6">
          Panel exclusivo para organizadores autorizados
        </p>
      </motion.div>
    </div>
  );
}
