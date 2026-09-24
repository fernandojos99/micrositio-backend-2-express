import { consulta, uno, exigirFila, primeraFila, insertarFilas, actualizarFilas } from '../config/db.js';
import { conMensaje } from '../utils/errorBd.js';
import Sesion from '../models/Sesion.js';

class  SesionRepository {
  async listarPorEmpleado(id_empleado) {
    const data = await conMensaje('Error al listar sesiones',
      consulta('SELECT * FROM sesion WHERE id_empleado = $1 ORDER BY updated_at DESC', [id_empleado]));

    return data.map(sesion => Sesion.fromDatabase(sesion));
  }

  async obtenerPorThreadId(thread_id) {
    const data = await conMensaje('Error al obtener sesión',
      uno('SELECT * FROM sesion WHERE thread_id = $1', [thread_id]));

    return data ? Sesion.fromDatabase(data) : null;
  }

  async crear(data) {
    const resultado = await conMensaje('Error al crear sesión',
      exigirFila(insertarFilas('sesion', {
        id_empleado: data.id_empleado,
        thread_id: data.thread_id
      })));

    return Sesion.fromDatabase(resultado);
  }

  async actualizarActualizado(thread_id) {
    const data = await conMensaje('Error al actualizar sesión',
      primeraFila(actualizarFilas('sesion', { updated_at: new Date().toISOString() }, 'thread_id = $1', [thread_id])));

    return data ? Sesion.fromDatabase(data) : null;
  }

  async actualizarTitulo(thread_id, titulo) {
    const data = await conMensaje('Error al actualizar título de sesión',
      primeraFila(actualizarFilas('sesion', { titulo, updated_at: new Date().toISOString() }, 'thread_id = $1', [thread_id])));

    return data ? Sesion.fromDatabase(data) : null;
  }

  async eliminar(thread_id, id_empleado) {
    const data = await conMensaje('Error al eliminar sesión',
      primeraFila(consulta('DELETE FROM sesion WHERE thread_id = $1 AND id_empleado = $2 RETURNING *', [thread_id, id_empleado])));

    return data ? Sesion.fromDatabase(data) : null;
  }
}

export default SesionRepository;
