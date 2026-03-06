import axios from "axios";

// Tu IP de AWS - La fábrica de datos
const AWS_IP = "35.173.161.55"; 

export const API_BASE_URL = `http://${AWS_IP}:4000`;

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Interceptor para el token (mantén el resto igual)
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
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    // ignore
  }
  return config;
}, (error) => Promise.reject(error));