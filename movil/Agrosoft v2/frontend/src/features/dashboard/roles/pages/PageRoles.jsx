import React, { useState } from "react";
import Table from "../components/UserTable";
import UserForm from "../components/UserForm";
//import "../styles/PageRoles.css";
import "../../../../style/PageUser.css";

export default function PageRoles() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Gestión de Roles</h1>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          + Nuevo Rol
        </button>
      </header>

      <Table />
      

      {/* modal_user siempre montado, pero visible según showForm */}
      <UserForm show={showForm} onClose={() => setShowForm(false)} />
    </div>
  );
}
