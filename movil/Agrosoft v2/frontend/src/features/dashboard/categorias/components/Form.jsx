import React, { useState } from 'react';
import { createCategory } from '../services/categoryService';
import { useNotification } from '../../../../context/NotificationContext';
import '../styles/CategoryForm.css';

export default function CategoryForm({ show, onClose, onSave }) {
  const [form, setForm] = useState({
    nombre_categoria: '',
  });
  const { addNotification } = useNotification();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createCategory(form);
      addNotification('Categoría creada con éxito', 'success');
      onSave();
      onClose();
      setForm({ nombre_categoria: '' });
    } catch (err) {
      addNotification(err.message, 'error');
    }
  };

  return (
    <div className={`modal_user-overlay ${show ? 'show' : ''}`}>
      <div className="modal_user">
        <h2>Nueva Categoría</h2>
        <form onSubmit={handleSubmit}>
          <label>Nombre de Categoría</label>
          <input
            type="text"
            name="nombre_categoria"
            value={form.nombre_categoria}
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
