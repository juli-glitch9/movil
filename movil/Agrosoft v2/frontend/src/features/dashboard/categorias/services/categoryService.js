// src/services/categoriesService.js
import { api } from "../../../../config/api";

const BASE_URL = "/api/categories/admin";

export const getCategories = async (search = '') => {
  try {
    const url = search ? `${BASE_URL}?search=${encodeURIComponent(search)}` : BASE_URL;
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error("Error al obtener categorías:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Error al obtener categorías');
  }
};

export const createCategory = async (categoria) => {
  try {
    const response = await api.post(`${BASE_URL}/create`, categoria);
    return response.data;
  } catch (error) {
    console.error("Error al crear categoría:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Error al crear la categoría');
  }
};

export const updateCategory = async (id, categoria) => {
  try {
    const response = await api.put(`${BASE_URL}/update/${id}`, categoria);
    return response.data;
  } catch (error) {
    console.error("Error al actualizar categoría:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Error al actualizar la categoría');
  }
};

export const deleteCategory = async (id) => {
  try {
    const response = await api.delete(`${BASE_URL}/delete/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error al eliminar categoría:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Error al eliminar la categoría');
  }
};
