// ─────────────────────────────────────────────────────────────
// Archivo: middleware/auth.middleware.js
// ¿Qué hace?
//   Es el "guardián" de las rutas protegidas. Antes de que una
//   petición llegue al controlador (ej: crear producto), este
//   middleware verifica que el usuario envió un JWT válido.
//   Si el token es válido → deja pasar.
//   Si no lo es → responde con error 401 (No autorizado).
//
//   Se usa así en las rutas:
//   router.post('/products', verifyToken, productController.create)
//                             ↑ se ejecuta primero
// ─────────────────────────────────────────────────────────────

const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
  // El frontend envía el token en el header así:
  // Authorization: Bearer eyJhbGci...
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ error: 'Acceso denegado. No se proporcionó token.' });
  }

  // Separamos "Bearer" del token real
  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Formato de token inválido.' });
  }

  try {
    // Verifica que el token no haya sido modificado ni expirado
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Guardamos los datos del usuario en req.user para usarlos
    // en el controlador si hace falta (ej: saber quién hizo la acción)
    req.user = decoded;

    // Todo OK → pasamos al siguiente middleware o controlador
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido o expirado.' });
  }
}

module.exports = { verifyToken };
