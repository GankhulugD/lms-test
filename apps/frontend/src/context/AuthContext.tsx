import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import * as authApi from '../api/auth';
import { clearToken, setToken } from '../api/client';
import type { User, UserRole } from '../types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role?: UserRole) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authApi
      .fetchMe()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const { accessToken } = await authApi.login(email, password);
    setToken(accessToken);
    const me = await authApi.fetchMe();
    setUser(me);
  }

  async function register(email: string, password: string, name: string, role?: UserRole) {
    const { accessToken } = await authApi.register(email, password, name, role);
    setToken(accessToken);
    const me = await authApi.fetchMe();
    setUser(me);
  }

  function logout() {
    clearToken();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
