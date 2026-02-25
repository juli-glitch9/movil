import React, { useState, useEffect } from "react";
// import { updateUser } from "../services/userService"; // Se comenta o elimina si no se usa directamente aquí
import "../styles/UserEditForm.css";

export default function UserEditForm({ show, onClose, user, onSave}) {
  const [form, setForm] = useState({
    nombre_usuario: "",
    password_hash: "",
    correo_electronico: "",
    id_rol: "",
    documento_identidad: "",
    estado: "",
  });

  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Roles disponibles (puedes traerlos del backend si quieres)
  const roles = [
    { id_rol: 1, nombre_rol: "cliente" },
    { id_rol: 2, nombre_rol: "administrador" },
    { id_rol: 3, nombre_rol: "agricultor" },
  ];

  // Cuando cambia el usuario, rellenamos el form
  useEffect(() => {
    if (user) {
      setForm({
        nombre_usuario: user.nombre_usuario || "",
        password_hash: "", 
        correo_electronico: user.correo_electronico || "",
        id_rol: user.id_rol || "",
        documento_identidad: user.documento_identidad || "",
        // Normalizamos a Title Case para coincidir con las opciones
        estado: (user.estado && user.estado.toLowerCase() === 'inactivo') ? 'Inactivo' : 'Activo',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      if (onSave) {
       
        await onSave({ ...form, id_usuario: user.id_usuario });
      }
    } catch (err) {
      console.error("Error al enviar formulario de edición:", err);
      setApiError("Error al guardar los cambios.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className={`modal_user-overlay ${show ? "show" : ""}`}>
      <div className="modal_user">
        <h2>Editar Usuario</h2>
        {apiError && <div className="error-message" style={{ color: 'red', textAlign: 'center', marginBottom: '10px' }}>{apiError}</div>}
        <form onSubmit={handleSubmit}>
          <label>Nombre Usuario</label>
          <input
            type="text"
            name="nombre_usuario"
            value={form.nombre_usuario}
            onChange={handleChange}
            required
          />

          <label>Correo Electrónico</label>
          <input
            type="email"
            name="correo_electronico"
            value={form.correo_electronico}
            onChange={handleChange}
            required
          />

          <label>Documento Identidad</label>
          <input
            type="text"
            name="documento_identidad"
            value={form.documento_identidad}
            onChange={handleChange}
            required
          />

          <label>Contraseña (opcional)</label>
          <input
            type="password"
            name="password_hash"
            value={form.password_hash}
            onChange={handleChange}
            placeholder="Dejar vacío si no se cambia"
          />

          <label>Rol</label>
          <select
            name="id_rol"
            value={form.id_rol}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione un rol</option>
            {roles.map((rol) => (
              <option key={rol.id_rol} value={rol.id_rol}>
                {rol.nombre_rol}
              </option>
            ))}
          </select>

          <label>Estado</label>
          <select
            name="estado"
            value={form.estado}
            onChange={handleChange}
            required
          >
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </select>

          <div className="form-actions">
            <button type="submit" 
                    className="btn-primary" 
                    disabled={loading}>
                    
                    {loading ? 'Guardando...' : 'Guardar Cambios'}
              
              
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
