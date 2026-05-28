import { createContext, useContext, useState, useEffect } from 'react';
import { obtenerSesion, iniciarSesion, cerrarSesion } from '../utils/data';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [nutritionist, setNutritionist] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sesion = obtenerSesion();
    if (sesion) setNutritionist(sesion);
    setLoading(false);
  }, []);

  const login = (name) => {
    if (!name.trim()) throw new Error('El nombre es requerido');
    const user = iniciarSesion(name);
    setNutritionist(user);
    return user;
  };

  const logout = () => {
    cerrarSesion();
    setNutritionist(null);
  };

  return (
    <AuthContext.Provider value={{ nutritionist, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
