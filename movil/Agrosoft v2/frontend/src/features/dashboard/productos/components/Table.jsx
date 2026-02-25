import React, { useState, useEffect, useCallback } from 'react';
import { getProducts } from '../services/productService';
import Form from './Form';
import ConfirmDelete from './ConfirmDelete';
import { useNotification } from '../../../../context/NotificationContext';
import '../styles/ProductTable.css';

export default function Table() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editProduct, setEditProduct] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { addNotification } = useNotification();

  const fetchProducts = useCallback(async (term = '') => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProducts(term);
      setProducts(data);
    } catch (err) {
      setError(err.message);
      addNotification(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleEdit = (product) => {
    setEditProduct(product);
  };

  const handleDelete = (id) => {
    setDeleteId(id);
  };

  const handleSave = () => {
    fetchProducts();
    setEditProduct(null);
  };

  const filteredProducts = products.filter((p) => {
    if (statusFilter && p.estado_producto?.toLowerCase() !== statusFilter.toLowerCase()) return false;
    if (minPrice && parseFloat(p.precio_unitario) < parseFloat(minPrice)) return false;
    if (maxPrice && parseFloat(p.precio_unitario) > parseFloat(maxPrice)) return false;
    return true;
  });

  if (loading) return <div>Cargando productos...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="table-container">
      <div className="search-container" style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: '0.5rem', width: '200px' }}
        />
        <button className="btn-success" onClick={() => fetchProducts(searchTerm)}>
          Buscar
        </button>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: '0.5rem' }}
        >
          <option value="">Todos los estados</option>
          <option value="activo">Activo</option>
          <option value="inactivo">Inactivo</option>
        </select>

        <input
          type="number"
          placeholder="Min Precio"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          style={{ padding: '0.5rem', width: '100px' }}
        />
        <input
          type="number"
          placeholder="Max Precio"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          style={{ padding: '0.5rem', width: '100px' }}
        />
      </div>
      <table className="user-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>ID Productor</th>
            <th>Nombre Producto</th>
            <th>Subcategoría</th>
            <th>Stock</th>
            <th>Precio</th>
            <th>Estado</th>
            <th>Creado</th>
            <th>Actualizado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.map((p) => (
            <tr key={p.id_producto}>
              <td>{p.id_producto}</td>
              <td>{p.id_usuario || '-'}</td>
              <td>{p.nombre_producto}</td>
              <td>{p.SubCategory ? p.SubCategory.nombre : (p.SubCategorium ? p.SubCategorium.nombre : p.id_SubCategoria)}</td>
              <td>{p.cantidad}</td>
              <td>{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(p.precio_unitario)}</td>
              <td>{p.estado_producto}</td>
              <td>{p.fecha_creacion ? new Date(p.fecha_creacion).toLocaleDateString() : '-'}</td>
              <td>{p.fecha_ultima_modificacion ? new Date(p.fecha_ultima_modificacion).toLocaleDateString() : '-'}</td>
              <td>
                <button className="btn-success" onClick={() => handleEdit(p)}>
                  Editar
                </button>
                <button className="btn-danger" onClick={() => handleDelete(p.id_producto)}>
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
          {filteredProducts.length === 0 && (
            <tr>
              <td colSpan="10">No hay productos registrados.</td>
            </tr>
          )}
        </tbody>
      </table>

      {editProduct && (
        <Form
          show={!!editProduct}
          onClose={() => setEditProduct(null)}
          product={editProduct}
          onSave={handleSave}
        />
      )}

      {deleteId && (
        <ConfirmDelete
          show={!!deleteId}
          onClose={() => setDeleteId(null)}
          productId={deleteId}
          onSave={fetchProducts}
        />
      )}
    </div>
  );
}
