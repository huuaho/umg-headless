"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { User } from "./types";
import {
  requestCode as apiRequestCode,
  verifyCode as apiVerifyCode,
  fetchCurrentUser,
  CompetitionApiError,
} from "./api";

const TOKEN_KEY = "umgpc_token";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  requestCode: (email: string) => Promise<void>;
  verifyCode: (email: string, code: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // On mount: check localStorage for existing token
  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (!stored) {
      setIsLoading(false);
      return;
    }

    fetchCurrentUser(stored)
      .then((u) => {
        setToken(stored);
        setUser(u);
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const requestCode = useCallback(async (email: string) => {
    setError(null);
    try {
      await apiRequestCode(email);
    } catch (err) {
      const message =
        err instanceof CompetitionApiError
          ? err.message
          : "Failed to send verification code. Please try again.";
      setError(message);
      throw err;
    }
  }, []);

  const verifyCode = useCallback(async (email: string, code: string) => {
    setError(null);
    try {
      const result = await apiVerifyCode(email, code);
      localStorage.setItem(TOKEN_KEY, result.token);
      setToken(result.token);
      setUser(result.user);
    } catch (err) {
      const message =
        err instanceof CompetitionApiError
          ? err.message
          : "Verification failed. Please try again.";
      setError(message);
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    setError(null);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!token) return;
    try {
      const u = await fetchCurrentUser(token);
      setUser(u);
    } catch (err) {
      if (err instanceof CompetitionApiError && err.status === 401) {
        logout();
      }
    }
  }, [token, logout]);

  const clearError = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        error,
        requestCode,
        verifyCode,
        logout,
        refreshUser,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
