// ─────────────────────────────────────────────────────────────
// Archivo: middleware/upload.middleware.js
// ¿Qué cambió?
//   Antes usábamos upload.single('image') — aceptaba UNA imagen.
//   Ahora usamos upload.array('images', 3) — acepta hasta 3.
//   En Thunder Client o el frontend se envían los archivos con
//   el campo llamado "images" (plural) en el Form Data.
// ─────────────────────────────────────────────────────────────

const multer = require('multer');
const path   = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    // Nombre único: timestamp + nombre original sin espacios
    const uniqueName = Date.now() + '-' + file.originalname.replace(/\s/g, '_');
    cb(null, uniqueName);
  }
});

function fileFilter(req, file, cb) {
  const allowed = /jpeg|jpg|png|webp|gif/;
  const isValid = allowed.test(path.extname(file.originalname).toLowerCase())
               && allowed.test(file.mimetype);
  if (isValid) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes (jpg, png, webp, gif)'));
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5 MB por imagen
});

module.exports = { upload };
