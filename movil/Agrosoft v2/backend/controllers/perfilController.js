const path = require('path');
const fs = require('fs');
const multer = require('multer');
const User = require('../models/user_model');

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `avatar_${Date.now()}${ext}`);
  }
});

const upload = multer({ storage });

async function getProfile(req, res) {
  try {
    const id = req.params.id || req.user?.id_usuario || req.user?.id;
    if (!id) return res.status(400).json({ message: 'Falta id de usuario' });
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    // Si la foto está guardada como ruta relativa, convertirla a URL absoluta
    if (user.foto_perfil && user.foto_perfil.startsWith('/uploads')) {
      const host = req.get('host');
      const protocol = req.protocol;
      user.foto_perfil = `${protocol}://${host}${user.foto_perfil}`;
    }
    return res.json(user);
  } catch (err) {
    console.error('Error al obtener perfil:', err);
    return res.status(500).json({ message: 'Error al obtener perfil' });
  }
}

async function updateProfile(req, res) {
  try {
    const id = req.params.id || req.user?.id_usuario || req.user?.id;
    if (!id) return res.status(400).json({ message: 'Falta id de usuario' });

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    const { nombre_usuario, correo_electronico, telefono, ubicacion } = req.body;

    const updateData = {};
    if (nombre_usuario) updateData.nombre_usuario = nombre_usuario;
    if (correo_electronico) updateData.correo_electronico = correo_electronico;
    if (telefono) updateData.telefono = telefono;
    if (ubicacion) updateData.ubicacion = ubicacion;

    if (req.file) {
      // Guardamos la URL absoluta para que el frontend la pueda cargar desde cualquier origen
      const host = req.get('host');
      const protocol = req.protocol;
      updateData.foto_perfil = `${protocol}://${host}/uploads/${req.file.filename}`;
    }

    await user.update(updateData);
    return res.json(user);
  } catch (err) {
    console.error('Error al actualizar perfil:', err);
    return res.status(500).json({ message: 'Error al actualizar perfil' });
  }
}

module.exports = { upload, getProfile, updateProfile };
