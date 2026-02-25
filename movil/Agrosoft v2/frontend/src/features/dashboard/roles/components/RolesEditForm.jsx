import React, { useState, useEffect } from "react";
import { updateRol } from "../services/rolesService";
import "../styles/UserEditForm.css";

export default function RolesEditForm({ show, onClose, roles,onSave }) {
  const [form, setForm] = useState({
    id_rol: 0,
    nombre_rol: "",
    descripcion_rol: "",
    
  });
  useEffect(() => {
    if (roles) {
      setForm({
        nombre_rol: roles.nombre_rol ||  "",
        descripcion_rol: roles.descripcion_rol || "",
      });
    }
  }, [roles]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!roles || !roles.id_rol) {
        const errorMsg = "Error interno: ID de rol no proporcionado.";
        console.error(errorMsg);
        alert(` ${errorMsg}`);
        return; 
    }    
    const dataToUpdate = {   
        nombre_rol: form.nombre_rol,
        descripcion_rol: form.descripcion_rol 
    };
    try {
        const updated = await updateRol(roles.id_rol, dataToUpdate);        
        console.log("Rol actualizado:", updated);        
        alert(` Rol "${dataToUpdate.nombre_rol || roles.id_rol}" actualizado con éxito.`);
        onSave();
        onClose();        
    } catch (err) {  
        const userFacingMessage = err.message || "Error desconocido al procesar la solicitud.";
        
       
        let fullErrorMessage = userFacingMessage;
        if (err.details && Array.isArray(err.details)) {
            const detailList = err.details.join('\n- ');
            fullErrorMessage += `\n\nDetalles del error:\n- ${detailList}`;
        }
        alert(` Fallo en la actualización del rol:\n${fullErrorMessage}`);
        console.error("Error al actualizar el rol:", err);
    }
}; 

  return (
    <div className={`modal_user-overlay ${show ? "show" : ""}`}>
      <div className="modal_user">
        <h2>Editar Rol</h2>
        <form onSubmit={handleSubmit}>
          <label>Nombre de Rol</label>
          <input
            type="text"
            name="nombre_rol"
            value={form.nombre_rol}
            onChange={handleChange}
            required
          />     
          <label>Descripcion</label>
          <input
            type="text"
            name="descripcion_rol"
            value={form.descripcion_rol}
            onChange={handleChange}
            placeholder="Dejar vacío si no se cambia"
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
