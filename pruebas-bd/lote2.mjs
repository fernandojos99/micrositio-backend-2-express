// Escrituras y búsquedas de los repositorios del Lote 2 contra la base real.
// `npm run test:bd`. Cada prueba corre dentro de transaccion() y termina en
// ROLLBACK: nada de lo que se crea, cambia o borra aquí queda en la base.
//
// Para no depender de conocer cada columna (ni sus NOT NULL y CHECK), las filas
// nuevas se crean copiando una existente y cambiando un campo marcador.

import test from 'node:test';
import assert from 'node:assert/strict';

const db = await import('../src/config/db.js');
const { default: ApiError } = await import('../src/utils/ApiError.js');
test.after(() => db.cerrar());

const FORZAR = 'forzar rollback';
const conRollback = (fn) =>
  assert.rejects(db.transaccion(async () => { await fn(); throw new Error(FORZAR); }), { message: FORZAR });
const esApiError = (status, texto) => (e) =>
  e instanceof ApiError && e.statusCode === status && (!texto || e.message.includes(texto));

async function copiaDe(tabla, pk, cambios) {
  const base = await db.uno(`SELECT * FROM ${tabla} ORDER BY ${pk} LIMIT 1`);
  delete base[pk];
  delete base.created_at;
  delete base.updated_at;
  return { ...base, ...cambios };
}

test('proyecto: crear, actualizar, listarPorIds, buscar y eliminar', async () => {
  const { default: Repo } = await import('../src/repositories/proyectoRepository.js');
  const repo = new Repo();
  await conRollback(async () => {
    await repo.crear(await copiaDe('proyecto', 'id_proyecto', { titulo: '__prueba__' }));
    const { id_proyecto: id } = await db.uno("SELECT id_proyecto FROM proyecto WHERE titulo = '__prueba__'");
    await repo.actualizar(id, { titulo: '__prueba2__' });
    assert.equal((await db.uno('SELECT titulo FROM proyecto WHERE id_proyecto = $1', [id])).titulo, '__prueba2__');
    assert.equal((await repo.listarPorIds([id])).length, 1);
    assert.deepEqual(await repo.listarPorIds([]), []);
    assert.equal((await repo.buscarPorTexto('__prueba2')).length, 1);
    await repo.eliminar(id);
    await assert.rejects(repo.actualizar(id, { titulo: 'x' }), esApiError(404, 'no encontrado'));
  });
});

test('proyecto: la búsqueda trata q como texto, no como filtro', async () => {
  const { default: Repo } = await import('../src/repositories/proyectoRepository.js');
  // Antes, una coma o un paréntesis en q se colaba en el filtro .or() de PostgREST.
  assert.deepEqual(await new Repo().buscarPorTexto('x),id_proyecto.gt.0,(titulo.ilike.x'), []);
});

test('secuencia: crear, actualizar, buscar (con proyecto anidado) y eliminar', async () => {
  const { default: Repo } = await import('../src/repositories/secuenciaRepository.js');
  const repo = new Repo();
  await conRollback(async () => {
    await repo.crear(await copiaDe('secuencia', 'id_secuencia', { nombre: '__prueba__' }));
    const fila = await db.uno("SELECT id_secuencia, id_proyecto FROM secuencia WHERE nombre = '__prueba__'");
    await repo.actualizar(fila.id_secuencia, { descripcion: 'd' });
    const [encontrada] = await repo.buscarPorTexto('__prueba__');
    assert.equal(encontrada.id_secuencia, fila.id_secuencia);
    assert.deepEqual(Object.keys(encontrada.proyecto), ['id_proyecto', 'titulo']);
    assert.equal(encontrada.proyecto.id_proyecto, fila.id_proyecto);
    await repo.eliminar(fila.id_secuencia);
    await assert.rejects(repo.eliminar(fila.id_secuencia), esApiError(404, 'Secuencia no encontrada'));
  });
});

test('testing_card: crear, actualizar, buscar (anidado) y eliminar', async () => {
  const { default: Repo } = await import('../src/repositories/testingCardRepository.js');
  const repo = new Repo();
  await conRollback(async () => {
    await repo.crear(await copiaDe('testing_card', 'id_testing_card', { titulo: '__prueba__' }));
    const { id_testing_card: id } = await db.uno("SELECT id_testing_card FROM testing_card WHERE titulo = '__prueba__'");
    await repo.actualizar(id, { hipotesis: '__h__' });
    const [encontrada] = await repo.buscarPorTexto('__prueba__');
    assert.equal(encontrada.id_testing_card, id);
    assert.ok('secuencia' in encontrada && 'responsable' in encontrada);
    if (encontrada.secuencia) {
      assert.deepEqual(Object.keys(encontrada.secuencia), ['id_secuencia', 'nombre', 'descripcion', 'id_proyecto', 'estado', 'proyecto']);
    }
    await repo.eliminar(id);
    assert.equal(await repo.obtenerPorId(id), null);
  });
});

test('testing_card: copiarTestingCard copia la card sin secuencia y todas sus métricas', async () => {
  const { default: Repo } = await import('../src/repositories/testingCardRepository.js');
  const repo = new Repo();
  const { id_testing_card: original, n } = await db.uno(`
    SELECT id_testing_card, count(*)::int AS n FROM metrica_testing_card
    GROUP BY id_testing_card ORDER BY id_testing_card LIMIT 1`);
  await conRollback(async () => {
    const copia = await repo.copiarTestingCard(original);
    assert.equal(copia.metricas.length, n);
    const fila = await db.uno('SELECT titulo, id_secuencia FROM testing_card WHERE id_testing_card = $1', [copia.id_testing_card]);
    assert.match(fila.titulo, / \(Copia\)$/);
    assert.equal(fila.id_secuencia, null);
    await assert.rejects(repo.copiarTestingCard(-1), esApiError(404, 'Testing card original no encontrada'));
  });
});

test('learning_card: crear, actualizar, buscar (anidado) y eliminar', async () => {
  const { default: Repo } = await import('../src/repositories/learningCardRepository.js');
  const repo = new Repo();
  await conRollback(async () => {
    await repo.crear(await copiaDe('learning_card', 'id', { hallazgo: '__prueba__' }));
    const { id, id_testing_card } = await db.uno("SELECT id, id_testing_card FROM learning_card WHERE hallazgo = '__prueba__'");
    await repo.actualizar(id, { resultado: '__r__' });
    await assert.rejects(repo.actualizar('no-numero', { resultado: 'x' }), esApiError(400, 'ID de learning card inválido'));
    const [encontrada] = await repo.buscarPorTexto('__prueba__');
    assert.equal(encontrada.id, id);
    assert.equal(encontrada.testing_card.id_testing_card, id_testing_card);
    assert.ok('secuencia' in encontrada.testing_card && 'responsable' in encontrada.testing_card);
    assert.ok((await repo.obtenerPorTestingCard(id_testing_card)).length >= 1);
    await repo.eliminar(id);
    await assert.rejects(repo.eliminar(id), esApiError(500, 'Error al eliminar learning card'));
  });
});

test('accionable: crear, actualizar, consultas por nivel y eliminar', async () => {
  const acc = await import('../src/repositories/accionableRepository.js');
  const lc = await db.uno(`
    SELECT lc.id, lc.id_testing_card, tc.id_secuencia, s.id_proyecto
    FROM learning_card lc
    JOIN testing_card tc ON tc.id_testing_card = lc.id_testing_card
    JOIN secuencia s ON s.id_secuencia = tc.id_secuencia
    ORDER BY lc.id LIMIT 1`);
  await conRollback(async () => {
    await acc.crear({ id_learning_card: lc.id, contenido: '__prueba__', impacto: 1, esfuerzo: 2 });
    const { id_accionable: id } = await db.uno("SELECT id_accionable FROM accionable WHERE contenido = '__prueba__'");
    await acc.actualizar(id, { realizado: true });
    assert.equal((await db.uno('SELECT realizado FROM accionable WHERE id_accionable = $1', [id])).realizado, true);
    const contiene = (lista) => lista.some((a) => (a.id_accionable ?? a.idAccionable ?? a.id) === id);
    assert.ok(contiene(await acc.obtenerPorLearningCard(lc.id)), 'por learning card');
    assert.ok(contiene(await acc.obtenerPorTestingCard(lc.id_testing_card)), 'por testing card');
    assert.ok(contiene(await acc.obtenerPorSecuencia(lc.id_secuencia)), 'por secuencia');
    assert.ok(contiene(await acc.obtenerPorProyecto(lc.id_proyecto)), 'por proyecto');
    assert.deepEqual(await acc.obtenerPorTestingCard(-1), []);
    await acc.eliminar(id);
    assert.equal(await acc.obtenerPorId(id), null);
    await assert.rejects(acc.eliminar(id), esApiError(500, 'Error al eliminar accionable'));
  });
});
