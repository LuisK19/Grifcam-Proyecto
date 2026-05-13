// ─────────────────────────────────────────────────────────────
// Archivo: controllers/product.controller.js  (versión 2)
// ¿Qué cambió?
//   1. create() y update() ahora leen req.files (array) en vez
//      de req.file (un solo archivo).
//   2. Se maneja previous_price: si el producto está en oferta
//      y se envía previous_price, se guarda; si no, se deja null.
//   3. Los IDs siguen siendo UUID string (sin Number()).
// ─────────────────────────────────────────────────────────────

const ProductModel = require('../models/product.model');

const ProductController = {

  // GET /api/products
  // Query params opcionales:
  //   ?category=uuid     → filtra por categoría
  //   ?filter=is_offer   → solo ofertas
  //   ?filter=is_new     → solo novedades
  async getAll(req, res) {
    const { category, filter } = req.query;

    let products;
    if (category) {
      products = await ProductModel.findByCategory(category);
    } else if (filter === 'is_offer' || filter === 'is_new') {
      products = await ProductModel.findByFlag(filter);
    } else {
      products = await ProductModel.findAll();
    }

    res.json(products);
  },

  // GET /api/products/:id
  async getById(req, res) {
    const product = await ProductModel.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado.' });
    }

    res.json(product);
  },

  // POST /api/products  ← Requiere JWT
  // Body (multipart/form-data):
  //   name, description, price, previous_price (opcional),
  //   category_id, is_offer, is_new, images (hasta 3 archivos)
  async create(req, res) {
    const { name, description, price, previous_price,
            category_id, is_offer, is_new } = req.body;

    if (!name || !price || !category_id) {
      return res.status(400).json({ error: 'Nombre, precio y categoría son requeridos.' });
    }

    // req.files es el array de imágenes subidas por Multer
    // Si no se subió ninguna imagen, imageUrls queda vacío []
    const imageUrls = (req.files || []).map(f => `/uploads/${f.filename}`);

    const product = await ProductModel.create({
      name,
      description,
      price:          Number(price),
      previous_price: previous_price ? Number(previous_price) : null,
      category_id,
      is_offer:  is_offer === 'true' || is_offer === true,
      is_new:    is_new   === 'true' || is_new   === true,
      imageUrls
    });

    res.status(201).json({ message: 'Producto creado exitosamente.', product });
  },

  // PUT /api/products/:id  ← Requiere JWT
  // Si se envían imágenes nuevas → reemplaza las anteriores.
  // Si NO se envían imágenes     → mantiene las existentes.
  async update(req, res) {
    const { name, description, price, previous_price,
            category_id, is_offer, is_new } = req.body;

    if (!name || !price || !category_id) {
      return res.status(400).json({ error: 'Nombre, precio y categoría son requeridos.' });
    }

    const imageUrls = (req.files || []).map(f => `/uploads/${f.filename}`);

    const product = await ProductModel.update(req.params.id, {
      name,
      description,
      price:          Number(price),
      previous_price: previous_price ? Number(previous_price) : null,
      category_id,
      is_offer:  is_offer === 'true' || is_offer === true,
      is_new:    is_new   === 'true' || is_new   === true,
      imageUrls
    });

    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado.' });
    }

    res.json({ message: 'Producto actualizado exitosamente.', product });
  },

  // DELETE /api/products/:id  ← Requiere JWT
  async delete(req, res) {
    const deleted = await ProductModel.delete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: 'Producto no encontrado.' });
    }

    res.json({ message: 'Producto eliminado exitosamente.' });
  }
};

module.exports = ProductController;
