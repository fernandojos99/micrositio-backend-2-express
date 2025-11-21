// src/controllers/notificacionController.js
/**
 * Controlador para manejar las notificaciones del sistema.
 * @class
 */
import NotificacionService from '../services/notificacionService.js';
import { notificacionSiguienteResponsableSchema } from '../middlewares/validation/notificacionSchema.js';
import ApiError from '../utils/ApiError.js';

class NotificacionController {
  constructor() {
    this.notificacionService = new NotificacionService();
  }

  /**
   * Envía una notificación al empleado especificado informándole que ha sido 
   * asignado como siguiente responsable de un experimento.
   * 
   * @async
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   * @param {Function} next - Función para pasar al siguiente middleware
   */
  async enviarNotificacionSiguienteResponsable(req, res, next) {
    try {
      // 1. Validar los datos de entrada
      const datosValidados = notificacionSiguienteResponsableSchema.parse(req.body);
      
      // 2. Preparar los datos para el servicio
      const datosNotificacion = {
        id_empleado: datosValidados.id_empleado,
        id_learning_card: datosValidados.id_learning_card,
        id_empleado_remitente: datosValidados.id_empleado_remitente
      };

      // 3. Enviar la notificación
      const resultado = await this.notificacionService.enviarNotificacionSiguienteResponsable(datosNotificacion);

      // 4. Responder con éxito
      res.status(200).json({
        success: true,
        mensaje: 'Notificación enviada exitosamente',
        data: resultado
      });

    } catch (error) {
      if (error.name === 'ZodError') {
        // Error de validación de datos
        const errores = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
        return next(new ApiError(`Datos inválidos: ${errores}`, 400));
      }
      
      // Otros errores
      next(error);
    }
  }
}

export default NotificacionController;
