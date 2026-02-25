// src/services/descuentoService.js
import { api } from "../../../../config/api";

const BASE_URL = "/api/descuentos-alt";

// Authorization header injected by api interceptor

// Manejo de errores centralizado
const handleError = (error) => {
  const message =
    error.response?.data?.message ||
    error.response?.data?.error ||
    error.message ||
    "Ocurrió un error inesperado";
  throw new Error(message);
};

// Obtener descuentos
export const getDescuentos = async (search = "") => {
  try {
    const url = search ? `${BASE_URL}/admin?search=${encodeURIComponent(search)}` : `${BASE_URL}/admin`;
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// Crear descuento
export const createDescuento = async (descuentoData) => {
  try {
    const response = await api.post(`${BASE_URL}/create`, descuentoData);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// Actualizar descuento
export const updateDescuento = async (id, descuentoData) => {
  try {
    const response = await api.put(`${BASE_URL}/update/${id}`, descuentoData);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// Eliminar descuento
export const deleteDescuento = async (id) => {
  try {
    const response = await api.delete(`${BASE_URL}/delete/${id}`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// Exportar como objeto para import fácil
const descuentoService = {
  getDescuentos,
  createDescuento,
  updateDescuento,
  deleteDescuento,
};

export default descuentoService;
