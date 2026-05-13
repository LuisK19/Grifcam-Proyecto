// ─────────────────────────────────────────────────────────────
// Archivo: models/category.model.js
// ¿Qué hace?
//   Consultas a Supabase para la tabla de categorías.
//   Solo lectura — las categorías se gestionan directamente
//   desde el panel de Supabase, no desde el frontend.
// ─────────────────────────────────────────────────────────────

const supabase = require('../config/db');

const CategoryModel = {

  // Devuelve todas las categorías 
  async findAll() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) throw error;
    return data;
  },

  // Busca una categoría por ID
  async findById(id) {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }
};

module.exports = CategoryModel;
