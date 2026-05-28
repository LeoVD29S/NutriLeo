import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { storage } from '../services/storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [nutritionist, setNutritionist] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    const saved = storage.getAuth();
    if (saved) {
      setNutritionist(saved);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (name) => {
    const data = await api.login(name);
    setNutritionist(data.nutritionist);
    return data;
  };

  const logout = async () => {
    await api.logout();
    setNutritionist(null);
  };

  return (
    <AuthContext.Provider value={{ nutritionist, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
