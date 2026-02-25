// src/services/pqrsService.js
import { api } from "../../../../config/api";

const BASE_URL = "/api/pqrs";

// Manejo centralizado de errores
const handleError = (error, id = "") => {
  console.error("PQRS Service Error:", error);

  let errorMessage = `Ocurrió un error inesperado al procesar la PQRS ${id || ""}`;

  if (error.response) {
    const status = error.response.status;
    if (status === 404) {
      errorMessage = `PQRS ${id} no encontrada en el servidor.`;
    } else if (status === 400) {
      errorMessage = error.response.data?.message || "Datos inválidos. Verifica la PQRS.";
    } else {
      errorMessage = error.response.data?.message || `Fallo del servidor (Status: ${status}).`;
    }
  } else if (error.request) {
    errorMessage = "No se pudo conectar al servidor. Verifique que la API esté activa y el puerto sea correcto.";
  }

  throw new Error(errorMessage);
};

// Obtener PQRS con búsqueda opcional
export const getPqrs = async (search = "") => {
  try {
    let url = BASE_URL;
    if (search) {
      url += `?search=${encodeURIComponent(search)}`;
    }

    const response = await api.get(url);
    return response.data.data || []; // Retornamos solo el array de PQRS
  } catch (error) {
    return handleError(error);
  }
};

// Actualizar / responder PQRS
export const updatePqrs = async (id, pqrs) => {
  try {
    const response = await api.put(`${BASE_URL}/${id}`, pqrs);
    alert(`PQRS ${id} respondida/actualizada con éxito.`);
    return response.data;
  } catch (error) {
    handleError(error, id);
  }
};

// Exportar como objeto para importar fácilmente
const pqrsService = {
  getPqrs,
  updatePqrs,
};

export default pqrsService;
