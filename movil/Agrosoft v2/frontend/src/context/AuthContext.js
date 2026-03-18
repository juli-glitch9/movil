// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from "react";
import { jwtDecode } from 'jwt-decode';
import { api } from "../config/api";

export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de AuthProvider");
  }
  return context;
};

const ROLE_MAP = {
  1: "cliente",
  2: "administrador",
  3: "productor"
};

const DEBUG_MODE = false;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    if (DEBUG_MODE) {
      const fakeUser = {
        id_usuario: 99,
        id_rol: 1,
        nombre: "Usuario Demo",
        email: "demo@demo.com",
        role: "cliente"
      };
      setUser(fakeUser);
      setIsAuthenticated(true);
      setIsLoading(false);
    } else {
      const token = localStorage.getItem("token");
      if (token) {
        api
          .get("/api/users/me", {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((res) => {
            const data = res.data;
            if (data?.success && data.user) {
              setUser({ ...data.user, role: ROLE_MAP[data.user.id_rol] || "cliente" });
              setIsAuthenticated(true);
            } else {
              try {
                const decoded = jwtDecode(token);
                setUser({ ...decoded, role: ROLE_MAP[decoded.id_rol] || "cliente" });
                setIsAuthenticated(true);
              } catch (error) {
                console.error("Token inválido:", error);
                setUser(null);
                setIsAuthenticated(false);
              }
            }
          })
          .catch((err) => {
            console.error("Error al obtener perfil:", err);
            try {
              const decoded = jwtDecode(token);
              setUser({ ...decoded, role: ROLE_MAP[decoded.id_rol] || "cliente" });
              setIsAuthenticated(true);
            } catch (error) {
              setUser(null);
              setIsAuthenticated(false);
            }
          })
          .finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    }
  }, []);

  const login = async (token) => {
    localStorage.setItem("token", token);
    try {
      const res = await api.get("/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data;
      if (data?.success && data.user) {
        setUser({ ...data.user, role: ROLE_MAP[data.user.id_rol] || "cliente" });
        setIsAuthenticated(true);
      } else {
        const decoded = jwtDecode(token);
        setUser({ ...decoded, role: ROLE_MAP[decoded.id_rol] || "cliente" });
        setIsAuthenticated(true);
      }
    } catch (err) {
      console.error("Error al obtener perfil tras login:", err);
      const decoded = jwtDecode(token);
      setUser({ ...decoded, role: ROLE_MAP[decoded.id_rol] || "cliente" });
      setIsAuthenticated(true);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setIsAuthenticated(false);
  };

  const isCliente = () => user?.id_rol === 1;
  const isAdmin = () => user?.id_rol === 2;
  const isAgricultor = () => user?.id_rol === 3;
  const hasRole = (requiredRole) => user?.id_rol === requiredRole;

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser, // ✅ Exportado para que Perfil.jsx lo encuentre
        isAuthenticated,
        isLoading,
        login,
        logout,
        isCliente,
        isAdmin,
        isAgricultor,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};