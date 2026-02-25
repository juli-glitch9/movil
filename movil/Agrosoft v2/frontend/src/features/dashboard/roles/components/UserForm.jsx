import React, { useState } from "react";
import { createRol } from "../services/rolesService";
import "../styles/UserForm.css";

export default function RolesForm({ show, onClose, onSave}) {
  const [form, setForm] = useState({
    nombre_rol: "",
    descripcion_rol: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createRol(form);
      console.log("rol creado:", form);      
      onClose();
      onSave();
    } catch (err) {
      console.error("Error al crear rol:", err);
    }
  };

  return (
    <div className={`modal_user-overlay ${show ? "show" : ""}`}>
      <div className="modal_user">
        <h2>Nuevo rol</h2>
        <form onSubmit={handleSubmit}>
          <label>Nombre de Rol</label>
          <input
            type="text"
            name="nombre_rol"
            value={form.nombre_rol}
            onChange={handleChange}
            required
          />

          <label>Descripción</label>
          <input
            type="text"
            name="descripcion_rol"
            value={form.descripcion_rol}
            onChange={handleChange}
            required
          />                 
          <div className="form-actions">
            <button type="submit" className="btn-primary">Guardar</button>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
