// Escrituras de los repositorios del Lote 1 contra la base real.
// `npm run test:bd`. Cada prueba corre dentro de transaccion() y termina en
// ROLLBACK: nada de lo que se crea, cambia o borra aquí queda en la base.
//
// Las comprobaciones se hacen releyendo con SQL, no con las propiedades de los
// modelos, para no depender de cómo cada modelo nombra sus campos.

import test from 'node:test';
import assert from 'node:assert/strict';

const db = await import('../src/config/db.js');
const { default: ApiError } = await import('../src/utils/ApiError.js');
test.after(() => db.cerrar());

const FORZAR = 'forzar rollback';
const conRollback = (fn) =>
  assert.rejects(db.transaccion(async () => { await fn(); throw new Error(FORZAR); }), { message: FORZAR });
const contar = async (tabla) => (await db.uno(`SELECT count(*)::int AS n FROM ${tabla}`)).n;
const esApiError = (status, texto) => (e) =>
  e instanceof ApiError && e.statusCode === status && (!texto || e.message.includes(texto));

// Ids reales para las FKs
const unEmpleado = async () => (await db.uno('SELECT id_empleado FROM empleado ORDER BY id_empleado LIMIT 1')).id_empleado;
const unaLc = async () => (await db.uno('SELECT id FROM learning_card ORDER BY id LIMIT 1')).id;
const unaTc = async () => (await db.uno('SELECT id_testing_card FROM testing_card ORDER BY id_testing_card LIMIT 1')).id_testing_card;

test('categoria: crear, actualizar y eliminar', async () => {
  const { default: Repo } = await import('../src/repositories/categoriaRepository.js');
  const repo = new Repo();
  const antes = await contar('categoria');
  await conRollback(async () => {
    await repo.crear({ nombre: '__prueba__' });
    const { id_categoria: id } = await db.uno("SELECT id_categoria FROM categoria WHERE nombre = '__prueba__'");
    await repo.actualizar(id, { nombre: '__prueba2__' });
    assert.equal((await db.uno('SELECT nombre FROM categoria WHERE id_categoria = $1', [id])).nombre, '__prueba2__');
    assert.ok(await repo.obtenerPorId(id));
    await repo.eliminar(id);
    assert.equal(await repo.obtenerPorId(id), null);
    await assert.rejects(repo.eliminar(id), esApiError(404, 'Categoría no encontrada'));
  });
  assert.equal(await contar('categoria'), antes);
});

test('experimento_tipo: crear, actualizar y eliminar', async () => {
  const { default: Repo } = await import('../src/repositories/experimentoTipoRepository.js');
  const repo = new Repo();
  await conRollback(async () => {
    // CHECK experimento_tipo_tipo_check: solo DESCUBRIMIENTO o VALIDACION
    await repo.crear({ nombre: '__prueba__', tipo: 'VALIDACION', icono: 'x' });
    const { id_experimento_tipo: id } = await db.uno("SELECT id_experimento_tipo FROM experimento_tipo WHERE nombre = '__prueba__'");
    await repo.actualizar(id, { tipo: 'DESCUBRIMIENTO' });
    assert.equal((await db.uno('SELECT tipo FROM experimento_tipo WHERE id_experimento_tipo = $1', [id])).tipo, 'DESCUBRIMIENTO');
    await repo.eliminar(id);
    await assert.rejects(repo.eliminar(id), esApiError(404));
  });
});

test('formato: los errores se relanzan tal cual (SinFilas para no encontrado)', async () => {
  const { default: Repo } = await import('../src/repositories/formatoRepository.js');
  await conRollback(async () => {
    const creado = await Repo.create({ document_name: '__prueba__', document_url: 'http://x/a/b', document_type: 'pdf', categoria: 'x' });
    assert.equal(creado.document_name, '__prueba__');
    assert.equal(typeof creado.id, 'string');
    const actualizado = await Repo.update(creado.id, { document_name: '__prueba2__' });
    assert.equal(actualizado.document_name, '__prueba2__');
    assert.equal((await Repo.findById(creado.id)).id, creado.id);
    await Repo.delete(creado.id);
    await assert.rejects(Repo.findById(creado.id), { name: 'SinFilas' });
    await assert.rejects(Repo.delete(creado.id), { name: 'SinFilas' });
  });
});

test('servicio: crear, actualizar y eliminar; sin fila es 500, como el .single() de antes', async () => {
  const { default: Repo } = await import('../src/repositories/servicioRepository.js');
  const repo = new Repo();
  await conRollback(async () => {
    await repo.crear({ nombre: '__prueba__', precio_aprox: 12.5 });
    const fila = await db.uno("SELECT id, precio_aprox FROM servicio WHERE nombre = '__prueba__'");
    assert.equal(fila.precio_aprox, 12.5, 'numeric vuelve como número');
    await repo.actualizar(fila.id, { descripcion: 'd' });
    assert.equal((await db.uno('SELECT descripcion FROM servicio WHERE id = $1', [fila.id])).descripcion, 'd');
    await repo.eliminar(fila.id);
    await assert.rejects(repo.actualizar(fila.id, { descripcion: 'x' }),
      esApiError(500, 'Error al actualizar servicio: No se encontró el registro'));
  });
});

test('habilidades: crear, actualizar y eliminar', async () => {
  const repo = await import('../src/repositories/habilidadesRepositorio.js');
  const empleado = await unEmpleado();
  await conRollback(async () => {
    await repo.crear({ id_empleado: empleado, nombre_habilidad: '__prueba__', nivel: 'alto' });
    assert.equal((await repo.obtenerPorEmpleado(empleado)).length >= 1, true);
    const { id_habilidad: id } = await db.uno("SELECT id_habilidad FROM habilidades WHERE nombre_habilidad = '__prueba__'");
    await repo.actualizar(id, { nivel: 'bajo' });
    assert.equal((await db.uno('SELECT nivel FROM habilidades WHERE id_habilidad = $1', [id])).nivel, 'bajo');
    await repo.eliminar(id);
    await assert.rejects(repo.eliminar(id), esApiError(500, 'Error al eliminar la habilidad'));
  });
});

test('url_formato: crear, actualizar y eliminar', async () => {
  const { default: Repo } = await import('../src/repositories/urlFormatoRepository.js');
  const repo = new Repo();
  await conRollback(async () => {
    // UrlFormatoModel.toDatabase() solo guarda url y categoria: se busca por url.
    await repo.crear({ url: 'https://prueba.test', categoria: 'x' });
    const { id_url_formato: id } = await db.uno("SELECT id_url_formato FROM url_formato WHERE url = 'https://prueba.test'");
    await repo.actualizar(id, { categoria: 'y' });
    assert.equal((await db.uno('SELECT categoria FROM url_formato WHERE id_url_formato = $1', [id])).categoria, 'y');
    assert.equal(await repo.eliminar(id), true);
    assert.equal(await repo.obtenerPorId(id), null);
  });
});

test('url_learning_card y url_testing_card: crear, actualizar y eliminar', async () => {
  const { default: RepoLc } = await import('../src/repositories/urlLearningCardRepository.js');
  const { default: RepoTc } = await import('../src/repositories/urlTestingCardRepository.js');
  const lc = await unaLc(); const tc = await unaTc();
  await conRollback(async () => {
    const repoLc = new RepoLc();
    await repoLc.crear({ id_learning_card: lc, url: 'https://lc.prueba' });
    const { id_url_lc } = await db.uno("SELECT id_url_lc FROM url_learning_card WHERE url = 'https://lc.prueba'");
    await repoLc.actualizar(id_url_lc, { url: 'https://lc2.prueba' });
    assert.ok(await repoLc.eliminar(id_url_lc));
    assert.equal(await repoLc.existeLearningCard(lc), true);
    assert.equal(await repoLc.existeLearningCard(-1), false);

    const repoTc = new RepoTc();
    await repoTc.crear({ id_testing_card: tc, url: 'https://tc.prueba' });
    const { id_url_tc } = await db.uno("SELECT id_url_tc FROM url_testing_card WHERE url = 'https://tc.prueba'");
    await repoTc.actualizar(id_url_tc, { url: 'https://tc2.prueba' });
    assert.ok(await repoTc.eliminar(id_url_tc));
    await assert.rejects(repoTc.eliminar(id_url_tc), esApiError(500, 'Error al eliminar URL'));
  });
});

test('celula_proyecto: crear, crearMultiple, actualizarActivo y eliminar', async () => {
  const { default: Repo } = await import('../src/repositories/celulaProyectoRepository.js');
  const repo = new Repo();
  const pares = await db.consulta(`
    SELECT e.id_empleado, p.id_proyecto FROM empleado e CROSS JOIN proyecto p
    WHERE NOT EXISTS (SELECT 1 FROM celula_proyecto c WHERE c.id_empleado = e.id_empleado AND c.id_proyecto = p.id_proyecto)
    ORDER BY 1, 2 LIMIT 3`);
  await conRollback(async () => {
    await repo.crear({ ...pares[0], activo: true });
    const creadas = await repo.crearMultiple([{ ...pares[1], activo: true }, { ...pares[2], activo: false }]);
    assert.equal(creadas.length, 2);
    const { id } = await db.uno('SELECT id FROM celula_proyecto WHERE id_empleado = $1 AND id_proyecto = $2', [pares[0].id_empleado, pares[0].id_proyecto]);
    await repo.actualizarActivo(id, false);
    assert.equal((await db.uno('SELECT activo FROM celula_proyecto WHERE id = $1', [id])).activo, false);
    await repo.eliminar(id);
    await assert.rejects(repo.eliminar(id), esApiError(404, 'Relación no encontrada'));
    assert.equal(await repo.obtenerPorId(id), null);
  });
});

test('metrica_testing_card: crear, actualizar, eliminar y copiarMetrica', async () => {
  const { default: Repo } = await import('../src/repositories/metricaTestingCardRepository.js');
  const repo = new Repo();
  const tc = await unaTc();
  await conRollback(async () => {
    await repo.crear({ id_testing_card: tc, nombre: '__prueba__', operador: '>', criterio: '1' });
    const { id_metrica: id } = await db.uno("SELECT id_metrica FROM metrica_testing_card WHERE nombre = '__prueba__'");
    await repo.actualizar(id, { criterio: '2' });
    assert.equal((await db.uno('SELECT criterio FROM metrica_testing_card WHERE id_metrica = $1', [id])).criterio, '2');
    const copia = await repo.copiarMetrica(id);
    assert.ok(copia);
    assert.equal((await db.uno("SELECT count(*)::int AS n FROM metrica_testing_card WHERE nombre = '__prueba__'")).n, 2);
    await repo.eliminar(id);
    await assert.rejects(repo.eliminar(id), esApiError(404, 'Métrica no encontrada'));
    await assert.rejects(repo.copiarMetrica(id), esApiError(404, 'Métrica original no encontrada'));
  });
});

test('sesion: crear, actualizar título, listar y eliminar', async () => {
  const { default: Repo } = await import('../src/repositories/sesionRepository.js');
  const repo = new Repo();
  const empleado = await unEmpleado();
  await conRollback(async () => {
    await repo.crear({ id_empleado: empleado, thread_id: '__prueba__' });
    assert.ok(await repo.obtenerPorThreadId('__prueba__'));
    await repo.actualizarTitulo('__prueba__', 'Título');
    assert.equal((await db.uno("SELECT titulo FROM sesion WHERE thread_id = '__prueba__'")).titulo, 'Título');
    assert.ok(await repo.actualizarActualizado('__prueba__'));
    assert.ok((await repo.listarPorEmpleado(empleado)).length >= 1);
    assert.ok(await repo.eliminar('__prueba__', empleado));
    assert.equal(await repo.eliminar('__prueba__', empleado), null, 'sin fila devuelve null, como antes');
    assert.equal(await repo.actualizarTitulo('__prueba__', 'x'), null);
  });
});

test('node_positions: upsert, upsertLote, crear, obtener y eliminar por secuencia', async () => {
  const { default: Repo } = await import('../src/repositories/nodePositionRepository.js');
  const repo = new Repo();
  const existente = await db.uno('SELECT id_secuencia, node_type, node_id FROM node_positions ORDER BY id_position LIMIT 1');
  await conRollback(async () => {
    await repo.upsert({ ...existente, position_x: 11, position_y: 22 });
    const tras = await repo.obtenerPosicionPorId(existente.node_id, existente.node_type, existente.id_secuencia);
    assert.deepEqual(tras, { position_x: 11, position_y: 22 }, 'el upsert actualiza la fila existente');

    const nuevas = await repo.upsertLote([
      { id_secuencia: existente.id_secuencia, node_type: 'learning', node_id: 999999, position_x: 1, position_y: 2 },
      { ...existente, position_x: 33, position_y: 44 },
    ]);
    assert.equal(nuevas.length, 2);

    await repo.crear({ id_secuencia: existente.id_secuencia, node_type: 'testing', node_id: 999998, position_x: 5, position_y: 6 });

    assert.equal(await repo.eliminarPorSecuencia(existente.id_secuencia), null);
    assert.deepEqual(await repo.obtenerPorSecuencia(existente.id_secuencia), []);
    await assert.rejects(repo.obtenerPosicionPorId(existente.node_id, existente.node_type, existente.id_secuencia),
      esApiError(404, 'Posición no encontrada'));
  });
  assert.ok((await db.consulta('SELECT 1 FROM node_positions WHERE id_secuencia = $1', [existente.id_secuencia])).length > 0,
    'tras el ROLLBACK las posiciones siguen ahí');
});

// Aparte porque en Postgres un error aborta la transacción: después ya no se
// puede seguir consultando dentro de ella.
test('node_positions: crear un nodo que ya tiene posición es un 500', async () => {
  const { default: Repo } = await import('../src/repositories/nodePositionRepository.js');
  const repo = new Repo();
  const existente = await db.uno('SELECT id_secuencia, node_type, node_id FROM node_positions ORDER BY id_position LIMIT 1');
  await assert.rejects(
    db.transaccion(() => repo.crear({ ...existente, position_x: 0, position_y: 0 })),
    (e) => e instanceof ApiError && e.statusCode === 500 && /unique_node_position|duplicad/i.test(e.message));
});

test('testing_card_playbook: sin página es SinFilas, relanzado tal cual', async () => {
  const { default: Repo } = await import('../src/repositories/testingCardPlaybookRepository.js');
  const repo = new Repo();
  await assert.rejects(repo.obtenerPorPagina(999999), { name: 'SinFilas' });
  assert.ok(Array.isArray(await repo.buscarPorCampo('__no_existe__')));
});
