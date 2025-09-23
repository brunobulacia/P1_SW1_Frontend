"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";

/**
 * Hook personalizado para manejar la protección de rutas
 * Proporciona funciones y estados útiles para componentes protegidos
 */
export function useRouteProtection(redirectTo: string = "/") {
  const router = useRouter();
  const { isAuthenticated, user, checkAuthStatus, logout } = useAuthStore();
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const validateAuth = async () => {
      try {
        setIsAuthenticating(true);
        setAuthError(null);

        // Verificar estado de autenticación
        const isValid = checkAuthStatus();

        if (!isValid) {
          setAuthError("Sesión expirada o inválida");
          router.push(redirectTo);
          return;
        }

        // Verificación adicional: comprobar si el token sigue siendo válido
        // Aquí podrías hacer una llamada a la API para verificar el token

        setIsAuthenticating(false);
      } catch (error) {
        console.error("Error al verificar autenticación:", error);
        setAuthError("Error al verificar la sesión");
        logout(); // Limpiar sesión inválida
        router.push(redirectTo);
      }
    };

    validateAuth();
  }, [checkAuthStatus, router, redirectTo, logout]);

  return {
    isAuthenticated,
    isAuthenticating,
    authError,
    user,
    logout: () => {
      logout();
      router.push(redirectTo);
    },
  };
}

/**
 * Hook simple para verificar si el usuario está autenticado
 * Útil para mostrar/ocultar elementos basados en el estado de auth
 */
export function useAuth() {
  const { isAuthenticated, user, checkAuthStatus } = useAuthStore();

  return {
    isAuthenticated: isAuthenticated && checkAuthStatus(),
    user,
    isLoggedIn: isAuthenticated && !!user.id, // Usuario válido tiene ID
  };
}

/**
 * Hook para obtener información del usuario autenticado
 * Redirige al login si no hay usuario válido
 */
export function useAuthenticatedUser(redirectTo: string = "/") {
  const router = useRouter();
  const { user, isAuthenticated, checkAuthStatus } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || !checkAuthStatus() || !user.id) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, user, checkAuthStatus, router, redirectTo]);

  return user;
}
