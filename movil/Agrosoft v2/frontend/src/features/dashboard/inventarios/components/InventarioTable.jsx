import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getInventarios, updateInventario, deleteInventario } from '../services/inventarioService';
import { useNotification } from '../../../../context/NotificationContext';
import '../styles/InventarioTable.css';
import '../styles/UserTable.css';

export default function InventarioTable() {
  const [inventarios, setInventarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const { addNotification } = useNotification();

  const fetchInventarios = useCallback(async (term = '') => {
    setLoading(true);
    setError(null);
    try {
      const data = await getInventarios(term);
      setInventarios(data);
    } catch (err) {
      setError(err.message);
      addNotification(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  useEffect(() => {
    fetchInventarios();
  }, [fetchInventarios]);

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este registro de inventario?')) {
      try {
        await deleteInventario(id);
        addNotification('Registro eliminado correctamente', 'success');
        fetchInventarios(searchTerm);
      } catch (err) {
        addNotification(err.message, 'error');
      }
    }
  };

  const handleEdit = (item) => {
    setEditingItem({ ...item });
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;
    try {
      await updateInventario(editingItem.id_inventario, {
        cantidad_disponible: editingItem.cantidad_disponible,
        ubicacion_almacenamiento: editingItem.ubicacion_almacenamiento,
      });
      addNotification('Inventario actualizado correctamente', 'success');
      setEditingItem(null);
      fetchInventarios(searchTerm);
    } catch (err) {
      addNotification(err.message, 'error');
    }
  };

  const groupedInventarios = useMemo(() => {
    return inventarios.reduce((acc, item) => {
      const producerId = item.Producto?.Productor?.id_usuario || '0';
      const producerName = item.Producto?.Productor?.nombre_usuario || 'Sin Asignar';
      const key = `${producerId}:::${producerName}`;

      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    }, {});
  }, [inventarios]);

  return (
    <div className="table-container">
      <h2>Gestión de Inventarios por Productor</h2>

      <div className="search-container inventario-search-container">
        <input
          type="text"
          placeholder="Buscar producto o productor..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="inventario-search-input"
        />
        <button className="btn-success" onClick={() => fetchInventarios(searchTerm)}>
          Buscar
        </button>
      </div>

      {loading && <p>Cargando datos del inventario...</p>}
      {error && <p className="inventario-error-msg">{error}</p>}

      {!loading && !error && Object.keys(groupedInventarios).length === 0 && (
        <div className="inventario-empty-state">
          No se encontraron registros de inventario.
        </div>
      )}

      {editingItem && (
        <div className="inventario-modal-overlay">
          <div className="inventario-modal-content">
            <h3>Editar Inventario #{editingItem.id_inventario}</h3>
            <div className="inventario-input-group">
              <label>Cantidad:</label>
              <input
                type="number"
                value={editingItem.cantidad_disponible}
                onChange={(e) => setEditingItem({ ...editingItem, cantidad_disponible: e.target.value })}
                className="inventario-modal-input"
              />
            </div>
            <div className="inventario-input-group">
              <label>Ubicación:</label>
              <input
                type="text"
                value={editingItem.ubicacion_almacenamiento || ''}
                onChange={(e) => setEditingItem({ ...editingItem, ubicacion_almacenamiento: e.target.value })}
                className="inventario-modal-input"
              />
            </div>
            <div className="inventario-modal-actions">
              <button onClick={() => setEditingItem(null)} className="inventario-btn-cancel">
                Cancelar
              </button>
              <button onClick={handleSaveEdit} className="btn-success">
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {!loading &&
        !error &&
        Object.entries(groupedInventarios).map(([key, items]) => {
          const [producerId, producerName] = key.split(':::');

          return (
            <div key={key} className="inventory-group inventario-group-container">
              <div className="inventario-group-header">
                <h3 className="inventario-group-title">
                  📦 Inventario ID: {producerId} — Productor: <strong>{producerName}</strong>
                </h3>
                <span className="inventario-badge">
                  {items.length} Productos
                </span>
              </div>

              <table className="user-table inventario-table">
                <thead className="inventario-thead">
                  <tr>
                    <th className="col-id">ID Item</th>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Ubicación</th>
                    <th>Última Act.</th>
                    <th className="col-actions">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((inv) => (
                    <tr key={inv.id_inventario}>
                      <td>#{inv.id_inventario}</td>
                      <td className="product-name">
                        {inv.Producto?.nombre_producto || `Producto ${inv.id_producto}`}
                      </td>
                      <td>
                        <span
                          className={
                            inv.cantidad_disponible === 0
                              ? 'quantity-low'
                              : inv.cantidad_disponible < 10
                              ? 'quantity-medium'
                              : 'quantity-ok'
                          }
                        >
                          {inv.cantidad_disponible}
                        </span>{' '}
                        {inv.Producto?.unidad_medida || ''}
                      </td>
                      <td>
                        {inv.ubicacion_almacenamiento || (
                          <span className="location-placeholder">No registrada</span>
                        )}
                      </td>
                      <td className="last-update">
                        {inv.fecha_ultima_actualizacion
                          ? new Date(inv.fecha_ultima_actualizacion).toLocaleDateString('es-CO', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })
                          : '-'}
                      </td>
                      <td>
                        <button onClick={() => handleEdit(inv)} className="btn-edit">
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(inv.id_inventario)}
                          className="btn-delete"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
    </div>
  );
}
