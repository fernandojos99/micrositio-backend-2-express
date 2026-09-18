// Brief de un proyecto (/proyecto_brief) contra la base real. `npm run test:bd`.
//
// Todo va dentro de transaccion() y termina en ROLLBACK: nada persiste.

import test from 'node:test';
import assert from 'node:assert/strict';

const db = await import('../src/config/db.js');
const { default: ApiError } = await import('../src/utils/ApiError.js');
const { default: ProyectoBriefService } = await import('../src/services/proyectoBriefService.js');

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

const servicio = new ProyectoBriefService();

test('brief: un proyecto sin brief devuelve el vacío sin crear la fila', async () => {
  await conRollback(async () => {
    const [proyecto] = await db.insertarFilas('proyecto',
      await copiaDe('proyecto', 'id_proyecto', { titulo: '__prueba_brief_vacio__' }));

    const brief = await servicio.obtener(proyecto.id_proyecto);

    assert.equal(brief.ejecutado, false);
    assert.equal(brief.url, null);
    assert.equal(brief.archivo, null);
    assert.equal(brief.pptx, null);

    // El GET no debe haber escrito nada.
    const fila = await db.uno('SELECT * FROM proyecto_brief WHERE id_proyecto = $1',
      [proyecto.id_proyecto]);
    assert.equal(fila, null);
  });
});

test('brief: guardar dos veces sustituye al anterior, una sola fila por proyecto', async () => {
  await conRollback(async () => {
    const [proyecto] = await db.insertarFilas('proyecto',
      await copiaDe('proyecto', 'id_proyecto', { titulo: '__prueba_brief_upsert__' }));
    const id = proyecto.id_proyecto;

    await servicio.guardar(id, {
      nombre_proyecto: 'Primera sesión',
      transcript_id: '111',
      url: 'https://docs.example.com/a',
      resumen_estructurado: { cliente: 'Uno' },
      origen: 'texto'
    });

    const segundo = await servicio.guardar(id, {
      nombre_proyecto: 'Segunda sesión',
      transcript_id: '222',
      url: 'https://docs.example.com/b',
      resumen_estructurado: { cliente: 'Dos' },
      origen: 'docx'
    });

    assert.equal(segundo.transcript_id, '222');
    assert.equal(segundo.url, 'https://docs.example.com/b');
    assert.deepEqual(segundo.resumen_estructurado, { cliente: 'Dos' });
    assert.equal(segundo.ejecutado, true);

    const filas = await db.consulta('SELECT id_proyecto FROM proyecto_brief WHERE id_proyecto = $1', [id]);
    assert.equal(filas.length, 1, 'debe quedar una sola fila por proyecto');
  });
});

test('brief: subir el pptx no borra lo que devolvió Ejecutar', async () => {
  await conRollback(async () => {
    const [proyecto] = await db.insertarFilas('proyecto',
      await copiaDe('proyecto', 'id_proyecto', { titulo: '__prueba_brief_pptx__' }));
    const id = proyecto.id_proyecto;

    await servicio.guardar(id, { transcript_id: '333', url: 'https://docs.example.com/c' });

    const conPptx = await servicio.subirArchivo(id, {
      originalname: 'propuesta.pptx',
      buffer: Buffer.from('no es un pptx de verdad, pero basta para la prueba'),
      size: 49
    }, 'pptx');

    assert.equal(conPptx.pptx.nombre, 'propuesta.pptx');
    assert.match(conPptx.pptx.url, /\/archivos\/brief-docs\/presentaciones\//);
    assert.equal(conPptx.url, 'https://docs.example.com/c', 'no debe pisar lo ya guardado');
    assert.equal(conPptx.transcript_id, '333');
  });
});

test('brief: el pptx se puede subir sin haber ejecutado nunca', async () => {
  await conRollback(async () => {
    const [proyecto] = await db.insertarFilas('proyecto',
      await copiaDe('proyecto', 'id_proyecto', { titulo: '__prueba_brief_solo_pptx__' }));

    const brief = await servicio.subirArchivo(proyecto.id_proyecto, {
      originalname: 'sin ejecutar.pptx',
      buffer: Buffer.from('x'),
      size: 1
    }, 'pptx');

    assert.equal(brief.ejecutado, false);
    assert.ok(brief.pptx.url);
  });
});

test('brief: rechaza una extensión que no es de presentación', async () => {
  await db.transaccion(async () => {
    const [proyecto] = await db.insertarFilas('proyecto',
      await copiaDe('proyecto', 'id_proyecto', { titulo: '__prueba_brief_extension__' }));

    await assert.rejects(
      servicio.subirArchivo(proyecto.id_proyecto, {
        originalname: 'foto.png', buffer: Buffer.from('x'), size: 1
      }, 'pptx'),
      esApiError(400, 'pptx')
    );

    throw new Error(FORZAR);
  }).catch((e) => { if (e.message !== FORZAR) throw e; });
});

test('brief: un proyecto inexistente da 404', async () => {
  await assert.rejects(servicio.obtener(999_999_999), esApiError(404, 'Proyecto no encontrado'));
});
