// src/config/entorno.js
//
// Carga src/.env fuera de producción. Importarlo antes que cualquier módulo que
// lea process.env al cargarse (jwtConfig, archivos, db...): ESM termina de
// evaluar este módulo, await incluido, antes de seguir con quien lo importa.
//
// El .env vive en src/, no en la raíz del paquete. Se localiza a partir de este
// archivo y no del directorio actual, así el backend arranca igual desde src/
// que desde la raíz (npm run dev), y las pruebas y scripts también.

import path from 'node:path';
import { fileURLToPath } from 'node:url';

if (process.env.NODE_ENV !== 'production') {
  const dotenv = await import('dotenv');
  const dirSrc = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
  dotenv.config({ path: path.join(dirSrc, '.env') });
}
