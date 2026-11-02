import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { fetchMe } from '../api/auth';
import { clearTokens, getAccessToken, setTokens } from '../utils/storage';
import { pickPrimaryMembership } from '../utils/membership';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);

  const applySession = useCallback((me) => {
    setUser(me);
    setMemberships(me?.memberships || []);
  }, []);

  const clearSession = useCallback(() => {
    setUser(null);
    setMemberships([]);
  }, []);

  const bootstrap = useCallback(async () => {
    const token = await getAccessToken();
    if (!token) {
      clearSession();
      setLoading(false);
      return;
    }
    try {
      const me = await fetchMe();
      applySession(me);
    } catch {
      await clearTokens();
      clearSession();
    } finally {
      setLoading(false);
    }
  }, [applySession, clearSession]);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const loginWithTokens = useCallback(
    async (tokens) => {
      await setTokens(tokens);
      setLoading(true);
      try {
        const me = await fetchMe();
        applySession(me);
        return me;
      } catch {
        await clearTokens();
        clearSession();
        throw new Error('Could not load session after login');
      } finally {
        setLoading(false);
      }
    },
    [applySession, clearSession]
  );

  const logout = useCallback(async () => {
    await clearTokens();
    clearSession();
  }, [clearSession]);

  const primaryMembership = useMemo(
    () => pickPrimaryMembership(memberships),
    [memberships]
  );

  const value = useMemo(
    () => ({
      user,
      memberships,
      primaryMembership,
      loading,
      loginWithTokens,
      logout,
      refreshSession: bootstrap,
    }),
    [user, memberships, primaryMembership, loading, loginWithTokens, logout, bootstrap]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
