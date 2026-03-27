// src/config/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// Solo cargar dotenv en desarrollo
if (process.env.NODE_ENV !== 'production') {
  const dotenv = await import('dotenv');
  dotenv.config();
}

// Validación de variables
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
  console.error('ERROR: SUPABASE_URL y SUPABASE_KEY deben estar definidas');
  process.exit(1);
}

// Crear cliente
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export default supabase;