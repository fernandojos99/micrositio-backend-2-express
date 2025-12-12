import NodePositionService from '../services/nodePositionService.js';
import NodePositionRepository from '../repositories/nodePositionRepository.js';
import SecuenciaRepository from '../repositories/secuenciaRepository.js';
import LearningCardRepository from '../repositories/learningCardRepository.js';
import TestingCardRepository from '../repositories/testingCardRepository.js';
import { upsertNodePositionSchema } from '../middlewares/validation/nodePositionSchema.js';
import ApiError from '../utils/ApiError.js';
import { supabase } from '../config/database.js';

class NodePositionController {
  constructor() {
    const nodePositionRepository = new NodePositionRepository();
    const secuenciaRepository = new SecuenciaRepository();
    const learningCardRepository = new LearningCardRepository();
    const testingCardRepository = new TestingCardRepository();

    this.nodePositionService = new NodePositionService(
      nodePositionRepository,
      secuenciaRepository,
      learningCardRepository,
      testingCardRepository
    );
  }

  /**
   * Obtiene todas las posiciones de una secuencia
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   * @param {Function} next - Next middleware
   */
  async obtenerPorSecuencia(req, res, next) {
    try {
      const { id_secuencia } = req.params;

      if (!id_secuencia) {
        throw new ApiError('Se requiere el parámetro "id_secuencia"', 400);
      }

      const posiciones = await this.nodePositionService.obtenerPorSecuencia(Number(id_secuencia));
      res.json(posiciones);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Crea o actualiza la posición de un nodo
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   * @param {Function} next - Next middleware
   */
  async upsert(req, res, next) {
    try {
      const validatedData = upsertNodePositionSchema.parse(req.body);
      const nodePosition = await this.nodePositionService.upsert(validatedData);
      res.status(201).json(nodePosition);
    } catch (error) {
      next(new ApiError(error.message, 400));
    }
  }

  /**
   * Elimina todas las posiciones de una secuencia
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   * @param {Function} next - Next middleware
   */
  async eliminarPorSecuencia(req, res, next) {
    try {
      const { id_secuencia } = req.params;

      if (!id_secuencia) {
        throw new ApiError('Se requiere el parámetro "id_secuencia"', 400);
      }

      await this.nodePositionService.eliminarPorSecuencia(Number(id_secuencia));
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtiene una posición específica de un nodo por sus identificadores
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   */
  async getPositionByIdentifiers(req, res) {
    try {
      const { node_id, node_type, id_secuencia } = req.params;

      const { data, error } = await supabase
        .from('node_positions')
        .select('position_x, position_y')
        .eq('node_id', node_id)
        .eq('node_type', node_type)
        .eq('id_secuencia', id_secuencia)
        .single();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      if (!data) {
        return res.status(404).json({ message: 'Position not found' });
      }

      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Obtiene todas las posiciones de nodos
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   */
  async getAllNodePositions(req, res) {
    try {
      const { data, error } = await supabase
        .from('node_positions')
        .select('*');

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default NodePositionController;