// Avance de un proyecto (GET /proyecto_etapa/:id_proyecto/avance) contra la
// base real. `npm run test:bd`.
//
// Todo va dentro de transaccion() y termina en ROLLBACK: nada persiste.

import test from 'node:test';
import assert from 'node:assert/strict';

const db = await import('../src/config/db.js');
const { default: ApiError } = await import('../src/utils/ApiError.js');
const { default: ProyectoEtapaService } = await import('../src/services/proyectoEtapaService.js');

test.after(() => db.cerrar());

const FORZAR = 'forzar rollback';
const conRollback = (fn) =>
  assert.rejects(db.transaccion(async () => { await fn(); throw new Error(FORZAR); }), { message: FORZAR });
const esApiError = (status, texto) => (e) =>
  e instanceof ApiError && e.statusCode === status && (!texto || e.message.includes(texto));

/** Copia la primera fila de una tabla para no depender de cada NOT NULL. */
async function copiaDe(tabla, pk, cambios) {
  const base = await db.uno(`SELECT * FROM ${tabla} ORDER BY ${pk} LIMIT 1`);
  delete base[pk];
  delete base.created_at;
  delete base.updated_at;
  return { ...base, ...cambios };
}

const servicio = new ProyectoEtapaService();

test('avance: cuenta lo publicado, ignora los borradores y evalúa las métricas', async () => {
  await conRollback(async () => {
    const [proyecto] = await db.insertarFilas('proyecto',
      await copiaDe('proyecto', 'id_proyecto', { titulo: '__prueba_avance__' }));
    const id_proyecto = proyecto.id_proyecto;

    // Equipo
    const empleado = await db.uno('SELECT id_empleado FROM empleado ORDER BY id_empleado LIMIT 1');
    await db.insertarFilas('celula_proyecto',
      { id_empleado: empleado.id_empleado, id_proyecto, activo: true });

    // Una secuencia vencida: fecha pasada y sin terminar
    const [secuencia] = await db.insertarFilas('secuencia', {
      id_proyecto, nombre: '__seq_prueba__', estado: 'EN PLANEACION',
      dia_inicio: '2020-01-01', dia_fin: '2020-01-31',
    });
    const id_secuencia = secuencia.id_secuencia;

    // Una testing card publicada y terminada, y otra en borrador que no debe contar
    const baseTc = await copiaDe('testing_card', 'id_testing_card', {});
    const [publicada] = await db.insertarFilas('testing_card', {
      ...baseTc, id_secuencia, padre_id: null, titulo: '__tc_publicada__',
      status: 'TERMINADO', es_borrador: false,
    });
    await db.insertarFilas('testing_card', {
      ...baseTc, id_secuencia, padre_id: null, titulo: '__tc_borrador__',
      status: 'EN PLANEACION', es_borrador: true,
    });

    // Learning card publicada con un accionable realizado
    const [learning] = await db.insertarFilas('learning_card', {
      id_testing_card: publicada.id_testing_card, estado: 'ACEPTADA',
      hallazgo: '__hallazgo_prueba__', es_borrador: false,
    });
    await db.insertarFilas('accionable', {
      id_learning_card: learning.id, contenido: '__accionable_prueba__',
      impacto: 3, esfuerzo: 2, realizado: true,
    });

    // Dos métricas: una que se cumple y otra sin medir
    await db.insertarFilas('metrica_testing_card', [
      { id_testing_card: publicada.id_testing_card, nombre: '__m_cumplida__', operador: '>=', criterio: '10', resultado: '15' },
      { id_testing_card: publicada.id_testing_card, nombre: '__m_sin_medir__', operador: '>=', criterio: '10', resultado: null },
    ]);

    const avance = await servicio.avance(id_proyecto);

    assert.equal(avance.totales.secuencias, 1);
    assert.equal(avance.totales.secuencias_terminadas, 0);
    assert.equal(avance.totales.secuencias_vencidas, 1, 'fecha pasada y sin terminar');
    assert.equal(avance.totales.testing_cards, 1, 'la card en borrador no cuenta');
    assert.equal(avance.totales.testing_cards_terminadas, 1);
    assert.equal(avance.totales.learning_cards, 1);
    assert.deepEqual(avance.totales.learning_cards_por_estado, { ACEPTADA: 1 });
    assert.equal(avance.totales.accionables, 1);
    assert.equal(avance.totales.accionables_realizados, 1);

    assert.equal(avance.metricas.resumen.total, 2);
    assert.equal(avance.metricas.resumen.cumplidas, 1);
    assert.equal(avance.metricas.resumen.no_evaluables, 1, 'sin resultado no es incumplimiento');

    assert.equal(avance.learning_cards.length, 1);
    assert.equal(avance.learning_cards[0].accionables, 1);
    assert.equal(avance.learning_cards[0].hallazgo, '__hallazgo_prueba__');

    assert.ok(avance.equipo.some((e) => e.id_empleado === empleado.id_empleado));
    assert.ok(avance.secuencias[0].vencida);
  });
});

test('avance: una learning card en borrador tampoco cuenta', async () => {
  await conRollback(async () => {
    const [proyecto] = await db.insertarFilas('proyecto',
      await copiaDe('proyecto', 'id_proyecto', { titulo: '__prueba_avance_2__' }));
    const [secuencia] = await db.insertarFilas('secuencia',
      { id_proyecto: proyecto.id_proyecto, nombre: '__seq_prueba_2__', estado: 'EN PLANEACION' });
    const baseTc = await copiaDe('testing_card', 'id_testing_card', {});
    const [tc] = await db.insertarFilas('testing_card', {
      ...baseTc, id_secuencia: secuencia.id_secuencia, padre_id: null,
      titulo: '__tc_2__', status: 'EN PLANEACION', es_borrador: false,
    });
    await db.insertarFilas('learning_card',
      { id_testing_card: tc.id_testing_card, estado: 'ACEPTADA', es_borrador: true });

    const avance = await servicio.avance(proyecto.id_proyecto);
    assert.equal(avance.totales.testing_cards, 1);
    assert.equal(avance.totales.learning_cards, 0);
    assert.equal(avance.learning_cards.length, 0);
  });
});

test('avance: un proyecto sin nada no rompe, devuelve ceros', async () => {
  await conRollback(async () => {
    const [proyecto] = await db.insertarFilas('proyecto',
      await copiaDe('proyecto', 'id_proyecto', { titulo: '__prueba_avance_vacio__' }));

    const avance = await servicio.avance(proyecto.id_proyecto);

    assert.equal(avance.totales.secuencias, 0);
    assert.equal(avance.totales.testing_cards, 0);
    assert.equal(avance.metricas.resumen.total, 0);
    assert.deepEqual(avance.secuencias, []);
    assert.deepEqual(avance.accionables, []);
  });
});

test('avance: proyecto inexistente es 404', async () => {
  await assert.rejects(servicio.avance(999999), esApiError(404, 'Proyecto no encontrado'));
});
