"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { toast } from "sonner";
import { LoginData, RegisterData } from "@/types/auth/auth";
import { loginApi, registerApi } from "@/api/auth";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";

interface LoginFormData extends LoginData {}

interface RegisterFormData extends RegisterData {
  confirmPassword: string;
}

export default function AuthPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  
  // Usar el store de autenticación
  const { setAuth, isLoading, error, isAuthenticated } = useAuthStore();

  const {
    register: loginRegister,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
  } = useForm<LoginFormData>();

  const {
    register: registerRegister,
    handleSubmit: handleRegisterSubmit,
    formState: { errors: registerErrors },
    watch,
  } = useForm<RegisterFormData>();

  const onLoginSubmit = async (data: LoginFormData) => {
    try {
      const response = await loginApi(data);
      
      // Guardar la respuesta en el store
      setAuth(response);
      
      toast.success("Inicio de sesión exitoso");
      console.log("Login response:", response);
      router.push("/home");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Error al iniciar sesión");
    }
  };

  const onRegisterSubmit = async (data: RegisterFormData) => {
    // Evitar enviar confirmPassword al backend
    const { confirmPassword, ...registerData } = data;
    try {
      const response = await registerApi(registerData);
      
      // Si el registro incluye login automático, guardar en el store
      if (response.access_token) {
        setAuth(response);
      }
      
      toast.success("Registro exitoso");
      console.log("Register response:", response);
      router.push("/home");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Error al registrar");
    }
  };

  const watchPassword = watch("password");

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/home");
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-100">
      {/* Main auth container */}
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            DClassMigrator
          </h1>
          <p className="text-slate-600">Iniciá sesión o crea una cuenta</p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
            <TabsTrigger value="register">Registrarse</TabsTrigger>
          </TabsList>

          {/* Login Form */}
          <TabsContent value="login">
            <Card className="border border-slate-200 shadow-lg">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-slate-900">
                  Iniciar Sesión
                </CardTitle>
                <CardDescription className="text-slate-600">
                  Ingresa tus credenciales para acceder
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form
                  onSubmit={handleLoginSubmit(onLoginSubmit)}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-slate-700 font-medium"
                    >
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="tu@email.com"
                        className="pl-10 h-12 border-slate-300 focus:border-sky-500 focus:ring-sky-500"
                        {...loginRegister("email", {
                          required: "El email es requerido",
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: "Email inválido",
                          },
                        })}
                      />
                    </div>
                    {loginErrors.email && (
                      <p className="text-red-500 text-sm">
                        {loginErrors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="password"
                      className="text-slate-700 font-medium"
                    >
                      Contraseña
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-10 pr-10 h-12 border-slate-300 focus:border-sky-500 focus:ring-sky-500"
                        {...loginRegister("password", {
                          required: "La contraseña es requerida",
                          minLength: {
                            value: 6,
                            message:
                              "La contraseña debe tener al menos 6 caracteres",
                          },
                        })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {loginErrors.password && (
                      <p className="text-red-500 text-sm">
                        {loginErrors.password.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 bg-sky-600 hover:bg-sky-700 text-white font-semibold disabled:opacity-50"
                  >
                    {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Register Form */}
          <TabsContent value="register">
            <Card className="border border-slate-200 shadow-lg">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-slate-900">
                  Crear Cuenta
                </CardTitle>
                <CardDescription className="text-slate-600">
                  Completa los datos para registrarte
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form
                  onSubmit={handleRegisterSubmit(onRegisterSubmit)}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <Label
                      htmlFor="username"
                      className="text-slate-700 font-medium"
                    >
                      Nombre de Usuario
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <Input
                        id="username"
                        type="text"
                        placeholder="usuario123"
                        className="pl-10 h-12 border-slate-300 focus:border-sky-500 focus:ring-sky-500"
                        {...registerRegister("username", {
                          required: "El nombre de usuario es requerido",
                          minLength: {
                            value: 3,
                            message:
                              "El nombre de usuario debe tener al menos 3 caracteres",
                          },
                        })}
                      />
                    </div>
                    {registerErrors.username && (
                      <p className="text-red-500 text-sm">
                        {registerErrors.username.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="register-email"
                      className="text-slate-700 font-medium"
                    >
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="tu@email.com"
                        className="pl-10 h-12 border-slate-300 focus:border-sky-500 focus:ring-sky-500"
                        {...registerRegister("email", {
                          required: "El email es requerido",
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: "Email inválido",
                          },
                        })}
                      />
                    </div>
                    {registerErrors.email && (
                      <p className="text-red-500 text-sm">
                        {registerErrors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="register-password"
                      className="text-slate-700 font-medium"
                    >
                      Contraseña
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <Input
                        id="register-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-10 pr-10 h-12 border-slate-300 focus:border-sky-500 focus:ring-sky-500"
                        {...registerRegister("password", {
                          required: "La contraseña es requerida",
                          minLength: {
                            value: 6,
                            message:
                              "La contraseña debe tener al menos 6 caracteres",
                          },
                        })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {registerErrors.password && (
                      <p className="text-red-500 text-sm">
                        {registerErrors.password.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="confirm-password"
                      className="text-slate-700 font-medium"
                    >
                      Confirmar Contraseña
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-10 pr-10 h-12 border-slate-300 focus:border-sky-500 focus:ring-sky-500"
                        {...registerRegister("confirmPassword", {
                          required: "Confirma tu contraseña",
                          validate: (value) =>
                            value === watchPassword ||
                            "Las contraseñas no coinciden",
                        })}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {registerErrors.confirmPassword && (
                      <p className="text-red-500 text-sm">
                        {registerErrors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 bg-sky-600 hover:bg-sky-700 text-white font-semibold disabled:opacity-50"
                  >
                    {isLoading ? "Creando cuenta..." : "Crear Cuenta"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
