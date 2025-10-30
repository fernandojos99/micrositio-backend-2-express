# Pruebas de API - Plantilla Secuencia

Este documento describe cómo probar la API de Plantilla Secuencia utilizando Postman.

## Configuración Inicial

### 1. Importar Archivos en Postman

1. Abrir Postman
2. Ir a **File > Import**
3. Importar los siguientes archivos:
   - `PlantillaSecuencia.postman_collection.json`
   - `PlantillaSecuencia.postman_environment.json`

### 2. Configurar Entorno

1. Seleccionar el entorno **"Plantilla Secuencia Environment"** en la esquina superior derecha
2. Verificar que la variable `base_url` apunte a tu servidor (por defecto: `http://localhost:3000`)
3. Configurar las variables de prueba si es necesario:
   - `test_secuencia_id`: ID de una secuencia existente (por defecto: 1)
   - `test_empleado_id`: ID de un empleado existente (por defecto: 1)

## Orden de Ejecución de Pruebas

### Paso 1: Autenticación
Ejecutar primero el endpoint **"Login"** en la carpeta **"Auth"**:
- Este endpoint guardará automáticamente el token JWT en la variable `auth_token`
- Usar credenciales válidas de tu sistema

### Paso 2: Operaciones CRUD
Ejecutar en el siguiente orden:

1. **Obtener todas las plantillas secuencia** - Verificar estado inicial
2. **Crear plantilla secuencia** - Crear una nueva plantilla (guarda el ID automáticamente)
3. **Obtener plantilla secuencia por ID** - Verificar la plantilla creada
4. **Actualizar plantilla secuencia** - Modificar la plantilla
5. **Eliminar plantilla secuencia** - Eliminar la plantilla de prueba

### Paso 3: Pruebas de Validación
Ejecutar las pruebas en la carpeta **"Tests de Validación"**:
- **Crear plantilla secuencia - Datos inválidos**
- **Obtener plantilla secuencia - ID no existe**
- **Acceso sin autenticación**

## Estructura de Datos

### Crear Plantilla Secuencia (POST)
```json
{
  "id_secuencia": 1,
  "id_empleado": 5
}
```

### Actualizar Plantilla Secuencia (PUT)
```json
{
  "id_secuencia": 2,
  "id_empleado": 7
}
```

### Respuesta Típica
```json
{
  "success": true,
  "message": "Plantilla secuencia creada exitosamente",
  "data": {
    "id_plantilla_secuencia": "123e4567-e89b-12d3-a456-426614174000",
    "id_secuencia": 1,
    "id_empleado": 5,
    "creado": "2025-01-15T10:30:00.000Z",
    "actualizado": "2025-01-15T10:30:00.000Z"
  }
}
```

## Scripts Automatizados

La colección incluye scripts automatizados que:

1. **Manejo de Tokens**: Guarda y usa automáticamente el token JWT
2. **Gestión de IDs**: Guarda IDs de plantillas creadas para uso posterior
3. **Validaciones**: Verifica estructura de respuestas y códigos de estado
4. **Limpieza**: Elimina variables de entorno al finalizar

## Validaciones Implementadas

### Campos Requeridos
- `id_secuencia`: Entero positivo (requerido para crear)
- `id_empleado`: Entero positivo (requerido para crear)

### Reglas de Validación
- **Crear**: Ambos campos son obligatorios
- **Actualizar**: Al menos un campo debe ser proporcionado
- **IDs**: Deben ser enteros positivos
- **UUID**: Los IDs de plantilla deben ser UUIDs válidos

## Códigos de Estado HTTP

| Código | Descripción | Cuándo Ocurre |
|--------|-------------|---------------|
| 200 | OK | Operación exitosa (GET, PUT, DELETE) |
| 201 | Created | Plantilla creada exitosamente |
| 400 | Bad Request | Datos de entrada inválidos |
| 401 | Unauthorized | Token inválido o faltante |
| 404 | Not Found | Plantilla no encontrada |
| 409 | Conflict | Conflicto de datos (duplicados) |
| 500 | Internal Server Error | Error del servidor |

## Errores Comunes

### 1. Token No Válido
```json
{
  "success": false,
  "message": "Token no válido"
}
```
**Solución**: Ejecutar nuevamente el endpoint de Login

### 2. Plantilla No Encontrada
```json
{
  "success": false,
  "message": "Plantilla secuencia no encontrada"
}
```
**Solución**: Verificar que el ID existe

### 3. Datos de Validación
```json
{
  "success": false,
  "message": "Validación fallida: id_secuencia es requerido"
}
```
**Solución**: Proporcionar todos los campos requeridos

### 4. Referencias Foráneas
```json
{
  "success": false,
  "message": "El ID de secuencia o empleado no existe"
}
```
**Solución**: Usar IDs válidos que existan en las tablas referenciadas

## Configuración de Variables de Entorno

Antes de ejecutar las pruebas, configurar:

```json
{
  "base_url": "http://localhost:3000",
  "test_secuencia_id": "1",
  "test_empleado_id": "1",
  "test_secuencia_id_updated": "2"
}
```

## Notas Importantes

1. **Orden de Ejecución**: Siempre ejecutar Login primero
2. **Variables Automáticas**: Los scripts manejan automáticamente los IDs
3. **Limpieza**: Las variables se limpian automáticamente después de eliminar
4. **Base de Datos**: Asegurarse de que existan registros en `secuencia` y `empleado`
5. **Servidor**: Verificar que el servidor esté corriendo en el puerto configurado

## Troubleshooting

### Problema: "Cannot read property of null"
**Causa**: Token no configurado
**Solución**: Ejecutar Login y verificar que el token se guarde

### Problema: "ECONNREFUSED"
**Causa**: Servidor no está corriendo
**Solución**: Iniciar el servidor backend

### Problema: "Foreign key constraint"
**Causa**: IDs de secuencia/empleado no existen
**Solución**: Crear registros en las tablas padre o usar IDs existentes

Para más información, consultar la documentación de la API en `plantilla_secuencia_api_documentation.json`.
