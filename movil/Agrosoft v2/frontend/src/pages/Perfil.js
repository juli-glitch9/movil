import React from 'react';

const Perfil = ({ user }) => {
  return (
    <div className="container mt-4">
      <h1>Mi Perfil</h1>
      <div className="card">
        <div className="card-body">
          <p><strong>Nombre:</strong> {user?.nombre || 'No especificado'}</p>
          <p><strong>Email:</strong> {user?.email || 'No especificado'}</p>
          <p><strong>Rol:</strong> {user?.role || 'Usuario'}</p>
          <p className="text-muted">Esta página está en desarrollo. El equipo de perfil la completará pronto.</p>
        </div>
      </div>
    </div>
  );
};

export default Perfil;