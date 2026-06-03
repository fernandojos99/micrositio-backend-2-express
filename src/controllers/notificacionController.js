import NotificacionService from '../services/notificacionService.js';
import { notificacionSiguienteResponsableSchema } from '../middlewares/validation/notificacionSchema.js';
import ApiError from '../utils/ApiError.js';
import { success } from '../utils/responseHelper.js';

class NotificacionController {
  constructor() {
    this.notificacionService = new NotificacionService();
  }

  async enviarNotificacionSiguienteResponsable(req, res, next) {
    const startTime = Date.now();

    try {
      const datosValidados = notificacionSiguienteResponsableSchema.parse(req.body);

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

      const resultado = await Promise.race([
        this.notificacionService.enviarNotificacionSiguienteResponsable(datosNotificacion),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout de 25 segundos excedido')), 25000)
        )
      ]);

      const duration = Date.now() - startTime;
      console.log(`✅ Notificación enviada en ${duration}ms`);

      return success(res, resultado, { message: 'Notificación enviada exitosamente' });

    } catch (error) {
      const duration = Date.now() - startTime;

      console.error('❌ Error en notificación:', {
        error: error.message,
        duration_ms: duration,
        stack: error.stack?.split('\n')[0],
        timestamp: new Date().toISOString()
      });

      if (error.name === 'ZodError') {
        const errores = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
        return next(new ApiError(`Datos inválidos: ${errores}`, 400));
      }

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

      next(error);
    }
  }
}

export default NotificacionController;
