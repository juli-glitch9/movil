import React, { useState, useEffect } from "react";
import { updateTipoPqrs } from "../services/tipoPqrsService";

import "../styles/UserEditForm.css"; // puedes duplicar a CategoryEditForm.css si quieres



export default function TipoPqrsEditForm({ show, onClose, tipoPqrs, onSave }) {
  const [form, setForm] = useState({
    id_tipo_pqrs: "",
    nombre_tipo:"",
  });

  //rellenamos el form
  useEffect(() => {
      if (tipoPqrs) {
        setForm({         
          nombre_tipo: tipoPqrs.nombre_tipo || ""
         });
      } 
    }, [tipoPqrs]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();   
  
    const idToUpdate = tipoPqrs?.id_tipo_pqrs;

    if (!idToUpdate) {
        console.error("Error: ID de Tipo PQRS es nulo o indefinido.");
        alert("Error: No se pudo obtener el ID del tipo de PQRS para actualizar.");
        return; 
    }

    try {
        const updated = await updateTipoPqrs(idToUpdate, form); 
        console.log("Tipo de pqrs Actualizada:", updated);    
        onSave();
        onClose();              
    } catch (err) {
        console.error("Error al actualizar tipo de pqrs:", err);
        alert("No se pudo actualizar la pqrs");
    }
    
};
  return (
    <div className={`modal_user-overlay ${show ? "show" : ""}`}>
      <div className="modal_user">
        <h2>Editar Tipo de pqrs</h2>
        <form onSubmit={handleSubmit}>
          <label>Nombre de estado Pqrs</label>
          <input
            type="text"
            name="nombre_tipo"
            value={form.nombre_tipo}
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
