// src/services/productService.js
import { api } from "../../../../config/api";

const BASE_URL = "/api/products";
const SUBCATEGORIES_URL = "/api/subcategorias";

// Manejo centralizado de errores
const handleError = (error, action = "realizar la acción") => {
  console.error("ProductService Error:", error);

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

// Productos
export const getProducts = async (search = "") => {
  try {
    let url = `${BASE_URL}/admin`;
    if (search) url += `?search=${encodeURIComponent(search)}`;
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    handleError(error, "obtener productos");
  }
};

// Subcategorías
export const getSubcategories = async () => {
  try {
    const response = await api.get(SUBCATEGORIES_URL);
    return response.data;
  } catch (error) {
    handleError(error, "obtener subcategorías");
  }
};

// Crear producto
export const createProduct = async (data) => {
  try {
    const response = await api.post(`${BASE_URL}/admin/create`, data);
    return response.data;
  } catch (error) {
    handleError(error, "crear producto");
  }
};

// Actualizar producto
export const updateProduct = async (id, data) => {
  try {
    const response = await api.put(`${BASE_URL}/admin/update/${id}`, data);
    return response.data;
  } catch (error) {
    handleError(error, `actualizar producto ID ${id}`);
  }
};

// Eliminar producto (soft delete)
export const deleteProduct = async (id) => {
  try {
    const response = await api.delete(`${BASE_URL}/admin/delete/${id}`);
    if (response.status === 204) return { success: true };
    return response.data;
  } catch (error) {
    handleError(error, `eliminar producto ID ${id}`);
  }
};

// Eliminar producto permanentemente
export const deleteProductPermanent = async (id) => {
  try {
    const response = await api.delete(`${BASE_URL}/admin/delete-permanent/${id}`);
    return response.data;
  } catch (error) {
    handleError(error, `eliminar permanentemente producto ID ${id}`);
  }
};

const productService = {
  getProducts,
  getSubcategories,
  createProduct,
  updateProduct,
  deleteProduct,
  deleteProductPermanent,
};

export default productService;
