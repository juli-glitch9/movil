// src/services/ordenService.js
import { api } from "../../../../config/api";

const BASE_URL = "/api/ordenes";

// Authorization header injected by api interceptor

// Manejo centralizado de errores
const handleError = (error, fallback = []) => {
  console.error("OrdenService Error:", error);
  if (error.response?.status === 401) {
    throw new Error("Token inválido o expirado. Por favor inicia sesión nuevamente.");
  }
  const message =
    error.response?.data?.message ||
    error.response?.data?.error ||
    error.message ||
    "Ocurrió un error inesperado al procesar la solicitud.";
  throw new Error(message || fallback);
};

// Obtener órdenes (con filtros opcionales)
export const obtenerOrdenes = async (filtros = {}) => {
  try {
    const params = new URLSearchParams();
    Object.keys(filtros).forEach((key) => {
      if (filtros[key] !== undefined && filtros[key] !== null) {
        params.append(key, filtros[key]);
      }
    });

    const url = params.toString() ? `${BASE_URL}/admin/todas?${params.toString()}` : `${BASE_URL}/admin/todas`;
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    return handleError(error, []);
  }
};

// Actualizar estado de una orden
export const actualizarEstadoOrden = async (id, estado) => {
  try {
    const response = await api.put(`${BASE_URL}/${id}/estado`, { estado });
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

// Obtener comprobante de una orden
export const obtenerComprobante = async (id_pedido) => {
  try {
    const response = await api.get(`${BASE_URL}/${id_pedido}/comprobante`, {
      responseType: "blob", // para descargar PDF o imagen
    });
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

// Exportar como objeto para import fácil
const ordenService = {
  obtenerOrdenes,
  actualizarEstadoOrden,
  obtenerComprobante,
};

export default ordenService;
