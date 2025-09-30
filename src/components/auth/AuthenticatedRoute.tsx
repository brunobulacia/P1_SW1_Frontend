"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";

interface AuthenticatedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  fallback?: React.ReactNode;
}

/**
 * Componente HOC que protege rutas requiriendo autenticación completa
 * NO permite acceso a colaboradores sin cuenta
 * Redirige a la página de invitación si es colaborador
 */
export function AuthenticatedRoute({ 
  children, 
  redirectTo = "/invitation", 
  fallback 
}: AuthenticatedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, isCollaborator, checkAuthStatus } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      // Verificar si es colaborador sin cuenta
      const isCollaboratorOnly = isCollaborator && !isAuthenticated;
      
      if (isCollaboratorOnly) {
        // Colaborador sin cuenta - redirigir a página de invitación
        console.log("🚫 Acceso denegado: Colaborador sin cuenta intentando acceder a ruta autenticada");
        router.push(redirectTo);
        return;
      }
      
      // Verificar si tiene autenticación válida
      const hasValidAuth = checkAuthStatus();
      
      if (!hasValidAuth) {
        // No autenticado - redirigir al login
        console.log("🚫 Acceso denegado: Usuario no autenticado");
        router.push("/");
        return;
      }
      
      // Usuario autenticado válido - continuar
      setIsChecking(false);
    };

    // Ejecutar verificación
    checkAuth();
  }, [isAuthenticated, isCollaborator, checkAuthStatus, router, redirectTo]);

  // Mostrar fallback mientras se verifica la autenticación
  if (isChecking || !isAuthenticated || (isCollaborator && !isAuthenticated)) {
    return fallback || <AuthLoadingFallback />;
  }

  // Usuario autenticado válido, mostrar contenido protegido
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
