# Documentación API - Agente Categoría

## Descripción
Esta API maneja las relaciones entre agentes y categorías en la tabla `relacion_agente_categoria`. Permite crear, leer, actualizar y eliminar relaciones entre agentes y categorías, incluyendo la gestión del campo `es_principal`.

## Base URL
```
/agente_categoria
```

## Endpoints Disponibles

### 1. Listar todas las relaciones
**GET** `/agente_categoria/`

Devuelve todas las relaciones agente-categoría existentes.

**Respuesta exitosa (200):**
```json
[
  {
    "id_relacion_agente_categoria": 1,
    "id_agente": 1,
    "id_categoria": 2,
    "es_principal": true,
    "creado": "2024-01-15T10:30:00.000Z",
    "actualizado": "2024-01-15T10:30:00.000Z"
  }
]
```

### 2. Obtener relación específica
**GET** `/agente_categoria/:id_relacion_agente_categoria`

Obtiene una relación específica por su ID único.

**Parámetros de ruta:**
- `id_relacion_agente_categoria` (number): ID único de la relación

**Respuesta exitosa (200):**
```json
{
  "id_relacion_agente_categoria": 1,
  "id_agente": 1,
  "id_categoria": 2,
  "es_principal": true,
  "creado": "2024-01-15T10:30:00.000Z",
  "actualizado": "2024-01-15T10:30:00.000Z"
}
```

### 3. Obtener categorías de un agente
**GET** `/agente_categoria/agente/:id_agente`

Lista todas las categorías asociadas a un agente específico.

**Parámetros de ruta:**
- `id_agente` (number): ID del agente

**Respuesta exitosa (200):**
```json
[
  {
    "id_relacion_agente_categoria": 1,
    "id_agente": 1,
    "id_categoria": 2,
    "es_principal": true,
    "creado": "2024-01-15T10:30:00.000Z",
    "actualizado": "2024-01-15T10:30:00.000Z"
  }
]
```

### 4. Obtener agentes de una categoría
**GET** `/agente_categoria/categoria/:id_categoria`

Lista todos los agentes asociados a una categoría específica.

**Parámetros de ruta:**
- `id_categoria` (number): ID de la categoría

**Respuesta exitosa (200):**
```json
[
  {
    "id_relacion_agente_categoria": 1,
    "id_agente": 1,
    "id_categoria": 2,
    "es_principal": true,
    "creado": "2024-01-15T10:30:00.000Z",
    "actualizado": "2024-01-15T10:30:00.000Z"
  }
]
```

### 5. Crear nueva relación
**POST** `/agente_categoria/`

Crea una nueva relación entre un agente y una categoría.

**Body de la petición:**
```json
{
  "id_agente": 1,
  "id_categoria": 2,
  "es_principal": true
}
```

**Campos:**
- `id_agente` (number, requerido): ID del agente
- `id_categoria` (number, requerido): ID de la categoría
- `es_principal` (boolean, opcional): Si esta es la categoría principal del agente (default: false)

**Respuesta exitosa (201):**
```json
{
  "id_relacion_agente_categoria": 1,
  "id_agente": 1,
  "id_categoria": 2,
  "es_principal": true,
  "creado": "2024-01-15T10:30:00.000Z",
  "actualizado": "2024-01-15T10:30:00.000Z"
}
```

### 6. Actualizar relación
**PATCH** `/agente_categoria/`

Actualiza una relación agente-categoría existente.

**Body de la petición:**
```json
{
  "id_agente": 1,
  "id_categoria": 2,
  "es_principal": false
}
```

**Campos:**
- `id_agente` (number, requerido): ID del agente para identificar la relación
- `id_categoria` (number, requerido): ID de la categoría para identificar la relación
- `es_principal` (boolean, opcional): Nuevo valor para es_principal

**Respuesta exitosa (200):**
```json
{
  "id_relacion_agente_categoria": 1,
  "id_agente": 1,
  "id_categoria": 2,
  "es_principal": false,
  "creado": "2024-01-15T10:30:00.000Z",
  "actualizado": "2024-01-15T11:45:00.000Z"
}
```

### 7. Eliminar relación específica
**DELETE** `/agente_categoria/`

Elimina una relación específica entre un agente y una categoría.

**Body de la petición:**
```json
{
  "id_agente": 1,
  "id_categoria": 2
}
```

**Respuesta exitosa (204):** Sin contenido

## Códigos de Error Comunes

- **400 Bad Request**: Datos de entrada inválidos
- **401 Unauthorized**: Token de autenticación requerido
- **403 Forbidden**: Permisos insuficientes (solo editores)
- **404 Not Found**: Relación no encontrada
- **500 Internal Server Error**: Error del servidor

## Autenticación

Todos los endpoints requieren autenticación JWT y permisos de editor. Incluir el token en el header:

```
Authorization: Bearer <token>
```

## Notas importantes

1. La tabla `relacion_agente_categoria` usa un ID único autoincremental (`id_relacion_agente_categoria`)
2. El campo `es_principal` indica si una categoría es la principal para un agente
3. Se recomienda que solo una categoría por agente tenga `es_principal = true`
4. Las consultas incluyen información expandida de agentes y categorías relacionadas
