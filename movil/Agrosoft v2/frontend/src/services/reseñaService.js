// services/comentariosService.js
import { api } from "../config/api";

// =======================================================
// Obtener comentarios y reseñas de productor
// =======================================================
export const getComentariosYResenas = async (categoryId) => {
  try {
    let endpoint = "/api/comentarios/productor";
    if (categoryId) {
      endpoint += `?categoriaId=${categoryId}`;
    }

    const res = await api.get(endpoint);
    return res.data;
  } catch (error) {
    console.error("❌ Error al obtener comentarios y reseñas:", error);
    if (error.response?.status === 401) {
      throw new Error("Token inválido o expirado. Inicia sesión nuevamente.");
    }
    throw error;
  }
};
