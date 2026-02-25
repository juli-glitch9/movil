// src/services/ordenesService.js
import { api } from "../config/api"; // <-- tu instancia de Axios con URL dinámica

// =======================================================
// 📦 Órdenes del productor
// =======================================================
export const obtenerOrdenes = async () => {
  try {
    const response = await api.get("/api/ordenes/productor");
    return response.data;
  } catch (error) {
    console.error("❌ Error al obtener las órdenes del productor:", error);
    if (error.response?.status === 401) {
      throw new Error("Token inválido o expirado. Inicia sesión nuevamente.");
    }
    return [];
  }
};

// =======================================================
// 🔄 Actualizar estado de una orden
// =======================================================
export const actualizarEstadoOrden = async (id, estado) => {
  try {
    const response = await api.put(`/api/ordenes/${id}/estado`, { estado });
    return response.data;
  } catch (error) {
    console.error("❌ Error al actualizar estado de la orden:", error);
    if (error.response?.status === 401) {
      throw new Error("Token inválido o expirado. Inicia sesión nuevamente.");
    }
    throw error;
  }
};

// =======================================================
// 📄 Obtener comprobante (PDF)
// =======================================================
export const obtenerComprobante = async (id_pedido) => {
  try {
    const response = await api.get(`/api/ordenes/${id_pedido}/comprobante`, {
      responseType: "blob", // necesario para recibir PDF
    });
    return response.data; // Retorna el objeto Blob
  } catch (error) {
    console.error("❌ Error al obtener el comprobante:", error);
    throw error;
  }
};
