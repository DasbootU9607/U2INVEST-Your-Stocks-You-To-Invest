import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  const checkUserAuth = async () => {
    try {
      setIsLoadingAuth(true);
      const response = await api.getCurrentUser();
      setUser(response.user || null);
    } catch {
      setUser(null);
    } finally {
      setAuthChecked(true);
      setIsLoadingAuth(false);
    }
  };

  useEffect(() => {
    checkUserAuth();
  }, []);

  const loginWithGoogle = async (credential) => {
    const response = await api.loginWithGoogle(credential);
    setUser(response.user || null);
    setAuthChecked(true);
    return response.user || null;
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
    setAuthChecked(true);
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      authChecked,
      isLoadingAuth,
      checkUserAuth,
      loginWithGoogle,
      logout,
    }),
    [user, authChecked, isLoadingAuth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
