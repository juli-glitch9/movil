// src/services/userService.js
import { api } from "../../../../config/api";

const BASE_URL = "/api/users";

// Manejo centralizado de errores
const handleError = (error, action = "realizar la acción") => {
  console.error("UserService Error:", error);

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
// Funciones principales de usuarios
// ================================

export const getUsers = async (search = "") => {
  try {
    let url = BASE_URL;
    if (search) url += `?search=${encodeURIComponent(search)}`;
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    handleError(error, "obtener usuarios");
  }
};

export const createUser = async (userData) => {
  try {
    const response = await api.post(BASE_URL, userData);
    return response.data;
  } catch (error) {
    handleError(error, "crear usuario");
  }
};

export const updateUser = async (id, userData) => {
  try {
    const dataToSend = { ...userData };
    if (!dataToSend.password_hash) delete dataToSend.password_hash;

    const response = await api.put(`${BASE_URL}/${id}`, dataToSend);
    return response.data;
  } catch (error) {
    handleError(error, "actualizar usuario");
  }
};

export const deleteUser = async (id) => {
  try {
    const response = await api.delete(`${BASE_URL}/${id}`);
    // Si status 204 → eliminado correctamente
    return response.status === 204
      ? { message: "Usuario eliminado con éxito." }
      : response.data;
  } catch (error) {
    handleError(error, "eliminar usuario");
  }
};

// Exportación de todas las funciones
const userService = {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
};

export default userService;
