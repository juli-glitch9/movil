// src/services/tipoPqrsService.js
import { api } from "../../../../config/api";

const BASE_URL = "/api/tipoPqrs/admin";

// Manejo centralizado de errores
const handleError = (error, action = "realizar la acción") => {
  console.error("TipoPQRS Service Error:", error);

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
// Funciones principales de tipoPQRS
// ================================

export const getTipoPqrs = async (search = "") => {
  try {
    let url = BASE_URL;
    if (search) {
      url += `?search=${encodeURIComponent(search)}`;
    }
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    handleError(error, "obtener tipos de PQRS");
  }
};

export const createTipoPqrs = async (tipoPqrs) => {
  try {
    const response = await api.post(`${BASE_URL}/create`, tipoPqrs);
    return response.data;
  } catch (error) {
    handleError(error, "crear tipo de PQRS");
  }
};

export const updateTipoPqrs = async (id, tipoPqrs) => {
  try {
    const response = await api.put(`${BASE_URL}/update/${id}`, tipoPqrs);
    return response.data;
  } catch (error) {
    handleError(error, "actualizar tipo de PQRS");
  }
};

export const deleteTipoPqrs = async (id) => {
  try {
    const response = await api.delete(`${BASE_URL}/delete/${id}`);
    return response.data;
  } catch (error) {
    handleError(error, "eliminar tipo de PQRS");
  }
};

// Exportación de todas las funciones
const tipoPqrsService = {
  getTipoPqrs,
  createTipoPqrs,
  updateTipoPqrs,
  deleteTipoPqrs,
};

export default tipoPqrsService;
