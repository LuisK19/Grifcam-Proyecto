// ─────────────────────────────────────────────────────────────
// Archivo: config/db.js
// ¿Qué hace?
//   Crea y exporta el cliente de Supabase.
//   A diferencia de SQL Server, aquí no hay pool ni conexión
//   manual — Supabase maneja todo eso internamente.
//   Solo necesitás la URL y la KEY de tu proyecto en Supabase.
//
//   ¿Dónde encuentro esos valores?
//   Supabase Dashboard → tu proyecto → Settings → API
// ─────────────────────────────────────────────────────────────

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL, 
  process.env.SUPABASE_KEY   
);

module.exports = supabase;
