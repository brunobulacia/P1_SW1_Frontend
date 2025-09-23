import axios from "axios";
import { getAuthToken, useAuthStore } from "@/store/auth.store";

/**
 * Configurar interceptor de Axios para agregar automáticamente
 * el token de autorización a todas las requests
 */
export function setupAuthInterceptor() {
  // Request interceptor - agregar token a requests
  axios.interceptors.request.use(
    (config) => {
      const token = getAuthToken();

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor - manejar errores de autenticación
  axios.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      // Si recibimos un 401 (No autorizado), limpiar la sesión
      if (error.response?.status === 401) {
        const { logout } = useAuthStore.getState();
        logout();

        // Redirigir al login si no estamos ya allí
        if (
          typeof window !== "undefined" &&
          !window.location.pathname.includes("/")
        ) {
          window.location.href = "/";
        }
      }

      return Promise.reject(error);
    }
  );
}

/**
 * Función para hacer requests autenticadas manualmente
 */
export function createAuthenticatedRequest() {
  const token = getAuthToken();

  if (!token) {
    throw new Error("No hay token de autenticación disponible");
  }

  return axios.create({
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Hook para obtener una instancia de axios con autenticación
 */
export function useAuthenticatedAxios() {
  const token = getAuthToken();

  return axios.create({
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}
