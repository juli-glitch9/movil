import React from 'react';
import '../styles/ConfirmDelete.css';

export default function ConfirmDelete({ show, onClose, onConfirm }) {
  if (!show) return null;

  return (
    <div className={`modal_user-overlay ${show ? 'show' : ''}`}>
      <div className="modal_user">
        <h2>¿Eliminar categoría?</h2>
        <p>Esta acción no se puede deshacer.</p>
        <div className="form-actions">
          <button className="btn-danger" onClick={onConfirm}>
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
