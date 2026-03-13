const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const mysql = require("mysql2/promise");
require("dotenv").config();

console.log("🔧 Configurando pool de MySQL...");
console.log("📊 DB_HOST:", process.env.DB_HOST);
console.log("📊 DB_USER:", process.env.DB_USER);
console.log("📊 DB_NAME:", process.env.DB_NAME);

// Crear conexión DIRECTA a MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "agrosoft",
  waitForConnections: true,
  connectionLimit: 10
});

console.log("✅ Pool de MySQL creado");

const EMAIL_SUBJECT = "Recuperación de contraseña - Agrosoft";

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function createEmailTransporter() {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const secure = (process.env.SMTP_SECURE || "false").toLowerCase() === "true";
  const authConfigured = process.env.SMTP_USER && process.env.SMTP_PASS;

  if (authConfigured) {
    return nodemailer.createTransport({
      host, port, secure,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });
  }

  console.warn("⚠️ Usando cuenta de prueba Ethereal...");
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: "smtp.ethereal.email", port: 587, secure: false,
    auth: { user: testAccount.user, pass: testAccount.pass }
  });
}

async function sendEmail(to, subject, text) {
  const transporter = await createEmailTransporter();
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER || "test@ethereal.email",
      to, subject, text
    });
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) console.log("🔎 URL de vista previa:", previewUrl);
    return info;
  } catch (error) {
    console.error("❌ Error al enviar email:", error.message);
    throw error;
  }
}

function buildMessage(code) {
  return `Hola, bienvenido a Agrosoft. Este es tu código de verificación: ${code}`;
}

// Solicitar código de recuperación
exports.requestReset = async (req, res) => {
  try {
    const { correo_electronico, metodo } = req.body;

    console.log("\n========== SOLICITUD DE CÓDIGO ==========");
    console.log(`🔐 Email: ${correo_electronico}`);
    console.log(`📱 Método: ${metodo}`);

    if (!correo_electronico) {
      return res.status(400).json({ status: "error", message: "Correo electrónico es requerido" });
    }

    // Buscar usuario
    const [users] = await pool.query(
      "SELECT * FROM usuarios WHERE correo_electronico = ?", 
      [correo_electronico]
    );
    
    if (users.length === 0) {
      return res.json({ status: "success", message: "Si el correo existe, se ha enviado un código" });
    }

    const user = users[0];
    console.log(`👤 Usuario ID: ${user.id_usuario}`);

    // Marcar códigos anteriores como usados
    await pool.query(
      "UPDATE password_resets SET used = true WHERE email = ? AND used = false",
      [correo_electronico]
    );

    const code = generateCode();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);
    
    console.log(`🔐 Código generado: ${code}`);

    // Guardar en base de datos
    await pool.query(
      "INSERT INTO password_resets (email, code, expires_at, used) VALUES (?, ?, ?, ?)",
      [correo_electronico, code, expiresAt, false]
    );

    console.log("✅ Código guardado en BD");

    // Enviar email (si es necesario)
    if (metodo === "email") {
      const message = buildMessage(code);
      await sendEmail(correo_electronico, EMAIL_SUBJECT, message);
      console.log("✅ Email enviado");
    }

    console.log("========== SOLICITUD COMPLETADA ==========\n");
    
    // 🔴 IMPORTANTE: Devolver el código al frontend
    return res.json({ 
      status: "success", 
      message: "Código enviado",
      code: code  // ← EL FRONTEND NECESITA ESTO
    });

  } catch (err) {
    console.error("\n❌❌❌ ERROR EN REQUEST RESET ❌❌❌");
    console.error("Mensaje:", err.message);
    console.error("Stack:", err.stack);
    console.error("=====================================\n");
    
    return res.status(500).json({ 
      status: "error", 
      message: "Error del servidor: " + err.message 
    });
  }
};

// Confirmar código
exports.confirmReset = async (req, res) => {
  try {
    const { correo_electronico, code, nueva_contrasena } = req.body;

    console.log("\n========== CONFIRMACIÓN DE CÓDIGO ==========");
    console.log(`🔍 Email: ${correo_electronico}`);
    console.log(`🔑 Código: ${code}`);

    if (!correo_electronico || !code || !nueva_contrasena) {
      return res.status(400).json({ 
        status: "error", 
        message: "Correo, código y nueva contraseña son requeridos" 
      });
    }

    // Buscar código válido
    const [resetRequests] = await pool.query(
      "SELECT * FROM password_resets WHERE email = ? AND code = ? AND used = false AND expires_at > NOW()",
      [correo_electronico, code]
    );

    console.log(`✅ Códigos encontrados: ${resetRequests.length}`);

    if (resetRequests.length === 0) {
      return res.status(400).json({ status: "error", message: "Código inválido o expirado" });
    }

    const resetRequest = resetRequests[0];

    // Buscar usuario
    const [users] = await pool.query(
      "SELECT * FROM usuarios WHERE correo_electronico = ?",
      [correo_electronico]
    );

    if (users.length === 0) {
      return res.status(400).json({ status: "error", message: "Usuario no encontrado" });
    }

    // Actualizar contraseña
    const hashed = await bcrypt.hash(nueva_contrasena, 10);
    await pool.query(
      "UPDATE usuarios SET password_hash = ? WHERE correo_electronico = ?",
      [hashed, correo_electronico]
    );

    // Marcar código como usado
    await pool.query(
      "UPDATE password_resets SET used = true WHERE id = ?",
      [resetRequest.id]
    );

    console.log("✅ Contraseña actualizada correctamente");
    console.log("========== CONFIRMACIÓN COMPLETADA ==========\n");

    return res.json({ 
      status: "success", 
      message: "Contraseña actualizada correctamente" 
    });

  } catch (err) {
    console.error("\n❌❌❌ ERROR EN CONFIRM RESET ❌❌❌");
    console.error("Mensaje:", err.message);
    console.error("Stack:", err.stack);
    console.error("======================================\n");
    
    return res.status(500).json({ 
      status: "error", 
      message: "Error al restablecer la contraseña: " + err.message 
    });
  }
};

// Endpoint para verificar si email existe
exports.checkEmail = async (req, res) => {
  try {
    const { correo_electronico } = req.body;
    const [users] = await pool.query(
      "SELECT * FROM usuarios WHERE correo_electronico = ?",
      [correo_electronico]
    );
    res.json({ status: "success", exists: users.length > 0 });
  } catch (error) {
    console.error("Error en checkEmail:", error);
    res.status(500).json({ status: "error", message: "Error del servidor" });
  }
};