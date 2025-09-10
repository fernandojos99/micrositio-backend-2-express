# Pruebas de API - Módulo Agentes

## Descripción
Este directorio contiene las colecciones de Postman para probar todos los endpoints del módulo de **Agentes** del sistema Micrositio Iris Backend.

## Archivos incluidos

### 1. Agentes.postman_collection.json
Colección completa con todos los endpoints del módulo agentes:

#### Endpoints incluidos:
- **POST /agentes** - Crear nuevo agente
- **GET /agentes** - Listar todos los agentes
- **POST /agentes/a** - Obtener agente por ID
- **PATCH /agentes** - Actualizar agente existente
- **DELETE /agentes** - Eliminar agente

#### Pruebas de validación:
- Validación de campos obligatorios
- Validación de formato de URL
- Validación de longitud de campos
- Pruebas de autenticación
- Manejo de errores 404

### 2. Agentes.postman_environment.json
Archivo de entorno con variables necesarias:
- `base_url`: URL base del API (http://localhost:3000)
- `token`: Token de autenticación JWT
- `agente_id`: ID del agente para pruebas
- `agente_id_2`: ID del segundo agente para pruebas

## Cómo usar

### Paso 1: Importar archivos en Postman
1. Abre Postman
2. Haz clic en "Import"
3. Selecciona ambos archivos:
   - `Agentes.postman_collection.json`
   - `Agentes.postman_environment.json`

### Paso 2: Configurar el entorno
1. Selecciona el entorno "Agentes API Environment"
2. Verifica que `base_url` apunte a `http://localhost:3000`

### Paso 3: Autenticarse
1. Ejecuta la request "Login" en la carpeta "Autenticación"
2. El token se guardará automáticamente en la variable `token`

### Paso 4: Ejecutar pruebas
Puedes ejecutar las requests individualmente o usar el "Collection Runner" para ejecutar todas las pruebas automáticamente.

## Orden recomendado de ejecución

1. **Login** - Para obtener el token de autenticación
2. **Crear Agente** - Crea un agente y guarda su ID
3. **Listar Todos los Agentes** - Verifica que el agente aparezca en la lista
4. **Obtener Agente por ID** - Obtiene los detalles del agente creado
5. **Actualizar Agente** - Modifica los datos del agente
6. **Crear Agente con datos mínimos** - Crea un segundo agente
7. **Eliminar Agente** - Elimina el segundo agente
8. **Pruebas de validación** - Ejecuta todas las pruebas de validación

## Estructura de datos

### Modelo Agente
```json
{
  "id_agente": 1,
  "nombre": "ChatGPT Assistant",
  "link": "https://chat.openai.com",
  "descripcion": "Asistente de inteligencia artificial conversacional",
  "prompt": "Eres un asistente útil que responde preguntas de manera clara y concisa.",
  "creado": "2025-09-10T12:00:00.000Z",
  "actualizado": "2025-09-10T12:00:00.000Z"
}
```

### Campos obligatorios para crear:
- `nombre` (mínimo 3 caracteres, máximo 150)

### Campos opcionales:
- `link` (debe ser URL válida)
- `descripcion` (mínimo 10 caracteres)
- `prompt` (mínimo 10 caracteres)

## Códigos de respuesta esperados

- **200**: Operación exitosa (GET, PATCH)
- **201**: Recurso creado exitosamente (POST)
- **204**: Recurso eliminado exitosamente (DELETE)
- **400**: Error de validación en los datos
- **401**: No autenticado
- **403**: No autorizado (no es editor)
- **404**: Recurso no encontrado
- **500**: Error interno del servidor

## Notas adicionales

- Todos los endpoints requieren autenticación JWT
- Solo usuarios con rol de "editor" pueden acceder a los endpoints
- Las fechas se devuelven en formato ISO 8601
- Los IDs de agentes se generan automáticamente por la base de datos
- El campo `updated_at` se actualiza automáticamente en cada modificación
