// ─────────────────────────────────────────────────────────────
// Archivo: server.js
// ¿Qué hace?
//   Es el punto de entrada del backend. Aquí se crea la app de
//   Express, se configuran los middlewares globales y se "montan"
//   todas las rutas. Es lo primero que se ejecuta cuando corres
//   "npm run dev".
// ─────────────────────────────────────────────────────────────

// Carga las variables del archivo .env (DB_PASSWORD, JWT_SECRET, etc.)
require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const path    = require('path');

// Importamos las rutas (cada archivo define un grupo de endpoints)
const authRoutes     = require('./routes/auth.routes');
const productRoutes  = require('./routes/product.routes');
const categoryRoutes = require('./routes/category.routes');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middlewares globales ──────────────────────────────────────
// cors: permite que el frontend (React en otro puerto) pueda
//       hacer peticiones a este servidor sin ser bloqueado.
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// express.json(): permite que el servidor entienda cuerpos JSON
// (cuando React envía datos con POST o PUT).
app.use(express.json());

// Sirve los archivos de imágenes subidas como si fueran estáticos.
// Ejemplo: GET http://localhost:5000/uploads/producto1.jpg
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Rutas ─────────────────────────────────────────────────────
// Cada grupo de rutas tiene un prefijo base:
//   /api/auth      → login del administrador
//   /api/products  → CRUD de productos
//   /api/categories→ listar categorías
app.use('/api/auth',       authRoutes);
app.use('/api/products',   productRoutes);
app.use('/api/categories', categoryRoutes);

// Ruta raíz para verificar que el servidor está vivo
app.get('/', (req, res) => {
  res.json({ message: '✅ API Grifcam funcionando correctamente' });
});

// Middleware de manejo de errores global
// Si cualquier ruta llama a next(error), llega aquí.
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(err.status || 500).json({ error: err.message || 'Error interno del servidor' });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor Grifcam corriendo en http://localhost:${PORT}`);
});
