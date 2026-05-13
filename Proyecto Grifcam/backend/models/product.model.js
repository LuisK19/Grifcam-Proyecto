// ─────────────────────────────────────────────────────────────
// Archivo: models/product.model.js  
// ¿Qué cambió?
//   1. Todas las consultas ahora traen también las imágenes
//      de la tabla product_images haciendo un select anidado.
//   2. create() y update() ya no reciben image_url — reciben
//      un array de URLs que se insertan en product_images.
//   3. Se agregó previous_price en create y update.
//   4. deleteImages() permite borrar imágenes viejas al editar.
//
// Patrón de respuesta de Supabase con imágenes:
//   product_images es una relación 1:N, Supabase la devuelve
//   como un array dentro del objeto producto:
//   { id, name, ..., product_images: [ {image_url, image_order}, ... ] }
// ─────────────────────────────────────────────────────────────

const supabase = require('../config/db');

const ProductModel = {

  // ── Obtener todos los productos con sus imágenes ───────────
  async findAll() {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories(name),
        product_images(id, image_url, image_order)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Ordenamos las imágenes de cada producto por image_order
    return data.map(p => ({
      ...p,
      product_images: (p.product_images || [])
        .sort((a, b) => a.image_order - b.image_order)
    }));
  },

  // ── Obtener un producto por ID con sus imágenes ────────────
  async findById(id) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories(name),
        product_images(id, image_url, image_order)
      `)
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    if (!data) return null;

    return {
      ...data,
      product_images: (data.product_images || [])
        .sort((a, b) => a.image_order - b.image_order)
    };
  },

  // ── Filtrar por categoría ──────────────────────────────────
  async findByCategory(categoryId) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories(name),
        product_images(id, image_url, image_order)
      `)
      .eq('category_id', categoryId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(p => ({
      ...p,
      product_images: (p.product_images || [])
        .sort((a, b) => a.image_order - b.image_order)
    }));
  },

  // ── Filtrar por is_offer o is_new ──────────────────────────
  async findByFlag(flag) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories(name),
        product_images(id, image_url, image_order)
      `)
      .eq(flag, true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(p => ({
      ...p,
      product_images: (p.product_images || [])
        .sort((a, b) => a.image_order - b.image_order)
    }));
  },

  // ── Crear un producto con sus imágenes ─────────────────────
  // imageUrls: array de strings con las rutas de las imágenes
  // Ejemplo: ['/uploads/img1.jpg', '/uploads/img2.jpg']
  async create({ name, description, price, previous_price, category_id, is_offer, is_new, imageUrls = [] }) {

    // 1. Insertamos el producto (sin image_url — ya no existe)
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert({ name, description, price, previous_price: previous_price || null,
                category_id, is_offer, is_new })
      .select()
      .single();

    if (productError) throw productError;

    // 2. Insertamos las imágenes en product_images
    if (imageUrls.length > 0) {
      const images = imageUrls.map((url, index) => ({
        product_id:  product.id,
        image_url:   url,
        image_order: index   // 0 = imagen principal
      }));

      const { error: imgError } = await supabase
        .from('product_images')
        .insert(images);

      if (imgError) throw imgError;
    }

    // 3. Devolvemos el producto completo con imágenes
    return this.findById(product.id);
  },

  // ── Actualizar un producto y reemplazar sus imágenes ───────
  // Si se suben imágenes nuevas, se eliminan las anteriores.
  // Si no se suben imágenes, se mantienen las existentes.
  async update(id, { name, description, price, previous_price, category_id,
                     is_offer, is_new, imageUrls = [] }) {

    // 1. Actualizamos los datos del producto
    const { error: updateError } = await supabase
      .from('products')
      .update({ name, description, price, previous_price: previous_price || null,
                category_id, is_offer, is_new })
      .eq('id', id);

    if (updateError) throw updateError;

    // 2. Si se enviaron imágenes nuevas, reemplazamos las anteriores
    if (imageUrls.length > 0) {
      // Borramos las imágenes anteriores de este producto
      const { error: deleteError } = await supabase
        .from('product_images')
        .delete()
        .eq('product_id', id);

      if (deleteError) throw deleteError;

      // Insertamos las nuevas
      const images = imageUrls.map((url, index) => ({
        product_id:  id,
        image_url:   url,
        image_order: index
      }));

      const { error: imgError } = await supabase
        .from('product_images')
        .insert(images);

      if (imgError) throw imgError;
    }

    // 3. Devolvemos el producto actualizado con sus imágenes
    return this.findById(id);
  },

  // ── Eliminar un producto ───────────────────────────────────
  // ON DELETE CASCADE en la BD borra automáticamente las
  // imágenes relacionadas en product_images.
  async delete(id) {
    const { data, error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
      .select('id')
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }
};

module.exports = ProductModel;
