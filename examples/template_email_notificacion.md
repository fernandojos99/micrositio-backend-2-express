# Template de Correo - Notificación Siguiente Responsable

Este es un boceto del correo que se envía cuando se asigna a un empleado como responsable del siguiente experimento.

## Variables que se utilizan en el template:

- **{nombreDestinatario}**: Nombre completo del empleado que recibe la notificación
- **{nombreRemitente}**: Nombre completo del empleado que envía la notificación  
- **{tituloProyecto}**: Título del proyecto
- **{nombreSecuencia}**: Nombre de la secuencia
- **{tituloTestingCardActual}**: Título del experimento actual (testing card)
- **{tituloTestingCardSiguiente}**: Título del siguiente experimento (puede ser null)
- **{emailDestinatario}**: Correo electrónico del destinatario

## Estructura del Correo:

### Asunto:
```
Iris Startup - Nueva responsabilidad asignada en {tituloProyecto}
```

### Contenido HTML:
El correo incluye:
1. **Header**: Logo e identificación de Iris Startup
2. **Saludo personalizado**: Con el nombre del destinatario
3. **Mensaje principal**: Explicación de la nueva responsabilidad
4. **Detalles destacados**: 
   - Proyecto
   - Secuencia  
   - Experimento actual
   - Siguiente experimento (o mensaje de "por definir")
5. **Call to action**: Invitación a acceder a la plataforma
6. **Footer**: Información del remitente y nota de mensaje automático

## Configuración de Email:

### Variables de entorno necesarias:
```
EMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=tu_app_password_de_gmail
```

### Tipo de servicio:
- **Servicio**: Gmail
- **Método**: Nodemailer con OAuth2 o App Password
- **Seguridad**: TLS/SSL habilitado

## Ejemplo de correo generado:

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Nueva Responsabilidad Asignada</title>
</head>
<body>
    <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background-color: #4A90E2; color: white; padding: 20px; text-align: center;">
            <h1>🚀 Iris Startup</h1>
            <p>Notificación de Nueva Responsabilidad</p>
        </div>
        
        <div style="background-color: #f9f9f9; padding: 30px;">
            <p>Hola <strong>Juan Pérez</strong>,</p>
            
            <p>Se han realizado cambios en la página de Iris Startup y queremos informarte que se te ha asignado como líder del siguiente proyecto.</p>
            
            <div style="background-color: #E3F2FD; padding: 15px; border-left: 4px solid #4A90E2;">
                <h3>📋 Detalles de la Asignación:</h3>
                <ul>
                    <li><strong>Proyecto:</strong> Sistema de Gestión Empresarial</li>
                    <li><strong>Secuencia:</strong> Fase de Testing Alpha</li>
                    <li><strong>Experimento actual:</strong> Pruebas de Usabilidad</li>
                    <li><strong>Tu nueva responsabilidad:</strong> Líder del siguiente experimento "Pruebas de Performance"</li>
                </ul>
            </div>
            
            <p>Por favor, accede a la plataforma para revisar los detalles.</p>
            
            <div style="margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px; font-size: 0.9em; color: #666;">
                <p><em>Esta notificación ha sido realizada por <strong>María González</strong>.</em></p>
                <p>---<br>Equipo Iris Startup</p>
            </div>
        </div>
    </div>
</body>
</html>
```

## Notas de implementación:

1. **Configuración de Gmail**: Necesitarás habilitar "App Passwords" en tu cuenta de Gmail si tienes 2FA activado.
2. **Variables de entorno**: Deben configurarse en el archivo `.env` del proyecto.
3. **Manejo de errores**: El sistema envía notificaciones por consola si no puede enviarse el correo.
4. **Fallback**: Si no hay siguiente experimento definido, se informa que "aún falta por definir".
