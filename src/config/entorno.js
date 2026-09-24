// src/config/entorno.js
//
// Carga src/.env fuera de producción. Importarlo antes que cualquier módulo que
// lea process.env al cargarse (jwtConfig, archivos, db...): ESM termina de
// evaluar este módulo, await incluido, antes de seguir con quien lo importa.
//
// El .env vive en src/, no en la raíz del paquete. Se localiza a partir de este
// archivo y no del directorio actual, así el backend arranca igual desde src/
// que desde la raíz (npm run dev), y las pruebas y scripts también.
//
// Toggle de base: ENTORNO=local (por defecto) usa solo src/.env, con la base
// local y los archivos en disco. ENTORNO=produccion carga además
// src/.env.produccion encima (base y Storage de Supabase). ENTORNO se lee del
// shell o de src/.env; el shell manda.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

if (process.env.NODE_ENV !== 'production') {
  const dotenv = await import('dotenv');
  const dirSrc = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
  dotenv.config({ path: path.join(dirSrc, '.env') });

  const entorno = process.env.ENTORNO || 'local';
  if (entorno !== 'local') {
    const archivo = path.join(dirSrc, `.env.${entorno}`);
    if (!fs.existsSync(archivo)) {
      console.error(`ERROR: ENTORNO=${entorno} pero no existe ${archivo}`);
      process.exit(1);
    }
    dotenv.config({ path: archivo, override: true });
    console.warn(`⚠️  ENTORNO=${entorno}: usando ${path.basename(archivo)}. Lo que escribas va a esa base.`);
  }
}
