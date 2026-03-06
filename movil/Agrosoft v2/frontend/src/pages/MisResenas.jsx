// src/pages/MisResenas.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaStar, FaArrowLeft } from 'react-icons/fa';
import { useNotification } from '../context/NotificationContext';
import { api } from '../config/api'; // ✅ API centralizada
import '../style/MisResenas.css';

export default function MisResenas() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [editRating, setEditRating] = useState(5);
  const [deletingId, setDeletingId] = useState(null); // Para controlar eliminación
  const [savingId, setSavingId] = useState(null); // Para controlar guardado
  
  const navigate = useNavigate();
  const { addNotification } = useNotification();

  const [fetched, setFetched] = React.useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchReviews = async () => {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (!storedUser) {
        if (mounted) {
          setReviews([]);
          setLoading(false);
          setFetched(true);
        }
        return;
      }

      try {
        setLoading(true);
        // ✅ Usando api en lugar de axios.get con URL hardcodeada
        const response = await api.get(`/api/clienteresenas/user/${storedUser.id_usuario}`);
        
        if (mounted) {
          if (response.data.success) {
            setReviews(response.data.reviews || []);
          } else {
            setError(response.data.message || 'Error al obtener reseñas');
          }
        }
      } catch (err) {
        console.error('❌ Error fetching reviews:', err);
        if (mounted) {
          const errorMsg = err.response?.data?.message || 'Error al obtener reseñas';
          setError(errorMsg);
          addNotification(errorMsg, 'error');
        }
      } finally {
        if (mounted) {
          setLoading(false);
          setFetched(true);
        }
      }
    };

    fetchReviews();
    return () => { mounted = false; };
  }, [addNotification]);

  // Si está cargando
  if (loading) return (
    <div className="mis-resenas-container">
      <button className="back-btn" onClick={() => navigate(-1)}>
        <FaArrowLeft/> Volver
      </button>
      <h2>Mis Reseñas</h2>
      <div className="loading-spinner">
        <p>Cargando reseñas...</p>
      </div>
    </div>
  );

  // Si hay error
  if (error) return (
    <div className="mis-resenas-container">
      <button className="back-btn" onClick={() => navigate(-1)}>
        <FaArrowLeft/> Volver
      </button>
      <h2>Mis Reseñas</h2>
      <p className="error-message">{error}</p>
      <button 
        className="retry-btn"
        onClick={() => window.location.reload()}
      >
        Reintentar
      </button>
    </div>
  );

  // Iniciar edición
  const startEdit = (r) => {
    setEditingId(r.id_comentario_resena);
    setEditText(r.texto_comentario || "");
    setEditRating(r.calificacion || 5);
  };

  // Cancelar edición
  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
    setEditRating(5);
  };

  // Guardar edición
  const saveEdit = async (id) => {
    try {
      setSavingId(id);
      const usuario = JSON.parse(localStorage.getItem('user'));
      
      if (!usuario) {
        addNotification('Usuario no autenticado', 'error');
        return;
      }

      const payload = {
        calificacion: editRating,
        texto_comentario: editText,
        id_usuario: usuario.id_usuario
      };

      // ✅ Usando api en lugar de axios.put
      const response = await api.put(`/api/clienteresenas/${id}`, payload);

      if (response.data.success) {
        addNotification('✅ Reseña actualizada correctamente', 'success');
        setReviews(reviews.map(r => 
          r.id_comentario_resena === id 
            ? { ...r, texto_comentario: editText, calificacion: editRating } 
            : r
        ));
        cancelEdit();
      } else {
        addNotification(response.data.message || 'No se pudo actualizar', 'error');
      }
    } catch (err) {
      console.error('❌ Error updating review', err);
      const errorMsg = err.response?.data?.message || 'Error actualizando reseña';
      addNotification(errorMsg, 'error');
    } finally {
      setSavingId(null);
    }
  };

  // Eliminar reseña
  const deleteReview = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta reseña? Esta acción no se puede deshacer.')) return;
    
    try {
      setDeletingId(id);
      const usuario = JSON.parse(localStorage.getItem('user'));
      
      if (!usuario) {
        addNotification('Usuario no autenticado', 'error');
        return;
      }

      // ✅ Usando api en lugar de axios.delete
      const response = await api.delete(`/api/clienteresenas/${id}`, { 
        data: { id_usuario: usuario.id_usuario } 
      });

      if (response.data.success) {
        addNotification('🗑️ Reseña eliminada correctamente', 'success');
        setReviews(reviews.filter(r => r.id_comentario_resena !== id));
      } else {
        addNotification(response.data.message || 'No se pudo eliminar', 'error');
      }
    } catch (err) {
      console.error('❌ Error deleting review', err);
      const errorMsg = err.response?.data?.message || 'Error eliminando reseña';
      addNotification(errorMsg, 'error');
    } finally {
      setDeletingId(null);
    }
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="mis-resenas-container">
      <button className="back-btn" onClick={() => navigate(-1)}>
        <FaArrowLeft/> Volver
      </button>
      
      <h2>Mis Reseñas</h2>

      {fetched && reviews.length === 0 && (
        <div className="empty-state">
          <p>No has realizado reseñas aún.</p>
          <button 
            className="browse-btn"
            onClick={() => navigate('/catalogo')}
          >
            Explorar productos
          </button>
        </div>
      )}

      {fetched && reviews.length > 0 && (
        <div className="reviews-list">
          {reviews.map(r => (
            <div key={r.id_comentario_resena} className="review-card">
              <div className="review-header">
                <div className="product-info">
                  <div className="product-name">{r.nombre_producto || 'Producto'}</div>
                  <div className="review-meta">
                    {formatDate(r.fecha_creacion)}
                  </div>
                </div>
                <div className="rating">
                  {[1, 2, 3, 4, 5].map(star => (
                    <FaStar 
                      key={star} 
                      className={`star ${star <= r.calificacion ? 'filled' : ''}`} 
                    />
                  ))}
                  <span className="rating-value">{r.calificacion}/5</span>
                </div>
              </div>

              {editingId === r.id_comentario_resena ? (
                <div className="edit-form">
                  <div className="form-group">
                    <label>Calificación:</label>
                    <div className="rating-selector">
                      {[5,4,3,2,1].map(n => (
                        <label key={n} className="rating-option">
                          <input
                            type="radio"
                            name="rating"
                            value={n}
                            checked={editRating === n}
                            onChange={() => setEditRating(n)}
                          />
                          <span>{n} <FaStar className="star filled" /></span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Comentario:</label>
                    <textarea 
                      value={editText} 
                      onChange={e => setEditText(e.target.value)}
                      placeholder="Escribe tu comentario..."
                      rows="4"
                    />
                  </div>

                  <div className="edit-actions">
                    <button 
                      className="btn-save" 
                      onClick={() => saveEdit(r.id_comentario_resena)}
                      disabled={savingId === r.id_comentario_resena}
                    >
                      {savingId === r.id_comentario_resena ? (
                        <>Guardando...</>
                      ) : (
                        <>Guardar cambios</>
                      )}
                    </button>
                    <button 
                      className="btn-cancel" 
                      onClick={cancelEdit}
                      disabled={savingId === r.id_comentario_resena}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="review-text">{r.texto_comentario || 'Sin comentario'}</p>
                  
                  <div className="review-footer">
                    <span className={`review-status status-${r.estado_comentario?.toLowerCase() || 'pendiente'}`}>
                      Estado: {r.estado_comentario || 'Pendiente'}
                    </span>
                    
                    <div className="review-actions">
                      <button 
                        className="btn-edit" 
                        onClick={() => startEdit(r)}
                        disabled={deletingId === r.id_comentario_resena}
                      >
                        Editar
                      </button>
                      <button 
                        className="btn-delete" 
                        onClick={() => deleteReview(r.id_comentario_resena)}
                        disabled={deletingId === r.id_comentario_resena}
                      >
                        {deletingId === r.id_comentario_resena ? 'Eliminando...' : 'Eliminar'}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}