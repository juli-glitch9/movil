import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../config/api";
import "./register.css";

const images = [
  "/img/food-3250439.jpg",
  "/img/grapevine-7368800.jpg",
  "/img/corn-5151505.jpg"
];

function Register({ onLogin }) {
  const navigate = useNavigate();
  const [activeImage, setActiveImage] = useState(0);
  const [showRoles, setShowRoles] = useState(false);

  const [formData, setFormData] = useState({
    nombre_usuario: "",
    correo_electronico: "",
    password: "",
    documento_identidad: "",
    id_rol: ""
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");

  // Cambio automático de imagen cada 4s
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveImage((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      if (!formData[key]) newErrors[key] = "Campo obligatorio";
    });
    setErrors(newErrors);
    if (Object.keys(newErrors).length) return;

    try {
      const res = await api.post("/api/users/register", formData);
      setMessage(res.data.message);
      setStatus(res.data.status);

      if (res.data.status === "success") {
        const userData = {
          id_usuario: res.data.user.id_usuario,
          id_rol: Number(formData.id_rol),
          nombre: formData.nombre_usuario,
          email: formData.correo_electronico
        };
        onLogin?.(userData);
        navigate(userData.id_rol === 3 ? "/productor" : "/catalogo", { replace: true });
      }
    } catch {
      setMessage("Error de conexión con el servidor");
      setStatus("error");
    }
  };

  return (
    <div className="register-page">
      <motion.div className="register-card" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
        {/* PANEL IZQUIERDO: CARRUSEL */}
        <div className="register-visual">
          {images.map((img, i) => (
            <img
              key={img}
              src={img}
              alt=""
              className={`register-image ${i === activeImage ? "active" : ""}`}
              onError={(e) => e.target.src = "https://placehold.co/400x300/A0E8AF/006400?text=Imagen"}
            />
          ))}
        </div>

        {/* FORMULARIO */}
        <div className="register-form">
          <h3 className="titulo-usuario">Registro de usuario</h3>

          <form onSubmit={handleSubmit}>
            {[
              ["nombre_usuario", "Nombre de usuario"],
              ["correo_electronico", "Correo electrónico"],
              ["password", "Contraseña"],
              ["documento_identidad", "Documento de identidad"]
            ].map(([name, label]) => (
              <div className="form-group" key={name}>
                <label>{label}</label>
                <input
                  type={name === "password" ? "password" : "text"}
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                  className={errors[name] ? "input-error" : ""}
                  placeholder={label}
                />
                {errors[name] && <small>{errors[name]}</small>}
              </div>
            ))}

            {/* DROPDOWN DE ROL */}
            <div className="form-group">
              <label>Elige tu rol</label>
              <div className="custom-dropdown">
                <button type="button" onClick={() => setShowRoles(!showRoles)}>
                  {formData.id_rol ? ["Cliente", "Administrador", "Agricultor"][formData.id_rol - 1] : "Selecciona un rol"}
                </button>
                {showRoles && (
                  <div className="dropdown-menu">
                    {["Cliente", "Administrador", "Agricultor"].map((r, i) => (
                      <div key={r} onClick={() => { setFormData({ ...formData, id_rol: i + 1 }); setShowRoles(false); }}>
                        {r}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {errors.id_rol && <small>{errors.id_rol}</small>}
            </div>

            <button className="btn-naranja">Unirse a la familia</button>
          </form>

          {message && <div className={`toast ${status}`}>{message}</div>}

          <Link to="/login" className="login-link">¿Ya tienes cuenta? Inicia sesión</Link>
        </div>
      </motion.div>
    </div>
  );
}

export default Register;
