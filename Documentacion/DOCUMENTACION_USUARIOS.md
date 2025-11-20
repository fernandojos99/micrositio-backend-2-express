# Documentación del Módulo de Usuarios

## Resumen General

Este módulo implementa el CRUD completo para la tabla `usuarios` siguiendo las mejores prácticas REST y la arquitectura del proyecto Micrositio-Iris. El sistema maneja usuarios de dos tipos: **EDITOR** y **VISITANTE**, con diferentes permisos y restricciones.

---

## Estructura de la Tabla

```sql
CREATE TABLE usuarios (
    id_usuario  UUID  PRIMARY KEY,
    alias VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(50) NOT NULL,
    tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('EDITOR', 'VISITANTE')),
    id_empleado INTEGER NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_empleado_editor 
        FOREIGN KEY (id_empleado) 
        REFERENCES empleado(id_empleado) 
        ON DELETE SET NULL,
    
    CONSTRAINT chk_editor_tiene_empleado 
        CHECK (
            (tipo = 'EDITOR' AND id_empleado IS NOT NULL) OR 
            (tipo = 'VISITANTE' AND id_empleado IS NULL)
        )
);
```

---

## Endpoints Implementados

### 1. **GET /usuarios**
- **Descripción**: Obtiene todos los usuarios con filtros opcionales
- **Autenticación**: Requerida (JWT)
- **Autorización**: Solo EDITORES
- **Query Parameters**:
  - `activo` (boolean): Filtrar por estado activo
  - `tipo` (string): Filtrar por tipo (`EDITOR` | `VISITANTE`)
- **Respuesta**: Lista de usuarios con paginación

### 2. **GET /usuarios/:id**
- **Descripción**: Obtiene un usuario específico por UUID
- **Autenticación**: Requerida (JWT)
- **Autorización**: Solo EDITORES
- **Parámetros**: `id` (UUID del usuario)
- **Respuesta**: Usuario específico

### 3. **GET /usuarios/empleado/:id_empleado**
- **Descripción**: Obtiene usuarios asociados a un empleado específico
- **Autenticación**: Requerida (JWT)
- **Autorización**: Solo EDITORES
- **Parámetros**: `id_empleado` (ID del empleado)
- **Respuesta**: Lista de usuarios del empleado

### 4. **POST /usuarios**
- **Descripción**: Crea un nuevo usuario
- **Autenticación**: Requerida (JWT)
- **Autorización**: Solo EDITORES
- **Body**: Datos del usuario a crear
- **Respuesta**: Usuario creado

### 5. **PATCH /usuarios/:id**
- **Descripción**: Actualiza un usuario existente
- **Autenticación**: Requerida (JWT)
- **Autorización**: Solo EDITORES
- **Parámetros**: `id` (UUID del usuario)
- **Body**: Datos a actualizar
- **Respuesta**: Usuario actualizado

### 6. **PATCH /usuarios/:id/baja**
- **Descripción**: Da de baja un usuario (activo = false)
- **Autenticación**: Requerida (JWT)
- **Autorización**: Solo EDITORES
- **Parámetros**: `id` (UUID del usuario)
- **Respuesta**: Usuario actualizado

### 7. **PATCH /usuarios/:id/alta**
- **Descripción**: Da de alta un usuario (activo = true)
- **Autenticación**: Requerida (JWT)
- **Autorización**: Solo EDITORES
- **Parámetros**: `id` (UUID del usuario)
- **Respuesta**: Usuario actualizado

### 8. **DELETE /usuarios/:id**
- **Descripción**: Elimina un usuario de forma física
- **Autenticación**: Requerida (JWT)
- **Autorización**: Solo EDITORES
- **Parámetros**: `id` (UUID del usuario)
- **Respuesta**: Usuario eliminado
- **Restricción**: Solo usuarios inactivos

### 9. **GET /usuarios/estadisticas**
- **Descripción**: Obtiene estadísticas generales de usuarios
- **Autenticación**: Requerida (JWT)
- **Autorización**: Solo EDITORES
- **Respuesta**: Estadísticas completas

### 10. **PATCH /usuarios/:id/password**
- **Descripción**: Cambia la contraseña de un usuario
- **Autenticación**: Requerida (JWT)
- **Autorización**: Solo EDITORES
- **Parámetros**: `id` (UUID del usuario)
- **Body**: `password_actual` y `password_nueva`
- **Respuesta**: Usuario actualizado

---

## Arquitectura del Módulo

### Componentes Implementados:

1. **usuarioSchema.js** - Esquemas de validación con Zod
2. **Usuario.js** - Modelo de datos
3. **usuarioRepository.js** - Capa de acceso a datos
4. **usuarioService.js** - Lógica de negocio
5. **usuarioController.js** - Controladores de endpoints
6. **usuarioRoutes.js** - Definición de rutas y documentación Swagger

---

## Reglas de Negocio

### Tipos de Usuario:

#### **EDITOR**
- Debe tener un `id_empleado` asociado
- El empleado debe estar activo
- Solo puede haber un usuario EDITOR activo por empleado
- Tiene acceso completo al sistema

#### **VISITANTE**
- No debe tener `id_empleado` asociado
- Acceso limitado solo a proyectos específicos asignados

### Validaciones:

#### **Alias**
- 3-50 caracteres
- Solo letras, números, guiones y guiones bajos
- Único en el sistema

#### **Contraseña**
- 8-100 caracteres
- Al menos una minúscula, una mayúscula y un número
- Hasheada con bcrypt (12 salt rounds)

#### **Estado Activo**
- Los usuarios inactivos no pueden autenticarse
- Solo usuarios inactivos pueden ser eliminados físicamente
- Al reactivar un EDITOR, se verifica que el empleado siga activo

---

## Ejemplos de Uso

### Crear Usuario EDITOR
```json
POST /usuarios
{
  "alias": "juan_editor",
  "password": "Password123",
  "tipo": "EDITOR",
  "id_empleado": 1
}
```

### Crear Usuario VISITANTE
```json
POST /usuarios
{
  "alias": "maria_visitante",
  "password": "Password456",
  "tipo": "VISITANTE"
}
```

### Actualizar Usuario
```json
PATCH /usuarios/123e4567-e89b-12d3-a456-426614174000
{
  "alias": "nuevo_alias",
  "activo": false
}
```

### Cambiar Contraseña
```json
PATCH /usuarios/123e4567-e89b-12d3-a456-426614174000/password
{
  "password_actual": "Password123",
  "password_nueva": "NewPassword456"
}
```

### Filtrar Usuarios
```
GET /usuarios?activo=true&tipo=EDITOR
```

---

## Estadísticas Disponibles

La API proporciona estadísticas completas:
- Total de usuarios
- Usuarios activos/inactivos
- Usuarios por tipo (EDITOR/VISITANTE)
- Usuarios activos por tipo

```json
{
  "success": true,
  "data": {
    "total": 25,
    "activos": 20,
    "inactivos": 5,
    "editores": 10,
    "visitantes": 15,
    "editores_activos": 8,
    "visitantes_activos": 12
  }
}
```

---

## Manejo de Errores

### Códigos HTTP utilizados:
- **200**: Operación exitosa
- **201**: Usuario creado exitosamente
- **400**: Datos inválidos o violación de reglas de negocio
- **401**: No autenticado
- **403**: Sin permisos (no es EDITOR)
- **404**: Usuario no encontrado
- **500**: Error interno del servidor

### Errores Comunes:
- **Alias duplicado**: "El alias ya está en uso"
- **Empleado no encontrado**: "Empleado no encontrado"
- **Usuario EDITOR duplicado**: "El empleado ya tiene un usuario EDITOR activo"
- **Contraseña inválida**: "La contraseña actual es incorrecta"
- **Usuario inactivo**: "No se puede eliminar un usuario activo"

---

## Seguridad

### Autenticación
- Todos los endpoints requieren JWT válido
- Solo usuarios EDITOR pueden acceder a estos endpoints

### Contraseñas
- Hasheadas con bcrypt (12 salt rounds)
- Validación robusta de complejidad
- Cambio seguro con verificación de contraseña actual

### Validaciones
- UUID válido para identificadores
- Sanitización de datos de entrada
- Verificación de restricciones de base de datos

---

## Testing

### Pruebas Recomendadas:

1. **Creación de Usuarios**
   - Usuario EDITOR válido
   - Usuario VISITANTE válido
   - Validaciones de restricciones tipo-empleado

2. **Actualización de Usuarios**
   - Cambio de alias
   - Cambio de contraseña
   - Cambio de estado activo

3. **Eliminación de Usuarios**
   - Baja lógica
   - Alta de usuarios
   - Eliminación física (solo usuarios inactivos)

4. **Validaciones de Negocio**
   - Un EDITOR por empleado activo
   - VISITANTE sin empleado
   - Empleado activo para EDITOR

5. **Filtros y Búsquedas**
   - Filtrado por estado activo
   - Filtrado por tipo
   - Búsqueda por empleado

---

## Consideraciones de Rendimiento

1. **Índices Recomendados**:
   - `alias` (único)
   - `id_empleado`
   - `activo`
   - `tipo`

2. **Consultas Optimizadas**:
   - Uso de `single()` para búsquedas únicas
   - Filtros a nivel de base de datos
   - Ordenamiento por `created_at`

3. **Caching**:
   - Estadísticas pueden ser cacheadas
   - Validaciones de unicidad son críticas

---

## Documentación Swagger

Toda la documentación Swagger está incluida en el archivo de rutas, proporcionando:
- Esquemas completos de request/response
- Ejemplos de uso
- Códigos de respuesta
- Parámetros requeridos y opcionales
- Seguridad requerida

Accede a la documentación interactiva en: `/api-docs` (cuando Swagger esté configurado).
