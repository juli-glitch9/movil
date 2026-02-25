import React from 'react';

const MisResenas = ({ user }) => {
  return (
    <div className="container mt-4">
      <h1>Mis Reseñas</h1>
      <div className="card">
        <div className="card-body">
          <p><strong>Usuario:</strong> {user?.email}</p>
          <p>Aquí podrás ver y gestionar todas tus reseñas.</p>
          <p className="text-muted">Módulo en desarrollo - Integración con backend próxima.</p>
        </div>
      </div>
    </div>
  );
};

export default MisResenas;