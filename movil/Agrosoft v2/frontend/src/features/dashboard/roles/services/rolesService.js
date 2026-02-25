// src/services/rolesService.js
import { api } from "../../../../config/api";

const BASE_URL = "/api/roles/admin";

// Manejo centralizado de errores
const handleError = (error, action = "realizar la acción") => {
  console.error("RolesService Error:", error);

  let message = `Ocurrió un error al ${action}`;
  if (error.response) {
    const status = error.response.status;
    message =
      error.response.data?.message ||
      error.response.data?.error ||
      `Fallo del servidor (Status: ${status})`;
  } else if (error.request) {
    message = "No se pudo conectar al servidor. Verifica tu conexión y que la API esté activa.";
  } else if (error.message) {
    message = error.message;
  }

  throw new Error(message);
};

// ================================
// Funciones principales de Roles
// ================================

export const getRoles = async (search = "") => {
  try {
    let url = BASE_URL;
    if (search) {
      url += `?search=${encodeURIComponent(search)}`;
    }
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    handleError(error, "obtener roles");
  }
};

export const createRol = async (rolData) => {
  try {
    const response = await api.post(`${BASE_URL}/create`, rolData);
    return response.data;
  } catch (error) {
    handleError(error, "crear rol");
  }
};

export const updateRol = async (id, rolData) => {
  try {
    const response = await api.put(`${BASE_URL}/update/${id}`, rolData);
    return response.data;
  } catch (error) {
    handleError(error, "actualizar rol");
  }
};

export const deleteRol = async (id) => {
  try {
    const response = await api.delete(`${BASE_URL}/delete/${id}`);
    return response.data;
  } catch (error) {
    handleError(error, "eliminar rol");
  }
};

// Exportación de todas las funciones
const rolesService = {
  getRoles,
  createRol,
  updateRol,
  deleteRol,
};

export default rolesService;
