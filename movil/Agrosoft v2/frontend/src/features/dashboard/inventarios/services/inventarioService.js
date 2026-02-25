// src/services/inventarioService.js
import { api } from "../../../../config/api";

const BASE_URL = "/api/inventarios";

// Función para agregar headers de autenticación
// Authorization header injected by api interceptor

// Manejo centralizado de errores
const handleError = (error) => {
  const message =
    error.response?.data?.message ||
    error.response?.data?.error ||
    error.message ||
    "Ocurrió un error inesperado";
  throw new Error(message);
};

// Obtener inventarios
export const getInventarios = async (searchTerm = "") => {
  try {
    const url = searchTerm ? `${BASE_URL}?search=${encodeURIComponent(searchTerm)}` : BASE_URL;
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// Crear inventario
export const createInventario = async (data) => {
  try {
    const response = await api.post(BASE_URL, data);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// Actualizar inventario
export const updateInventario = async (id, data) => {
  try {
    const response = await api.put(`${BASE_URL}/${id}`, data);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// Eliminar inventario
export const deleteInventario = async (id) => {
  try {
    const response = await api.delete(`${BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// Exportar como objeto para import fácil
const inventarioService = {
  getInventarios,
  createInventario,
  updateInventario,
  deleteInventario,
};

export default inventarioService;
