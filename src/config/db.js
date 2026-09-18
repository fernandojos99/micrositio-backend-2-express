// src/config/db.js
//
// Acceso a PostgreSQL con `pg`. Sustituye a supabase-js.
//
// Todas las filas las serializa el propio Postgres con json_agg, que es lo
// mismo que hacía PostgREST por debajo. Así la API devuelve exactamente el JSON
// de antes: fechas como "YYYY-MM-DD", timestamptz con su zona horaria y numeric
// como número. Si las columnas se leyeran con los parsers por defecto de
// node-postgres, `date` llegaría como objeto Date (con riesgo de desfase de
// zona) y `numeric` como texto, y el contrato de la API cambiaría.

import './entorno.js';
import { AsyncLocalStorage } from 'node:async_hooks';
import pg from 'pg';
import { sqlInsertar, sqlUpsert, sqlActualizar } from './sql.js';

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL debe estar definida (postgres://usuario:clave@host:5432/base)');
  process.exit(1);
}

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  // En Lambda cada instancia abre su propio pool: conviene que sea pequeño.
  max: Number(process.env.PG_POOL_MAX) || 10,
});

// Mientras se ejecuta transaccion(fn), todas las consultas de fn (y de lo que
// llame, incluidos los repositorios) usan el mismo cliente sin pasarlo a mano.
const transaccionActual = new AsyncLocalStorage();
const ejecutor = () => transaccionActual.getStore() ?? pool;

const ES_DML = /^\s*(insert|update|delete)\b/i;

function envolver(sql) {
  const limpio = sql.trim().replace(/;\s*$/, '');
  // Un INSERT/UPDATE/DELETE no puede ir dentro de una subconsulta, así que va
  // en un CTE. Por eso esas sentencias deben llevar RETURNING; si no devuelven
  // filas, se usan con ejecutar().
  return ES_DML.test(limpio)
    ? `WITH _q AS (${limpio}) SELECT coalesce(json_agg(_q), '[]'::json) AS filas FROM _q`
    : `SELECT coalesce(json_agg(_q), '[]'::json) AS filas FROM (${limpio}) _q`;
}

// ---------------------------------------------------------------------------
// Consultas
// ---------------------------------------------------------------------------

/**
 * Ejecuta un SELECT (o un INSERT/UPDATE/DELETE con RETURNING).
 * @param {string} sql - Con parámetros posicionales $1, $2...
 * @param {Array} [params]
 * @returns {Promise<Object[]>} Filas con el mismo formato JSON que PostgREST
 */
export async function consulta(sql, params = []) {
  const { rows } = await ejecutor().query(envolver(sql), params);
  return rows[0].filas;
}

/**
 * Primera fila de un SELECT, o null. Equivale a `.maybeSingle()` y a los
 * `.single()` cuyo "sin filas" (PGRST116) se trataba como null.
 */
export async function uno(sql, params = []) {
  const filas = await consulta(sql, params);
  return filas.length > 0 ? filas[0] : null;
}

/** Ejecuta una sentencia sin devolver filas. Devuelve cuántas filas afectó. */
export async function ejecutar(sql, params = []) {
  const { rowCount } = await ejecutor().query(sql, params);
  return rowCount;
}

// ---------------------------------------------------------------------------
// "Exactamente una fila": lo que hacía `.single()`
// ---------------------------------------------------------------------------

/**
 * "Sin filas" en una operación que exige exactamente un resultado. Es lo que
 * antes era el error PGRST116 de `.single()`.
 */
export class SinFilas extends Error {
  constructor(mensaje = 'No se encontró el registro') {
    super(mensaje);
    this.name = 'SinFilas';
    this.code = 'SIN_FILAS';
  }
}

/**
 * Como uno(), pero lanza SinFilas si no hay resultado. Para los `.single()`
 * de repositorios que NO trataban el caso "sin filas" y lo dejaban llegar
 * como error.
 */
export async function unoObligatorio(sql, params = []) {
  const fila = await uno(sql, params);
  if (fila === null) throw new SinFilas();
  return fila;
}

/**
 * Espera una operación que devuelve filas y exige al menos una. Equivale a
 * `.select().single()` sobre un INSERT, UPDATE o DELETE.
 */
export async function exigirFila(promesa) {
  const filas = await promesa;
  if (!filas || filas.length === 0) throw new SinFilas();
  return filas[0];
}

/**
 * Primera fila de una operación, o null. Equivale a `.select().single()`
 * sobre un UPDATE o DELETE cuyo "sin filas" se trataba como null.
 */
export async function primeraFila(promesa) {
  const filas = await promesa;
  return filas && filas.length > 0 ? filas[0] : null;
}

// ---------------------------------------------------------------------------
// Escrituras a partir de objetos de datos (sql.js arma la sentencia)
// ---------------------------------------------------------------------------

/** INSERT de un objeto o de un array de objetos. Devuelve las filas creadas. */
export async function insertarFilas(tabla, datos) {
  const { sql, params } = sqlInsertar(tabla, datos);
  return consulta(sql, params);
}

/**
 * UPDATE con los campos del objeto. Devuelve las filas actualizadas.
 * @example actualizarFilas('categoria', datos, 'id_categoria = $1', [id])
 */
export async function actualizarFilas(tabla, datos, where, paramsWhere = []) {
  // Un update sin campos no toca nada. PostgREST respondía 200 con [] (cero
  // filas, no la fila sin cambios), así que se devuelve eso sin ir a la base.
  if (!Object.values(datos).some((v) => v !== undefined)) return [];
  const { sql, params } = sqlActualizar(tabla, datos, where, paramsWhere);
  return consulta(sql, params);
}

/** INSERT ... ON CONFLICT DO UPDATE. Devuelve las filas resultantes. */
export async function upsertFilas(tabla, datos, columnasConflicto) {
  const { sql, params } = sqlUpsert(tabla, datos, columnasConflicto);
  return consulta(sql, params);
}

// ---------------------------------------------------------------------------
// Transacciones
// ---------------------------------------------------------------------------

/**
 * Ejecuta fn dentro de una transacción: COMMIT si termina bien, ROLLBACK si
 * lanza. Una transaccion() anidada reutiliza la que ya está abierta.
 */
export async function transaccion(fn) {
  if (transaccionActual.getStore()) return fn();

  const cliente = await pool.connect();
  try {
    await cliente.query('BEGIN');
    const resultado = await transaccionActual.run(cliente, fn);
    await cliente.query('COMMIT');
    return resultado;
  } catch (error) {
    await cliente.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    cliente.release();
  }
}

/** Cierra el pool. Solo para scripts y pruebas. */
export async function cerrar() {
  await pool.end();
}

export { sqlInsertar, sqlUpsert, sqlActualizar };

export default {
  consulta, uno, ejecutar, unoObligatorio, exigirFila, primeraFila,
  insertarFilas, actualizarFilas, upsertFilas, transaccion, cerrar, SinFilas,
};
