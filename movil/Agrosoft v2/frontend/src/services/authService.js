const getToken = () => {
  // Primero intentamos obtener el token directamente
  const token = localStorage.getItem("token");
  if (token) return token;

  // Si no hay token directo, buscamos en el objeto user
  try {
    const userData = localStorage.getItem("user");
    if (userData) {
      const usuario = JSON.parse(userData);
      if (usuario && usuario.token) {
        // Guardamos el token directamente para futuras consultas
        localStorage.setItem("token", usuario.token);
        return usuario.token;
      }
    }
  } catch (e) {
    console.error("Error parsing user data:", e);
  }

  return null;
};

const authHeaders = () => {
  const token = getToken();
  return token ? {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  } : {
    "Content-Type": "application/json"
  };
};

const isAuthenticated = () => {
  return !!getToken();
};

const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/login";
};

const handleAuthError = (error) => {
  if (error.response?.status === 401 || error.response?.status === 403) {
    logout();
  }
  throw error;
};

export {
  getToken,
  authHeaders,
  isAuthenticated,
  logout,
  handleAuthError
};