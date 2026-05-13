// ─────────────────────────────────────────────────────────────
// Archivo: controllers/auth.controller.js
// ¿Qué hace?
//   Maneja la lógica del login del administrador.
//   Recibe los datos del request, llama al modelo, y responde.
//
//   Flujo del login:
//   1. Frontend envía POST /api/auth/login con {username, password}
//   2. Este controlador busca el usuario en la BD
//   3. Verifica la contraseña con bcrypt
//   4. Si todo OK → genera un JWT y lo devuelve al frontend
//   5. El frontend guarda el JWT y lo usa en peticiones futuras
// ─────────────────────────────────────────────────────────────

const jwt      = require('jsonwebtoken');
const UserModel = require('../models/user.model');

const AuthController = {

  // POST /api/auth/login
  async login(req, res) {
    try {

      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          error: 'Usuario y contraseña son requeridos.'
        });
      }

      // Buscamos el usuario en la BD
      const user = await UserModel.findByUsername(username);

      if (!user) {
        // No revelamos si falló usuario o contraseña
        return res.status(401).json({
          error: 'Credenciales incorrectas.'
        });
      }

      // Verificamos la contraseña
      const isValid = await UserModel.verifyPassword(
        password,
        user.password_hash
      );

      if (!isValid) {
        return res.status(401).json({
          error: 'Credenciales incorrectas.'
        });
      }

      // Generamos el JWT
      const token = jwt.sign(
        {
          id: user.id,
          username: user.username
        },
        process.env.JWT_SECRET,
        { expiresIn: '8h' }
      );

      // Respondemos
      res.json({
        message: 'Login exitoso',
        token,
        user: {
          id: user.id,
          username: user.username
        }
      });

    } catch (error) {

      console.error('Error en login:', error);

      res.status(500).json({
        error: 'Error interno del servidor.'
      });
    }
  },

  // POST /api/auth/seed
  async seed(req, res) {
    try {

      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          error: 'Campos requeridos.'
        });
      }

      const newUser = await UserModel.createAdmin(
        username,
        password
      );

      res.status(201).json({
        message: 'Admin creado',
        user: newUser
      });

    } catch (error) {

      console.error('Error en seed:', error);

      res.status(500).json({
        error: 'Error interno del servidor.'
      });
    }
  }
};

module.exports = AuthController;
