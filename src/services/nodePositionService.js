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

  async obtenerTodas() {
    return this.repo.obtenerTodas();
  }

  /**
   * Guarda un lote de posiciones en una sola operación.
   *
   * Valida las mismas precondiciones que `upsert` (que existan la secuencia y
   * cada nodo referenciado), pero deduplicando y en paralelo: el front manda
   * decenas de nodos de la misma secuencia y antes hacía una petición HTTP por
   * cada uno.
   */
  async upsertLote(posiciones) {
    const idsSecuencia = [...new Set(posiciones.map(p => p.id_secuencia))];
    const idsTesting = [...new Set(posiciones.filter(p => p.node_type === 'testing').map(p => p.node_id))];
    const idsLearning = [...new Set(posiciones.filter(p => p.node_type === 'learning').map(p => p.node_id))];

    const [secuencias, testings, learnings] = await Promise.all([
      Promise.all(idsSecuencia.map(id => this.secuenciaRepo.obtenerPorId(id))),
      Promise.all(idsTesting.map(id => this.testingRepo.obtenerPorId(id))),
      Promise.all(idsLearning.map(id => this.learningRepo.obtenerPorId(id))),
    ]);

    const faltaSecuencia = idsSecuencia.filter((_, i) => !secuencias[i]);
    if (faltaSecuencia.length > 0) {
      throw new ApiError(`No existe la secuencia: ${faltaSecuencia.join(', ')}`, 404);
    }

    const faltaTesting = idsTesting.filter((_, i) => !testings[i]);
    if (faltaTesting.length > 0) {
      throw new ApiError(`No existe la testing card: ${faltaTesting.join(', ')}`, 404);
    }

    const faltaLearning = idsLearning.filter((_, i) => !learnings[i]);
    if (faltaLearning.length > 0) {
      throw new ApiError(`No existe la learning card: ${faltaLearning.join(', ')}`, 404);
    }

    return this.repo.upsertLote(posiciones);
  }

  async eliminarPorSecuencia(id_secuencia) {
    return this.repo.eliminarPorSecuencia(id_secuencia);
  }

  async obtenerPosicionPorId(node_id, node_type, id_secuencia) {
    return this.repo.obtenerPosicionPorId(node_id, node_type, id_secuencia);
  }
}

export default NodePositionService;