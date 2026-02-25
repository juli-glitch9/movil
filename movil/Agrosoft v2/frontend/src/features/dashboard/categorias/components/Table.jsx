import React, { useState, useEffect, useCallback } from 'react';
import { getCategories, deleteCategory } from '../services/categoryService';
import CategoryEditForm from './CategoryEditForm';
import ConfirmDelete from './ConfirmDelete';
import { useNotification } from '../../../../context/NotificationContext';
import '../styles/UserTable.css';

export default function CategoryTable() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [editCategory, setEditCategory] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const { addNotification } = useNotification();

  const loadCategories = useCallback(async (term = '') => {
    setError(null);
    try {
      const data = await getCategories(term);
      setCategories(data);
    } catch (err) {
      setError(err.message);
      addNotification(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      await deleteCategory(deleteId);
      addNotification('Categoría eliminada con éxito', 'success');
      setDeleteId(null);
      loadCategories(searchTerm);
    } catch (err) {
      addNotification(err.message, 'error');
    }
  };

  if (loading) {
    return <div className="table-container">Cargando categorías...</div>;
  }
  if (error) {
    return <div className="table-container error-message">Error: {error}</div>;
  }

  return (
    <div className="table-container">
      <div className="search-container" style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: '0.5rem', width: '300px' }}
        />
        <button className="btn-success" onClick={() => loadCategories(searchTerm)}>
          Buscar
        </button>
      </div>
      <table className="user-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre Categoría</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {categories.length > 0 ? (
            categories.map((c) => (
              <tr key={c.id_categoria}>
                <td>{c.id_categoria}</td>
                <td>{c.nombre_categoria}</td>
                <td>
                  <button
                    className="btn-success"
                    onClick={() => setEditCategory(c)}
                  >
                    Editar
                  </button>
                  <button
                    className="btn-danger"
                    onClick={() => setDeleteId(c.id_categoria)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3">No hay categorías registradas</td>
            </tr>
          )}
        </tbody>
      </table>

      {editCategory && (
        <CategoryEditForm
          show={!!editCategory}
          category={editCategory}
          onClose={() => setEditCategory(null)}
          onSave={() => loadCategories(searchTerm)}
        />
      )}
      {deleteId && (
        <ConfirmDelete
          show={!!deleteId}
          onClose={() => setDeleteId(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  );
}
