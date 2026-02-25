import React, { useState, useEffect } from 'react';

const DashboardPage = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userJson = localStorage.getItem("user");
    if (userJson) {
      try {
        setUser(JSON.parse(userJson));
      } catch (e) {
        console.error("Error al obtener datos del usuario:", e);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Dashboard de Administrador</h1>
        <button 
          onClick={handleLogout}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Cerrar Sesión
        </button>
      </div>

      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '1.5rem', 
        borderRadius: '8px',
        marginBottom: '2rem'
      }}>
        <h2>Información del Usuario</h2>
        {user ? (
          <>
            <p><strong>ID:</strong> {user.id_usuario || 'N/A'}</p>
            <p><strong>Nombre:</strong> {user.nombre || 'N/A'}</p>
            <p><strong>Email:</strong> {user.email || 'N/A'}</p>
            <p><strong>Rol:</strong> {user.role || 'N/A'}</p>
          </>
        ) : (
          <p>Cargando información del usuario...</p>
        )}
      </div>

      <div style={{ 
        backgroundColor: '#e7f3ff', 
        padding: '1.5rem', 
        borderRadius: '8px',
        borderLeft: '4px solid #2196F3'
      }}>
        <h3>Bienvenido al Panel de Administración</h3>
        <p>Este es tu panel de control. Aquí podrás gestionar usuarios, PQRS, descuentos y otras funcionalidades del sistema.</p>
      </div>
    </div>
  );
};

export default DashboardPage;
