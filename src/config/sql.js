// src/config/sql.js
//
// Construcción de INSERT / UPDATE / upsert a partir de objetos de datos.
// Módulo puro (no abre conexiones), para poder probarlo sin base de datos;
// db.js lo reexporta.
//
// Reproduce cómo serializaba supabase-js el cuerpo de la petición a PostgREST,
// para que las escrituras guarden exactamente lo mismo que antes.

const IDENTIFICADOR = /^[a-z_][a-z0-9_]*$/i;

/**
 * Valida y entrecomilla un nombre de tabla o columna. No pueden ir como
 * parámetros de la consulta, y parte de las claves llega del body de la
 * petición, así que se rechaza cualquier cosa que no sea un identificador.
 */
export function identificador(nombre) {
  if (!IDENTIFICADOR.test(nombre)) {
    throw new Error(`Nombre de tabla o columna no válido: ${nombre}`);
  }
  return `"${nombre}"`;
}

// pg convierte un array de JS en un array de Postgres, pero PostgREST recibía
// JSON. Para que un objeto o array acabe en una columna json/jsonb igual que
// antes, se manda como texto JSON.
export function valorParaBd(v) {
  if (v !== null && typeof v === 'object' && !(v instanceof Date) && !Buffer.isBuffer(v)) {
    return JSON.stringify(v);
  }
  return v;
}

// supabase-js serializaba a JSON, y JSON.stringify descarta las claves con
// valor undefined: aquí se hace lo mismo.
const clavesDefinidas = (datos) => Object.keys(datos).filter((k) => datos[k] !== undefined);

function partesInsert(tabla, datos) {
  const filas = Array.isArray(datos) ? datos : [datos];
  const columnas = [...new Set(filas.flatMap(clavesDefinidas))];
  if (columnas.length === 0) {
    throw new Error(`No hay columnas que insertar en ${tabla}`);
  }
  const params = [];
  const tuplas = filas.map((fila) => {
    const marcadores = columnas.map((c) => {
      // Una clave ausente en alguna fila de un insert múltiple va como NULL,
      // igual que hacía supabase-js (defaultToNull).
      params.push(fila[c] === undefined ? null : valorParaBd(fila[c]));
      return `$${params.length}`;
    });
    return `(${marcadores.join(', ')})`;
  });
  const cabecera = `INSERT INTO ${identificador(tabla)} (${columnas.map(identificador).join(', ')}) VALUES ${tuplas.join(', ')}`;
  return { cabecera, columnas, params };
}

/**
 * INSERT de un objeto o de un array de objetos, con RETURNING *.
 * @returns {{ sql: string, params: Array }}
 */
export function sqlInsertar(tabla, datos) {
  const { cabecera, params } = partesInsert(tabla, datos);
  return { sql: `${cabecera} RETURNING *`, params };
}

/**
 * INSERT ... ON CONFLICT DO UPDATE, como el upsert de supabase-js
 * (resolution=merge-duplicates): en conflicto actualiza todas las columnas
 * recibidas.
 */
export function sqlUpsert(tabla, datos, columnasConflicto) {
  const { cabecera, columnas, params } = partesInsert(tabla, datos);
  const conflicto = columnasConflicto.map(identificador).join(', ');
  const set = columnas.map((c) => `${identificador(c)} = EXCLUDED.${identificador(c)}`).join(', ');
  return { sql: `${cabecera} ON CONFLICT (${conflicto}) DO UPDATE SET ${set} RETURNING *`, params };
}

/**
 * UPDATE con los campos del objeto y RETURNING *. El WHERE se escribe con sus
 * propios $1, $2...; aquí se desplazan detrás de los parámetros del SET.
 * @example sqlActualizar('categoria', datos, 'id_categoria = $1', [id])
 */
export function sqlActualizar(tabla, datos, where, paramsWhere = []) {
  const columnas = clavesDefinidas(datos);
  if (columnas.length === 0) {
    throw new Error(`No hay campos que actualizar en ${tabla}`);
  }
  const set = columnas.map((c, i) => `${identificador(c)} = $${i + 1}`).join(', ');
  const whereDesplazado = where.replace(/\$(\d+)/g, (_, n) => `$${Number(n) + columnas.length}`);
  return {
    sql: `UPDATE ${identificador(tabla)} SET ${set} WHERE ${whereDesplazado} RETURNING *`,
    params: [...columnas.map((c) => valorParaBd(datos[c])), ...paramsWhere],
  };
}

export default { identificador, valorParaBd, sqlInsertar, sqlUpsert, sqlActualizar };
