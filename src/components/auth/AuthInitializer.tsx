"use client";

import { useEffect } from "react";
import { setupAuthInterceptor } from "@/lib/auth-interceptor";

/**
 * Componente que inicializa la configuración de autenticación
 * Debe ser usado en el layout raíz de la aplicación
 */
export function AuthInitializer({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Configurar interceptores de axios al cargar la app
    setupAuthInterceptor();
  }, []);

  return <>{children}</>;
}