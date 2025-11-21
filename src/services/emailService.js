// src/services/emailService.js
/**
 * Servicio para el envío de correos electrónicos.
 * Utiliza Nodemailer para enviar notificaciones a los usuarios.
 * @class
 */
import nodemailer from 'nodemailer';
import ApiError from '../utils/ApiError.js';

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  /**
   * Inicializa el transportador de Nodemailer
   * @private
   */
  initializeTransporter() {
    try {
      // Configuración para Gmail
      // En producción, estas credenciales deben estar en variables de entorno
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER || 'tu_email@gmail.com',
          pass: process.env.EMAIL_PASSWORD || 'tu_app_password'
        }
      });

      // Verificar la conexión
      this.transporter.verify((error, success) => {
        if (error) {
          console.warn('Advertencia: No se pudo verificar la configuración de email:', error.message);
        } else {
          console.log('✓ Servicio de email configurado correctamente');
        }
      });
    } catch (error) {
      console.error('Error al inicializar el servicio de email:', error.message);
    }
  }

  /**
   * Envía una notificación al siguiente responsable de un experimento
   * @async
   * @param {Object} datosNotificacion - Datos para la notificación
   * @param {string} datosNotificacion.emailDestinatario - Email del destinatario
   * @param {string} datosNotificacion.nombreDestinatario - Nombre del destinatario
   * @param {string} datosNotificacion.nombreRemitente - Nombre de quien envía la notificación
   * @param {string} datosNotificacion.tituloTestingCardActual - Título de la testing card actual
   * @param {string} datosNotificacion.tituloTestingCardSiguiente - Título de la testing card siguiente (puede ser null)
   * @param {string} datosNotificacion.nombreSecuencia - Nombre de la secuencia
   * @param {string} datosNotificacion.tituloProyecto - Título del proyecto
   * @returns {Promise<Object>} Resultado del envío
   * @throws {ApiError} Si hay errores en el envío
   */
  async enviarNotificacionSiguienteResponsable(datosNotificacion) {
    try {
      const {
        emailDestinatario,
        nombreDestinatario,
        nombreRemitente,
        tituloTestingCardActual,
        tituloTestingCardSiguiente,
        nombreSecuencia,
        tituloProyecto
      } = datosNotificacion;

      // Generar el contenido del email
      const asunto = `Iris Startup - Nueva responsabilidad asignada en ${tituloProyecto}`;
      const contenidoHtml = this.generarTemplateNotificacion(datosNotificacion);

      // Configurar las opciones del email
      const mailOptions = {
        from: `"Iris Startup" <${process.env.EMAIL_USER || 'noreply@irisstart.com'}>`,
        to: emailDestinatario,
        subject: asunto,
        html: contenidoHtml
      };

      // Enviar el email
      const resultado = await this.transporter.sendMail(mailOptions);

      return {
        success: true,
        messageId: resultado.messageId,
        destinatario: emailDestinatario,
        asunto: asunto
      };

    } catch (error) {
      console.error('Error al enviar notificación:', error);
      throw new ApiError(`Error al enviar la notificación por email: ${error.message}`, 500);
    }
  }

  /**
   * Genera el template HTML para la notificación
   * @private
   * @param {Object} datos - Datos para el template
   * @returns {string} HTML del email
   */
  generarTemplateNotificacion(datos) {
    const {
      nombreDestinatario,
      nombreRemitente,
      tituloTestingCardActual,
      tituloTestingCardSiguiente,
      nombreSecuencia,
      tituloProyecto
    } = datos;

    // Determinar el mensaje sobre el siguiente experimento
    const mensajeSiguienteExperimento = tituloTestingCardSiguiente
      ? `para el experimento <strong>"${tituloTestingCardSiguiente}"</strong>`
      : 'aunque <strong>aún falta por definir el siguiente experimento</strong>';

    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Nueva Responsabilidad Asignada</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px; 
          }
          .header { 
            background-color: #4A90E2; 
            color: white; 
            padding: 20px; 
            text-align: center; 
            border-radius: 8px 8px 0 0; 
          }
          .content { 
            background-color: #f9f9f9; 
            padding: 30px; 
            border-radius: 0 0 8px 8px; 
            border: 1px solid #ddd; 
          }
          .highlight { 
            background-color: #E3F2FD; 
            padding: 15px; 
            border-left: 4px solid #4A90E2; 
            margin: 20px 0; 
          }
          .footer { 
            margin-top: 30px; 
            padding-top: 20px; 
            border-top: 1px solid #ddd; 
            font-size: 0.9em; 
            color: #666; 
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🚀 Iris Startup</h1>
          <p>Notificación de Nueva Responsabilidad</p>
        </div>
        
        <div class="content">
          <p>Hola <strong>${nombreDestinatario}</strong>,</p>
          
          <p>Se han realizado cambios en la página de Iris Startup y queremos informarte que se te ha asignado como líder del siguiente proyecto.</p>
          
          <div class="highlight">
            <h3>📋 Detalles de la Asignación:</h3>
            <ul>
              <li><strong>Proyecto:</strong> ${tituloProyecto}</li>
              <li><strong>Secuencia:</strong> ${nombreSecuencia}</li>
              <li><strong>Experimento actual:</strong> ${tituloTestingCardActual}</li>
              <li><strong>Tu nueva responsabilidad:</strong> Líder del siguiente experimento ${mensajeSiguienteExperimento}</li>
            </ul>
          </div>
          
          <p>Te has asignado la responsabilidad del siguiente experimento desde <strong>"${tituloTestingCardActual}"</strong> ${mensajeSiguienteExperimento} de la secuencia <strong>"${nombreSecuencia}"</strong>, del proyecto <strong>"${tituloProyecto}"</strong>.</p>
          
          <p>Por favor, accede a la plataforma para revisar los detalles y comenzar con tu nueva responsabilidad.</p>
          
          <div class="footer">
            <p><em>Esta notificación ha sido realizada por <strong>${nombreRemitente}</strong>.</em></p>
            <p>---<br>
            Equipo Iris Startup<br>
            Este es un mensaje automático, por favor no responder a este correo.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Verifica si el servicio de email está configurado correctamente
   * @returns {boolean} True si está configurado
   */
  isConfigured() {
    return this.transporter !== null;
  }
}

export default EmailService;
