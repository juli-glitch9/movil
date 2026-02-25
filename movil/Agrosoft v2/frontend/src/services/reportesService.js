// services/finanzasService.js
import { api } from "../config/api";

// =======================================================
//  Reporte de Productos Registrados
// =======================================================
export const getReporteProductos = async (format = "json") => {
  try {
    const response = await api.get(`/api/finanzas/reportes/productos?format=${format}`);
    return response.data;
  } catch (error) {
    console.error("❌ Error al obtener reporte de productos:", error);
    if (error.response?.status === 401)
      throw new Error("Token inválido o expirado. Inicia sesión nuevamente.");
    throw error;
  }
};

// =======================================================
//  Reporte de Inventario Actual
// =======================================================
export const getReporteInventario = async (format = "json") => {
  try {
    const response = await api.get(`/api/finanzas/reportes/inventario?format=${format}`);
    return response.data;
  } catch (error) {
    console.error("❌ Error al obtener reporte de inventario:", error);
    if (error.response?.status === 401)
      throw new Error("Token inválido o expirado. Inicia sesión nuevamente.");
    throw error;
  }
};

// =======================================================
//  Reporte de Ventas / Pedidos
// =======================================================
export const getReportePedidos = async (format = "json") => {
  try {
    const response = await api.get(`/api/finanzas/reportes/pedidos?format=${format}`);
    return response.data;
  } catch (error) {
    console.error("❌ Error al obtener reporte de pedidos:", error);
    if (error.response?.status === 401)
      throw new Error("Token inválido o expirado. Inicia sesión nuevamente.");
    throw error;
  }
};

// =======================================================
//  Reporte de Descuentos y Ofertas
// =======================================================
export const getReporteDescuentos = async (format = "json") => {
  try {
    const response = await api.get(`/api/finanzas/reportes/descuentos?format=${format}`);
    return response.data;
  } catch (error) {
    console.error("❌ Error al obtener reporte de descuentos:", error);
    if (error.response?.status === 401)
      throw new Error("Token inválido o expirado. Inicia sesión nuevamente.");
    throw error;
  }
};

// =======================================================
// Descarga de archivos (PDF/Excel)
// =======================================================
export const descargarReportePDF = async (tipoReporte) => {
  try {
    const response = await api.get(`/api/finanzas/reportes/${tipoReporte}?format=pdf`, {
      responseType: "blob",
    });

    const blob = new Blob([response.data], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `reporte_${tipoReporte}_${new Date().toISOString().split("T")[0]}.pdf`;
    link.click();

    return true;
  } catch (error) {
    console.error(`❌ Error al descargar reporte PDF (${tipoReporte}):`, error);
    throw error;
  }
};

export const descargarReporteExcel = async (tipoReporte) => {
  try {
    const response = await api.get(`/api/finanzas/reportes/${tipoReporte}?format=excel`, {
      responseType: "blob",
    });

    const blob = new Blob([response.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `reporte_${tipoReporte}_${new Date().toISOString().split("T")[0]}.xlsx`;
    link.click();

    return true;
  } catch (error) {
    console.error(`❌ Error al descargar reporte Excel (${tipoReporte}):`, error);
    throw error;
  }
};

// =======================================================
// Preview HTML (para visualización previa)
// =======================================================
export const getReportePreview = async (tipoReporte) => {
  try {
    const response = await api.get(`/api/finanzas/reportes/${tipoReporte}?format=html`);
    return response.data; // Retorna el HTML
  } catch (error) {
    console.error(`❌ Error al obtener preview del reporte (${tipoReporte}):`, error);
    throw error;
  }
};
