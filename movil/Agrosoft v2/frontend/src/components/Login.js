// src/components/Login.jsx
import React, { useState, useContext } from "react";
import { motion } from "framer-motion";
import './login.css';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from "../context/AuthContext";
import { api } from "../config/api"; // Axios con URL dinámica

function Login({ switchToRegister, onLogin }) {
  const { login: authLogin } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    correo_electronico: "",
    password: ""
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const newErrors = {};
    if (!formData.correo_electronico) newErrors.correo_electronico = "Correo obligatorio";
    if (!formData.password) newErrors.password = "Contraseña obligatoria";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      setLoading(false);
      return;
    }

    try {
      console.log('🔐 [LOGIN] Iniciando proceso de autenticación...');

      // Petición al backend
      const { data } = await api.post("/api/users/login", formData);

      console.log('🔐 [LOGIN] Respuesta del servidor:', data);

      if (data.status === "error") {
        setErrors({ ...errors, password: data.message });
        setMessage("");
      } else if (data.status === "success") {
        setMessage(data.message);
        setErrors({});

        console.log('💾 [LOGIN] Guardando token y datos de usuario...');

        // --- CORRECCIÓN CRÍTICA AQUÍ ---
        // 1. Guardamos el token para las peticiones API
        localStorage.setItem('token', data.token);
        
        // 2. Guardamos el objeto usuario completo (contiene id_usuario, nombre, rol, etc.)
        // Esto es lo que AdminView.jsx busca para filtrar Pedidos y Finanzas
        localStorage.setItem('user', JSON.stringify(data.user)); 
        
        console.log('✅ [LOGIN] Datos guardados en localStorage correctamente');

        // 3. Actualizamos el contexto global de la App
        authLogin(data.token);

        console.log(`🚀 [LOGIN] Rol detectado: ${data.user.id_rol}, redirigiendo...`);
        
        // Redirección basada en el rol del usuario
        if (data.user.id_rol === 3) {
          // Vista del Productor/Admin Agrosoft
          navigate('/AdminView', { replace: true });
        } else if (data.user.id_rol === 2) {
          // Vista de Administrador de Sistema
          navigate('/admin', { replace: true });
        } else {
          // Vista de Cliente/Público
          navigate('/', { replace: true });
        }
      }

    } catch (error) {
      console.error("❌ [LOGIN] Error:", error);
      if (error.response?.status === 401) {
        setMessage("Correo o contraseña incorrectos");
      } else if (error.response) {
        setMessage(error.response.data?.message || "Error del servidor");
      } else {
        setMessage("Error de conexión con el servidor");
      }
    } finally {
      setLoading(false);
    }
  };

  // Animaciones de Framer Motion
  const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.5 } },
    exit: { opacity: 0, transition: { duration: 0.5 } }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="video-background-container" 
      style={{ position: 'relative' }}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <img
        src="/img/1.png"
        alt="Logo Agrosoft"
        style={{
          position: "absolute",
          top: "30px",
          left: "30px",
          width: "70px",
          height: "auto",
          zIndex: 2,
          filter: "brightness(0) invert(0)"
        }}
      />

      {/* VIDEO DE FONDO */}
      <video autoPlay loop muted className="video-background">
        <source src="/video/vecteezy_the-farmer-is-working-and-inspecting-the-vegetables-in-the_7432637.mov" type="video/mp4" />
        Tu navegador no soporta videos de fondo.
      </video>

      {/* TARJETA DE LOGIN */}
      <motion.div
        className="login-container"
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        transition={{ duration: 0.8 }}
      >
        <div className="login-card">
          <motion.h3
            className="login-title login-title-underline"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Iniciar sesión
          </motion.h3>

          <form className="login-form" onSubmit={handleSubmit}>
            <motion.div
              className="login-field"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <label>Correo electrónico</label>
              <input
                type="text"
                name="correo_electronico"
                value={formData.correo_electronico}
                onChange={handleChange}
                className={errors.correo_electronico ? "input-error" : ""}
                placeholder={errors.correo_electronico || "ejemplo@correo.com"}
                disabled={loading}
              />
            </motion.div>

            <motion.div
              className="login-field"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <label>Contraseña</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? "input-error" : ""}
                placeholder={errors.password || "********"}
                disabled={loading}
              />
            </motion.div>

            <motion.button
              type="submit"
              className="btn-login"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={loading}
            >
              {loading ? "Iniciando sesión..." : "Iniciar sesión"}
            </motion.button>
          </form>

          {message && (
            <div className={`login-message ${message.toLowerCase().includes('error') || message.toLowerCase().includes('incorrecto') ? 'error' : 'success'}`}>
              {message}
            </div>
          )}

          <div className="login-footer">
            <Link to="/register" className="btn-link-login">
              ¿No tienes cuenta? Regístrate aquí
            </Link>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default Login;