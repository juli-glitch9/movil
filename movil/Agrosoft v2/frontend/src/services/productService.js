// services/productorService.js
import { api } from "../config/api";

const UNAUTHORIZED_ERROR = "Token inválido o expirado. Inicia sesión nuevamente.";

const getLoggedUserId = () => {
  try {
    const userJson = localStorage.getItem("user");
    if (!userJson) return null;
    const user = JSON.parse(userJson);
    return user?.id_usuario || user?.idUsuario || null;
  } catch (e) {
    return null;
  }
};

// =======================================================
// 📦 Productos del productor
// =======================================================
export const getProductos = async (id_usuario) => {
  try {
    const id = id_usuario || getLoggedUserId();
    if (!id) throw new Error("No se encontró id de productor. Inicia sesión.");
    const response = await api.get(`/api/productor/usuario/${id}`);
    return response.data;
  } catch (err) {
    console.error("[DEBUG] GET productos error:", err);
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      throw new Error(UNAUTHORIZED_ERROR);
    }
    throw err;
  }
};

export const addProducto = async (producto) => {
  try {
    const productoToSend = { ...producto };
    if (!productoToSend.id_usuario) {
      const id = getLoggedUserId();
      if (!id) throw new Error("No se encontró id de productor. Inicia sesión.");
      productoToSend.id_usuario = id;
    }
    const response = await api.post("/api/productor", productoToSend);
    return response.data;
  } catch (err) {
    console.error("[DEBUG] POST producto error:", err);
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      throw new Error(UNAUTHORIZED_ERROR);
    }
    throw err;
  }
};

export const updateProducto = async (id, producto) => {
  try {
    const response = await api.put(`/api/productor/${id}`, producto);
    return response.data;
  } catch (err) {
    console.error("[DEBUG] PUT producto error:", err);
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      throw new Error(UNAUTHORIZED_ERROR);
    }
    throw err;
  }
};

export const deleteProducto = async (id) => {
  try {
    const response = await api.delete(`/api/productor/${id}`);
    return response.data;
  } catch (err) {
    console.error("[DEBUG] DELETE producto error:", err);
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      throw new Error(UNAUTHORIZED_ERROR);
    }
    throw err;
  }
};

// =======================================================
// 🔍 Debug de autenticación
// =======================================================
export const debugAuth = () => {
  console.log("=== AUTH DEBUG ===");
  console.log("Token:", localStorage.getItem("token"));
  console.log("User:", localStorage.getItem("user"));
  console.log("=== END DEBUG ===");
};

export { UNAUTHORIZED_ERROR };
