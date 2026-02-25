import React, { useState } from "react";
import { createTipoPqrs } from "../services/tipoPqrsService";
import "../styles/UserForm.css";

export default function Form({ show, onClose }) {
  const [form, setForm] = useState({
    id_tipo_pqrs: "",
    nombre_tipo: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createTipoPqrs(form);
      console.log("Tipo de PQRS creada:", form);
      onClose();
    } catch (err) {
      console.error("Error al crear tipo de pqrs:", err);
    }
  };

  return (
    <div className={`modal_user-overlay ${show ? "show" : ""}`}>
      <div className="modal_user">
        <h2>Nuevo Tipo Pqrs</h2>
        <form onSubmit={handleSubmit}>
          <label>Nombre</label>
          <input
            type="text"
            name="nombre_tipo"
            value={form.nombre_tipo}
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
