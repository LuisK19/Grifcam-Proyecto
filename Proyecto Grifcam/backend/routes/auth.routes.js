// ─────────────────────────────────────────────────────────────
// Archivo: routes/auth.routes.js
// ¿Qué hace?
//   Define los endpoints de autenticación y los conecta
//   con sus funciones en el controlador.
//
//   Endpoints disponibles:
//   POST /api/auth/login  → iniciar sesión (público)
//   POST /api/auth/seed   → crear admin inicial (solo 1 vez)
// ─────────────────────────────────────────────────────────────

const express        = require('express');
const AuthController = require('../controllers/auth.controller');

const router = express.Router();

// POST /api/auth/login
router.post('/login', AuthController.login);

// POST /api/auth/seed — crea el admin la primera vez
// Comenta o elimina esta ruta una vez que hayas creado el admin
router.post('/seed', AuthController.seed);

module.exports = router;
