// src/pages/Perfil.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../config/api'; // ✅ Usar API centralizada
import { useNotification } from '../context/NotificationContext'; // ✅ Para notificaciones

const Perfil = () => {
  const { user, isAuthenticated, login } = useAuth();
  const { addNotification } = useNotification(); // ✅ Notificaciones
  const [form, setForm] = useState({ 
    nombre_usuario: '', 
    correo_electronico: '', 
    telefono: '', 
    ubicacion: '' 
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        nombre_usuario: user.nombre || user.nombre_usuario || '',
        correo_electronico: user.email || user.correo_electronico || '',
        telefono: user.telefono || '',
        ubicacion: user.ubicacion || '',
      });
      setPreview(user.foto_perfil || user.foto || null);
    }
  }, [user]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFile = (e) => {
    const f = e.target.files[0];
    setFile(f);
    if (f) setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      addNotification('Usuario no autenticado', 'error');
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('token');
      
      // Crear FormData para enviar archivo
      const fd = new FormData();
      fd.append('nombre_usuario', form.nombre_usuario);
      fd.append('correo_electronico', form.correo_electronico);
      fd.append('telefono', form.telefono || '');
      fd.append('ubicacion', form.ubicacion || '');
      if (file) fd.append('foto_perfil', file);

      // ✅ Usar api en lugar de fetch
      const response = await api.put(`/api/perfil/${user.id_usuario}`, fd, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      });

      const data = response.data;
      
      if (!response.status === 200) {
        throw new Error(data.message || 'Error al actualizar perfil');
      }

      setMessage('Perfil actualizado correctamente');
      addNotification('¡Perfil actualizado con éxito!', 'success');
      
      // ✅ Refrescar perfil en contexto
      if (token && typeof login === 'function') {
        await login(token); // Esto debería actualizar el user en el contexto
      }

    } catch (err) {
      console.error('❌ Error:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Error al actualizar';
      setMessage(errorMsg);
      addNotification(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Si no está autenticado, mostrar mensaje
  if (!isAuthenticated) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning">
          Debes iniciar sesión para ver tu perfil
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h1>Mi Perfil</h1>
      <div className="card p-3">
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          {/* Foto de perfil */}
          <div className="mb-3">
            <label className="form-label">Foto de perfil</label>
            <div className="d-flex align-items-center gap-3">
              {preview ? (
                <img 
                  src={preview} 
                  alt="preview" 
                  style={{ 
                    width: 96, 
                    height: 96, 
                    objectFit: 'cover', 
                    borderRadius: '50%',
                    border: '2px solid #ddd'
                  }} 
                />
              ) : (
                <div 
                  style={{ 
                    width: 96, 
                    height: 96, 
                    background: '#eee', 
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#999',
                    border: '2px solid #ddd'
                  }}
                >
                  Sin foto
                </div>
              )}
            </div>
            <input 
              type="file" 
              name="foto_perfil" 
              accept="image/*" 
              onChange={handleFile} 
              className="form-control mt-2" 
              disabled={loading}
            />
            <small className="text-muted">
              Formatos permitidos: JPG, PNG, GIF. Tamaño máximo: 5MB
            </small>
          </div>

          {/* Nombre */}
          <div className="mb-3">
            <label className="form-label">Nombre de usuario</label>
            <input 
              name="nombre_usuario" 
              className="form-control" 
              value={form.nombre_usuario} 
              onChange={handleChange} 
              required
              disabled={loading}
            />
          </div>

          {/* Email */}
          <div className="mb-3">
            <label className="form-label">Correo electrónico</label>
            <input 
              name="correo_electronico" 
              type="email"
              className="form-control" 
              value={form.correo_electronico} 
              onChange={handleChange} 
              required
              disabled={loading}
            />
          </div>

          {/* Teléfono */}
          <div className="mb-3">
            <label className="form-label">Teléfono</label>
            <input 
              name="telefono" 
              className="form-control" 
              value={form.telefono} 
              onChange={handleChange} 
              disabled={loading}
              placeholder="Opcional"
            />
          </div>

          {/* Ubicación */}
          <div className="mb-3">
            <label className="form-label">Ubicación</label>
            <input 
              name="ubicacion" 
              className="form-control" 
              value={form.ubicacion} 
              onChange={handleChange} 
              disabled={loading}
              placeholder="Ej: Bogotá, Colombia"
            />
          </div>

          {/* Botón de guardar */}
          <button 
            className="btn btn-primary" 
            type="submit" 
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Guardando...
              </>
            ) : (
              'Guardar cambios'
            )}
          </button>
        </form>

        {/* Mensajes */}
        {message && (
          <div className={`mt-3 alert ${message.includes('éxito') ? 'alert-success' : 'alert-info'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default Perfil;