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
    const startTime = Date.now();
    
    try {
      // 1. Validar los datos de entrada
      const datosValidados = notificacionSiguienteResponsableSchema.parse(req.body);
      
      // 2. Preparar los datos para el servicio
      const datosNotificacion = {
        id_empleado: datosValidados.id_empleado,
        id_learning_card: datosValidados.id_learning_card,
        id_empleado_remitente: datosValidados.id_empleado_remitente
      };

      console.log('📧 Intentando enviar notificación...', {
        timestamp: new Date().toISOString(),
        empleado: datosValidados.id_empleado,
        environment: process.env.NODE_ENV
      });

      // 3. Enviar la notificación con timeout propio
      const resultado = await Promise.race([
        this.notificacionService.enviarNotificacionSiguienteResponsable(datosNotificacion),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout de 25 segundos excedido')), 25000)
        )
      ]);

      const duration = Date.now() - startTime;

      // 4. Responder con éxito
      res.status(200).json({
        success: true,
        mensaje: 'Notificación enviada exitosamente',
        data: resultado,
        debug: process.env.NODE_ENV === 'development' ? {
          duration_ms: duration,
          timestamp: new Date().toISOString()
        } : undefined
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      
      console.error('❌ Error en notificación:', {
        error: error.message,
        duration_ms: duration,
        stack: error.stack?.split('\n')[0],
        timestamp: new Date().toISOString()
      });

      if (error.name === 'ZodError') {
        // Error de validación de datos
        const errores = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
        return next(new ApiError(`Datos inválidos: ${errores}`, 400));
      }
      
      // Mejorar mensaje de error para timeout
      if (error.message.includes('timeout') || error.message.includes('Timeout')) {
        return next(new ApiError(
          'El servicio de email está tardando demasiado. Posible causa: servicio en sleep o problemas de red',
          503,
          {
            causa_probable: 'Render service en sleep o Gmail bloqueado',
            duracion_intento_ms: duration,
            recomendacion: 'Usar SendGrid o mantener servicio activo con UptimeRobot'
          }
        ));
      }
      
      // Otros errores
      next(error);
    }
  }
}

export default NotificacionController;
