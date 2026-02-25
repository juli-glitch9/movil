import React, { useState, useEffect } from "react";
import { updatePqrs } from "../services/pqrsService";
import "../styles/UserEditForm.css";

export default function PqrsEditForm({ show, onClose, pqrs, onSave }) {
  const [form, setForm] = useState({
    id_estado_pqrs: 0,
    respuesta_administrador:"",
    id_administrador_respuesta:0
  });

  useEffect(() => {
      if (pqrs) {
        setForm({
          id_estado_pqrs: pqrs.id_estado_pqrs || 0,          
          respuesta_administrador: pqrs.respuesta_administrador || "",
          id_administrador_respuesta: pqrs.id_administrador_respuesta || 0
         });
      } 
    }, [pqrs]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();   
    try {
      const updated = await updatePqrs(pqrs.id_pqrs, form);
      console.log("pqrs respondida:", updated);
      onSave();
      onClose();      
    } catch (err) {
      console.error("Error al responder pqrs:", err);
      alert("No se pudo responder la pqrs");
    }
  };

  return (
    <div className={`modal_user-overlay ${show ? "show" : ""}`}>
      <div className="modal_user">
        <h2>Editar pqrs</h2>
        <form onSubmit={handleSubmit}>
          <label>Estado Pqrs</label>
          <input
            type="number"
            name="id_estado_pqrs"
            value={form.id_estado_pqrs}
            onChange={handleChange}
            required
          />          
          <label>Respuesta Admin</label>
          <input
            type="text"
            name="respuesta_administrador"
            value={form.respuesta_administrador || ""}
            onChange={handleChange}
            required
          />
          <label>Id Admin</label>
          <input
            type="number"
            name="id_administrador_respuesta"
            value={form.id_administrador_respuesta || ""}
            onChange={handleChange}
            required
          />
            <div className="form-actions">
            <button type="submit" className="btn-primary">
              Guardar Cambios
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
