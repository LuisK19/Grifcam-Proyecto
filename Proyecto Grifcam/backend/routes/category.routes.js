// ─────────────────────────────────────────────────────────────
// Archivo: routes/category.routes.js
// ¿Qué hace?
//   Define los endpoints para las categorías.
//   Solo GET — son públicos porque el catálogo los necesita
//   para mostrar los filtros sin que el usuario esté logueado.
// ─────────────────────────────────────────────────────────────

const express             = require('express');
const CategoryController  = require('../controllers/category.controller');

const router = express.Router();

router.get('/',    CategoryController.getAll);
router.get('/:id', CategoryController.getById);

module.exports = router;
