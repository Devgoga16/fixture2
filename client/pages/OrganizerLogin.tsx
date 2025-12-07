import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, LogIn, ArrowLeft, Crown, Send, Smartphone } from "lucide-react";
import { motion } from "framer-motion";
import { requestOTP, verifyOTP, saveAuthToken, saveUserData } from "@/services/auth";

// Get version from package.json via import.meta.env or define it here
const APP_VERSION = "1.0.0"; // Update this manually or use build script

export default function OrganizerLogin() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [debugError, setDebugError] = useState<string>("");
  const navigate = useNavigate();
  const { toast } = useToast();

  // Capturar errores globales no manejados
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error("[Global Error]", event.error);
      setDebugError(`GLOBAL ERROR:\n${event.message}\n\nFile: ${event.filename}\nLine: ${event.lineno}:${event.colno}\n\nStack: ${event.error?.stack || "No stack"}`);
      event.preventDefault();
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error("[Unhandled Promise Rejection]", event.reason);
      setDebugError(`UNHANDLED PROMISE:\n${event.reason?.message || String(event.reason)}\n\nStack: ${event.reason?.stack || "No stack"}`);
      event.preventDefault();
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  const handleRequestCode = async () => {
    setDebugError(""); // Limpiar errores anteriores
    
    if (!phoneNumber || phoneNumber.length !== 9) {
      toast({
        title: "Número inválido",
        description: "Por favor ingresa un número de celular válido de 9 dígitos",
        variant: "destructive",
      });
      return;
    }

    try {
      setDebugError("STEP 1: Iniciando solicitud de código...");
      setIsSendingCode(true);
      
      setDebugError("STEP 2: Llamando requestOTP...");
      console.log("[OTP Request] Solicitando código para:", phoneNumber);
      
      const response = await requestOTP(phoneNumber);
      
      setDebugError("STEP 3: Respuesta recibida correctamente");
      console.log("[OTP Request] Respuesta recibida:", response);

      toast({
        title: "Código enviado",
        description: response.message || `Código enviado al +51 ${phoneNumber} por WhatsApp`,
      });

      setDebugError("STEP 4: Actualizando estado...");
      setCodeSent(true);
      
      setDebugError(""); // Limpiar si todo salió bien
      console.log("[OTP Request] Estado actualizado: codeSent = true");
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : "No stack";
      const errorName = error instanceof Error ? error.name : typeof error;
      const fullError = `REQUEST ERROR:\nType: ${errorName}\nMessage: ${errorMsg}\n\nStack:\n${errorStack}`;
      
      console.error("[OTP Request] Error completo:", error);
      console.error("[OTP Request] Error type:", errorName);
      console.error("[OTP Request] Error constructor:", error?.constructor?.name);
      
      setDebugError(fullError);
      
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsSendingCode(false);
      console.log("[OTP Request] Proceso finalizado");
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
      setDebugError("");
      console.log("[OTP Verify] Verificando código:", code.length, "dígitos");
      console.log("[OTP Verify] Teléfono:", phoneNumber);
      
      const response = await verifyOTP(phoneNumber, code);
      console.log("[OTP Verify] Respuesta recibida:", response);

      // Guardar token y datos del usuario
      console.log("[OTP Verify] Guardando token...");
      saveAuthToken(response.token);
      console.log("[OTP Verify] Token guardado");
      
      console.log("[OTP Verify] Guardando datos de usuario...");
      saveUserData(response.user);
      console.log("[OTP Verify] Datos de usuario guardados:", response.user);

      toast({
        title: "Inicio de sesión exitoso",
        description: `Bienvenido, ${response.user.name}`,
      });

      console.log("[OTP Verify] Navegando a dashboard...");
      navigate("/organizer-dashboard");
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : "No stack";
      const fullError = `VERIFY ERROR:\n${errorMsg}\n\nStack: ${errorStack}`;
      
      console.error("[OTP Verify] Error completo:", error);
      setDebugError(fullError);
      
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
      console.log("[OTP Verify] Proceso finalizado");
    }
  };

  const handleResendCode = async () => {
    setCode("");
    await handleRequestCode();
  };

  // Si hay un error de renderizado catastrófico, mostrar pantalla de error simple
  if (debugError && debugError.includes("GLOBAL ERROR")) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-red-50">
        <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-red-700 mb-4">Error Fatal Detectado</h1>
          <div className="bg-red-100 border border-red-300 rounded p-4 mb-4">
            <pre className="text-xs text-red-800 whitespace-pre-wrap break-words overflow-auto max-h-96">
              {debugError}
            </pre>
          </div>
          <Button 
            onClick={() => {
              setDebugError("");
              window.location.reload();
            }}
            className="w-full"
          >
            Recargar Página
          </Button>
        </div>
      </div>
    );
  }

  try {
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

                {debugError && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h4 className="text-sm font-semibold text-red-800 mb-2">Error de Debug:</h4>
                    <pre className="text-xs text-red-700 whitespace-pre-wrap break-words max-h-48 overflow-y-auto">
                      {debugError}
                    </pre>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setDebugError("")}
                      className="mt-2 text-red-600 hover:text-red-700"
                    >
                      Cerrar
                    </Button>
                  </div>
                )}

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

                {debugError && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h4 className="text-sm font-semibold text-red-800 mb-2">Error de Debug:</h4>
                    <pre className="text-xs text-red-700 whitespace-pre-wrap break-words max-h-48 overflow-y-auto">
                      {debugError}
                    </pre>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setDebugError("")}
                      className="mt-2 text-red-600 hover:text-red-700"
                    >
                      Cerrar
                    </Button>
                  </div>
                )}

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

        <div className="text-center space-y-2 mt-6">
          <p className="text-sm text-slate-400">
            Panel exclusivo para organizadores autorizados
          </p>
          <p className="text-xs text-slate-300">
            Versión {APP_VERSION}
          </p>
        </div>
      </motion.div>
    </div>
    );
  } catch (renderError) {
    console.error("[Render Error]", renderError);
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-red-50">
        <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-red-700 mb-4">Error de Renderizado</h1>
          <div className="bg-red-100 border border-red-300 rounded p-4 mb-4">
            <pre className="text-xs text-red-800 whitespace-pre-wrap break-words overflow-auto max-h-96">
              {renderError instanceof Error ? renderError.message : String(renderError)}
              {"\n\n"}
              {renderError instanceof Error ? renderError.stack : "No stack"}
            </pre>
          </div>
          <Button 
            onClick={() => window.location.reload()}
            className="w-full"
          >
            Recargar Página
          </Button>
        </div>
      </div>
    );
  }
}
