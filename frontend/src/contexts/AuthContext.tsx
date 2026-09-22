import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../api/axios';
import { 
  User, 
  AuthResponse, 
  LoginCredentials, 
  RegisterPayload, 
  UpdateProfilePayload,
  ApiResponse 
} from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  register: (payload: RegisterPayload) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  updateProfile: (payload: UpdateProfilePayload | FormData) => Promise<User>;
  refreshUser: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('renstore_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize and check authenticated user on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('renstore_token');
      if (storedToken) {
        try {
          const res = await api.get<ApiResponse<User>>('/auth/profile');
          if (res.data?.data) {
            setUser(res.data.data);
          } else {
            localStorage.removeItem('renstore_token');
            setToken(null);
            setUser(null);
          }
        } catch {
          localStorage.removeItem('renstore_token');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
      const authData = response.data.data!;
      localStorage.setItem('renstore_token', authData.token);
      setToken(authData.token);
      setUser(authData.user);
      return authData;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: RegisterPayload): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', payload);
      const authData = response.data.data!;
      localStorage.setItem('renstore_token', authData.token);
      setToken(authData.token);
      setUser(authData.user);
      return authData;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      if (token) {
        await api.post('/auth/logout');
      }
    } catch {
      // Ignored if network fails on logout
    } finally {
      localStorage.removeItem('renstore_token');
      setToken(null);
      setUser(null);
    }
  };

  const updateProfile = async (payload: UpdateProfilePayload | FormData): Promise<User> => {
    let response;
    if (payload instanceof FormData) {
      response = await api.post<ApiResponse<User>>('/auth/profile', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    } else {
      response = await api.put<ApiResponse<User>>('/auth/profile', payload);
    }
    const updatedUser = response.data.data!;
    setUser(updatedUser);
    return updatedUser;
  };

  const refreshUser = async (): Promise<User | null> => {
    try {
      const res = await api.get<ApiResponse<User>>('/auth/profile');
      if (res.data?.data) {
        setUser(res.data.data);
        return res.data.data;
      }
      return null;
    } catch {
      return null;
    }
  };

  const isAuthenticated = !!token && !!user;
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isAdmin,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
