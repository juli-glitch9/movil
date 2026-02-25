import React, { useState, useEffect, useCallback } from 'react';
import { createProduct, updateProduct, getSubcategories } from '../services/productService';
import { useNotification } from '../../../../context/NotificationContext';
import '../styles/ProductForm.css';

export default function ProductForm({ show, onClose, product, onSave }) {
  const [formData, setFormData] = useState({
    nombre_producto: '',
    descripcion_producto: '',
    precio_unitario: '',
    unidad_medida: '',
    id_SubCategoria: '',
    cantidad: 0,
    estado_producto: 'activo',
    id_usuario: '',
  });

  const [subcategories, setSubcategories] = useState([]);
  const { addNotification } = useNotification();

  const loadSubcategories = useCallback(async () => {
    try {
      const data = await getSubcategories();
      setSubcategories(data);
    } catch (error) {
      addNotification('Error cargando subcategorías', 'error');
    }
  }, [addNotification]);

  useEffect(() => {
    if (show) {
      loadSubcategories();
      if (product) {
        setFormData({
          nombre_producto: product.nombre_producto || '',
          descripcion_producto: product.descripcion_producto || '',
          precio_unitario: product.precio_unitario || '',
          unidad_medida: product.unidad_medida || '',
          id_SubCategoria: product.id_SubCategoria || '',
          cantidad: product.cantidad || 0,
          estado_producto: product.estado_producto || 'activo',
          id_usuario: product.id_usuario || '',
        });
      } else {
        setFormData({
          nombre_producto: '',
          descripcion_producto: '',
          precio_unitario: '',
          unidad_medida: '',
          id_SubCategoria: '',
          cantidad: 0,
          estado_producto: 'activo',
          id_usuario: '',
        });
      }
    }
  }, [show, product, loadSubcategories]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (product) {
        await updateProduct(product.id_producto, formData);
        addNotification('Producto actualizado correctamente', 'success');
      } else {
        await createProduct(formData);
        addNotification('Producto creado correctamente', 'success');
      }
      onSave();
      onClose();
    } catch (error) {
      addNotification(error.message || 'Error al guardar el producto', 'error');
    }
  };

  if (!show) return null;

  return (
    <div className={`modal_user-overlay ${show ? 'show' : ''}`}>
      <div className="modal_user">
        <h2>{product ? 'Editar Producto' : 'Nuevo Producto'}</h2>
        <form onSubmit={handleSubmit}>
          <label>Nombre del Producto:</label>
          <input
            type="text"
            name="nombre_producto"
            value={formData.nombre_producto}
            onChange={handleChange}
            required
          />

          <label>Descripción:</label>
          <textarea
            name="descripcion_producto"
            value={formData.descripcion_producto}
            onChange={handleChange}
          />

          <label>Precio Unitario:</label>
          <input
            type="number"
            step="1"
            name="precio_unitario"
            value={formData.precio_unitario}
            onChange={handleChange}
            required
          />

          <label>Unidad de Medida:</label>
          <input
            type="text"
            name="unidad_medida"
            value={formData.unidad_medida}
            onChange={handleChange}
            placeholder="Ej: Kg, Unidades, Litros"
          />

          <label>Subcategoría:</label>
          <select
            name="id_SubCategoria"
            value={formData.id_SubCategoria}
            onChange={handleChange}
            required
          >
            <option value="">-- Seleccione --</option>
            {subcategories.map((sub) => (
              <option key={sub.id_SubCategoria} value={sub.id_SubCategoria}>
                {sub.nombre_categoria} - {sub.nombre_subcategoria}
              </option>
            ))}
          </select>

          <label>Cantidad (Stock):</label>
          <input
            type="number"
            name="cantidad"
            value={formData.cantidad}
            onChange={handleChange}
            min="0"
          />

          <label>ID Agricultor (Rol 3):</label>
          <input
            type="number"
            name="id_usuario"
            value={formData.id_usuario}
            onChange={handleChange}
            placeholder="Ingrese ID del agricultor"
          />

          <label>Estado:</label>
          <select
            name="estado_producto"
            value={formData.estado_producto}
            onChange={handleChange}
          >
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </select>

          <div className="form-actions">
            <button type="submit" className="btn-primary">
              Guardar
            </button>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
