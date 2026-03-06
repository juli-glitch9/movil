const express = require('express');

const router = express.Router();
const perfilController = require('../controllers/perfilController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Se requiere autenticación para ver/editar perfil
router.get('/:id', authenticateToken, perfilController.getProfile);
router.put('/:id', authenticateToken, perfilController.upload.single('foto_perfil'), perfilController.updateProfile);

module.exports = router;
