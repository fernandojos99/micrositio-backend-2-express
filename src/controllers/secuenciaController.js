import SecuenciaService from '../services/secuenciaService.js';
import SecuenciaRepository from '../repositories/secuenciaRepository.js';
import ProyectoRepository from '../repositories/proyectoRepository.js';
import TestingCardRepository from '../repositories/testingCardRepository.js';
import plantillaSecuenciaService from '../services/plantillaSecuenciaService.js';
import { secuenciaCreateSchema, secuenciaUpdateSchema } from '../middlewares/validation/secuenciaSchema.js';
import { success, created, noContent } from '../utils/responseHelper.js';
import ApiError from '../utils/ApiError.js';
import { getPaginationParams } from '../utils/paginationHelper.js';

class SecuenciaController {
  constructor() {
    const secuenciaRepository = new SecuenciaRepository();
    const proyectoRepository = new ProyectoRepository();
    const testingCardRepository = new TestingCardRepository();

    this.secuenciaService = new SecuenciaService(
      secuenciaRepository,
      proyectoRepository,
      testingCardRepository
    );
  }

  /**
   * Obtiene todas las secuencias o filtra por proyecto
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   * @param {Function} next - Next middleware
   */
  async obtenerTodas(req, res, next) {
    try {
      const { page, limit } = getPaginationParams(req);
      const idProyecto = req.query.proyectoId;

      if (idProyecto) {
        const secuencias = await this.secuenciaService.obtenerPorProyecto(Number(idProyecto));
        return success(res, secuencias);
      }

      const secuencias = await this.secuenciaService.obtenerTodas();
      const total = secuencias.length;
      success(res, secuencias, { page, limit, total, totalPages: Math.ceil(total / limit) });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtiene una secuencia por su ID
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   * @param {Function} next - Next middleware
   */
  async obtenerPorId(req, res, next) {
    try {
      const { id } = req.params;

      if (!id) {
        throw new ApiError('Se requiere el parámetro "id" en la ruta', 400);
      }

      const secuencia = await this.secuenciaService.obtenerPorId(id);
      success(res, secuencia);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Crea una nueva secuencia
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   * @param {Function} next - Next middleware
   */
  async crear(req, res, next) {
    try {
      const validatedData = secuenciaCreateSchema.parse(req.body);
      const secuencia = await this.secuenciaService.crear(validatedData);
      created(res, secuencia);
    } catch (error) {
      next(new ApiError(error.message, 400));
    }
  }

  /**
   * Actualiza una secuencia existente
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   * @param {Function} next - Next middleware
   */
  async actualizar(req, res, next) {
    try {
      const id = req.params.id;

      if (!id) {
        throw new ApiError('Se requiere el campo "id" en la ruta', 400);
      }

      const validatedData = secuenciaUpdateSchema.parse(req.body);
      const secuencia = await this.secuenciaService.actualizar(id, validatedData);
      success(res, secuencia);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Elimina una secuencia
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   * @param {Function} next - Next middleware
   */
  async eliminar(req, res, next) {
    try {
      const id = req.params.id;

      if (!id) {
        throw new ApiError('Se requiere el campo "id" en la ruta', 400);
      }

      await this.secuenciaService.eliminar(id);
      noContent(res);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Aplica una plantilla secuencia a una secuencia existente
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   * @param {Function} next - Next middleware
   */
  async aplicarPlantilla(req, res, next) {
    try {
      const id = req.params.id;
      const { id_plantilla_secuencia } = req.body;

      if (!id || !id_plantilla_secuencia) {
        throw new ApiError('id_secuencia e id_plantilla_secuencia son requeridos', 400);
      }

      const resultado = await plantillaSecuenciaService.aplicarPlantilla(id, id_plantilla_secuencia);

      success(res, resultado, { message: 'Plantilla aplicada exitosamente a la secuencia' });
    } catch (error) {
      next(error);
    }
  }
}

export default SecuenciaController;
