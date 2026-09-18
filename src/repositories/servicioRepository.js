import { consulta, uno, exigirFila, insertarFilas, actualizarFilas } from '../config/db.js';
import { conMensaje } from '../utils/errorBd.js';
import ApiError from '../utils/ApiError.js';
import Servicio from '../models/Servicio.js';

class ServicioRepository {

  async obtenerPorId(id) {
    const data = await conMensaje('Error al obtener servicio',
      uno('SELECT * FROM servicio WHERE id = $1', [id]));

    return data ? new Servicio(data) : null;
  }

  async obtenerTodos() {
    const data = await conMensaje('Error al obtener servicios',
      consulta('SELECT * FROM servicio ORDER BY id'));

    return data.map(item => new Servicio(item));
  }

  async crear(servicioData) {
    const data = await conMensaje('Error al crear servicio',
      exigirFila(insertarFilas('servicio', servicioData)));

    return new Servicio(data);
  }

  async actualizar(id, updateData) {
    // Sin filas, exigirFila lanza y conMensaje lo convierte en un 500, igual
    // que el `.single()` de antes: el 404 de abajo nunca llegaba a ejecutarse.
    const data = await conMensaje('Error al actualizar servicio',
      exigirFila(actualizarFilas('servicio', {
        ...updateData,
        updated_at: new Date().toISOString()
      }, 'id = $1', [id])));

    if (!data) {
      throw new ApiError(
        'Servicio no encontrado',
        404
      );
    }

    return new Servicio(data);
  }

  async eliminar(id) {
    const data = await conMensaje('Error al eliminar servicio',
      exigirFila(consulta('DELETE FROM servicio WHERE id = $1 RETURNING *', [id])));

    if (!data) {
      throw new ApiError(
        'Servicio no encontrado',
        404
      );
    }

    return new Servicio(data);
  }
}

export default ServicioRepository;
