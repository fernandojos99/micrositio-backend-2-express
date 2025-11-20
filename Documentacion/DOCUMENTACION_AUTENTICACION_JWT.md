# Documentación del Sistema de Autenticación JWT

## Resumen General

Esta documentación explica el sistema de autenticación basado en JWT (JSON Web Tokens) implementado en el backend del proyecto Micrositio-Iris. El sistema maneja dos tipos de usuarios:
- **EDITOR**: Acceso completo al sistema
- **VISITANTE**: Acceso limitado solo a proyectos específicos asignados

---

## Arquitectura del Sistema

El sistema está organizado en 5 componentes principales:

```
config/jwtConfig.js         → Configuración JWT
controllers/authController.js → Controladores de endpoints
middlewares/authMiddleware.js → Middlewares de autenticación
services/authService.js      → Lógica de negocio
utils/jwtUtils.js           → Utilidades JWT
```

---

## 1. Configuration - `jwtConfig.js`

### ¿Qué hace?
Define la configuración central para los tokens JWT.

### Implementación:
```javascript
export const JWT_CONFIG = {
  secret: process.env.JWT_SECRET || 'tu-clave-secreta-muy-segura',
  expiresIn: '24h',
  algorithm: 'HS256'
};
```

### Funcionalidad:
- **secret**: Clave secreta para firmar y verificar tokens (usa variable de entorno)
- **expiresIn**: Tiempo de vida del token (24 horas)
- **algorithm**: Algoritmo de encriptación HS256 (HMAC SHA-256)

---

## 2. Controller - `authController.js`

### ¿Qué hace?
Maneja las peticiones HTTP relacionadas con autenticación. Es la capa que recibe las requests del cliente.

### Métodos implementados:

#### `login(req, res, next)`
- **Propósito**: Procesa el login del usuario
- **Input**: `alias` y `password` desde req.body
- **Validaciones**: Verifica que ambos campos estén presentes
- **Output**: JSON con token JWT y datos del usuario

#### `registro(req, res, next)`
- **Propósito**: Registra nuevos usuarios
- **Input**: Datos del usuario desde req.body
- **Output**: JSON con token JWT y datos del usuario creado

#### `verificarToken(req, res, next)`
- **Propósito**: Valida si un token es válido
- **Funciona**: En conjunto con el middleware authMiddleware
- **Output**: Confirmación de token válido y datos del usuario

### Flujo de trabajo:
1. Recibe la petición HTTP
2. Extrae y valida datos del request
3. Delega la lógica de negocio al AuthService
4. Retorna respuesta JSON estandarizada

---

## 3. Middleware - `authMiddleware.js`

### ¿Qué hace?
Intercepta peticiones HTTP para verificar autenticación y autorización antes de que lleguen a los controladores.

### Middlewares implementados:

#### `authMiddleware(req, res, next)`
- **Propósito**: Verifica que el usuario esté autenticado
- **Proceso**:
  1. Extrae token del header Authorization
  2. Verifica validez del token
  3. Decodifica información del usuario
  4. Añade `req.user` con datos del usuario
- **Error**: Retorna 401 si token inválido

#### `soloEditores(req, res, next)`
- **Propósito**: Restringe acceso solo a usuarios tipo EDITOR
- **Verifica**: `req.user.tipo === 'EDITOR'`
- **Error**: Retorna 403 si no es editor

#### `verificarAccesoProyecto(req, res, next)`
- **Propósito**: Controla acceso a proyectos específicos
- **Lógica**:
  - EDITOR: Acceso total a todos los proyectos
  - VISITANTE: Solo proyectos asignados en `req.user.proyectos`
- **Error**: Retorna 403 si no tiene acceso

### Uso típico:
```javascript
// Ruta protegida para editores
router.post('/crear', authMiddleware, soloEditores, controller.crear);

// Ruta con acceso por proyecto
router.get('/proyecto/:id', authMiddleware, verificarAccesoProyecto, controller.obtener);
```

---

## 4. Service - `authService.js`

### ¿Qué hace?
Contiene toda la lógica de negocio para autenticación. Interactúa con la base de datos y maneja el procesamiento de datos.

### Dependencias:
- `bcryptjs`: Para hash y verificación de passwords
- `supabase`: Cliente de base de datos
- `JWTUtils`: Para generar tokens
- `ApiError`: Para manejo de errores

### Métodos implementados:

#### `login(alias, password)`
**Proceso detallado**:
1. **Buscar usuario**: Consulta tabla `usuarios` por alias y activo=true
2. **Verificar password**: Compara password con hash usando bcrypt
3. **Obtener proyectos**: Si es VISITANTE, consulta tabla `usuario_proyecto`
4. **Generar JWT**: Crea token con datos del usuario y proyectos
5. **Preparar respuesta**: Elimina password_hash y retorna datos limpios

**Output**:
```javascript
{
  token: "jwt_token_here",
  usuario: {
    id_usuario: 1,
    alias: "usuario",
    tipo: "EDITOR",
    proyectos: [1, 2, 3] // solo para VISITANTE
  }
}
```

#### `registro(datosUsuario)`
**Proceso detallado**:
1. **Verificar unicidad**: Comprueba que el alias no exista
2. **Hash password**: Usa bcrypt con 12 salt rounds
3. **Crear usuario**: Inserta en tabla `usuarios`
4. **Generar token**: Crea JWT para el nuevo usuario
5. **Retornar datos**: Usuario sin password + token

**Seguridad**:
- Salt rounds: 12 (recomendado para seguridad alta)
- Validación de alias único
- Eliminación de password_hash de respuestas

---

## 5. Utils - `jwtUtils.js`

### ¿Qué hace?
Utilidades específicas para manejo de JWT. Abstrae la lógica de creación, verificación y extracción de tokens.

### Métodos implementados:

#### `generarToken(usuario, proyectos)`
- **Propósito**: Crea un JWT con información del usuario
- **Payload incluye**:
  ```javascript
  {
    user_id: usuario.id_usuario,
    alias: usuario.alias,
    tipo: usuario.tipo,
    id_empleado: usuario.id_empleado,
    proyectos: proyectos,
    iat: timestamp_actual
  }
  ```
- **Configuración**: Usa JWT_CONFIG para secret, expiración y algoritmo

#### `verificarToken(token)`
- **Propósito**: Valida y decodifica un JWT
- **Verifica**: Firma, expiración y formato
- **Error**: Lanza excepción si token inválido o expirado
- **Retorna**: Payload decodificado

#### `extraerTokenDelHeader(authHeader)`
- **Propósito**: Extrae token del header Authorization
- **Formato esperado**: `"Bearer jwt_token_here"`
- **Proceso**: Verifica formato y extrae solo el token
- **Error**: Si no hay header o formato incorrecto

---

## Flujo Completo de Autenticación

### 1. Login del Usuario
```
Cliente → POST /auth/login {alias, password}
     ↓
AuthController.login()
     ↓
AuthService.login()
     ↓
1. Busca usuario en DB
2. Verifica password con bcrypt
3. Obtiene proyectos si es VISITANTE
4. JWTUtils.generarToken()
     ↓
Retorna: {token, usuario}
```

### 2. Request Protegido
```
Cliente → GET /api/resource
Header: Authorization: Bearer <token>
     ↓
authMiddleware()
     ↓
1. JWTUtils.extraerTokenDelHeader()
2. JWTUtils.verificarToken()
3. req.user = decoded_data
     ↓
Controller.method()
```

### 3. Verificación de Permisos
```
authMiddleware() → req.user disponible
     ↓
soloEditores() → verifica tipo === 'EDITOR'
     ↓
verificarAccesoProyecto() → verifica acceso a proyecto
     ↓
Controller ejecuta lógica
```

---

## Características de Seguridad

### 1. **Hashing de Passwords**
- Algoritmo: bcrypt
- Salt rounds: 12
- No almacena passwords en texto plano

### 2. **JWT Security**
- Algoritmo: HS256 (HMAC SHA-256)
- Expiración: 24 horas
- Secret key configurable por variable de entorno

### 3. **Control de Acceso**
- Autenticación: Verificación de identidad
- Autorización: Control basado en roles (EDITOR/VISITANTE)
- Autorización por recurso: Acceso limitado por proyecto

### 4. **Validaciones**
- Headers Authorization requeridos
- Formato Bearer token
- Verificación de expiración de tokens
- Validación de datos de entrada

---

## Tipos de Usuario y Permisos

### EDITOR
- **Acceso**: Total al sistema
- **Proyectos**: Todos
- **JWT incluye**: Solo datos básicos del usuario

### VISITANTE
- **Acceso**: Limitado
- **Proyectos**: Solo asignados en tabla `usuario_proyecto`
- **JWT incluye**: Lista de proyectos permitidos

---

## Manejo de Errores

### Códigos HTTP utilizados:
- **400**: Bad Request (datos faltantes o inválidos)
- **401**: Unauthorized (credenciales inválidas o token expirado)
- **403**: Forbidden (sin permisos para el recurso)
- **500**: Internal Server Error (errores del sistema)

### ApiError personalizado:
- Estandariza respuestas de error
- Incluye mensaje descriptivo
- Código HTTP apropiado

---

## Configuración Requerida

### Variables de Entorno
```env
JWT_SECRET=tu-clave-secreta-muy-segura-y-larga
```

### Dependencias NPM
```json
{
  "jsonwebtoken": "^9.0.0",
  "bcryptjs": "^2.4.3"
}
```

### Estructura de Base de Datos
```sql
-- Tabla usuarios
usuarios (
  id_usuario,
  alias UNIQUE,
  password_hash,
  tipo ('EDITOR'|'VISITANTE'),
  id_empleado,
  activo BOOLEAN
)

-- Tabla relación usuario-proyecto (solo VISITANTES)
usuario_proyecto (
  id_usuario,
  id_proyecto
)
```

---

## Consideraciones de Mejora

### Seguridad:
1. Implementar refresh tokens
2. Blacklist de tokens revocados
3. Rate limiting en endpoints de auth
4. Logs de intentos de login

### Funcionalidad:
1. Reset de passwords
2. Cambio de passwords
3. Gestión de sesiones múltiples
4. Notificaciones de login

Esta implementación proporciona una base sólida y segura para el sistema de autenticación de tu aplicación.
