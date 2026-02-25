import { API_BASE_URL } from "../config/api"; // tu api base dinámica
import { authHeaders as getAuthHeaders } from "./authService";

// Para endpoints de productor
const PRODUCT_API_URL = `${API_BASE_URL}/api/productor`;

// Reuse auth header helper that also extracts token from `user` object if needed
const authHeaders = () => getAuthHeaders();

export const getProducerProductsApi = async (idProductor) => {
  const res = await fetch(`${PRODUCT_API_URL}/usuario/${idProductor}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Error al obtener productos del productor");
  return await res.json();
};

// Endpoints de ofertas/promociones
const OFERTAS_API_URL = `${API_BASE_URL}/api/ofertasPro`;

export const getDeals = async (idProductor, includeDeleted = false) => {
  const url = includeDeleted 
    ? `${OFERTAS_API_URL}/productor/${idProductor}?includeDeleted=true`
    : `${OFERTAS_API_URL}/productor/${idProductor}`;
  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) throw new Error("Error al obtener promociones");
  return await res.json();
};

export const createNewOferta = async (data) => {
  const res = await fetch(OFERTAS_API_URL, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al crear promoción");
  return await res.json();
};

export const updatePromocion = async (data) => {
  const res = await fetch(`${OFERTAS_API_URL}/${data.idPromocion}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al actualizar promoción");
  return await res.json();
};

export const deletePromocion = async (idPromocion) => {
  const res = await fetch(`${OFERTAS_API_URL}/${idPromocion}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Error al eliminar promoción");
  return await res.json();
};
