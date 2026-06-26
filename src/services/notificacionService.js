// src/services/notificacionService.js
/**
 * Servicio para manejar las notificaciones del sistema.
 * @class
 */
import EmpleadoRepository from '../repositories/empleadoRepository.js';
import LearningCardRepository from '../repositories/learningCardRepository.js';
import TestingCardRepository from '../repositories/testingCardRepository.js';
import SecuenciaRepository from '../repositories/secuenciaRepository.js';
import ProyectoRepository from '../repositories/proyectoRepository.js';


import EmailService from './emailService.js';
import ApiError from '../utils/ApiError.js';

class NotificacionService {
  constructor() {
    this.empleadoRepo = new EmpleadoRepository();
    this.learningCardRepo = new LearningCardRepository();
    this.testingCardRepo = new TestingCardRepository();
    this.secuenciaRepo = new SecuenciaRepository();
    this.proyectoRepo = new ProyectoRepository();
    this.emailService = new EmailService();
  }

  /**
   * Envía notificación al siguiente responsable
   * @async
   * @param {Object} datos - Datos de la notificación
   * @param {number} datos.id_empleado - ID del empleado que recibirá la notificación
   * @param {number} datos.id_learning_card - ID de la learning card
   * @param {number} datos.id_empleado_remitente - ID del empleado que envía (desde JWT)
   * @returns {Promise<Object>} Resultado del envío
   * @throws {ApiError} Si hay errores en el proceso
   */
  async enviarNotificacionSiguienteResponsable(datos) {
    const { id_empleado, id_learning_card, id_empleado_remitente } = datos;

    try {
      // 1. Obtener información del empleado destinatario
      const empleadoDestinatario = await this.empleadoRepo.obtenerPorId(id_empleado);
      if (!empleadoDestinatario) {
        throw new ApiError('Empleado destinatario no encontrado', 404);
      }

      if (!empleadoDestinatario.correo) {
        throw new ApiError('El empleado no tiene correo electrónico registrado', 400);
      }

      // 2. Obtener información del empleado remitente
      const empleadoRemitente = await this.empleadoRepo.obtenerPorId(id_empleado_remitente);
      if (!empleadoRemitente) {
        throw new ApiError('Empleado remitente no encontrado', 404);
        
      }

      // 3. Obtener la learning card
      const learningCard = await this.learningCardRepo.obtenerPorId(id_learning_card);
      if (!learningCard) {
        throw new ApiError('Learning card no encontrada', 404);
      }

      // 4. Obtener la testing card asociada
      const testingCardActual = await this.testingCardRepo.obtenerPorId(learningCard.id_testing_card);
      if (!testingCardActual) {
        throw new ApiError('Testing card asociada no encontrada', 404);
      }

      // 5. Obtener información de secuencia y proyecto
      const secuencia = await this.secuenciaRepo.obtenerPorId(testingCardActual.id_secuencia);
      if (!secuencia) {
        throw new ApiError('Secuencia no encontrada', 404);
      }

      const proyecto = await this.proyectoRepo.obtenerPorId(secuencia.id_proyecto);
      if (!proyecto) {
        throw new ApiError('Proyecto no encontrado', 404);
      }

      // 6. Buscar testing card hija (siguiente experimento)
      let testingCardSiguiente = null;
      try {
        const testingCardsHijas = await this.testingCardRepo.obtenerPorPadre(testingCardActual.id_testing_card);
        if (testingCardsHijas && testingCardsHijas.length > 0) {
          // Tomar la primera testing card hija
          testingCardSiguiente = testingCardsHijas[0];
        }
      } catch (error) {
        // Si no hay testing cards hijas, continuar sin error
        console.log('No se encontraron testing cards hijas para:', testingCardActual.id_testing_card);
      }

      // 7. Preparar datos para el email
      const datosEmail = {
        emailDestinatario: empleadoDestinatario.correo,
        nombreDestinatario: `${empleadoDestinatario.nombre_pila} ${empleadoDestinatario.apellido_paterno}`,
        nombreRemitente: `${empleadoRemitente.nombre_pila} ${empleadoRemitente.apellido_paterno}`,
        tituloTestingCardActual: testingCardActual.titulo,
        tituloTestingCardSiguiente: testingCardSiguiente ? testingCardSiguiente.titulo : null,
        nombreSecuencia: secuencia.nombre,
        tituloProyecto: proyecto.titulo
      };

      // 8. Enviar el email
      const resultadoEmail = await this.emailService.enviarNotificacionSiguienteResponsable(datosEmail);

      return {
        success: true,
        mensaje: 'Notificación enviada exitosamente',
        detalles: {
          destinatario: {
            nombre: datosEmail.nombreDestinatario,
            email: datosEmail.emailDestinatario
          },
          remitente: {
            nombre: datosEmail.nombreRemitente
          },
          proyecto: datosEmail.tituloProyecto,
          secuencia: datosEmail.nombreSecuencia,
          experimentoActual: datosEmail.tituloTestingCardActual,
          experimentoSiguiente: datosEmail.tituloTestingCardSiguiente || 'Por definir',
          email: {
            messageId: resultadoEmail.messageId,
            enviado: true
          }
        }
      };

    } catch (error) {
      console.error('Error en notificacionService:', error);
      
      // Re-throw ApiErrors, wrap other errors
      if (error instanceof ApiError) {
        throw error;
      } else {
        throw new ApiError(`Error interno al procesar la notificación: ${error.message}`, 500);
      }
    }
  }
}

export default NotificacionService;
