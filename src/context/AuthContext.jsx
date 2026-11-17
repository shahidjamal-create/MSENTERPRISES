import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi, sessionStore } from '../services/api';
import { PERMISSIONS, STAFF_ROLES } from '../utils/constants';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    if (!sessionStore.get()) {
      setUser(null);
      setLoading(false);
      return null;
    }
    try {
      const { user: profile } = await authApi.me();
      setUser(profile);
      return profile;
    } catch (err) {
      if ([401, 403].includes(err.response?.status)) {
        sessionStore.clear();
        setUser(null);
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
    const onCleared = () => setUser(null);
    const onStorage = (e) => {
      if (e.key === 'ms_session') loadUser();
    };
    window.addEventListener('ms-session-cleared', onCleared);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('ms-session-cleared', onCleared);
      window.removeEventListener('storage', onStorage);
    };
  }, [loadUser]);

  const value = useMemo(() => {
    const startSession = (data) => {
      sessionStore.set(data);
      setUser(data.user);
      return data.user;
    };
    return {
      user,
      loading,
      isStaff: !!user && STAFF_ROLES.includes(user.role),
      can: (permission) => !!user && (PERMISSIONS[permission] || []).includes(user.role),
      login: async (email, password, portal = 'customer') => startSession(await authApi.login({ email, password, portal })),
      register: async (form) => startSession(await authApi.register(form)),
      logout: () => {
        sessionStore.clear();
        setUser(null);
      },
      refreshUser: loadUser,
      setUser,
    };
  }, [user, loading, loadUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
