/**
 * Repositorio de metrica_accionable.
 * @class
 */
import { consulta, uno, exigirFila, primeraFila, insertarFilas, actualizarFilas } from '../config/db.js';
import { conMensaje } from '../utils/errorBd.js';
import MetricaAccionable from '../models/MetricaAccionable.js';

class MetricaAccionableRepository {
  async obtenerPorId(id) {
    const data = await conMensaje('Error al obtener métrica del accionable',
      uno('SELECT * FROM metrica_accionable WHERE id_metrica_accionable = $1', [id]));

    return data ? new MetricaAccionable(data) : null;
  }

  async obtenerPorAccionable(id_accionable) {
    const data = await conMensaje('Error al obtener métricas del accionable',
      consulta('SELECT * FROM metrica_accionable WHERE id_accionable = $1 ORDER BY id_metrica_accionable',
        [id_accionable]));

    return data.map((fila) => new MetricaAccionable(fila));
  }

  /** Métricas de todos los accionables de un proyecto, para el tablero. */
  async obtenerPorProyecto(id_proyecto) {
    const data = await conMensaje('Error al obtener métricas de accionables del proyecto',
      consulta(`
        SELECT m.*
        FROM metrica_accionable m
        JOIN accionable a ON a.id_accionable = m.id_accionable
        JOIN learning_card lc ON lc.id = a.id_learning_card
        JOIN testing_card tc ON tc.id_testing_card = lc.id_testing_card
        JOIN secuencia s ON s.id_secuencia = tc.id_secuencia
        WHERE s.id_proyecto = $1
        ORDER BY m.id_metrica_accionable`, [id_proyecto]));

    return data.map((fila) => new MetricaAccionable(fila));
  }

  async crear(datos) {
    const data = await conMensaje('Error al crear métrica del accionable',
      exigirFila(insertarFilas('metrica_accionable', datos)));

    return new MetricaAccionable(data);
  }

  async actualizar(id, cambios) {
    const data = await primeraFila(conMensaje('Error al actualizar métrica del accionable',
      actualizarFilas('metrica_accionable', {
        ...cambios,
        updated_at: new Date().toISOString(),
      }, 'id_metrica_accionable = $1', [id])));

    return data ? new MetricaAccionable(data) : null;
  }

  async eliminar(id) {
    const data = await primeraFila(conMensaje('Error al eliminar métrica del accionable',
      consulta('DELETE FROM metrica_accionable WHERE id_metrica_accionable = $1 RETURNING *', [id])));

    return data ? new MetricaAccionable(data) : null;
  }
}

export default MetricaAccionableRepository;
