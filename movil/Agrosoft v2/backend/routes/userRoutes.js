const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController"); 
const passwordResetController = require("../controllers/passwordResetController");
const { authenticateToken, isAdmin } = require("../middleware/authMiddleware");
const User = require("../models/user_model");

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: API para gestión de usuarios
 */

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - email
 *               - password
 *               - rol
 *             properties:
 *               nombre:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               documento:
 *                 type: string
 *               rol:
 *                  type: integer
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *       400:
 *         description: Error en los datos enviados
 */
router.post("/register", userController.register);

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso, retorna token
 *       401:
 *         description: Credenciales inválidas
 */
router.post("/login", userController.login);

/**
 * @swagger
 * /api/users/password-reset/request:
 *   post:
 *     summary: Solicitar código de verificación para recuperar contraseña
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - correo_electronico
 *               - metodo
 *             properties:
 *               correo_electronico:
 *                 type: string
 *               metodo:
 *                 type: string
 *                 enum: [email, whatsapp]
 *     responses:
 *       200:
 *         description: Código enviado (si el correo existe)
 */
router.post("/password-reset/request", passwordResetController.requestReset);

/**
 * @swagger
 * /api/users/password-reset/confirm:
 *   post:
 *     summary: Confirmar código y establecer nueva contraseña
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - correo_electronico
 *               - code
 *               - nueva_contrasena
 *             properties:
 *               correo_electronico:
 *                 type: string
 *               code:
 *                 type: string
 *               nueva_contrasena:
 *                 type: string
 *     responses:
 *       200:
 *         description: Contraseña actualizada correctamente
 */
router.post("/password-reset/confirm", passwordResetController.confirmReset);

/**
 * @swagger
 * /api/users/check-email:
 *   post:
 *     summary: Verificar si un email existe (para recuperación de contraseña)
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - correo_electronico
 *             properties:
 *               correo_electronico:
 *                 type: string
 *     responses:
 *       200:
 *         description: Retorna si el email existe o no
 */
router.post("/check-email", passwordResetController.checkEmail);

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Obtener perfil del usuario autenticado
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Datos del perfil del usuario
 *       401:
 *         description: No autorizado
 */
// Perfil del usuario autenticado
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const id = req.user?.id_usuario || req.user?.id;
    if (!id) return res.status(400).json({ success: false, error: "ID de usuario no disponible en token" });

    const user = await User.findOne({ where: { id_usuario: id } });
    if (!user) return res.status(404).json({ success: false, error: "Usuario no encontrado" });

    const profile = {
      id_usuario: user.id_usuario,
      id_rol: user.id_rol,
      nombre: user.nombre_usuario,
      email: user.correo_electronico,
      documento_identidad: user.documento_identidad,
      estado: user.estado,
    };

    return res.json({ success: true, user: profile });
  } catch (err) {
    console.error("Error al obtener perfil:", err);
    return res.status(500).json({ success: false, error: "Error interno al obtener perfil" });
  }
});

// Rutas de administración de usuarios
/**
 * @swagger
 * /api/users/:
 *   get:
 *     summary: Listar usuarios (Admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *       403:
 *         description: Acceso denegado (requiere admin)
 */
router.get("/", authenticateToken, isAdmin, userController.listUsers);

/**
 * @swagger
 * /api/users/:
 *   post:
 *     summary: Crear usuario (Admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: Usuario creado
 */
router.post("/", authenticateToken, isAdmin, userController.createUser);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Actualizar usuario (Admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: Usuario actualizado
 */
router.put("/:id", authenticateToken, isAdmin, userController.updateUser);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Eliminar usuario (Admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Usuario eliminado
 */
router.delete("/:id", authenticateToken, isAdmin, userController.deleteUser);

module.exports = router;