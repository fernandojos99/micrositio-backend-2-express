// src/controllers/plantillaSecuenciaController.js
import plantillaSecuenciaService from '../services/plantillaSecuenciaService.js';
import ApiError from '../utils/ApiError.js';

class PlantillaSecuenciaController {
  /**
   * Obtiene una plantilla secuencia por su ID
   * @route GET /api/plantilla-secuencia/:id
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async obtenerPorId(req, res, next) {
    try {
      const { id } = req.params;
      
      if (!id) {
        throw new ApiError('ID de plantilla secuencia es requerido', 400);
      }

      const plantillaSecuencia = await plantillaSecuenciaService.obtenerPorId(id);

      res.status(200).json({
        success: true,
        message: 'Plantilla secuencia obtenida exitosamente',
        data: plantillaSecuencia
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtiene todas las plantillas secuencia
   * @route GET /api/plantilla-secuencia
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async obtenerTodas(req, res, next) {
    try {
      const plantillasSecuencia = await plantillaSecuenciaService.obtenerTodas();

      res.status(200).json({
        success: true,
        message: 'Plantillas secuencia obtenidas exitosamente',
        data: plantillasSecuencia,
        total: plantillasSecuencia.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Crea una nueva plantilla secuencia
   * @route POST /api/plantilla-secuencia
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async crear(req, res, next) {
    try {
      const datosPlantillaSecuencia = req.body;

      const nuevaPlantillaSecuencia = await plantillaSecuenciaService.crear(datosPlantillaSecuencia);

      res.status(201).json({
        success: true,
        message: 'Plantilla secuencia creada exitosamente',
        data: nuevaPlantillaSecuencia
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Actualiza una plantilla secuencia existente
   * @route PUT /api/plantilla-secuencia/:id
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async actualizar(req, res, next) {
    try {
      const { id } = req.params;
      const datosActualizacion = req.body;

      if (!id) {
        throw new ApiError('ID de plantilla secuencia es requerido', 400);
      }

      if (!datosActualizacion || Object.keys(datosActualizacion).length === 0) {
        throw new ApiError('Datos de actualización son requeridos', 400);
      }

      const plantillaSecuenciaActualizada = await plantillaSecuenciaService.actualizar(id, datosActualizacion);

      res.status(200).json({
        success: true,
        message: 'Plantilla secuencia actualizada exitosamente',
        data: plantillaSecuenciaActualizada
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Elimina una plantilla secuencia y su secuencia copiada asociada
   * @route DELETE /api/plantilla-secuencia/:id
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async eliminar(req, res, next) {
    try {
      const { id } = req.params;

      if (!id) {
        throw new ApiError('ID de plantilla secuencia es requerido', 400);
      }

      const resultado = await plantillaSecuenciaService.eliminar(id);

      res.status(200).json({
        success: true,
        message: resultado.message,
        data: resultado.eliminado
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Aplica una plantilla secuencia a una secuencia existente
   * @route PATCH /api/plantilla-secuencia/aplicar-plantilla
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
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

export default new PlantillaSecuenciaController();
