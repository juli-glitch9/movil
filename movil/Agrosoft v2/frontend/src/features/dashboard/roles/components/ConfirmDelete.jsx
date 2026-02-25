import React from "react";
import { deleteRol } from "../services/rolesService";
import "../styles/ConfirmDelete.css";

export default function ConfirmDelete({ show, onClose, id_rol, onSave }) {
  const handleDelete = async () => {
    if (!id_rol) {
        const errorMsg = "No se ha proporcionado un ID de rol para eliminar.";
        console.error(errorMsg);
        alert(` ${errorMsg}`);
        return;
    }    
    try {
        await deleteRol(id_rol);        
        console.log("Rol eliminado con éxito. ID:", id_rol);      
        onSave();
        onClose();        
        } 
        catch (err) {
        const userFacingMessage = err.message || "Error desconocido al intentar eliminar el rol.";        
        let finalMessage = userFacingMessage;        
        if (userFacingMessage.includes("foreign key") || userFacingMessage.includes("restricción")) {
             finalMessage = "No se puede eliminar este rol porque está asignado a uno o más usuarios."+
             " Desasigne primero a los usuarios.";
        } else if (userFacingMessage.includes("404")) {
            finalMessage = "El rol que intentas eliminar no fue encontrado en el servidor.";
        }alert(` Fallo al eliminar el rol: ${finalMessage}`);       
        console.error("Error al eliminar el rol:", err);
    }
};

  return (
    <div className={`modal_user-overlay ${show ? "show" : ""}`}>
      <div className="modal_user">
        <h2>¿Eliminar rol?</h2>
        <p>Esta acción no se puede deshacer.</p>
        <div className="form-actions">
          <button className="btn-danger" onClick={handleDelete}>
            Sí, eliminar
          </button>
          <button className="btn-secondary" onClick={onClose}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
