import React, { useState, useEffect, useCallback } from "react";

import userService from "../services/userService"; 
import UserEditForm from "./UserEditForm";
import ConfirmDelete from "./ConfirmDelete";
import "../styles/UserTable.css";

const ROLE_MAP = {
  1: "Cliente",
  2: "Administrador",
  3: "Productor",
};

export default function UserManagementTable({ refreshTrigger }) {

  const [users, setUsers] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null); 
  
  // Estados para los modales
  const [editUser, setEditUser] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  //filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const fetchUsers = useCallback(async (term = "") => {
    try {
      // Don't set loading to true here if you want seamless updates, or use a separate loading state
      // setLoading(true); 
      setError(null);     
      const data = await userService.getUsers(term);
      setUsers(data); 
    } catch (err) {
      console.error("Error al cargar usuarios:", err);
      setError(err.message || "Fallo la conexión con el servidor para obtener los usuarios.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [refreshTrigger, fetchUsers]); // Fetch on mount and when refreshTrigger changes

  // Expose fetchUsers to parent via ref if needed, or pass it down?
  // Better yet, just trust internal state updates.

  const handleUpdate = async (updatedData) => {
    try {
      await userService.updateUser(updatedData.id_usuario, updatedData);
      setEditUser(null);
      alert('Usuario actualizado con éxito!');
      await fetchUsers(); // Refresh list immediately
    } catch (err) {
      alert(`Error al actualizar: ${err}`);
    }
  };

  const handleDeleteConfirm = async (id_usuario) => {
    try {
      await userService.deleteUser(id_usuario);
      setDeleteId(null);
      // alert('Usuario eliminado con éxito!'); // Service might already alert
      await fetchUsers(); // Refresh list immediately
    } catch (err) {
      // alert(`Error al eliminar: ${err}`); // Service might already alert
    }
  };




  const filteredUsers = users.filter((user) => {
    const matchesRole = filterRole ? String(user.id_rol) === String(filterRole) : true;
    const matchesStatus = filterStatus ? user.estado?.toLowerCase() === filterStatus.toLowerCase() : true;

    let matchesSearch = true;
    // Si el término de búsqueda es numérico y se realizó la búsqueda (fetchUsers actualizó users),
    // refinamos en frontend para asegurar coincidencia exacta con ID o Documento.
    if (searchTerm && !isNaN(searchTerm) && searchTerm.trim() !== '') {
      const term = searchTerm.trim();
      // Verificamos coincidencia EXACTA con ID o Documento
      const exactId = String(user.id_usuario) === term;
      const exactDoc = String(user.documento_identidad) === term;
      matchesSearch = exactId || exactDoc;
    }
    
    return matchesRole && matchesStatus && matchesSearch;
  });

  if (loading) {
    return <div className="loading-message">Cargando usuarios desde la base de datos...</div>;
  }

  if (error) {
    return <div className="error-message">Error de la API: {error}</div>;
  }

  return (
    <div className="table-container">
      <div className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder="Buscar por nombre, correo o documento..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <select
          className="search-select"
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
        >
          <option value="">Todos los Roles</option>
          {Object.entries(ROLE_MAP).map(([id, name]) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </select>

        <select
          className="search-select"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">Todos los Estados</option>
          <option value="Activo">Activo</option>
          <option value="Inactivo">Inactivo</option>
        </select>

        <button className="btn-search" onClick={() => fetchUsers(searchTerm)}>
          Buscar
        </button>
      </div>
      <table className="user-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre Usuario</th>
            <th>Correo Electrónico</th>
            <th>Documento Identidad</th>
            <th>Rol</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.length > 0 ? (
            filteredUsers.map((u) => (
              <tr key={u.id_usuario}>
                <td>{u.id_usuario}</td>
                <td>{u.nombre_usuario}</td>
                <td>{u.correo_electronico}</td>
                <td>{u.documento_identidad || "N/A"}</td>
                <td>{ROLE_MAP[u.id_rol] || "Desconocido"}</td> 
                <td>{u.estado || "N/A"}</td>
                <td>
                  <button
                    className="btn-success"
                    onClick={() => setEditUser(u)}
                  >
                    Editar
                  </button>
                  <button
                    className="btn-danger"
                    onClick={() => setDeleteId(u.id_usuario)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7">No hay usuarios registrados en la base de datos.</td>
            </tr>
          )}
        </tbody>
      </table>

      {editUser && (
        <UserEditForm
          show={!!editUser}
          user={editUser}
          roles={ROLE_MAP} 
          onClose={() => setEditUser(null)}
          onSave={handleUpdate} 
          
        />
      )}
      {deleteId && (
        <ConfirmDelete
          show={!!deleteId}
          userId={deleteId}
          onClose={() => setDeleteId(null)}
          onConfirm={handleDeleteConfirm}
          onSave={fetchUsers}
        />
      )}
    </div>
  );
}