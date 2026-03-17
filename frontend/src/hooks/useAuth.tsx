import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api, tokenStorage } from '../services/api';
import { UserResponse } from '../types/api';

type AuthContextType = {
  user: UserResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      if (!tokenStorage.getAccessToken()) {
        setIsLoading(false);
        return;
      }

      try {
        const me = await api.me();
        setUser(me);
      } catch {
        tokenStorage.clear();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    void bootstrap();
  }, []);

  const login = async (email: string, password: string) => {
    const tokens = await api.login(email, password);
    tokenStorage.save(tokens.access_token, tokens.refresh_token);
    const me = await api.me();
    setUser(me);
  };

  const register = async (email: string, username: string, password: string) => {
    await api.register({ email, username, password });
    await login(email, password);
  };

  const logout = () => {
    tokenStorage.clear();
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, isAuthenticated: !!user, isLoading, login, register, logout }),
    [user, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
