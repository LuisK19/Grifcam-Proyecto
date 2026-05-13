

-- Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Eliminar tablas anteriores (en orden por las FK) ─────────
DROP TABLE IF EXISTS product_images CASCADE;
DROP TABLE IF EXISTS products       CASCADE;
DROP TABLE IF EXISTS categories     CASCADE;
DROP TABLE IF EXISTS users          CASCADE;

-- ── Tabla categories ──────────────────────────────────────────
-- Combina los filtros especiales (Ofertas, Nuevos) con las
-- categorías reales de repostería.
CREATE TABLE categories (
  id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE
);

-- Categorías de filtrado rápido
INSERT INTO categories (name) VALUES
  ('Ofertas'),
  ('Nuevos');

-- Categorías de prueba
INSERT INTO categories (name) VALUES
  ('Lácteos'),
  ('Harinas'),
  ('Cremas'),
  ('Azúcares'),
  ('Chocolates'),
  ('Colorantes'),
  ('Esencias y saborizantes'),
  ('Moldes y utensilios'),
  ('General');

-- ── Tabla products ────────────────────────────────────────────
CREATE TABLE products (
  id             UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  name           VARCHAR(200)  NOT NULL,
  description    TEXT,
  price          NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  previous_price NUMERIC(10,2) DEFAULT NULL CHECK (previous_price IS NULL OR previous_price >= 0),
  category_id    UUID          NOT NULL REFERENCES categories(id),
  is_offer       BOOLEAN       NOT NULL DEFAULT false,
  is_new         BOOLEAN       NOT NULL DEFAULT false,
  created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ── Tabla product_images ──────────────────────────────────────
-- Un producto puede tener hasta 3 imágenes.
-- image_order: define el orden de display (0 = imagen principal).
CREATE TABLE product_images (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url   TEXT        NOT NULL,
  image_order INT         NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Tabla users ───────────────────────────────────────────────
CREATE TABLE users (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  username      VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── Verificar resultado ───────────────────────────────────────
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
