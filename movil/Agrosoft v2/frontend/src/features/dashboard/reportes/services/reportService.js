// src/services/finanzasService.js
import { api } from "../../../../config/api";

// Base URL relativa (Axios ya usa API_BASE_URL)
const BASE_URL = "/api/finanzas";

// Manejo centralizado de errores
const handleError = (error, action = "realizar la acción") => {
  console.error("FinanzasService Error:", error);

  let message = `Ocurrió un error al ${action}`;
  if (error.response) {
    const status = error.response.status;
    message =
      error.response.data?.message ||
      error.response.data?.error ||
      `Error del servidor (Status: ${status})`;
  } else if (error.request) {
    message = "No se pudo conectar al servidor. Verifica tu conexión y que la API esté activa.";
  } else if (error.message) {
    message = error.message;
  }

  throw new Error(message);
};

// Helper para construir URLs filtradas por usuario
const buildUrlWithUserId = (endpoint = "", id_usuario) =>
  id_usuario ? `${BASE_URL}${endpoint}?id_usuario=${id_usuario}` : `${BASE_URL}${endpoint}`;

// =======================================================
// 👤 FUNCIONES PRODUCTOR (Filtrado por usuario)
// =======================================================

export const getFinanzasData = async (id_usuario) => {
  try {
    const response = await api.get(buildUrlWithUserId("", id_usuario));
    return response.data;
  } catch (error) {
    handleError(error, "obtener datos financieros");
  }
};

export const getVentasPorMes = async (id_usuario) => {
  try {
    const response = await api.get(buildUrlWithUserId("/ventas-por-mes", id_usuario));
    return response.data;
  } catch (error) {
    handleError(error, "obtener ventas por mes");
  }
};

export const getProductosMasVendidos = async (id_usuario) => {
  try {
    const response = await api.get(buildUrlWithUserId("/productos-mas-vendidos", id_usuario));
    return response.data;
  } catch (error) {
    handleError(error, "obtener productos más vendidos");
  }
};

export const getOrdenesEstado = async (id_usuario) => {
  try {
    const response = await api.get(buildUrlWithUserId("/ordenes-estado", id_usuario));
    return response.data;
  } catch (error) {
    handleError(error, "obtener órdenes por estado");
  }
};

export const getReport = async (type, format = "json") => {
  try {
    const response = await api.get(`${BASE_URL}/reportes/${type}`, {
      params: { format },
      responseType: format === "html" ? "text" : format === "pdf" || format === "excel" ? "blob" : "json",
    });
    return response.data;
  } catch (error) {
    handleError(error, `obtener reporte ${type}`);
  }
};

// =======================================================
// 🛡️ FUNCIONES ADMIN (Globales)
// =======================================================

export const getFinanzasDataAdmin = async () => {
  try {
    const response = await api.get(`${BASE_URL}/admin/stats`);
    return response.data;
  } catch (error) {
    handleError(error, "obtener datos financieros admin");
  }
};

export const getVentasPorMesAdmin = async () => {
  try {
    const response = await api.get(`${BASE_URL}/admin/ventas-por-mes`);
    return response.data;
  } catch (error) {
    handleError(error, "obtener ventas por mes admin");
  }
};

export const getProductosMasVendidosAdmin = async () => {
  try {
    const response = await api.get(`${BASE_URL}/admin/productos-mas-vendidos`);
    return response.data;
  } catch (error) {
    handleError(error, "obtener productos más vendidos admin");
  }
};

export const getOrdenesEstadoAdmin = async () => {
  try {
    const response = await api.get(`${BASE_URL}/admin/ordenes-estado`);
    return response.data;
  } catch (error) {
    handleError(error, "obtener órdenes por estado admin");
  }
};

export const getReportAdmin = async (type, format = "json") => {
  try {
    const response = await api.get(`${BASE_URL}/admin/reportes/${type}`, {
      params: { format },
      responseType: format === "html" ? "text" : format === "pdf" || format === "excel" ? "blob" : "json",
    });
    return response.data;
  } catch (error) {
    handleError(error, `obtener reporte admin ${type}`);
  }
};

// Exportando un objeto para importar todas las funciones fácilmente
const finanzasService = {
  getFinanzasData,
  getVentasPorMes,
  getProductosMasVendidos,
  getOrdenesEstado,
  getReport,
  getFinanzasDataAdmin,
  getVentasPorMesAdmin,
  getProductosMasVendidosAdmin,
  getOrdenesEstadoAdmin,
  getReportAdmin,
};

export default finanzasService;
