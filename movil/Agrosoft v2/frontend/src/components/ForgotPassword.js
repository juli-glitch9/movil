import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../config/api";
import emailjs from '@emailjs/browser';

// IMPORTANTE: Inicializar EmailJS con tu Public Key
emailjs.init("K1xk84VHUNS_jSpVv");

function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    correo_electronico: "",
    metodo: "email",
    code: "",
    nueva_contrasena: "",
    confirmar_contrasena: "",
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Configuración de EmailJS (TUS CREDENCIALES REALES)
  const EMAILJS_CONFIG = {
    SERVICE_ID: "service_nx3666n",     // ✅ Tu Service ID
    TEMPLATE_ID: "template_byse3dh",    // ✅ Tu Template ID (NO el de prueba)
    PUBLIC_KEY: "K1xk84VHUNS_jSpVv"     // ✅ Tu Public Key
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
    setMessage("");
  };

  const validateRequest = () => {
    const newErrors = {};
    if (!form.correo_electronico) newErrors.correo_electronico = "Correo obligatorio";
    if (!form.metodo) newErrors.metodo = "Seleccione un método";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateConfirm = () => {
    const newErrors = {};
    if (!form.code) newErrors.code = "Código obligatorio";
    if (!form.nueva_contrasena) newErrors.nueva_contrasena = "Nueva contraseña obligatoria";
    if (!form.confirmar_contrasena) newErrors.confirmar_contrasena = "Confirmar contraseña es obligatorio";
    if (form.nueva_contrasena && form.confirmar_contrasena && form.nueva_contrasena !== form.confirmar_contrasena) {
      newErrors.confirmar_contrasena = "Las contraseñas no coinciden";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Función para generar código de 6 dígitos
  const generateCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Función para enviar email con EmailJS
 // Función para enviar email con EmailJS

// Función para enviar email con EmailJS - VERSIÓN CORREGIDA
const sendEmailWithCode = async (email, code) => {
  try {
    const templateParams = {
      email: email,                    // ← Variable correcta según tu template
      to_name: email.split('@')[0],     // Nombre del destinatario
      verification_code: code,          // Código de verificación
      reply_to: "julitiquea17@gmail.com" // Email para respuestas
    };

    console.log("📧 Enviando email a:", email);
    console.log("📧 Con código:", code);
    
    const response = await emailjs.send(
      "service_nx3666n",
      "template_byse3dh", 
      templateParams
    );

    console.log("✅ Email enviado exitosamente:", response);
    return true;
  } catch (error) {
    console.error("❌ Error al enviar email:", error);
    throw error;
  }
};

  // PASO 1: Solicitar código de recuperación
  const handleRequestReset = async (e) => {
    e.preventDefault();
    if (!validateRequest()) return;
    setLoading(true);
    setMessage("");

    try {
      // Verificar si el usuario existe (opcional - por seguridad)
      const userCheck = await api.post("/api/users/check-email", {
        correo_electronico: form.correo_electronico
      }).catch(() => ({ data: { exists: true } })); // Si falla, asumimos que existe por seguridad

      // Siempre procedemos como si existiera (por seguridad)
      if (true) { // userCheck.data.exists
        // Generar código de verificación
        const verificationCode = generateCode();
        
        // Guardar código en localStorage con expiración (10 minutos)
        const resetData = {
          code: verificationCode,
          email: form.correo_electronico,
          expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutos
        };
        
        localStorage.setItem(
          `reset_${form.correo_electronico}`, 
          JSON.stringify(resetData)
        );
        
        console.log("🔐 Código generado y guardado:", verificationCode);

        // Enviar email según el método seleccionado
        if (form.metodo === "email") {
          await sendEmailWithCode(form.correo_electronico, verificationCode);
          setMessage("✅ Código enviado a tu correo electrónico");
        } else {
          // Para WhatsApp, necesitarías implementar con otra API
          setMessage("📱 Modo WhatsApp: Código guardado localmente");
          // Aquí podrías integrar TextBelt u otro servicio
        }
        
        setStep(2);
      } else {
        // Por seguridad, no revelamos si el email existe
        setMessage("📧 Si el correo existe, recibirás un código");
        setStep(2);
      }
    } catch (error) {
      console.error("❌ Error en solicitud:", error);
      setMessage("Error al enviar código. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  // PASO 2: Confirmar código y cambiar contraseña
  const handleConfirmReset = async (e) => {
    e.preventDefault();
    if (!validateConfirm()) return;
    setLoading(true);
    setMessage("");

    try {
      // Recuperar código guardado
      const storedData = localStorage.getItem(`reset_${form.correo_electronico}`);
      
      if (!storedData) {
        setErrors({ ...errors, code: "❌ No hay solicitud activa. Solicita un nuevo código." });
        setLoading(false);
        return;
      }

      const resetData = JSON.parse(storedData);

      // Verificar expiración
      if (Date.now() > resetData.expiresAt) {
        setErrors({ ...errors, code: "⏰ Código expirado. Solicita uno nuevo." });
        localStorage.removeItem(`reset_${form.correo_electronico}`);
        setLoading(false);
        return;
      }

      // Verificar código
      if (resetData.code !== form.code) {
        setErrors({ ...errors, code: "❌ Código incorrecto" });
        setLoading(false);
        return;
      }

      // Código válido - proceder con el cambio de contraseña
      console.log("✅ Código verificado correctamente");

      // Llamar al backend para actualizar la contraseña
     const response = await api.post("/api/users/password-reset/confirm", {
     correo_electronico: form.correo_electronico,
     code: form.code,                    // ← AGREGAR ESTA LÍNEA
    nueva_contrasena: form.nueva_contrasena
  });

      if (response.data.status === "success") {
        // Limpiar localStorage
        localStorage.removeItem(`reset_${form.correo_electronico}`);
        
        setMessage("✅ Contraseña actualizada correctamente");
        setStep(3);
      } else {
        setMessage("❌ Error al actualizar contraseña");
      }
    } catch (error) {
      console.error("❌ Error al confirmar:", error);
      setMessage(error.response?.data?.message || "Error al restablecer la contraseña");
    } finally {
      setLoading(false);
    }
  };

  // PASO 3: Reenviar código
  const handleResendCode = async () => {
    setLoading(true);
    try {
      const verificationCode = generateCode();
      const resetData = {
        code: verificationCode,
        email: form.correo_electronico,
        expiresAt: Date.now() + 10 * 60 * 1000
      };
      
      localStorage.setItem(`reset_${form.correo_electronico}`, JSON.stringify(resetData));
      
      if (form.metodo === "email") {
        await sendEmailWithCode(form.correo_electronico, verificationCode);
        setMessage("✅ Nuevo código enviado a tu correo");
      }
    } catch (error) {
      setMessage("❌ Error al reenviar código");
    } finally {
      setLoading(false);
    }
  };

  const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.5 } },
    exit: { opacity: 0, transition: { duration: 0.5 } },
  };

  return (
    <motion.div
      className="video-background-container"
      style={{ position: "relative" }}
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
          filter: "brightness(0) invert(0)",
        }}
      />

      <video autoPlay loop muted className="video-background">
        <source
          src="/video/vecteezy_the-farmer-is-working-and-inspecting-the-vegetables-in-the_7432637.mov"
          type="video/mp4"
        />
        Tu navegador no soporta videos de fondo.
      </video>

      <motion.div
        className="login-container"
        initial="hidden"
        animate="visible"
        variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }}
        transition={{ duration: 0.8 }}
      >
        <div className="login-card">
          <motion.h3
            className="login-title login-title-underline"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Recuperar contraseña
          </motion.h3>

          {/* PASO 1: Solicitar código */}
          {step === 1 && (
            <form className="login-form" onSubmit={handleRequestReset}>
              <motion.div
                className="login-field"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <label>Correo electrónico</label>
                <input
                  type="email"
                  name="correo_electronico"
                  value={form.correo_electronico}
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
                <label>Método de envío</label>
                <select
                  name="metodo"
                  value={form.metodo}
                  onChange={handleChange}
                  className={errors.metodo ? "input-error" : ""}
                  disabled={loading}
                >
                  <option value="email">Correo electrónico</option>
                  <option value="whatsapp">WhatsApp (próximamente)</option>
                </select>
                {errors.metodo && <span className="error-text">{errors.metodo}</span>}
              </motion.div>

              <motion.button
                type="submit"
                className="btn-login"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={loading}
              >
                {loading ? "Enviando código..." : "Enviar código"}
              </motion.button>
            </form>
          )}

          {/* PASO 2: Ingresar código y nueva contraseña */}
          {step === 2 && (
            <form className="login-form" onSubmit={handleConfirmReset}>
              <motion.div
                className="login-field"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <label>Código de verificación</label>
                <input
                  type="text"
                  name="code"
                  value={form.code}
                  onChange={handleChange}
                  className={errors.code ? "input-error" : ""}
                  placeholder={errors.code || "Ingresa el código de 6 dígitos"}
                  disabled={loading}
                  maxLength="6"
                />
                <small style={{ color: '#666', cursor: 'pointer' }} onClick={handleResendCode}>
                  ¿No recibiste el código? Reenviar
                </small>
              </motion.div>

              <motion.div
                className="login-field"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <label>Nueva contraseña</label>
                <input
                  type="password"
                  name="nueva_contrasena"
                  value={form.nueva_contrasena}
                  onChange={handleChange}
                  className={errors.nueva_contrasena ? "input-error" : ""}
                  placeholder={errors.nueva_contrasena || "********"}
                  disabled={loading}
                />
              </motion.div>

              <motion.div
                className="login-field"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <label>Confirmar contraseña</label>
                <input
                  type="password"
                  name="confirmar_contrasena"
                  value={form.confirmar_contrasena}
                  onChange={handleChange}
                  className={errors.confirmar_contrasena ? "input-error" : ""}
                  placeholder={errors.confirmar_contrasena || "********"}
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
                {loading ? "Restableciendo..." : "Restablecer contraseña"}
              </motion.button>

              <button
                type="button"
                className="btn-login btn-secondary"
                onClick={() => setStep(1)}
                disabled={loading}
              >
                Volver
              </button>
            </form>
          )}

          {/* PASO 3: Éxito */}
          {step === 3 && (
            <div className="login-message success">
              {message || "✅ Contraseña restablecida correctamente."}
              <div style={{ marginTop: "1rem" }}>
                <button
                  className="btn-login"
                  onClick={() => navigate("/login")}
                >
                  Ir a iniciar sesión
                </button>
              </div>
            </div>
          )}

          {/* Mensajes de estado */}
          {message && step !== 3 && (
            <div
              className={`login-message ${
                message.includes("✅") ? "success" : "error"
              }`}
            >
              {message}
            </div>
          )}

          <div className="login-footer">
            <Link to="/login" className="btn-link-login">
              Volver al inicio de sesión
            </Link>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default ForgotPassword;