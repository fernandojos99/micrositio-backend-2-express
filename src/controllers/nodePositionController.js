import NodePositionService from '../services/nodePositionService.js';
import NodePositionRepository from '../repositories/nodePositionRepository.js';
import SecuenciaRepository from '../repositories/secuenciaRepository.js';
import LearningCardRepository from '../repositories/learningCardRepository.js';
import TestingCardRepository from '../repositories/testingCardRepository.js';
import { upsertNodePositionSchema } from '../middlewares/validation/nodePositionSchema.js';
import ApiError from '../utils/ApiError.js';
import supabase from '../config/supabaseClient.js';
import { success, created, noContent, fail } from '../utils/responseHelper.js';

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

  async obtenerPorSecuencia(req, res, next) {
    try {
      const { id_secuencia } = req.params;

      if (!id_secuencia) {
        throw new ApiError('Se requiere el parámetro "id_secuencia"', 400);
      }

      const posiciones = await this.nodePositionService.obtenerPorSecuencia(Number(id_secuencia));
      return success(res, posiciones);
    } catch (error) {
      next(error);
    }
  }

  async upsert(req, res, next) {
    try {
      const validatedData = upsertNodePositionSchema.parse(req.body);
      const nodePosition = await this.nodePositionService.upsert(validatedData);
      return created(res, nodePosition);
    } catch (error) {
      next(new ApiError(error.message, 400));
    }
  }

  async batchUpsert(req, res, next) {
    try {
      const posiciones = req.body;
      if (!Array.isArray(posiciones) || posiciones.length === 0) {
        throw new ApiError('Se requiere un array de posiciones no vacío', 400);
      }
      const results = [];
      for (const pos of posiciones) {
        const validated = upsertNodePositionSchema.parse(pos);
        const result = await this.nodePositionService.upsert(validated);
        results.push(result);
      }
      return created(res, results);
    } catch (error) {
      next(new ApiError(error.message, 400));
    }
  }

  async eliminarPorSecuencia(req, res, next) {
    try {
      const { id_secuencia } = req.params;

      if (!id_secuencia) {
        throw new ApiError('Se requiere el parámetro "id_secuencia"', 400);
      }

      await this.nodePositionService.eliminarPorSecuencia(Number(id_secuencia));
      return noContent(res);
    } catch (error) {
      next(error);
    }
  }

  async obtenerPosicionPorId(req, res, next) {
    try {
      const { node_id, node_type, id_secuencia } = req.params;

      if (!node_id || !node_type || !id_secuencia) {
        throw new ApiError('Se requieren los parámetros node_id, node_type e id_secuencia', 400);
      }

      const posicion = await this.nodePositionService.obtenerPosicionPorId(node_id, node_type, Number(id_secuencia));
      return success(res, posicion);
    } catch (error) {
      next(error);
    }
  }

  async getAllNodePositions(req, res) {
    try {
      const { data, error } = await supabase
        .from('node_positions')
        .select('*');

      if (error) {
        return fail(res, { message: error.message });
      }

      return success(res, data);
    } catch (error) {
      return fail(res, { message: error.message, statusCode: 500 });
    }
  }
}

export default NodePositionController;
