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
}

export default NodePositionRepository;