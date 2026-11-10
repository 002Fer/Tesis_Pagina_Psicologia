import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const res = await authService.getMe();
          if (res.success && res.data) {
            const userData = {
              id_usuario: res.data.id_usuario,
              correo: res.data.correo,
              rol: res.data.rol,
              estado: res.data.estado,
              perfil: res.data.profesional || res.data.paciente || null,
            };
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
          }
        } catch (err) {
          console.error('Error verificando sesión:', err);
          logout();
        }
      }
      setLoading(false);
    };

    verifyAuth();
  }, []);

  const login = async (correo, password) => {
    const res = await authService.login(correo, password);
    if (res.success && res.data) {
      const { token: newToken, usuario } = res.data;
      setToken(newToken);
      setUser(usuario);
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(usuario));
      return usuario;
    }
    throw new Error(res.message || 'Error en inicio de sesión');
  };

  const register = async (userData) => {
    const res = await authService.register(userData);
    if (res.success && res.data) {
      const { token: newToken, usuario } = res.data;
      setToken(newToken);
      setUser(usuario);
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(usuario));
      return usuario;
    }
    throw new Error(res.message || 'Error en el registro');
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
