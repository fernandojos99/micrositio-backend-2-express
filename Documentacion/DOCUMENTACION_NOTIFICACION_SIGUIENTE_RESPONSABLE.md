# Endpoint de Notificación - Siguiente Responsable

Este documento explica cómo configurar y usar el nuevo endpoint `notificacionSiguienteResponsable` para enviar correos de notificación cuando se asigna a un empleado como responsable del siguiente experimento.

## 📋 Descripción

El endpoint envía una notificación por correo electrónico a un empleado informándole que ha sido asignado como líder del siguiente experimento en una secuencia de testing.

## 🔗 Endpoint

```
POST /secuencia/notificacionSiguienteResponsable
```

### Headers requeridos:
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

### Body del request:
```json
{
  "id_empleado": 123,
  "id_learning_card": 456
}
```

## 🔐 Autenticación

- Requiere JWT válido en el header `Authorization`
- El sistema obtiene automáticamente el `id_empleado` del remitente desde el JWT
- No requiere permisos especiales (cualquier usuario autenticado puede usarlo)

## 📤 Parámetros

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `id_empleado` | number | ✅ | ID del empleado que recibirá la notificación |
| `id_learning_card` | number | ✅ | ID de la learning card asociada al experimento |

## 🔄 Flujo de Procesamiento

1. **Validación de datos**: Verifica que los parámetros sean números positivos
2. **Verificación de empleado destinatario**: 
   - Busca al empleado por ID
   - Verifica que tenga correo registrado
3. **Obtención de empleado remitente**: Extrae información del JWT
4. **Búsqueda de learning card**: Verifica que exista
5. **Búsqueda de testing card**: Obtiene la testing card asociada a la learning card
6. **Búsqueda de secuencia y proyecto**: Obtiene información de contexto
7. **Búsqueda del siguiente experimento**: Busca testing cards hijas (opcionales)
8. **Envío de correo**: Genera y envía el correo HTML personalizado

## 📧 Configuración de Email

### Variables de entorno requeridas:

Agregar al archivo `.env`:

```bash
EMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=tu_app_password_de_gmail
```

### Configuración de Gmail:

1. **Habilitar 2FA** en tu cuenta de Gmail
2. **Generar App Password**:
   - Ve a "Gestionar tu cuenta de Google"
   - Seguridad → Verificación en dos pasos → Contraseñas de aplicaciones
   - Genera una contraseña para "Aplicación personalizada"
3. **Usar la App Password** en la variable `EMAIL_PASSWORD`

## 📨 Ejemplo de Request

```bash
curl -X POST http://localhost:3000/secuencia/notificacionSiguienteResponsable \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "id_empleado": 123,
    "id_learning_card": 456
  }'
```

## ✅ Respuesta Exitosa

```json
{
  "success": true,
  "mensaje": "Notificación enviada exitosamente",
  "data": {
    "destinatario": {
      "nombre": "Juan Pérez",
      "email": "juan.perez@empresa.com"
    },
    "remitente": {
      "nombre": "María González"
    },
    "proyecto": "Sistema de Gestión Empresarial",
    "secuencia": "Fase de Testing Alpha",
    "experimentoActual": "Pruebas de Usabilidad",
    "experimentoSiguiente": "Pruebas de Performance",
    "email": {
      "messageId": "<unique-message-id>",
      "enviado": true
    }
  }
}
```

## ❌ Posibles Errores

### 400 - Bad Request
```json
{
  "error": "El empleado no tiene correo electrónico registrado"
}
```

### 401 - Unauthorized
```json
{
  "error": "Token inválido o expirado"
}
```

### 404 - Not Found
```json
{
  "error": "Learning card no encontrada"
}
```

### 500 - Internal Server Error
```json
{
  "error": "Error al enviar la notificación por email: Connection refused"
}
```

## 📧 Template del Correo

El correo incluye:

- **Asunto**: `Iris Startup - Nueva responsabilidad asignada en {nombre_proyecto}`
- **Contenido HTML** con:
  - Header con logo de Iris Startup
  - Saludo personalizado al destinatario
  - Detalles del proyecto, secuencia y experimentos
  - Información del siguiente experimento (o mensaje de "por definir")
  - Footer con información del remitente

## 🧪 Testing

### Casos de prueba recomendados:

1. **Caso exitoso**: Empleado con correo, learning card válida
2. **Empleado sin correo**: Debe devolver error 400
3. **Learning card inexistente**: Debe devolver error 404
4. **JWT inválido**: Debe devolver error 401
5. **Siguiente experimento no definido**: Debe enviar correo con mensaje de "por definir"

### Datos de prueba:

Puedes usar los datos existentes en tu base de datos o crear registros específicos para testing.

## 🔧 Troubleshooting

### Problemas comunes:

1. **Email no se envía**: 
   - Verificar variables de entorno
   - Comprobar App Password de Gmail
   - Revisar logs del servidor

2. **Error 401**: 
   - Verificar que el JWT sea válido y no haya expirado
   - Confirmar que el header Authorization esté presente

3. **Error 404**: 
   - Verificar que los IDs de empleado y learning card existan
   - Comprobar las relaciones entre learning card y testing card

## 📁 Archivos Relacionados

- **Controlador**: `/src/controllers/notificacionController.js`
- **Servicio**: `/src/services/notificacionService.js`
- **Servicio Email**: `/src/services/emailService.js`
- **Validaciones**: `/src/middlewares/validation/notificacionSchema.js`
- **Rutas**: `/src/routes/secuenciaRoutes.js`
- **Template ejemplo**: `/examples/template_email_notificacion.md`
