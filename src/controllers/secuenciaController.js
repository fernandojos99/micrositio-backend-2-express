// src/controllers/secuenciaController.js
import SecuenciaService from '../services/secuenciaService.js';
import SecuenciaRepository from '../repositories/secuenciaRepository.js';
import ProyectoRepository from '../repositories/proyectoRepository.js';
import TestingCardRepository from '../repositories/testingCardRepository.js';
import plantillaSecuenciaService from '../services/plantillaSecuenciaService.js';
import Secuencia from '../models/Secuencia.js';
import { secuenciaCreateSchema, secuenciaUpdateSchema } from '../middlewares/validation/secuenciaSchema.js';
import ApiError from '../utils/ApiError.js';

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
   * Obtiene secuencias por proyecto
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   * @param {Function} next - Next middleware
   */
  async obtenerPorProyecto(req, res, next) {
    try {
      // Leer desde query params en lugar de body
      const id_proyecto = Number(req.query.id_proyecto);

      if (!id_proyecto) {
        throw new ApiError('Se requiere el parámetro "id_proyecto"', 400);
      }

      const secuencias = await this.secuenciaService.obtenerPorProyecto(id_proyecto);
      res.json(secuencias);
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
      res.json(secuencia);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtiene todas las secuencias
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   * @param {Function} next - Next middleware
   */
  async obtenerTodas(req, res, next) {
    try {
      const secuencias = await this.secuenciaService.obtenerTodas();
      res.json(secuencias);
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
      res.status(201).json(secuencia);
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
      if (!req.body.id_secuencia) {
        throw new ApiError('Se requiere el campo "id_secuencia" en el body', 400);
      }

      const { id_secuencia, ...updateData } = req.body;
      const validatedData = secuenciaUpdateSchema.parse(updateData);
      const secuencia = await this.secuenciaService.actualizar(id_secuencia, validatedData);
      res.json(secuencia);
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
      if (!req.body.id_secuencia) {
        throw new ApiError('Se requiere el campo "id_secuencia" en el body', 400);
      }

      await this.secuenciaService.eliminar(req.body.id_secuencia);
      res.status(204).end();
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
      const { id_secuencia, id_plantilla_secuencia } = req.body;

      if (!id_secuencia || !id_plantilla_secuencia) {
        throw new ApiError('id_secuencia e id_plantilla_secuencia son requeridos', 400);
      }

      const resultado = await plantillaSecuenciaService.aplicarPlantilla(id_secuencia, id_plantilla_secuencia);

      res.status(200).json({
        success: true,
        message: 'Plantilla aplicada exitosamente a la secuencia',
        data: resultado
      });
    } catch (error) {
      next(error);
    }
  }
}

export default SecuenciaController;