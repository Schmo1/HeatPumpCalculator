import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api, getToken, setToken, setUnauthorizedHandler } from "../api/client";
import type { LoginResponse } from "../types";

interface AuthState {
  username: string | null;
  role: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

interface StoredUser {
  username: string;
  role: string;
}

const USER_KEY = "hp_user";

function loadUser(): StoredUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw || !getToken()) return null;
  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<StoredUser | null>(loadUser);

  useEffect(() => {
    // Bei 401 automatisch abmelden.
    setUnauthorizedHandler(() => {
      setToken(null);
      localStorage.removeItem(USER_KEY);
      setUser(null);
    });
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      username: user?.username ?? null,
      role: user?.role ?? null,
      isAuthenticated: !!user,
      isAdmin: user?.role === "Admin",
      async login(username, password) {
        const res = await api.post<LoginResponse>("/api/auth/login", { username, password });
        setToken(res.token);
        const u = { username: res.username, role: res.role };
        localStorage.setItem(USER_KEY, JSON.stringify(u));
        setUser(u);
      },
      logout() {
        setToken(null);
        localStorage.removeItem(USER_KEY);
        setUser(null);
      },
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth muss innerhalb von AuthProvider verwendet werden.");
  return ctx;
}
