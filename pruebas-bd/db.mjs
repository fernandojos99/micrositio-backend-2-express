// Pruebas de src/config/db.js contra la base de datos real (DATABASE_URL).
// No las corre `npm test` ni el CI, que no tienen base: `npm run test:bd`.
//
// Toda escritura va dentro de transaccion() y termina en ROLLBACK: nada de lo
// que se inserta aquí queda en la base.

import test from 'node:test';
import assert from 'node:assert/strict';

const db = await import('../src/config/db.js');
test.after(() => db.cerrar());

const FORZAR_ROLLBACK = 'forzar rollback';
const conRollback = (fn) =>
  assert.rejects(db.transaccion(async () => { await fn(); throw new Error(FORZAR_ROLLBACK); }),
    { message: FORZAR_ROLLBACK });

test('date sale como texto YYYY-MM-DD, igual que PostgREST', async () => {
  const fila = await db.uno('SELECT dia_inicio FROM testing_card WHERE dia_inicio IS NOT NULL LIMIT 1');
  assert.equal(typeof fila.dia_inicio, 'string');
  assert.match(fila.dia_inicio, /^\d{4}-\d{2}-\d{2}$/);
});

test('numeric sale como número, no como texto', async () => {
  const fila = await db.uno('SELECT position_x FROM node_positions LIMIT 1');
  assert.equal(typeof fila.position_x, 'number');
});

test('timestamptz sale como texto ISO con su zona horaria', async () => {
  const fila = await db.uno('SELECT created_at FROM testing_card LIMIT 1');
  assert.match(fila.created_at, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?[+-]\d{2}:\d{2}$/);
});

test('jsonb sale como objeto o array, no como texto', async () => {
  const fila = await db.uno('SELECT metricas FROM testing_card_playbook WHERE metricas IS NOT NULL LIMIT 1');
  assert.notEqual(typeof fila.metricas, 'string');
});

test('consulta() respeta el ORDER BY', async () => {
  const filas = await db.consulta('SELECT id_proyecto FROM proyecto ORDER BY id_proyecto DESC');
  const ids = filas.map((f) => f.id_proyecto);
  assert.deepEqual(ids, [...ids].sort((a, b) => b - a));
});

test('uno() devuelve null si no hay filas', async () => {
  assert.equal(await db.uno('SELECT * FROM proyecto WHERE id_proyecto = $1', [-1]), null);
});

test('consulta() sin filas devuelve un array vacío', async () => {
  assert.deepEqual(await db.consulta('SELECT * FROM proyecto WHERE id_proyecto = $1', [-1]), []);
});

test('INSERT ... RETURNING devuelve la fila creada', () => conRollback(async () => {
  const fila = await db.uno("INSERT INTO servicio (nombre) VALUES ($1) RETURNING *", ['__prueba__']);
  assert.equal(fila.nombre, '__prueba__');
  assert.equal(typeof fila.id, 'number');
}));

test('transaccion() deshace todo si falla', async () => {
  const contar = async () => (await db.uno('SELECT count(*)::int AS n FROM servicio')).n;
  const antes = await contar();
  await conRollback(async () => {
    await db.consulta("INSERT INTO servicio (nombre) VALUES ('__prueba__') RETURNING id");
    assert.equal(await contar(), antes + 1, 'dentro de la transacción la fila se ve');
  });
  assert.equal(await contar(), antes, 'tras el ROLLBACK la fila no está');
});

test('los errores de Postgres conservan su SQLSTATE (23505, clave duplicada)', async () => {
  await assert.rejects(
    db.transaccion(async () => {
      const p = await db.uno('SELECT id_secuencia, node_type, node_id FROM node_positions LIMIT 1');
      await db.consulta(
        'INSERT INTO node_positions (id_secuencia, node_type, node_id, position_x, position_y) VALUES ($1, $2, $3, 0, 0) RETURNING *',
        [p.id_secuencia, p.node_type, p.node_id]
      );
    }),
    (error) => error.code === '23505'
  );
});

test('ejecutar() devuelve las filas afectadas', () => conRollback(async () => {
  await db.consulta("INSERT INTO servicio (nombre) VALUES ('__prueba__') RETURNING id");
  assert.equal(await db.ejecutar("UPDATE servicio SET descripcion = 'x' WHERE nombre = '__prueba__'"), 1);
}));

test('actualizarFilas sin campos devuelve [] sin tocar la base, como PostgREST ante un update vacío', async () => {
  assert.deepEqual(await db.actualizarFilas('servicio', {}, 'id = $1', [1]), []);
  assert.deepEqual(await db.actualizarFilas('servicio', { nombre: undefined }, 'id = $1', [1]), []);
});
