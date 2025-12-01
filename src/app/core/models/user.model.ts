export interface User {
  id: string;
  email: string;
  name: string;
  role: 'owner' | 'sitter' | 'admin' | 'therapist' | 'patient';
  createdAt?: string;
  updatedAt?: string;
}

export interface UserWithPassword extends User {
  password?: string; // Solo para mostrar en admin, nunca se envía al backend
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
