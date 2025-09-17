# README - Tests de Agente Categoria API

## Descripción
Este directorio contiene las colecciones y configuraciones de Postman para probar la API de relaciones Agente-Categoría del proyecto Micrositio Iris Backend.

## Archivos incluidos

- `AgenteCategoria.postman_collection.json`: Colección principal con todos los tests
- `AgenteCategoria.postman_environment.json`: Variables de entorno para las pruebas

## Configuración inicial

### 1. Importar archivos en Postman
1. Abrir Postman
2. Hacer clic en "Import"
3. Seleccionar ambos archivos JSON
4. Confirmar la importación

### 2. Configurar el environment
1. Seleccionar el environment "AgenteCategoria API Environment"
2. Verificar que `base_url` esté configurada correctamente (por defecto: `http://localhost:3000`)
3. El campo `token` se llenará automáticamente al hacer login

## Orden de ejecución recomendado

### Paso 1: Autenticación
```
Autenticación > Login
```
- Ejecutar este endpoint primero para obtener el token JWT
- El token se guarda automáticamente en las variables de entorno

### Paso 2: Operaciones CRUD básicas
```
1. Agente Categoria - CRUD > 1. Crear relación agente-categoria
2. Agente Categoria - CRUD > 2. Crear segunda relación agente-categoria
3. Agente Categoria - CRUD > 3. Crear relación para otro agente
4. Agente Categoria - CRUD > 4. Listar todas las relaciones
```

### Paso 3: Consultas específicas
```
5. Agente Categoria - CRUD > 5. Obtener relación específica
6. Agente Categoria - CRUD > 6. Obtener categorías de un agente
7. Agente Categoria - CRUD > 7. Obtener agentes de una categoría
```

### Paso 4: Actualizaciones
```
8. Agente Categoria - CRUD > 8. Actualizar relación (cambiar es_principal)
9. Agente Categoria - CRUD > 9. Actualizar todas las categorías de un agente
```

### Paso 5: Eliminaciones
```
1. Agente Categoria - DELETE > 1. Eliminar relación específica
2. Agente Categoria - DELETE > 2. Eliminar todas las relaciones de un agente
3. Agente Categoria - DELETE > 3. Eliminar todas las relaciones de una categoría
```

### Paso 6: Casos de error
```
Casos de Error > Error: Crear relación duplicada
Casos de Error > Error: Datos inválidos (ID negativo)
Casos de Error > Error: Relación no encontrada
Casos de Error > Error: Sin autenticación
```

## Estructura de la colección

### 📁 Autenticación
- **Login**: Obtiene token JWT necesario para todos los endpoints

### 📁 Agente Categoria - CRUD
- **Crear relaciones**: Tests para crear nuevas relaciones agente-categoría
- **Listar relaciones**: Tests para obtener listas de relaciones
- **Consultas específicas**: Tests para obtener relaciones por IDs compuestos
- **Consultas por entidad**: Tests para obtener relaciones filtradas por agente o categoría
- **Actualizaciones**: Tests para modificar relaciones existentes

### 📁 Agente Categoria - DELETE
- **Eliminación específica**: Eliminar una relación particular
- **Eliminación por agente**: Eliminar todas las relaciones de un agente
- **Eliminación por categoría**: Eliminar todas las relaciones de una categoría

### 📁 Casos de Error
- **Validaciones**: Tests que deben fallar con datos inválidos
- **Duplicados**: Tests para verificar manejo de relaciones duplicadas
- **No encontrado**: Tests para recursos inexistentes
- **Autenticación**: Tests sin token de autenticación

## Variables de entorno utilizadas

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `base_url` | URL base del servidor | `http://localhost:3000` |
| `token` | Token JWT (se llena automáticamente) | `""` |
| `id_agente` | ID del agente para tests | `""` |
| `id_categoria` | ID de la categoría para tests | `""` |
| `id_agente_2` | ID del segundo agente | `2` |
| `id_categoria_2` | ID de la segunda categoría | `2` |

## Datos de prueba requeridos

Para que los tests funcionen correctamente, necesitas tener en la base de datos:

### Agentes (tabla `agente`)
```sql
INSERT INTO agente (id_agente, nombre) VALUES 
(1, 'Agente Test 1'),
(2, 'Agente Test 2');
```

### Categorías (tabla `categoria`)
```sql
INSERT INTO categoria (id_categoria, nombre) VALUES 
(1, 'Categoría Test 1'),
(2, 'Categoría Test 2'),
(3, 'Categoría Test 3'),
(4, 'Categoría Test 4');
```

### Usuario para autenticación
```sql
-- Usuario con permisos de editor
INSERT INTO usuario (alias, password, rol) VALUES 
('admin', 'hashed_password', 'editor');
```

## Respuestas esperadas

### ✅ Casos exitosos
- **201 Created**: Al crear nuevas relaciones
- **200 OK**: Al consultar, actualizar o eliminar relaciones
- **204 No Content**: Al eliminar relación específica

### ❌ Casos de error
- **400 Bad Request**: Datos de entrada inválidos
- **401 Unauthorized**: Sin token de autenticación
- **403 Forbidden**: Sin permisos de editor
- **404 Not Found**: Relación no encontrada
- **409 Conflict**: Relación duplicada

## Notas importantes

1. **Orden de ejecución**: Seguir el orden recomendado para evitar dependencias
2. **Limpieza**: Algunos tests eliminan datos, por lo que el orden importa
3. **Autenticación**: Siempre ejecutar el login primero
4. **Variables automáticas**: Los IDs se capturan automáticamente en algunos tests
5. **Claves compuestas**: La tabla usa claves compuestas (id_agente + id_categoria)

## Troubleshooting

### Error 401 - Unauthorized
- Verificar que el token esté configurado en el environment
- Ejecutar nuevamente el endpoint de Login

### Error 404 - Not Found
- Verificar que existan los agentes y categorías en la base de datos
- Revisar que los IDs usados en los tests sean correctos

### Error 500 - Internal Server Error
- Verificar que el servidor esté ejecutándose
- Revisar los logs del servidor para más detalles
- Verificar la conexión a la base de datos

## Ejecución automatizada

Para ejecutar toda la colección de forma automatizada:

1. Usar Newman (CLI de Postman):
```bash
npm install -g newman
newman run AgenteCategoria.postman_collection.json -e AgenteCategoria.postman_environment.json
```

2. O usar el Collection Runner en Postman:
   - Seleccionar la colección
   - Hacer clic en "Run"
   - Configurar el environment
   - Ejecutar todos los tests
