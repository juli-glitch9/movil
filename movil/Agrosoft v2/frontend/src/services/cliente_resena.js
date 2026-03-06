// src/services/comentariosService.js
import { api } from "../config/api"; // ✅ Importar API centralizada

// No necesitas API_URL ni getToken porque api ya lo maneja
// El interceptor de api ya agrega el token automáticamente

export const getComentariosYResenas = async (categoryId) => {
  try {
    let url = `/api/comentarios/productor`; // ✅ Ruta relativa
    
    if (categoryId) { 
      url = `/api/comentarios/productor?categoriaId=${categoryId}`;
    }

    // ✅ Usar api.get en lugar de axios.get
    const res = await api.get(url);
    return res.data;
  } catch (error) {
    console.error("❌ Error al obtener comentarios y reseñas:", error);
    throw error;
  }
};

// Si necesitas otras funciones relacionadas:
export const getComentariosByProducto = async (productoId) => {
  try {
    const res = await api.get(`/api/comentarios/producto/${productoId}`);
    return res.data;
  } catch (error) {
    console.error("❌ Error al obtener comentarios del producto:", error);
    throw error;
  }
};

export const createComentario = async (comentario) => {
  try {
    const res = await api.post("/api/comentarios", comentario);
    return res.data;
  } catch (error) {
    console.error("❌ Error al crear comentario:", error);
    throw error;
  }
};