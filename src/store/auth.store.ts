import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { LoginResponse, AuthUser, LoginCredentials } from "@/types/auth/auth";

// Usuario por defecto para cuando no hay autenticación
const DEFAULT_USER: AuthUser = {
  id: "",
  email: "",
  username: "",
};

// Interface del store de autenticación
interface AuthStore {
  // Estado
  isAuthenticated: boolean;
  accessToken: string | null;
  user: AuthUser; // Nunca será null
  isLoading: boolean;
  error: string | null;
  // Estado para colaboradores
  isCollaborator: boolean;
  collaboratorToken: string | null;
  collaboratorDiagramId: string | null;

  // Acciones
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  setAuth: (loginResponse: LoginResponse) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  checkAuthStatus: () => boolean;
  getAuthHeaders: () => { Authorization?: string };
  // Acciones para colaboradores
  setCollaboratorAccess: (token: string, diagramId: string) => void;
  clearCollaboratorAccess: () => void;
  hasAccess: () => boolean; // Verifica si tiene acceso (usuario autenticado o colaborador)
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Estado inicial
      isAuthenticated: false,
      accessToken: null,
      user: DEFAULT_USER,
      isLoading: false,
      error: null,
      // Estado inicial para colaboradores
      isCollaborator: false,
      collaboratorToken: null,
      collaboratorDiagramId: null,

      // Establecer autenticación desde respuesta de login
      setAuth: (loginResponse: LoginResponse) => {
        const { access_token, user } = loginResponse;

        set({
          isAuthenticated: true,
          accessToken: access_token,
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
          },
          error: null,
        });
      },

      // Función de login (aquí puedes integrar tu API)
      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null });

        try {
          // Aquí harías la llamada a tu API de login
          // Por ahora es un placeholder - tendrás que reemplazar con tu llamada real
          const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(credentials),
          });

          if (!response.ok) {
            throw new Error("Credenciales inválidas");
          }

          const loginResponse: LoginResponse = await response.json();

          // Establecer la autenticación
          get().setAuth(loginResponse);

          set({ isLoading: false });
          return true;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Error de autenticación";
          set({
            isLoading: false,
            error: errorMessage,
            isAuthenticated: false,
            accessToken: null,
            user: DEFAULT_USER,
          });
          return false;
        }
      },

      // Cerrar sesión
      logout: () => {
        set({
          isAuthenticated: false,
          accessToken: null,
          user: DEFAULT_USER,
          error: null,
          // También limpiar estado de colaborador
          isCollaborator: false,
          collaboratorToken: null,
          collaboratorDiagramId: null,
        });
      },

      // Limpiar autenticación
      clearAuth: () => {
        set({
          isAuthenticated: false,
          accessToken: null,
          user: DEFAULT_USER,
          error: null,
          // También limpiar estado de colaborador
          isCollaborator: false,
          collaboratorToken: null,
          collaboratorDiagramId: null,
        });
      },

      // Establecer estado de carga
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      // Establecer error
      setError: (error: string | null) => {
        set({ error });
      },

      // Verificar si el usuario está autenticado
      checkAuthStatus: () => {
        const { accessToken, user } = get();
        // El usuario es válido si tiene un ID (no está vacío)
        const isValid = !!(accessToken && user.id);

        if (!isValid) {
          get().clearAuth();
        }

        return isValid;
      },

      // Obtener headers de autorización para requests
      getAuthHeaders: () => {
        const { accessToken } = get();

        if (accessToken) {
          return {
            Authorization: `Bearer ${accessToken}`,
          };
        }

        return {};
      },

      // Establecer acceso de colaborador
      setCollaboratorAccess: (token: string, diagramId: string) => {
        set({
          isCollaborator: true,
          collaboratorToken: token,
          collaboratorDiagramId: diagramId,
          error: null,
        });
      },

      // Limpiar acceso de colaborador
      clearCollaboratorAccess: () => {
        set({
          isCollaborator: false,
          collaboratorToken: null,
          collaboratorDiagramId: null,
        });
      },

      // Verificar si tiene acceso (usuario autenticado o colaborador)
      hasAccess: () => {
        const { isAuthenticated, accessToken, user, isCollaborator, collaboratorToken } = get();
        
        // Usuario autenticado válido
        const isAuthenticatedUser = !!(accessToken && user.id);
        
        // Colaborador con token válido
        const isCollaboratorUser = !!(isCollaborator && collaboratorToken);
        
        return isAuthenticatedUser || isCollaboratorUser;
      },
    }),
    {
      name: "auth-storage", // nombre del key en localStorage
      storage: createJSONStorage(() => localStorage),
      // Solo persistir estos campos específicos
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        accessToken: state.accessToken,
        user: state.user,
        // Persistir también el estado de colaborador
        isCollaborator: state.isCollaborator,
        collaboratorToken: state.collaboratorToken,
        collaboratorDiagramId: state.collaboratorDiagramId,
      }),
    }
  )
);

// Hook personalizado para verificar autenticación
export const useAuth = () => {
  const authStore = useAuthStore();

  return {
    ...authStore,
    isLoggedIn:
      authStore.isAuthenticated &&
      !!authStore.accessToken &&
      !!authStore.user.id,
    // Incluir la nueva función hasAccess
    hasAccess: authStore.hasAccess(),
  };
};

// Utilidad para obtener el token actual
export const getAuthToken = () => {
  return useAuthStore.getState().accessToken;
};

export const getAuthUser = () => {
  return useAuthStore.getState().user;
};

// Utilidad para obtener los headers de autenticación
export const getAuthHeaders = () => {
  return useAuthStore.getState().getAuthHeaders();
};
