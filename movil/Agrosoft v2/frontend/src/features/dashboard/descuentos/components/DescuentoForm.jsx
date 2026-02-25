import React, { useState } from 'react';
import { createDescuento } from '../services/descuentoService';
import { useNotification } from '../../../../context/NotificationContext';
import '../styles/DescuentoForm.css';

export default function DescuentoForm({ show, onClose, onSave }) {
  const [form, setForm] = useState({
    nombre_descuento: '',
    tipo_descuento: 'porcentaje',
    codigo_descuento: '',
    valor_descuento: '',
    fecha_inicio: '',
    fecha_fin: '',
    estado: 'Pendiente',
    activo: true,
  });

  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const { addNotification } = useNotification();

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setApiError(null);

    try {
      const dataToSend = {
        ...form,
        valor_descuento: parseFloat(form.valor_descuento),
      };

      await createDescuento(dataToSend);
      addNotification('Descuento creado con éxito', 'success');
      if (onSave) onSave();
      onClose();
    } catch (err) {
      setApiError(err.message || 'No se pudo conectar con el servidor.');
      addNotification(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="modal_user-overlay show" onClick={onClose}>
      <div className="modal_user" onClick={(e) => e.stopPropagation()}>
        <h2>Crear Nuevo Descuento</h2>
        {apiError && <p className="error-text">{apiError}</p>}

        <form onSubmit={handleSubmit}>
          <label>Nombre Descuento</label>
          <input
            type="text"
            name="nombre_descuento"
            value={form.nombre_descuento}
            onChange={handleChange}
            required
            disabled={loading}
          />

          <label>Código Descuento</label>
          <input
            type="text"
            name="codigo_descuento"
            value={form.codigo_descuento}
            onChange={handleChange}
            required
            disabled={loading}
          />

          <label>Tipo Descuento</label>
          <select
            name="tipo_descuento"
            value={form.tipo_descuento}
            onChange={handleChange}
            required
            disabled={loading}
          >
            <option value="porcentaje">Porcentaje</option>
            <option value="monto">Monto Fijo</option>
          </select>

          <label>Valor Descuento</label>
          <input
            type="number"
            step="0.01"
            name="valor_descuento"
            value={form.valor_descuento}
            onChange={handleChange}
            required
            disabled={loading}
          />

          <label>Fecha Inicio</label>
          <input
            type="date"
            name="fecha_inicio"
            value={form.fecha_inicio}
            onChange={handleChange}
            disabled={loading}
          />

          <label>Fecha Fin</label>
          <input
            type="date"
            name="fecha_fin"
            value={form.fecha_fin}
            onChange={handleChange}
            disabled={loading}
          />

          <label>Estado</label>
          <select
            name="estado"
            value={form.estado}
            onChange={handleChange}
            required
            disabled={loading}
          >
            <option value="Pendiente">Pendiente</option>
            <option value="Rechazado">Rechazado</option>
            <option value="Aprobado">Aprobado</option>
          </select>

          <label>
            Estado Activo
          </label>
          <select
            name="activo"
            value={form.activo.toString()}
            onChange={(e) => setForm({ ...form, activo: e.target.value === 'true' })}
            disabled={loading}
          >
            <option value="true">Activo</option>
            <option value="false">Inactivo</option>
          </select>

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creando...' : 'Crear Descuento'}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
