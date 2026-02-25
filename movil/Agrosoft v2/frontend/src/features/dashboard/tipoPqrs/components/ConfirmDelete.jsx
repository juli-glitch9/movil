import React from "react";
import { deleteTipoPqrs } from "../services/tipoPqrsService";
import "../styles/ConfirmDelete.css";

export default function ConfirmDelete({ show, onClose, onSave, tipoPqrsId }) {
  const handleDelete = async () => {
    try {
      await deleteTipoPqrs(tipoPqrsId);
      console.log("tipo de pqrs eliminado:", tipoPqrsId);
      onSave();
      onClose();
    } catch (err) {
      console.error("Error al eliminar:", err);
      alert("No se pudo eliminar el tipo de pqrs");
    }
  };

  return (
    <div className={`modal_user-overlay ${show ? "show" : ""}`}>
      <div className="modal_user">
        <h2>¿Eliminar usuario?</h2>
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
