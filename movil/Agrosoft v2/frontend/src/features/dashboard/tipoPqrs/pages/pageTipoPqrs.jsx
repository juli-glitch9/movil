import React, { useState } from "react";
import Table from "../components/Table";
import "../../../../style/PageUser.css";
//import "../styles/PageTipoPqrs.css";
import UserForm from "../components/UserForm";


export default function PageTipoPqrs() {
  
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Gestión de Tipos de PQRS</h1>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          + Nuevo Tipo De Pqrs
        </button>
        
      </header>

      
      <Table />

      <UserForm show={showForm} onClose={() => setShowForm(false)} />
    </div>
  );
}
