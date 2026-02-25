import React, { useState } from 'react';
import { deleteProduct, deleteProductPermanent } from '../services/productService';
import { useNotification } from '../../../../context/NotificationContext';
import '../styles/ConfirmDelete.css';

export default function ConfirmDelete({ show, onClose, productId, onSave }) {
  const [isPermanent, setIsPermanent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { addNotification } = useNotification();

  const handleDelete = async () => {
    setLoading(true);
    try {
      let response;
      if (isPermanent) {
        response = await deleteProductPermanent(productId);
      } else {
        response = await deleteProduct(productId);
      }

      if (response && response.message) {
        addNotification(response.message, 'success');
      } else {
        addNotification('Producto eliminado correctamente', 'success');
      }

      onSave();
      onClose();
      setIsPermanent(false);
    } catch (err) {
      addNotification(err.message || 'No se pudo eliminar el producto', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsPermanent(false);
    onClose();
  };

  if (!show) return null;

  return (
    <div className={`modal_user-overlay ${show ? 'show' : ''}`} onClick={handleClose}>
      <div className="modal_user" onClick={(e) => e.stopPropagation()}>

        <div className="modal-header">
          <div className="warning-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <h2>Confirmar Eliminación</h2>
          <p>¿Estás seguro que deseas eliminar este producto? Esta acción no se puede deshacer si eliges la eliminación permanente.</p>
        </div>

        <div className="modal-content">
          <div className="permanent-option">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={isPermanent}
                onChange={(e) => setIsPermanent(e.target.checked)}
              />
              <span>Forzar eliminación permanente</span>
            </label>

            {isPermanent && (
              <div className="warning-box">
                <p>
                  <strong>Advertencia:</strong> Esto borrará el registro físicamente de la base de datos. Si existen ventas u otros registros asociados, la operación podría fallar por seguridad.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="form-actions">
          <button className="btn btn-secondary" onClick={handleClose} disabled={loading}>
            Cancelar
          </button>
          <button className="btn btn-danger" onClick={handleDelete} disabled={loading}>
            {loading ? 'Eliminando...' : (isPermanent ? 'Eliminar Definitivamente' : 'Eliminar')}
          </button>
        </div>

      </div>
    </div>
  );
}
