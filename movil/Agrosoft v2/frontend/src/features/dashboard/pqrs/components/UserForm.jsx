import React, { useState } from "react";
import { createUser } from "../services/userService";
import "../../../../styles/UserForm.css";

export default function Form({ show, onClose }) {
  const [form, setForm] = useState({
    id_pqrs: "",
    id_usuario: "",
    id_tipo_pqrs: "",
    asunto: "",
    descripcion: "",
    id_estado_pqrs: "",
    respuesta_administrador:"",
    id_administrador_respuesta:""
  });

  const roles = [
    { id_rol: 1, nombre_rol: "cliente" },
    { id_rol: 2, nombre_rol: "administrador" },
    { id_rol: 3, nombre_rol: "agricultor" },
  ];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createUser(form);
      console.log("Usuario creado:", form);
      onClose();
    } catch (err) {
      console.error("Error al crear usuario:", err);
    }
  };

  return (
    <div className={`modal_user-overlay ${show ? "show" : ""}`}>
      <div className="modal_user">
        <h2>Nueva Pqrs</h2>
        <form onSubmit={handleSubmit}>
          <label>Nombre</label>
          <input
            type="text"
            name="nombre_usuario"
            value={form.nombre_usuario}
            onChange={handleChange}
            required
          />

          <label>Correo electrónico</label>
          <input
            type="email"
            name="correo_electronico"
            value={form.correo_electronico}
            onChange={handleChange}
            required
          />

          <label>Documento identidad</label>
          <input
            type="text"
            name="documento_identidad"
            value={form.documento_identidad}
            onChange={handleChange}
            required
          />

          <label>Contraseña</label>
          <input
            type="password"
            name="password_hash"
            value={form.password_hash}
            onChange={handleChange}
            required
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
          <select name="estado" value={form.estado} onChange={handleChange}>
            <option value="">Seleccione estado</option>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>

          <div className="form-actions">
            <button type="submit" className="btn-primary">Guardar</button>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
