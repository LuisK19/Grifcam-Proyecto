// ─────────────────────────────────────────────────────────────
// Archivo: models/user.model.js
// ¿Qué hace?
//   Consultas a Supabase para la tabla de usuarios (el admin).
//   bcryptjs sigue igual — Supabase no maneja el hash de
//   contraseñas automáticamente, así que lo hacemos nosotros.
// ─────────────────────────────────────────────────────────────

const supabase = require('../config/db');
const bcrypt   = require('bcryptjs');

const UserModel = {

  // Busca un usuario por su nombre de usuario
  async findByUsername(username) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data; // null si no existe
  },

  // Compara la contraseña ingresada con el hash guardado en BD
  // Devuelve true si coinciden, false si no
  async verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  },

  // Crea el usuario admin (úsalo una sola vez para inicializar la BD)
  async createAdmin(username, password) {
    const hash = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
      .from('users')
      .insert({ username, password_hash: hash })
      .select('id, username')
      .single();

    if (error) throw error;
    return data;
  }
};

module.exports = UserModel;
