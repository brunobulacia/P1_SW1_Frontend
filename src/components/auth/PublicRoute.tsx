"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";

interface PublicRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

/**
 * Componente que maneja rutas públicas (como login)
 * Redirige a usuarios ya autenticados a la página principal
 */
export function PublicRoute({ children, redirectTo = "/home" }: PublicRouteProps) {
  const router = useRouter();
  const { isAuthenticated, checkAuthStatus } = useAuthStore();

  useEffect(() => {
    // Si el usuario ya está autenticado, redirigir a la página principal
    if (isAuthenticated && checkAuthStatus()) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, checkAuthStatus, router, redirectTo]);

  // Mostrar contenido público (login/register)
  return <>{children}</>;
}