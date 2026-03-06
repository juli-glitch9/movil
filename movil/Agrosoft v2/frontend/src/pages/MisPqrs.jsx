// src/pages/MisPqrs.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import { api } from '../config/api'; // ✅ API centralizada
import '../style/Oferta.css';

export default function MisPqrs() {
  const [pqrs, setPqrs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false); // Para control de envío
  const [tipoPqrs, setTipoPqrs] = useState([]);
  const [estados, setEstados] = useState([]);
  const [form, setForm] = useState({ id_tipo_pqrs: '', asunto: '', descripcion: '' });
  const [editing, setEditing] = useState(null);
  const navigate = useNavigate();
  const { addNotification } = useNotification();

  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

  useEffect(() => {
    if (!user) {
      addNotification('Debes iniciar sesión para ver tus PQRS', 'warning');
      navigate('/login');
      return;
    }

    fetchTipos();
    fetchEstados();
    fetchMyPqrs();
  }, []);

  // Cargar tipos de PQRS
  const fetchTipos = async () => {
    try {
      // ✅ Usando api
      const response = await api.get('/api/tipoPqrs/admin');
      console.log('[MisPqrs] tipos response:', response.data);
      
      if (Array.isArray(response.data)) {
        setTipoPqrs(response.data);
      } else if (response.data && Array.isArray(response.data.data)) {
        setTipoPqrs(response.data.data);
      }
    } catch (err) {
      console.error('❌ Error cargando tipos PQRS', err);
      addNotification('Error cargando tipos de PQRS', 'error');
    }
  };

  // Cargar estados de PQRS
  const fetchEstados = async () => {
    try {
      // ✅ Usando api
      const response = await api.get('/api/estadoPqrs/admin');
      
      if (Array.isArray(response.data)) {
        setEstados(response.data);
      } else if (response.data && Array.isArray(response.data.data)) {
        setEstados(response.data.data);
      }
    } catch (err) {
      console.error('❌ Error cargando estados PQRS', err);
      addNotification('Error cargando estados de PQRS', 'error');
    }
  };

  // Obtener etiqueta de estado por ID
  const estadoLabel = (id) => {
    const e = estados.find(s => s.id_estado_pqrs === id);
    return e ? e.nombre_estado : `Estado #${id}`;
  };

  // Obtener etiqueta de tipo por ID
  const tipoLabel = (id) => {
    const t = tipoPqrs.find(s => s.id_tipo_pqrs === id);
    return t ? t.nombre_tipo : `Tipo #${id}`;
  };

  // Cargar mis PQRS
  const fetchMyPqrs = async () => {
    try {
      setLoading(true);
      // ✅ Usando api
      const response = await api.get(`/api/pqrs/my-pqrs/${user.id_usuario}`);
      
      if (response.data.success) {
        setPqrs(response.data.data || []);
      } else {
        setPqrs([]);
        addNotification(response.data.message || 'Error al cargar PQRS', 'warning');
      }
    } catch (err) {
      console.error('❌ Error cargando PQRS', err);
      setPqrs([]);
      addNotification('Error al cargar tus PQRS', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambios en el formulario
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Enviar nueva PQRS
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (!form.id_tipo_pqrs || !form.asunto || !form.descripcion) {
        addNotification('Por favor completa todos los campos', 'warning');
        return;
      }

      setSubmitting(true);

      const body = {
        id_usuario: user.id_usuario,
        id_tipo_pqrs: parseInt(form.id_tipo_pqrs),
        asunto: form.asunto.trim(),
        descripcion: form.descripcion.trim()
      };

      // ✅ Usando api
      const response = await api.post('/api/pqrs', body);

      if (response.data.success) {
        addNotification('✅ PQRS creada correctamente', 'success');
        setForm({ id_tipo_pqrs: '', asunto: '', descripcion: '' });
        await fetchMyPqrs(); // Recargar lista
      } else {
        addNotification(response.data.error || 'Error creando PQRS', 'error');
      }
    } catch (err) {
      console.error('❌ Error creando PQRS:', err);
      const errorMsg = err.response?.data?.error || err.message || 'Error creando PQRS';
      addNotification(errorMsg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Iniciar edición
  const startEdit = (item) => {
    if (item.id_estado_pqrs !== 1) {
      addNotification('Solo puedes editar PQRS que aún no han sido respondidas', 'warning');
      return;
    }
    setEditing({ ...item });
  };

  // Cancelar edición
  const cancelEdit = () => setEditing(null);

  // Guardar edición
  const submitEdit = async () => {
    try {
      if (!editing.asunto?.trim() || !editing.descripcion?.trim()) {
        addNotification('Completa asunto y descripción', 'warning');
        return;
      }

      setSubmitting(true);

      const body = {
        id_usuario: user.id_usuario,
        asunto: editing.asunto.trim(),
        descripcion: editing.descripcion.trim()
      };

      // ✅ Usando api
      const response = await api.patch(`/api/pqrs/${editing.id_pqrs}`, body);

      if (response.data.success) {
        addNotification('✅ PQRS actualizada correctamente', 'success');
        setEditing(null);
        await fetchMyPqrs(); // Recargar lista
      } else {
        addNotification(response.data.error || 'Error actualizando PQRS', 'error');
      }
    } catch (err) {
      console.error('❌ Error actualizando PQRS:', err);
      const errorMsg = err.response?.data?.error || err.message || 'Error actualizando PQRS';
      addNotification(errorMsg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Si no hay usuario, no renderizar (redirige en useEffect)
  if (!user) return null;

  return (
    <div className="mis-pqrs-page container">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Volver
        </button>
        <h2 className="page-title">Mis PQRS</h2>
      </div>

      <div className="grid-2">
        {/* SECCIÓN: Crear nueva PQRS */}
        <section className="pqrs-form-section card">
          <h3 className="card-title">Crear nueva PQRS</h3>
          <form onSubmit={handleSubmit} className="pqrs-form">
            <div className="form-group">
              <label>Tipo de PQRS</label>
              <select 
                name="id_tipo_pqrs" 
                value={form.id_tipo_pqrs} 
                onChange={handleChange}
                disabled={submitting}
                required
              >
                <option value="">Selecciona un tipo</option>
                {tipoPqrs.map(t => (
                  <option key={t.id_tipo_pqrs} value={t.id_tipo_pqrs}>
                    {t.nombre_tipo}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Asunto</label>
              <input 
                name="asunto" 
                value={form.asunto} 
                onChange={handleChange} 
                placeholder="Breve resumen de tu solicitud"
                disabled={submitting}
                required
                maxLength="200"
              />
            </div>

            <div className="form-group">
              <label>Descripción</label>
              <textarea 
                name="descripcion" 
                value={form.descripcion} 
                onChange={handleChange} 
                placeholder="Describe detalladamente tu petición, queja, reclamo o sugerencia"
                disabled={submitting}
                required
                rows="5"
              />
            </div>

            <button 
              type="submit" 
              className="btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Enviando...' : 'Enviar PQRS'}
            </button>
          </form>
        </section>

        {/* SECCIÓN: Lista de mis PQRS */}
        <section className="pqrs-list-section">
          <h3 className="section-title">Mis solicitudes</h3>
          
          {loading ? (
            <div className="loading-state">
              <p>Cargando tus PQRS...</p>
            </div>
          ) : pqrs.length === 0 ? (
            <div className="empty-state">
              <p>No has creado ninguna PQRS aún.</p>
            </div>
          ) : (
            <div className="pqrs-list">
              {pqrs.map(item => (
                <article key={item.id_pqrs} className="pqrs-item card">
                  <div className="pqrs-item-header">
                    <div className="pqrs-badges">
                      <span className="badge tipo">
                        {tipoLabel(item.id_tipo_pqrs)}
                      </span>
                      <span className={`badge estado ${item.id_estado_pqrs === 1 ? 'pending' : 'answered'}`}>
                        {estadoLabel(item.id_estado_pqrs)}
                      </span>
                    </div>
                    <small className="pqrs-fecha">
                      {new Date(item.fecha_creacion).toLocaleString('es-CO')}
                    </small>
                  </div>

                  <div className="pqrs-item-body">
                    <h4 className="pqrs-asunto">{item.asunto}</h4>
                    <p className="pqrs-desc">{item.descripcion}</p>
                  </div>

                  <div className="pqrs-actions">
                    {item.id_estado_pqrs === 1 ? (
                      <button 
                        className="btn-edit"
                        onClick={() => startEdit(item)}
                        disabled={submitting}
                      >
                        Editar
                      </button>
                    ) : (
                      <button 
                        className="btn-disabled" 
                        title="Esta PQRS ya fue respondida y no puede editarse"
                        disabled
                      >
                        No editable
                      </button>
                    )}
                    
                    {item.respuesta && (
                      <div className="pqrs-respuesta">
                        <strong>Respuesta:</strong>
                        <p>{item.respuesta}</p>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* MODAL DE EDICIÓN */}
      {editing && (
        <div className="modal-overlay" onClick={cancelEdit}>
          <div className="modal-content card" onClick={(e) => e.stopPropagation()}>
            <h4>Editar PQRS #{editing.id_pqrs}</h4>
            
            <div className="form-group">
              <label>Asunto</label>
              <input 
                value={editing.asunto} 
                onChange={(e) => setEditing({ ...editing, asunto: e.target.value })}
                disabled={submitting}
                maxLength="200"
              />
            </div>

            <div className="form-group">
              <label>Descripción</label>
              <textarea 
                value={editing.descripcion} 
                onChange={(e) => setEditing({ ...editing, descripcion: e.target.value })}
                disabled={submitting}
                rows="5"
              />
            </div>

            <div className="modal-actions">
              <button 
                className="btn-primary" 
                onClick={submitEdit}
                disabled={submitting}
              >
                {submitting ? 'Guardando...' : 'Guardar cambios'}
              </button>
              <button 
                className="btn-outline" 
                onClick={cancelEdit}
                disabled={submitting}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}