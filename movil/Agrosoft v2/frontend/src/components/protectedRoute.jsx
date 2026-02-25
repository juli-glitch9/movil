import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, isAuthenticated, isLoading, hasRole } = useAuth();

  if (isLoading) {
    return <div>Cargando sesión...</div>; 
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    console.warn(`Acceso denegado. Rol actual: ${user?.id_rol}. Rol requerido: ${requiredRole}`);
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

export default ProtectedRoute;