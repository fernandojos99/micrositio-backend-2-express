import supabase from '../config/supabaseClient.js';
import ApiError from '../utils/ApiError.js';
import NodePosition from '../models/NodePosition.js';

class NodePositionRepository {
  async obtenerPorSecuencia(id_secuencia) {
    const { data, error } = await supabase
      .from('node_positions')
      .select('*')
      .eq('id_secuencia', id_secuencia);

    if (error) throw new ApiError(error.message, 500);
    return data.map(row => new NodePosition(row));
  }

  async upsert(nodePositionData) {
    const { data, error } = await supabase
      .from('node_positions')
      .upsert([nodePositionData], { onConflict: ['id_secuencia', 'node_type', 'node_id'] })
      .select()
      .single();

    if (error) throw new ApiError(error.message, 500);
    return new NodePosition(data);
  }

  async eliminarPorSecuencia(id_secuencia) {
    const { data, error } = await supabase
      .from('node_positions')
      .delete()
      .eq('id_secuencia', id_secuencia);

    if (error) throw new ApiError(error.message, 500);
    return data;
  }

  async crear(nodePositionData) {
    const { data, error } = await supabase
      .from('node_positions')
      .insert(nodePositionData)
      .select()
      .single();

    if (error) throw new ApiError(error.message, 500);
    return new NodePosition(data);
  }

  async obtenerPosicionPorId(node_id, node_type, id_secuencia) {
    const { data, error } = await supabase
      .from('node_positions')
      .select('position_x, position_y')
      .eq('node_id', node_id)
      .eq('node_type', node_type)
      .eq('id_secuencia', id_secuencia)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new ApiError('Posición no encontrada', 404);
      }
      throw new ApiError(error.message, 500);
    }
    return data;
  }
}

export default NodePositionRepository;