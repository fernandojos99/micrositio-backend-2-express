# 📬 Testing del Endpoint de Notificación - Postman

Este documento explica cómo usar las colecciones de Postman para probar el endpoint `notificacionSiguienteResponsable`.

## 📁 Archivos de Postman

- **Colección**: `NotificacionSiguienteResponsable.postman_collection.json`
- **Environment**: `NotificacionSiguienteResponsable.postman_environment.json`

## 🚀 Configuración Inicial

### 1. Importar en Postman

1. Abrir Postman
2. Hacer clic en **Import**
3. Seleccionar ambos archivos JSON:
   - `NotificacionSiguienteResponsable.postman_collection.json`
   - `NotificacionSiguienteResponsable.postman_environment.json`
4. Seleccionar el environment "**Notificación Siguiente Responsable - Environment**"

### 2. Configurar Variables de Environment

Actualiza las siguientes variables en el environment:

| Variable | Valor por Defecto | Descripción |
|----------|------------------|-------------|
| `base_url` | `http://localhost:3000` | URL base del servidor |
| `usuario_test` | `editor1` | Usuario para login de prueba |
| `password_test` | `password123` | Password para login de prueba |
| `id_empleado_destinatario` | `456` | ID de empleado que recibirá la notificación |
| `id_learning_card_valida` | `789` | ID de learning card válida |

## 🧪 Secuencia de Pruebas

### Paso 1: Autenticación 🔐

**Request**: `Login - Obtener JWT`

- Ejecutar este request primero
- El script automáticamente guardará el token JWT en la variable `jwt_token`
- También guardará el `id_empleado_remitente` del usuario autenticado

### Paso 2: Pruebas del Endpoint 📨

Ejecutar los siguientes requests en orden:

#### 2.1 Caso Exitoso ✅
**Request**: `Enviar Notificación - Caso Exitoso`
- **Esperado**: Status 200
- **Resultado**: Notificación enviada exitosamente
- **Validaciones automáticas**: Success property, notification details

#### 2.2 Error - Sin Correo 📧❌
**Request**: `Notificación - Sin Correo Empleado`
- **Esperado**: Status 400
- **Resultado**: "El empleado no tiene correo electrónico registrado"

#### 2.3 Error - Learning Card Inexistente 🔍❌
**Request**: `Notificación - Learning Card Inexistente`
- **Esperado**: Status 404
- **Resultado**: "Learning card no encontrada"

#### 2.4 Error - Sin Autenticación 🔒❌
**Request**: `Notificación - Sin Token JWT`
- **Esperado**: Status 401
- **Resultado**: "Token de autenticación requerido"

#### 2.5 Error - Datos Inválidos 📝❌
**Request**: `Notificación - Datos Inválidos`
- **Esperado**: Status 400
- **Resultado**: Error de validación de datos

## 📊 Endpoints de Apoyo

Para obtener datos reales de tu base de datos:

### Obtener IDs de Empleados
**Request**: `Listar Empleados`
- Usar para obtener IDs válidos de empleados
- Actualizar `id_empleado_destinatario` en el environment

### Obtener IDs de Learning Cards
**Request**: `Listar Learning Cards`
- Usar para obtener IDs válidos de learning cards
- Actualizar `id_learning_card_valida` en el environment

## ⚙️ Configuración de Email

**⚠️ Importante**: Para que las pruebas de email funcionen correctamente:

1. **Configurar variables de entorno** en tu servidor:
   ```bash
   EMAIL_USER=tu_email@gmail.com
   EMAIL_PASSWORD=tu_app_password_gmail
   ```

2. **Configurar Gmail**:
   - Habilitar 2FA
   - Generar App Password
   - Usar App Password en `EMAIL_PASSWORD`

3. **Verificar empleados con correo**:
   - Asegúrate de que el empleado destinatario tenga correo registrado
   - Puedes verificar esto con el endpoint `Listar Empleados`

## 🔧 Tests Automáticos

La colección incluye tests automáticos que verifican:

- ✅ Status codes correctos
- ✅ Estructura de respuesta
- ✅ Propiedades requeridas
- ✅ Guardado automático de JWT token

### Ejecutar todos los tests:

1. Seleccionar la colección
2. Hacer clic en **Run collection**
3. Configurar la secuencia de ejecución
4. Hacer clic en **Run**

## 📋 Casos de Prueba Recomendados

### Datos Reales de Tu BD

Antes de hacer las pruebas, ejecuta estos queries para obtener datos válidos:

```sql
-- Empleados con correo
SELECT id_empleado, nombre_pila, apellido_paterno, correo 
FROM empleado 
WHERE correo IS NOT NULL AND correo != '';

-- Learning cards disponibles
SELECT lc.id_learning_card, lc.id_testing_card, tc.titulo
FROM learning_card lc
JOIN testing_card tc ON lc.id_testing_card = tc.id_testing_card
LIMIT 10;
```

### Variables de Environment Sugeridas

```json
{
  "id_empleado_destinatario": "ID_REAL_EMPLEADO_CON_CORREO",
  "id_learning_card_valida": "ID_REAL_LEARNING_CARD",
  "usuario_test": "TU_USUARIO_REAL",
  "password_test": "TU_PASSWORD_REAL"
}
```

## 📝 Ejemplo de Respuesta Exitosa

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
      "messageId": "<unique-message-id@gmail.com>",
      "enviado": true
    }
  }
}
```

## 🚨 Troubleshooting

### Error común: "Login failed"
- Verificar credenciales en environment variables
- Asegurarse de que el usuario existe en la BD

### Error común: "Employee not found"
- Verificar que el ID de empleado existe
- Usar el endpoint `Listar Empleados` para obtener IDs válidos

### Error común: "Email configuration error"
- Verificar variables de entorno EMAIL_USER y EMAIL_PASSWORD
- Confirmar configuración de Gmail App Password

### Error común: "Learning card not found"
- Verificar que el ID de learning card existe
- Usar el endpoint `Listar Learning Cards` para obtener IDs válidos

## 📈 Monitoreo de Tests

Los tests incluyen assertions que verificarán automáticamente:

1. **Códigos de respuesta apropiados**
2. **Estructura JSON correcta**
3. **Presencia de campos requeridos**
4. **Guardado automático de tokens**

¡Listo para hacer testing! 🚀
