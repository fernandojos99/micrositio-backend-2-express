import { consulta, uno, ejecutar, exigirFila, insertarFilas, upsertFilas } from '../config/db.js';
import { conMensaje } from '../utils/errorBd.js';
import ApiError from '../utils/ApiError.js';
import NodePosition from '../models/NodePosition.js';

// Clave única de node_positions (constraint unique_node_position): una
// posición por nodo y secuencia.
const CLAVE_NODO = ['id_secuencia', 'node_type', 'node_id'];

class NodePositionRepository {
  async obtenerPorSecuencia(id_secuencia) {
    const data = await conMensaje(null,
      consulta('SELECT * FROM node_positions WHERE id_secuencia = $1', [id_secuencia]));

    return data.map(row => new NodePosition(row));
  }

  async upsert(nodePositionData) {
    const data = await conMensaje(null,
      exigirFila(upsertFilas('node_positions', [nodePositionData], CLAVE_NODO)));

    return new NodePosition(data);
  }

  async obtenerTodas() {
    const data = await conMensaje(null, consulta('SELECT * FROM node_positions'));

    return data.map(row => new NodePosition(row));
  }

  async upsertLote(posiciones) {
    const data = await conMensaje(null, upsertFilas('node_positions', posiciones, CLAVE_NODO));

    return data.map(row => new NodePosition(row));
  }

  async eliminarPorSecuencia(id_secuencia) {
    await conMensaje(null,
      ejecutar('DELETE FROM node_positions WHERE id_secuencia = $1', [id_secuencia]));

    // supabase-js devolvía data: null en un delete sin .select()
    return null;
  }

  async crear(nodePositionData) {
    const data = await conMensaje(null,
      exigirFila(insertarFilas('node_positions', nodePositionData)));

    return new NodePosition(data);
  }

  async obtenerPosicionPorId(node_id, node_type, id_secuencia) {
    const data = await conMensaje(null, uno(`
      SELECT position_x, position_y
      FROM node_positions
      WHERE node_id = $1 AND node_type = $2 AND id_secuencia = $3
    `, [node_id, node_type, id_secuencia]));

    if (!data) {
      throw new ApiError('Posición no encontrada', 404);
    }
    return data;
  }
}

export default NodePositionRepository;
