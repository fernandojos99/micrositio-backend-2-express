// Escrituras de los repositorios del Lote 3 (plantillas, agentes, empleados,
// usuarios) y de authService, contra la base real. `npm run test:bd`.
//
// Todo va dentro de transaccion() y termina en ROLLBACK: nada persiste. Los
// casos que provocan un error de Postgres (FK, clave duplicada) van en su
// propia transacción, porque en Postgres un error la aborta entera.

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
const valor = async (sql, params = []) => { const f = await db.uno(sql, params); return f ? Object.values(f)[0] : null; };

// Ids de una tabla antes de insertar, para localizar después la fila nueva.
const idsDe = async (tabla, pk) => new Set((await db.consulta(`SELECT ${pk}::text AS id FROM ${tabla}`)).map((f) => f.id));
const idNuevo = async (tabla, pk, antes) =>
  (await db.consulta(`SELECT ${pk}::text AS id FROM ${tabla}`)).map((f) => f.id).find((id) => !antes.has(id));

async function copiaDe(tabla, pk, cambios) {
  const base = await db.uno(`SELECT * FROM ${tabla} ORDER BY ${pk} LIMIT 1`);
  delete base[pk];
  delete base.created_at;
  delete base.updated_at;
  return { ...base, ...cambios };
}

const dosEmpleados = async () => (await db.consulta('SELECT id_empleado FROM empleado ORDER BY 1 LIMIT 2')).map((f) => f.id_empleado);

test('plantilla_testing_card: crear, relación, actualizar y eliminar', async () => {
  const { default: Repo } = await import('../src/repositories/plantillaTestingCardRepository.js');
  const repo = new Repo();
  const tc = await valor('SELECT id_testing_card FROM testing_card ORDER BY 1 LIMIT 1');
  const [e1, e2] = await dosEmpleados();
  await conRollback(async () => {
    const antes = await idsDe('plantilla_testing_card', 'id_plantilla_testing_card');
    await repo.crear({ id_testing_card: tc, id_empleado: e1 });
    const id = await idNuevo('plantilla_testing_card', 'id_plantilla_testing_card', antes);
    assert.equal(await repo.existeRelacion(tc, e1), true);
    assert.ok(await repo.actualizar(id, { id_empleado: e2 }));
    assert.equal(await repo.existeRelacion(tc, e2), true);
    assert.ok((await repo.listarPorEmpleado(e2)).length >= 1);
    assert.ok(await repo.eliminar(id));
    assert.equal(await repo.eliminar(id), null);
    assert.equal(await repo.actualizar(id, { id_empleado: e1 }), null);
    assert.equal(await repo.obtenerPorId(id), null);
  });
  await assert.rejects(repo.obtenerPorId('999999'), esApiError(500, 'uuid'));
});

test('plantilla_metrica_tc: crear, relación, actualizar y eliminar', async () => {
  const { default: Repo } = await import('../src/repositories/plantillaMetricaTcRepository.js');
  const repo = new Repo();
  const metrica = await valor('SELECT id_metrica FROM metrica_testing_card ORDER BY 1 LIMIT 1');
  const [e1, e2] = await dosEmpleados();
  await conRollback(async () => {
    const antes = await idsDe('plantilla_metrica_tc', 'id_plantilla_metrica');
    await repo.crear({ id_metrica: metrica, id_empleado: e1 });
    const id = await idNuevo('plantilla_metrica_tc', 'id_plantilla_metrica', antes);
    assert.equal(await repo.existeRelacion(metrica, e1), true);
    assert.ok(await repo.actualizar(id, { id_empleado: e2 }));
    assert.ok((await repo.listarPorMetrica(metrica)).length >= 1);
    assert.ok(await repo.eliminar(id));
    assert.equal(await repo.obtenerPorId(id), null);
  });
});

test('plantilla_secuencia: crear, consultar, actualizar y eliminar', async () => {
  const { default: repo } = await import('../src/repositories/plantillaSecuenciaRepository.js');
  const sec = await valor(`SELECT id_secuencia FROM secuencia
    WHERE id_secuencia NOT IN (SELECT id_secuencia FROM plantilla_secuencia WHERE id_secuencia IS NOT NULL) ORDER BY 1 LIMIT 1`);
  const [e1, e2] = await dosEmpleados();
  await conRollback(async () => {
    const antes = await idsDe('plantilla_secuencia', 'id_plantilla_secuencia');
    await repo.crear({ id_secuencia: sec, id_empleado: e1 });
    const id = await idNuevo('plantilla_secuencia', 'id_plantilla_secuencia', antes);
    assert.ok(await repo.obtenerPorId(id));
    assert.ok(await repo.obtenerPorIdSecuencia(sec));
    assert.equal(await repo.existeRelacion(sec), true);
    assert.ok(await repo.actualizar(id, { id_empleado: e2 }));
    assert.equal(await repo.eliminar(id), true);
    await assert.rejects(repo.actualizar(id, { id_empleado: e1 }), esApiError(404, 'Plantilla secuencia no encontrada'));
  });
});

test('plantilla_secuencia: con dos plantillas para una secuencia, obtenerPorIdSecuencia es null (.single())', async () => {
  const { default: repo } = await import('../src/repositories/plantillaSecuenciaRepository.js');
  const sec = await valor('SELECT id_secuencia FROM secuencia ORDER BY 1 LIMIT 1');
  const [e1, e2] = await dosEmpleados();
  await conRollback(async () => {
    await repo.crear({ id_secuencia: sec, id_empleado: e1 });
    await repo.crear({ id_secuencia: sec, id_empleado: e2 });
    assert.equal(await repo.obtenerPorIdSecuencia(sec), null);
  });
});

test('plantilla_secuencia: FK inexistente es 400', async () => {
  const { default: repo } = await import('../src/repositories/plantillaSecuenciaRepository.js');
  const [e1] = await dosEmpleados();
  await assert.rejects(db.transaccion(() => repo.crear({ id_secuencia: 999999, id_empleado: e1 })),
    esApiError(400, 'no existe'));
});

test('agente: crear, actualizar, buscar y eliminar', async () => {
  const { default: Repo } = await import('../src/repositories/agenteRepository.js');
  const repo = new Repo();
  await conRollback(async () => {
    await repo.crear(await copiaDe('agente', 'id_agente', { nombre: '__prueba__' }));
    const id = await valor("SELECT id_agente FROM agente WHERE nombre = '__prueba__'");
    assert.ok(await repo.actualizar(id, { descripcion: '__desc_prueba__' }));
    assert.equal((await repo.buscarPorTexto('__desc_prueba__')).length, 1);
    assert.ok(await repo.eliminar(id));
    assert.equal(await repo.obtenerPorId(id), null);
  });
  assert.deepEqual(await repo.buscarPorTexto('zq),nombre.ilike.*,(zq'), []);
});

test('agente_categoria: crear, actualizar, listar con anidados y eliminar', async () => {
  const { default: Repo } = await import('../src/repositories/agenteCategoriaRepository.js');
  const repo = new Repo();
  const agente = await valor('SELECT id_agente FROM agente ORDER BY 1 LIMIT 1');
  const cat = await valor('SELECT id_categoria FROM categoria_agente ORDER BY 1 LIMIT 1');
  assert.ok((await repo.listarCategorias()).length >= 1);
  await conRollback(async () => {
    // Dentro del ROLLBACK: se parte de un par sin relaciones para que el
    // resultado de actualizar/eliminar sea determinista.
    await db.ejecutar('DELETE FROM relacion_agente_categoria WHERE id_agente = $1 AND id_categoria = $2', [agente, cat]);
    await repo.crear({ id_agente: agente, id_categoria: cat, es_principal: false });
    assert.ok(await repo.actualizar(agente, cat, { es_principal: true }));
    assert.ok((await repo.listarPorAgente(agente)).length >= 1);
    assert.ok((await repo.listarPorCategoria(cat)).length >= 1);
    assert.ok(await repo.eliminar(agente, cat));
    assert.equal(await repo.eliminar(agente, cat), null);
  });
});

test('empleado: crear sin habilidades, actualizar sincronizando habilidades y desactivar', async () => {
  const { default: Repo } = await import('../src/repositories/empleadoRepository.js');
  const repo = new Repo();
  const habilidadesDe = (id) => valor('SELECT count(*)::int FROM habilidades WHERE id_empleado = $1', [id]);
  await conRollback(async () => {
    // correo, celular y numero_empleado son UNIQUE
    const datos = await copiaDe('empleado', 'id_empleado',
      { correo: '__prueba__@test.local', celular: '__prueba__', numero_empleado: 'ZZ9999', nombre_pila: '__prueba__' });
    await repo.crear({ ...datos, habilidades: ['se ignora'] });
    const id = await valor("SELECT id_empleado FROM empleado WHERE correo = '__prueba__@test.local'");
    assert.equal(await habilidadesDe(id), 0, 'crear() no guarda habilidades');
    await repo.actualizar(id, { cargo: 'c', habilidades: ['a', 'b'] });
    assert.equal(await valor('SELECT cargo FROM empleado WHERE id_empleado = $1', [id]), 'c');
    assert.equal(await habilidadesDe(id), 2);
    await repo.actualizar(id, { departamento: 'd', habilidades: [] });
    assert.equal(await habilidadesDe(id), 0);
    assert.ok((await repo.obtenerEmpleadosSinUsuario()).length >= 1);
    await repo.desactivar(id);
    assert.equal(await valor('SELECT activo FROM empleado WHERE id_empleado = $1', [id]), false);
  });
});

test('usuario_proyecto: crear, consultar, eliminar y errores 409/404', async () => {
  const { default: Repo } = await import('../src/repositories/usuarioProyectoRepository.js');
  const repo = new Repo();
  const par = await db.uno(`
    SELECT u.id_usuario, p.id_proyecto FROM usuarios u CROSS JOIN proyecto p
    WHERE NOT EXISTS (SELECT 1 FROM usuario_proyecto up WHERE up.id_usuario = u.id_usuario AND up.id_proyecto = p.id_proyecto)
    ORDER BY 1, 2 LIMIT 1`);
  assert.ok((await repo.obtenerTodos()).length >= 1);
  await conRollback(async () => {
    await repo.crear(par);
    assert.equal(await repo.existe(par.id_usuario, par.id_proyecto), true);
    assert.ok((await repo.obtenerPorIdProyecto(par.id_proyecto)).some((u) => u.id_usuario === par.id_usuario));
    assert.ok((await repo.obtenerPorIdUsuario(par.id_usuario)).some((p) => p.id_proyecto === par.id_proyecto));
    assert.ok((await repo.obtenerEstadisticas()).total_relaciones >= 1);
    await repo.eliminar(par.id_usuario, par.id_proyecto);
    await assert.rejects(repo.eliminar(par.id_usuario, par.id_proyecto), esApiError(404, 'no encontrada'));
  });
  await assert.rejects(db.transaccion(async () => { await repo.crear(par); await repo.crear(par); }),
    esApiError(409, 'ya existe'));
  await assert.rejects(db.transaccion(() => repo.crear({ id_usuario: par.id_usuario, id_proyecto: 999999 })),
    esApiError(404, 'no encontrado'));
  await conRollback(async () => {
    assert.equal((await repo.crearMultiples(par.id_usuario, [par.id_proyecto])).length, 1);
    assert.ok((await repo.eliminarPorUsuario(par.id_usuario)).length >= 1);
  });
});

test('usuario: crear, consultar, actualizaciones, eliminar y alias duplicado', async () => {
  const { default: Repo } = await import('../src/repositories/usuarioRepository.js');
  const repo = new Repo();
  const [emp] = await dosEmpleados();
  await conRollback(async () => {
    await repo.crear({ alias: '__prueba__', password_hash: 'x', tipo: 'VISITANTE' });
    const id = await valor("SELECT id_usuario::text FROM usuarios WHERE alias = '__prueba__'");
    assert.ok(await repo.obtenerPorAlias('__prueba__'));
    assert.equal(await repo.existeAlias('__prueba__'), true);
    assert.equal(await repo.existeAlias('__prueba__', id), false);
    assert.ok(await repo.actualizar(id, { alias: '__prueba2__' }));
    assert.ok(await repo.cambiarEstadoActivo(id, false));
    assert.ok(await repo.actualizarTipo(id, 'EDITOR'));
    assert.ok(await repo.asignarEmpleado(id, emp));
    assert.ok(await repo.actualizarImagen(id, 'http://x/y.png'));
    await repo.updateUserImage(id, 'http://x/z.png');
    assert.equal(await valor('SELECT image FROM usuarios WHERE id_usuario = $1', [id]), 'http://x/z.png');
    assert.ok((await repo.obtenerTodos({ tipo: 'EDITOR', activo: false })).length >= 1);
    assert.ok(await repo.eliminar(id));
    // Sin fila, como con .single(): 500 con el prefijo del método
    await assert.rejects(repo.eliminar(id), esApiError(500, 'Error al eliminar usuario'));
    await assert.rejects(repo.cambiarEstadoActivo(id, true), esApiError(500, 'Error al cambiar estado del usuario'));
  });
  await assert.rejects(db.transaccion(async () => {
    await repo.crear({ alias: '__prueba__', password_hash: 'x', tipo: 'VISITANTE' });
    await repo.crear({ alias: '__prueba__', password_hash: 'x', tipo: 'VISITANTE' });
  }), esApiError(400, 'El alias ya está en uso'));
  assert.ok((await repo.obtenerEstadisticas()).total >= 1);
});

test('authService: login, registro y obtenerUsuarioPorId', async () => {
  const { default: AuthService } = await import('../src/services/authService.js');
  const { default: bcrypt } = await import('bcryptjs');
  const auth = new AuthService();
  await conRollback(async () => {
    const hash = await bcrypt.hash('Clave1234', 4);
    await db.consulta("INSERT INTO usuarios (alias, password_hash, tipo) VALUES ('__prueba_login__', $1, 'VISITANTE') RETURNING id_usuario", [hash]);
    const r = await auth.login('__prueba_login__', 'Clave1234');
    assert.ok(r.token);
    assert.equal(r.usuario.password_hash, undefined);
    assert.deepEqual(r.usuario.proyectos, []);
    await assert.rejects(auth.login('__prueba_login__', 'mala'), esApiError(401, 'Credenciales inválidas'));
    await assert.rejects(auth.login('__no_existe__', 'x'), esApiError(401));

    const reg = await auth.registro({ alias: '__prueba_reg__', password: 'Clave1234', tipo: 'VISITANTE' });
    assert.ok(reg.token);
    assert.equal(reg.usuario.alias, '__prueba_reg__');
    assert.equal(reg.usuario.password_hash, undefined);
    await assert.rejects(auth.registro({ alias: '__prueba_reg__', password: 'Clave1234', tipo: 'VISITANTE' }),
      esApiError(400, 'ya está registrado'));
    assert.equal((await auth.obtenerUsuarioPorId(reg.usuario.id_usuario)).alias, '__prueba_reg__');
  });
  await assert.rejects(auth.obtenerUsuarioPorId('00000000-0000-0000-0000-000000000000'), esApiError(404));
  await assert.rejects(auth.obtenerUsuarioPorId('no-es-uuid'), esApiError(404));
});
