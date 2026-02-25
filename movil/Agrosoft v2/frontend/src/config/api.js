// src/config/api.js
import axios from "axios";

// Detectar si estamos en Capacitor (Android / iOS)
const isCapacitor = !!window.Capacitor;

// IP de tu PC para conexión desde móvil
const PC_IP = "192.168.20.26"; // cambia si tu IP cambia

// URL base según plataforma
export const API_BASE_URL = (() => {
  if (isCapacitor) {
    // Emulador Android → usar 10.0.2.2
    if (navigator.userAgent.includes("Android")) return "http://10.0.2.2:4000";
    // Celular real → usar IP de tu PC
    return `http://${PC_IP}:4000`;
  } else {
    // Web → localhost
    return "http://localhost:4000";
  }
})();

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Attach Authorization header automatically if token is present
api.interceptors.request.use((config) => {
  try {
    let token = localStorage.getItem("token");
    if (!token) {
      const userJson = localStorage.getItem("user");
      if (userJson) {
        const user = JSON.parse(userJson);
        token = user?.token || user?.accessToken || null;
      }
    }
    if (token) {
      config.headers = config.headers || {};
      if (!config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch (e) {
    // ignore parsing errors
  }
  return config;
}, (error) => Promise.reject(error));
