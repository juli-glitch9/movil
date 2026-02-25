// services/subcategoriasService.js
import { api } from "../config/api";

// =======================================================
// Obtener subcategorías
// =======================================================
export const getSubcategorias = async () => {
  try {
    const res = await api.get("/api/subcategorias");
    return res.data;
  } catch (error) {
    console.error("❌ Error al obtener las subcategorías:", error);
    if (error.response?.status === 401) {
      throw new Error("Token inválido o expirado. Inicia sesión nuevamente.");
    }
    throw error;
  }
};
