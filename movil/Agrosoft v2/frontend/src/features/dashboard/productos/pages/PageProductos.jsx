import React, { useState } from "react";
import Table from "../components/Table";
import Form from "../components/Form";
import "../styles/ProductTable.css"; // Reusing table styles for container if needed, or create specific page css

export default function PageProductos() {
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSave = () => {
    setRefreshKey((prev) => prev + 1); // Force table refresh
    setShowForm(false);
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Gestión de Productos</h1>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          + Nuevo Producto
        </button>
      </header>
      
      {/* key forces remount to refetch data */}
      <Table key={refreshKey} />

      {/* Form for creating new product */}
      <Form 
        show={showForm} 
        onClose={() => setShowForm(false)} 
        onSave={handleSave}
        product={null}
      />
    </div>
  );
}
