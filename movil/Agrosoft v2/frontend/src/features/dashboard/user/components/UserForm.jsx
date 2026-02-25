import React, { useState } from "react";
import { createUser } from "../services/userService";
import "../styles/UserForm.css";

export default function UserCreateForm({ show, onClose, onSave }) { 
    
    const [form, setForm] = useState({
        nombre_usuario: "",
        password_hash: "", 
        correo_electronico: "",
        id_rol: "",
        documento_identidad: "",
        estado: "Activo", 
    });

    const roles = [
        { id_rol: 1, nombre_rol: "cliente" },
        { id_rol: 2, nombre_rol: "administrador" },
        { id_rol: 3, nombre_rol: "agricultor" },
    ];

    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState(null);

    

    
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setApiError(null);
        
        // Preparación de los datos
        const dataToSend = {
            ...form,
            id_rol: parseInt(form.id_rol),
        };

        try {            
            const created = await createUser(dataToSend);            
            alert(`Usuario ${created.nombre_usuario || 'creado'} con éxito.`);
            if (onSave) onSave();
            onClose();            
        } catch (err) {            
            console.error("Error al crear usuario:", err); 
            setApiError(err.message || "No se pudo conectar con el servidor.");            
        } finally {
            setLoading(false);
        }
    };
    // ----------------------------------------------------------------------

    return (
        <div className={`modal_user-overlay ${show ? "show" : ""}`} onClick={onClose}>
            <div className="modal_user" onClick={(e) => e.stopPropagation()}>
                
                <h2>Crear Nuevo Usuario</h2>
                {apiError && <p style={{ color: 'red', textAlign: 'center' }}>{apiError}</p>}
                
                <form onSubmit={handleSubmit}>
                    <label>Nombre Usuario</label>
                    <input
                        type="text"
                        name="nombre_usuario"
                        value={form.nombre_usuario}
                        onChange={handleChange}
                        required
                        disabled={loading}
                    />

                    <label>Correo Electrónico</label>
                    <input
                        type="email"
                        name="correo_electronico"
                        value={form.correo_electronico}
                        onChange={handleChange}
                        required
                        disabled={loading}
                    />

                    <label>Documento Identidad</label>
                    <input
                        type="text"
                        name="documento_identidad"
                        value={form.documento_identidad}
                        onChange={handleChange}
                        required
                        disabled={loading}
                    />

                  
                    <label>Contraseña (*)</label>
                    <input
                        type="password"
                        name="password_hash"
                        value={form.password_hash}
                        onChange={handleChange}
                        placeholder="Contraseña requerida"
                        required 
                        disabled={loading}
                    />

                    <label>Rol</label>
                    <select
                        name="id_rol"
                        value={form.id_rol}
                        onChange={handleChange}
                        required
                        disabled={loading}
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
                        disabled={loading}
                    >
                        <option value="Activo">Activo</option>
                        <option value="Inactivo">Inactivo</option>
                    </select>

                    <div className="form-actions">
                        <button type="submit" 
                                className="btn-primary" 
                                disabled={loading}>
                            
                            {loading ? 'Creando...' : 'Crear Usuario'}
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