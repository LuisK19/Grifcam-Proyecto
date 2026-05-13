// ─────────────────────────────────────────────────────────────
// Archivo: controllers/category.controller.js
// ¿Qué hace?
//   Maneja las peticiones de categorías. Solo GET,
//   porque las categorías se gestionan directamente en Supabase.
//
//   IMPORTANTE sobre los IDs:
//   Los IDs son UUID (string), no números enteros.
//   NO usamos Number(req.params.id).
// ─────────────────────────────────────────────────────────────

const CategoryModel = require('../models/category.model');

const CategoryController = {

  // GET /api/categories
  async getAll(req, res) {
    const categories = await CategoryModel.findAll();
    res.json(categories);
  },

  // GET /api/categories/:id
  async getById(req, res) {
    const id = req.params.id; 

    const category = await CategoryModel.findById(id);

    if (!category) {
      return res.status(404).json({ error: 'Categoría no encontrada.' });
    }

    res.json(category);
  }
};

module.exports = CategoryController;
