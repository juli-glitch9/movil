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

    // PASO 1: Buscar usuario
    console.log("🔍 PASO 1: Buscando usuario...");
    const [users] = await pool.query(
      "SELECT * FROM usuarios WHERE correo_electronico = ?", 
      [correo_electronico]
    );
    
    console.log(`✅ Usuarios encontrados: ${users.length}`);
    
    if (users.length === 0) {
      console.log("⚠️ Usuario no encontrado, pero respondemos OK por seguridad");
      return res.json({ status: "success", message: "Si el correo existe, se ha enviado un código" });
    }

    const user = users[0];
    console.log(`👤 Usuario ID: ${user.id_usuario}`);

    // PASO 2: Marcar códigos anteriores
    console.log("🔍 PASO 2: Marcando códigos anteriores como usados...");
    const [updateResult] = await pool.query(
      "UPDATE password_resets SET used = true WHERE email = ? AND used = false",
      [correo_electronico]
    );
    console.log(`✅ Códigos anteriores marcados: ${updateResult.affectedRows}`);

    // PASO 3: Generar código
    const code = generateCode();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);
    
    console.log(`🔐 PASO 3: Código generado: ${code}`);
    console.log(`📅 Expira: ${expiresAt}`);

    // PASO 4: Guardar en BD
    console.log("🔍 PASO 4: Intentando guardar en BD...");
    
    const [insertResult] = await pool.query(
      "INSERT INTO password_resets (email, code, expires_at, used) VALUES (?, ?, ?, ?)",
      [correo_electronico, code, expiresAt, false]
    );

    console.log(`✅ Resultado inserción - insertId: ${insertResult.insertId}`);
    console.log(`✅ Resultado inserción - affectedRows: ${insertResult.affectedRows}`);

    // PASO 5: Verificar que se guardó
    console.log("🔍 PASO 5: Verificando guardado...");
    const [verification] = await pool.query(
      "SELECT * FROM password_resets WHERE email = ? AND code = ?",
      [correo_electronico, code]
    );

    if (verification.length > 0) {
      console.log(`✅ VERIFICACIÓN EXITOSA - ID: ${verification[0].id}`);
    } else {
      console.error("❌ VERIFICACIÓN FALLÓ - El código NO se guardó");
      throw new Error("No se pudo verificar el guardado del código");
    }

    // PASO 6: Enviar email
    console.log("🔍 PASO 6: Enviando email...");
    const message = buildMessage(code);
    
    if (metodo === "email") {
      await sendEmail(correo_electronico, EMAIL_SUBJECT, message);
      console.log("✅ Email enviado");
    }

    console.log("========== SOLICITUD COMPLETADA ==========\n");
    return res.json({ status: "success", message: "Código enviado" });

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
      console.log("❌ Error: Faltan campos requeridos");
      return res.status(400).json({ 
        status: "error", 
        message: "Correo, código y nueva contraseña son requeridos" 
      });
    }

    // PASO 1: Buscar código válido
    console.log("🔍 PASO 1: Buscando código en BD...");
    const [resetRequests] = await pool.query(
      "SELECT * FROM password_resets WHERE email = ? AND code = ? AND used = false AND expires_at > NOW()",
      [correo_electronico, code]
    );

    console.log(`✅ Códigos encontrados: ${resetRequests.length}`);

    if (resetRequests.length === 0) {
      // Verificar si existe pero expiró
      const [expirados] = await pool.query(
        "SELECT * FROM password_resets WHERE email = ? AND code = ?",
        [correo_electronico, code]
      );
      
      if (expirados.length > 0) {
        if (expirados[0].used) {
          console.log("❌ Código ya usado");
          return res.status(400).json({ status: "error", message: "Código ya fue utilizado" });
        }
        if (new Date() > new Date(expirados[0].expires_at)) {
          console.log("❌ Código expirado");
          return res.status(400).json({ status: "error", message: "Código expirado" });
        }
      }
      
      console.log("❌ Código no encontrado");
      return res.status(400).json({ status: "error", message: "Código inválido" });
    }

    const resetRequest = resetRequests[0];
    console.log(`✅ Código válido encontrado - ID: ${resetRequest.id}`);

    // PASO 2: Buscar usuario
    console.log("🔍 PASO 2: Buscando usuario...");
    const [users] = await pool.query(
      "SELECT * FROM usuarios WHERE correo_electronico = ?",
      [correo_electronico]
    );

    console.log(`✅ Usuarios encontrados: ${users.length}`);

    if (users.length === 0) {
      console.log("❌ Usuario no encontrado");
      return res.status(400).json({ status: "error", message: "Usuario no encontrado" });
    }

    // PASO 3: Actualizar contraseña
    console.log("🔍 PASO 3: Actualizando contraseña...");
    const hashed = await bcrypt.hash(nueva_contrasena, 10);
    const [updateResult] = await pool.query(
      "UPDATE usuarios SET password_hash = ? WHERE correo_electronico = ?",
      [hashed, correo_electronico]
    );
    console.log(`✅ Contraseña actualizada: ${updateResult.affectedRows} filas`);

    // PASO 4: Marcar código como usado
    console.log("🔍 PASO 4: Marcando código como usado...");
    const [usedResult] = await pool.query(
      "UPDATE password_resets SET used = true WHERE id = ?",
      [resetRequest.id]
    );
    console.log(`✅ Código marcado: ${usedResult.affectedRows} filas`);

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