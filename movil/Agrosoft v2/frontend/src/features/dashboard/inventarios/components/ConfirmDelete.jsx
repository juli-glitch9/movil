import React from "react";
import { deleteUser } from "../services/userService";
import "../styles/ConfirmDelete.css";

export default function ConfirmDelete({ show, onClose, userId }) {
  const handleDelete = async () => {
    try {
      await deleteUser(userId);
      console.log("Usuario eliminado:", userId);
      onClose();
    } catch (err) {
      console.error("Error al eliminar:", err);
      alert("No se pudo eliminar el usuario");
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
