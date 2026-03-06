// src/components/Login.jsx
import React, { useState, useContext } from "react";
import { motion } from "framer-motion";
import './login.css';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from "../context/AuthContext";
import { api } from "../config/api"; // <- Axios con URL dinámica

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
      console.log('🔐 [LOGIN] Starting login process...');

      // 🔹 Usando Axios con API dinámica (igual que el primer código)
      const { data } = await api.post("/api/users/login", formData);

      console.log('🔐 [LOGIN] Response:', data);

      if (data.status === "error") {
        setErrors({ ...errors, password: data.message });
        setMessage("");
      } else if (data.status === "success") {
        setMessage(data.message);
        setErrors({});

        console.log('💾 [LOGIN] Saving token and user data...');

        localStorage.setItem('token', data.token);
        console.log(' [LOGIN] Token saved to localStorage');

        // 🔥 Actualizar AuthContext PRIMERO para que obtenga los datos frescos
        console.log('🔐 [LOGIN] Actualizando AuthContext...');
        authLogin(data.token);

        console.log(` [LOGIN] User role: ${data.user.id_rol}, redirecting...`);
        
        // Redirección según rol (igual que el primer código)
        if (data.user.id_rol === 3) {
          navigate('/AdminView', { replace: true });
        } else if (data.user.id_rol === 2) {
          navigate('/admin', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      }

    } catch (error) {
      if (error.response?.status === 401) {
        setMessage("Correo o contraseña incorrectos");
      } else if (error.response) {
        setMessage(error.response.data?.message || "Error del servidor");
      } else {
        setMessage("Error de conexión");
      }
    } finally {
      setLoading(false);
    }
  };

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
        alt="Logo"
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
            {["correo_electronico", "password"].map((field, index) => (
              <motion.div
                key={field}
                className="login-field"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 * index }}
              >
                <label>
                  {field === "correo_electronico" ? "Correo electrónico" : "Contraseña"}
                </label>
                <input
                  type={field === "password" ? "password" : "text"}
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  className={errors[field] ? "input-error" : ""}
                  placeholder={errors[field] ? errors[field] : field === "correo_electronico" ? "ejemplo@correo.com" : "********"}
                  disabled={loading}
                />
              </motion.div>
            ))}

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
            <div className={`login-message ${message.includes('Error') ? 'error' : 'success'}`}>
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