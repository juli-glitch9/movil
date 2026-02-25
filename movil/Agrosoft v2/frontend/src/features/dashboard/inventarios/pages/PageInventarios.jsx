import React from 'react';
import InventarioTable from '../components/InventarioTable';
import '../styles/PageInventarios.css';

export default function PageInventarios() {
  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Gestión de Inventarios</h1>
      </header>
      <InventarioTable />
    </div>
  );
}
