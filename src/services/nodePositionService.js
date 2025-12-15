import ApiError from '../utils/ApiError.js';

class NodePositionService {
  constructor(nodePositionRepository, secuenciaRepository, learningCardRepository, testingCardRepository) {
    this.repo = nodePositionRepository;
    this.secuenciaRepo = secuenciaRepository;
    this.learningRepo = learningCardRepository;
    this.testingRepo = testingCardRepository;
  }

  async obtenerPorSecuencia(id_secuencia) {
    return this.repo.obtenerPorSecuencia(id_secuencia);
  }

  async upsert(nodePositionData) {
    // Validar existencia de la secuencia
    const secuencia = await this.secuenciaRepo.obtenerPorId(nodePositionData.id_secuencia);
    if (!secuencia) {
      throw new ApiError('La secuencia no existe', 404);
    }

    // Validar existencia del nodo según el tipo
    if (nodePositionData.node_type === 'learning') {
      const learning = await this.learningRepo.obtenerPorId(nodePositionData.node_id);
      if (!learning) {
        throw new ApiError('La learning card no existe', 404);
      }
    } else if (nodePositionData.node_type === 'testing') {
      const testing = await this.testingRepo.obtenerPorId(nodePositionData.node_id);
      if (!testing) {
        throw new ApiError('La testing card no existe', 404);
      }
    } else {
      throw new ApiError('Tipo de nodo inválido', 400);
    }

    return this.repo.upsert(nodePositionData);
  }

  async eliminarPorSecuencia(id_secuencia) {
    return this.repo.eliminarPorSecuencia(id_secuencia);
  }

  async obtenerPosicionPorId(node_id, node_type, id_secuencia) {
    return this.repo.obtenerPosicionPorId(node_id, node_type, id_secuencia);
  }
}

export default NodePositionService;