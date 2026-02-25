import React, { useState } from "react";
import DescuentoTable from "../components/DescuentoTable";
import DescuentoForm from "../components/DescuentoForm";
import "../styles/PageDescuentos.css";

export default function PageDescuentos() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="page-user-container">
      <header className="page-header">
        <h1 className="page-title">Gestión de Descuentos</h1>
        <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
          + Crear Descuento
        </button>
      </header>

      <section className="table-section">
        <DescuentoTable refreshTrigger={refreshTrigger} />
      </section>

      {showCreateModal && (
        <DescuentoForm
          show={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSave={handleRefresh}
        />
      )}
    </div>
  );
}
