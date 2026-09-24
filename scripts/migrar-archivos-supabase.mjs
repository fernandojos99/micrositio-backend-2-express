// Copia a disco los archivos de Supabase Storage que la base todavía
// referencia, y reescribe sus URLs para que apunten al backend (/archivos).
//
//   node scripts/migrar-archivos-supabase.mjs            # solo lista qué haría
//   node scripts/migrar-archivos-supabase.mjs --aplicar  # descarga y reescribe
//
// Recorre todas las columnas de texto del esquema public buscando URLs públicas
// de Storage (https://<proyecto>.supabase.co/storage/v1/object/public/<bucket>/<ruta>).
// Solo lee de Supabase, por HTTP público: no toca su base ni sus buckets. Las
// escrituras son sobre la base de DATABASE_URL.
//
// Se puede repetir: una URL ya migrada deja de coincidir con el patrón. Si una
// descarga falla, esa URL se deja como está y el script sale con código 1.

import { consulta, ejecutar, cerrar } from '../src/config/db.js';
import archivos from '../src/config/archivos.js';

const aplicar = process.argv.includes('--aplicar');
const PATRON = /^https?:\/\/[^/]+\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/;
const ident = (s) => `"${s.replace(/"/g, '""')}"`;

const columnas = await consulta(`
  SELECT c.table_name, c.column_name
  FROM information_schema.columns c
  JOIN information_schema.tables t USING (table_schema, table_name)
  WHERE c.table_schema = 'public' AND t.table_type = 'BASE TABLE'
    AND c.data_type IN ('text', 'character varying')
  ORDER BY 1, 2`);

let fallos = 0;
let migradas = 0;

for (const { table_name: tabla, column_name: col } of columnas) {
  const filas = await consulta(
    `SELECT DISTINCT ${ident(col)} AS url FROM ${ident(tabla)} WHERE ${ident(col)} LIKE '%/storage/v1/object/public/%'`);

  for (const { url } of filas) {
    const m = url.match(PATRON);
    if (!m) {
      console.log(`? ${tabla}.${col}: no se reconoce como URL de Storage, se deja: ${url}`);
      continue;
    }
    const bucket = decodeURIComponent(m[1]);
    const ruta = m[2].split('?')[0].split('/').map(decodeURIComponent).join('/');
    const nueva = archivos.urlPublica(bucket, ruta);

    if (!aplicar) {
      console.log(`· ${tabla}.${col}\n    ${url}\n  → ${nueva}`);
      continue;
    }

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await archivos.subir(bucket, ruta, Buffer.from(await res.arrayBuffer()), { sobrescribir: true });
      const n = await ejecutar(`UPDATE ${ident(tabla)} SET ${ident(col)} = $1 WHERE ${ident(col)} = $2`, [nueva, url]);
      migradas++;
      console.log(`✓ ${tabla}.${col} (${n} fila${n === 1 ? '' : 's'}): ${bucket}/${ruta}`);
    } catch (error) {
      fallos++;
      console.error(`✗ ${tabla}.${col}: ${url}\n    ${error.message}`);
    }
  }
}

console.log(aplicar
  ? `\nMigradas: ${migradas}. Fallidas: ${fallos}. Archivos en ${archivos.DIRECTORIO}`
  : '\nNada cambió. Ejecuta con --aplicar para descargar y reescribir.');
await cerrar();
process.exit(fallos > 0 ? 1 : 0);
