import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";
import { getDiagramsByUser } from "@/api/diagrams";

interface Diagram {
  id: number;
  name: string;
  description?: string;
  thumbnail: string;
  selected: boolean;
}

/**
 * Hook personalizado para manejar la carga y gestión de diagramas
 * Maneja automáticamente la dependencia del usuario autenticado
 */
export function useDiagrams() {
  const { user } = useAuthStore();
  const [diagrams, setDiagrams] = useState<Diagram[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDiagrams = async () => {
    // Verificar que el usuario esté disponible
    if (!user?.id) {
      console.warn("Usuario no disponible para cargar diagramas");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await getDiagramsByUser(user.id);
      console.log("Diagramas cargados:", data);
      setDiagrams(data || []);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al cargar diagramas";
      console.error("Error al cargar diagramas:", err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar diagramas cuando el usuario esté disponible
  useEffect(() => {
    if (user?.id) {
      fetchDiagrams();
    }
  }, [user?.id]);

  // Función para refrescar diagramas manualmente
  const refreshDiagrams = () => {
    if (user?.id) {
      fetchDiagrams();
    }
  };

  // Función para limpiar diagramas
  const clearDiagrams = () => {
    setDiagrams([]);
    setError(null);
  };

  return {
    diagrams,
    setDiagrams,
    isLoading,
    error,
    refreshDiagrams,
    clearDiagrams,
    hasUser: !!user?.id,
  };
}
