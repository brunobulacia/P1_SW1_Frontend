"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  fallback?: React.ReactNode;
}

/**
 * Componente HOC que protege rutas requiriendo autenticación
 * Redirige a la página de login si el usuario no está autenticado
 */
export function ProtectedRoute({ 
  children, 
  redirectTo = "/", 
  fallback 
}: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, checkAuthStatus } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      // Verificar el estado de autenticación
      const isValid = checkAuthStatus();
      
      if (!isValid) {
        // Redirigir al login si no está autenticado
        router.push(redirectTo);
      } else {
        // Usuario autenticado, continuar
        setIsChecking(false);
      }
    };

    // Ejecutar verificación
    checkAuth();
  }, [checkAuthStatus, router, redirectTo]);

  // Mostrar fallback mientras se verifica la autenticación
  if (isChecking || !isAuthenticated) {
    return fallback || <AuthLoadingFallback />;
  }

  // Usuario autenticado, mostrar contenido protegido
  return <>{children}</>;
}

/**
 * Componente de fallback que se muestra mientras se verifica la autenticación
 */
function AuthLoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Verificando autenticación...
        </h2>
        <p className="text-muted-foreground">
          Por favor espera mientras verificamos tu sesión
        </p>
      </div>
    </div>
  );
}