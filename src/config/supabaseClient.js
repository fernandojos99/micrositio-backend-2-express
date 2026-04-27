// src/config/supabaseClient.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Verificar variables
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
  console.error('ERROR: Las variables SUPABASE_URL y SUPABASE_KEY deben estar definidas en .env');
  process.exit(1); // Detener la aplicación si faltan variables
}

// Crear cliente Supabase
// const supabase = createClient(
// const supabase = createClient(

//   process.env.SUPABASE_URL,
//   process.env.SUPABASE_KEY
// );


const supabase = createClient(

  "https://tfouyrwfxofithkzeezt.supabase.co",
  "sb_publishable_bVVOp1f4VKPKAJ-XrZynOg_IBbwkvzk"
);


export default supabase;