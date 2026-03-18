import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../config/api';
import { useNotification } from '../context/NotificationContext';

const Perfil = () => {
  const { user, isAuthenticated, setUser } = useAuth();
  const { addNotification } = useNotification();
  const [form, setForm] = useState({ 
    nombre_usuario: '', 
    correo_electronico: '', 
    telefono: '', 
    ubicacion: '' 
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        nombre_usuario: user.nombre || user.nombre_usuario || '',
        correo_electronico: user.email || user.correo_electronico || '',
        telefono: user.telefono || '',
        ubicacion: user.ubicacion || '',
      });
      // Si la foto viene del backend, asegúrate de que la URL sea completa si es necesario
      setPreview(user.foto_perfil ? `http://localhost:4000${user.foto_perfil}` : null);
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
    if (!user) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const fd = new FormData();
      fd.append('nombre_usuario', form.nombre_usuario);
      fd.append('correo_electronico', form.correo_electronico);
      fd.append('telefono', form.telefono || '');
      fd.append('ubicacion', form.ubicacion || '');
      if (file) fd.append('foto_perfil', file);

      // ✅ URL CORREGIDA: Apuntando a /api/users/perfil/
      const response = await api.put(`/api/users/perfil/${user.id_usuario}`, fd, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        const updatedUser = response.data;
        addNotification('¡Perfil actualizado con éxito!', 'success');
        
        setUser({
          ...user,
          nombre: updatedUser.nombre_usuario,
          email: updatedUser.correo_electronico,
          telefono: updatedUser.telefono,
          ubicacion: updatedUser.ubicacion,
          foto_perfil: updatedUser.foto_perfil 
        });
      }
    } catch (err) {
      console.error('❌ Error:', err);
      addNotification('Error al actualizar perfil', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) return <div className="container mt-4 alert alert-warning">Debes iniciar sesión</div>;

  return (
    <div className="container mt-4">
      <h1>Mi Perfil</h1>
      <div className="card p-4 shadow-sm">
        <form onSubmit={handleSubmit}>
          <div className="mb-4 text-center">
            <div className="position-relative d-inline-block">
              {preview ? (
                <img src={preview} alt="perfil" className="rounded-circle border" style={{ width: 150, height: 150, objectFit: 'cover' }} />
              ) : (
                <div className="rounded-circle bg-light border d-flex align-items-center justify-content-center text-muted" style={{ width: 150, height: 150 }}>Sin foto</div>
              )}
            </div>
            <input type="file" accept="image/*" onChange={handleFile} className="form-control mt-3" disabled={loading} />
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Nombre de usuario</label>
              <input name="nombre_usuario" className="form-control" value={form.nombre_usuario} onChange={handleChange} required />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Correo electrónico</label>
              <input name="correo_electronico" className="form-control" value={form.correo_electronico} onChange={handleChange} required />
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Teléfono</label>
              <input name="telefono" className="form-control" value={form.telefono} onChange={handleChange} placeholder="Tu número" />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Ubicación</label>
              <input name="ubicacion" className="form-control" value={form.ubicacion} onChange={handleChange} placeholder="Ciudad, País" />
            </div>
          </div>

          <button className="btn btn-success w-100 mt-3" type="submit" disabled={loading}>
            {loading ? 'Guardando...' : 'GUARDAR CAMBIOS'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Perfil;