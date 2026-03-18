const express = require("express");
const router = express.Router();
const multer = require("multer"); // ✅ Importar Multer
const path = require("path");
const userController = require("../controllers/userController"); 
const passwordResetController = require("../controllers/passwordResetController");
const { authenticateToken, isAdmin } = require("../middleware/authMiddleware");
const User = require("../models/user_model");

// Configuración básica de Multer para fotos de perfil
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

/**
 * @swagger
 * /api/users/register:
 * post:
 * summary: Registrar usuario
 * tags: [Users]
 */
router.post("/register", userController.register);

/**
 * @swagger
 * /api/users/login:
 * post:
 * summary: Login de usuario
 * tags: [Users]
 */
router.post("/login", userController.login);

router.post("/password-reset/request", passwordResetController.requestReset);
router.post("/password-reset/confirm", passwordResetController.confirmReset);
router.post("/check-email", passwordResetController.checkEmail);

/**
 * @swagger
 * /api/users/me:
 * get:
 * summary: Perfil actual
 * tags: [Users]
 */
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const id = req.user?.id_usuario || req.user?.id;
    if (!id) return res.status(400).json({ success: false, error: "ID no disponible" });

    const user = await User.findOne({ where: { id_usuario: id } });
    if (!user) return res.status(404).json({ success: false, error: "Usuario no encontrado" });

    const profile = {
      id_usuario: user.id_usuario,
      id_rol: user.id_rol,
      nombre: user.nombre_usuario,
      email: user.correo_electronico,
      documento_identidad: user.documento_identidad,
      estado: user.estado,
      telefono: user.telefono,
      ubicacion: user.ubicacion,
      foto_perfil: user.foto_perfil
    };

    return res.json({ success: true, user: profile });
  } catch (err) {
    console.error("Error al obtener perfil:", err);
    return res.status(500).json({ success: false, error: "Error interno" });
  }
});

// Rutas de administración
router.get("/", authenticateToken, isAdmin, userController.listUsers);
router.post("/", authenticateToken, isAdmin, userController.createUser);
router.put("/:id", authenticateToken, isAdmin, userController.updateUser);
router.delete("/:id", authenticateToken, isAdmin, userController.deleteUser);

// ✅ RUTA DE PERFIL CORREGIDA (Con upload.single para la imagen)
router.put("/perfil/:id", authenticateToken, upload.single('foto_perfil'), userController.updateUserProfile);

module.exports = router;