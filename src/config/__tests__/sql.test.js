import test from 'node:test';
import assert from 'node:assert/strict';
import { identificador, valorParaBd, sqlInsertar, sqlUpsert, sqlActualizar } from '../sql.js';

test('sqlInsertar: un objeto, columnas entrecomilladas y parámetros en orden', () => {
  const { sql, params } = sqlInsertar('servicio', { nombre: 'A', precio_aprox: 10 });
  assert.equal(sql, 'INSERT INTO "servicio" ("nombre", "precio_aprox") VALUES ($1, $2) RETURNING *');
  assert.deepEqual(params, ['A', 10]);
});

test('sqlInsertar: ignora las claves undefined, como JSON.stringify en supabase-js', () => {
  const { sql, params } = sqlInsertar('t', { a: 1, b: undefined, c: null });
  assert.equal(sql, 'INSERT INTO "t" ("a", "c") VALUES ($1, $2) RETURNING *');
  assert.deepEqual(params, [1, null]);
});

test('sqlInsertar: varias filas; una clave ausente en alguna fila va como NULL', () => {
  const { sql, params } = sqlInsertar('t', [{ a: 1, b: 2 }, { a: 3 }]);
  assert.equal(sql, 'INSERT INTO "t" ("a", "b") VALUES ($1, $2), ($3, $4) RETURNING *');
  assert.deepEqual(params, [1, 2, 3, null]);
});

test('valorParaBd: objetos y arrays como texto JSON; Date, Buffer y primitivos intactos', () => {
  assert.equal(valorParaBd({ x: 1 }), '{"x":1}');
  assert.equal(valorParaBd([1, 2]), '[1,2]');
  const fecha = new Date(0);
  assert.equal(valorParaBd(fecha), fecha);
  const buf = Buffer.from('a');
  assert.equal(valorParaBd(buf), buf);
  assert.equal(valorParaBd(null), null);
  assert.equal(valorParaBd('texto'), 'texto');
});

test('identificador: rechaza cualquier cosa que no sea un nombre simple', () => {
  assert.equal(identificador('id_proyecto'), '"id_proyecto"');
  for (const malo of ['a; DROP TABLE x', 'a"b', 'a b', '1a', '']) {
    assert.throws(() => identificador(malo), /no válido/, malo);
  }
  assert.throws(() => sqlInsertar('t', { 'a; --': 1 }), /no válido/);
});

test('sqlUpsert: ON CONFLICT actualiza todas las columnas recibidas', () => {
  const { sql, params } = sqlUpsert('node_positions', { id_secuencia: 1, node_type: 'testing', node_id: 2, position_x: 3 },
    ['id_secuencia', 'node_type', 'node_id']);
  assert.equal(sql,
    'INSERT INTO "node_positions" ("id_secuencia", "node_type", "node_id", "position_x") VALUES ($1, $2, $3, $4) ' +
    'ON CONFLICT ("id_secuencia", "node_type", "node_id") DO UPDATE SET ' +
    '"id_secuencia" = EXCLUDED."id_secuencia", "node_type" = EXCLUDED."node_type", "node_id" = EXCLUDED."node_id", "position_x" = EXCLUDED."position_x" ' +
    'RETURNING *');
  assert.deepEqual(params, [1, 'testing', 2, 3]);
});

test('sqlActualizar: desplaza los $n del WHERE detrás de los del SET', () => {
  const { sql, params } = sqlActualizar('categoria', { nombre: 'X', descripcion: undefined, activo: true },
    'id_categoria = $1 AND tipo = $2', [7, 'a']);
  assert.equal(sql, 'UPDATE "categoria" SET "nombre" = $1, "activo" = $2 WHERE id_categoria = $3 AND tipo = $4 RETURNING *');
  assert.deepEqual(params, ['X', true, 7, 'a']);
});

test('sin columnas: insertar y actualizar fallan en vez de generar SQL inválido', () => {
  assert.throws(() => sqlInsertar('t', {}), /No hay columnas/);
  assert.throws(() => sqlActualizar('t', { a: undefined }, 'id = $1', [1]), /No hay campos/);
});
