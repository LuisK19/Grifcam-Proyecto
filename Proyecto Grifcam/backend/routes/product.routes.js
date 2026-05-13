// ─────────────────────────────────────────────────────────────
// Archivo: routes/product.routes.js  
// ¿Qué cambió?
//   upload.single('image')  →  upload.array('images', 3)
//   Ahora el campo se llama "images" (plural) y acepta hasta 3.
// ─────────────────────────────────────────────────────────────

const express           = require('express');
const ProductController = require('../controllers/product.controller');
const { verifyToken }   = require('../middleware/auth.middleware');
const { upload }        = require('../middleware/upload.middleware');

const router = express.Router();

// ── Rutas públicas ────────────────────────────────────────────
router.get('/',    ProductController.getAll);
router.get('/:id', ProductController.getById);

// ── Rutas protegidas ──────────────────────────────────────────
// upload.array('images', 3) → campo "images", máximo 3 archivos
router.post('/',      verifyToken, upload.array('images', 3), ProductController.create);
router.put('/:id',    verifyToken, upload.array('images', 3), ProductController.update);
router.delete('/:id', verifyToken, ProductController.delete);

module.exports = router;
