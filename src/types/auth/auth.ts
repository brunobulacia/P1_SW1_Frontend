export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

// Tipos para la respuesta de autenticación del servidor
export interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    username: string;
    password: string;
    createdAt: string;
    updatedAt: string;
    isActive: boolean;
  };
}

// Tipos para el usuario autenticado (solo los datos que necesitamos)
export interface AuthUser {
  id: string;
  email: string;
  username: string;
}

// Tipo para las credenciales de login
export interface LoginCredentials {
  email: string;
  password: string;
}
