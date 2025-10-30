# Testing de APIs de Plantillas - Guía Completa

## Resumen
Esta guía cubre el testing de las APIs de plantillas implementadas:

1. **Plantilla Métrica TC** - Con lógica de copia de métricas
2. **Plantilla Secuencia** - CRUD estándar

## Archivos Incluidos

- `PlantillasCompletas.postman_collection.json` - Colección completa de Postman
- `PlantillasCompletas.postman_environment.json` - Variables de entorno
- `plantilla_metrica_tc_api_documentation.json` - Documentación detallada Métrica TC
- `documentacion_plantilla_secuencia_api.json` - Documentación Secuencia

## Configuración Inicial

### 1. Importar en Postman
```
1. Abrir Postman
2. File > Import
3. Importar ambos archivos: collection.json y environment.json
4. Seleccionar el environment "Plantillas Completas Environment"
```

### 2. Configurar Variables de Entorno

Antes de ejecutar las pruebas, verificar estas variables en el environment:

```json
{
  "base_url": "http://localhost:3000",
  "metrica_original_id": "1",    // ID de métrica existente para copiar
  "secuencia_test_id": "1",      // ID de secuencia existente
  "user_id": "1"                 // Se actualiza automáticamente al hacer login
}
```

### 3. Prerequisitos de Base de Datos

Asegurar que existan:
- Al menos una métrica en `metrica_testing_card` (para plantilla_metrica_tc)
- Al menos una secuencia en `secuencia` (para plantilla_secuencia)
- Al menos un empleado en `empleado`
- Credenciales de login válidas

## Lógica de Negocio Especial

### Plantilla Métrica TC

**Flujo de Creación:**
1. Usuario proporciona `id_metrica_tc` (métrica original A) e `id_empleado`
2. Sistema verifica que existe la métrica A
3. Sistema crea una COPIA de la métrica A (métrica B) en `metrica_testing_card`
4. Sistema crea `plantilla_metrica_tc` con `id_metrica` apuntando a la métrica B
5. Retorna la plantilla con el ID de la métrica copiada

**Flujo de Eliminación:**
1. Usuario elimina plantilla por ID
2. Sistema busca la plantilla y su `id_metrica` (métrica B)
3. Sistema elimina la plantilla
4. Sistema elimina la métrica B de `metrica_testing_card`

**Importante:** La métrica original (A) nunca se modifica.

## Orden de Testing Recomendado

### Parte 1: Autenticación
1. **Login** - Obtener JWT token

### Parte 2: Plantilla Métrica TC
1. **Crear** - Crea plantilla y copia métrica
2. **Obtener por ID** - Verificar creación
3. **Obtener Todas** - Listar plantillas
4. **Obtener por Empleado** - Filtrar por empleado
5. **Actualizar** - Modificar plantilla
6. **Eliminar** - Elimina plantilla y métrica copiada

### Parte 3: Plantilla Secuencia
1. **Crear** - Crear nueva plantilla secuencia
2. **Obtener por ID** - Verificar creación
3. **Obtener Todas** - Listar plantillas
4. **Actualizar** - Modificar plantilla
5. **Eliminar** - Eliminar plantilla

## Scripts Automáticos Incluidos

### Auto-saves en Variables de Entorno
- JWT token se guarda automáticamente al hacer login
- IDs de plantillas creadas se guardan para usar en otros requests
- ID de métrica copiada se guarda para verificación

### Tests Automáticos
- Verificación de status codes
- Verificación de estructura de respuesta
- Validación de IDs generados
- Logs de información importante

## Validaciones Importantes

### Para Plantilla Métrica TC
```javascript
// Verificar que se creó métrica copiada diferente a la original
console.log('Métrica original:', pm.environment.get('metrica_original_id'));
console.log('Métrica copia:', pm.environment.get('metrica_copia_id'));
// Deben ser diferentes
```

### Para Plantilla Secuencia
```javascript
// Verificar estructura de respuesta estándar
{
  "success": true,
  "message": "...",
  "data": { ... }
}
```

## Troubleshooting

### Error 404 "Métrica original no existe"
- Verificar que `metrica_original_id` en environment apunte a métrica existente
- Ejecutar query: `SELECT * FROM metrica_testing_card LIMIT 5;`

### Error 404 "Secuencia no encontrada"
- Verificar que `secuencia_test_id` en environment apunte a secuencia existente
- Ejecutar query: `SELECT * FROM secuencia LIMIT 5;`

### Error 401 "Token requerido"
- Ejecutar request de Login primero
- Verificar que `jwt_token` se guardó en environment

### Error 400 "Datos inválidos"
- Verificar formato JSON en request body
- Verificar que los IDs sean números enteros positivos

## Verificación Manual en Base de Datos

### Después de crear Plantilla Métrica TC:
```sql
-- Verificar plantilla creada
SELECT * FROM plantilla_metrica_tc ORDER BY created_at DESC LIMIT 1;

-- Verificar métrica copiada
SELECT * FROM metrica_testing_card ORDER BY created_at DESC LIMIT 2;
-- Debe mostrar la métrica original y la copia
```

### Después de eliminar Plantilla Métrica TC:
```sql
-- Verificar que se eliminó la métrica copiada
SELECT * FROM metrica_testing_card WHERE id_metrica = <metrica_copia_id>;
-- No debe retornar registros
```

### Para Plantilla Secuencia:
```sql
-- Verificar plantillas de secuencia
SELECT * FROM plantilla_secuencia ORDER BY created_at DESC;
```

## Logs y Debugging

Los requests incluyen logs automáticos que muestran:
- IDs generados
- Tokens obtenidos
- Errores detallados
- Confirmaciones de operaciones

Revisar la consola de Postman para información detallada durante la ejecución.

## Endpoints Implementados

### Plantilla Métrica TC
- `POST /plantilla_metrica_tc` - Crear (con copia de métrica)
- `GET /plantilla_metrica_tc/:id` - Obtener por ID
- `GET /plantilla_metrica_tc` - Obtener todas
- `GET /plantilla_metrica_tc/empleado/:id_empleado` - Por empleado
- `PUT /plantilla_metrica_tc/:id` - Actualizar
- `DELETE /plantilla_metrica_tc/:id` - Eliminar (con métrica copiada)

### Plantilla Secuencia
- `POST /plantilla_secuencia` - Crear
- `GET /plantilla_secuencia/:id` - Obtener por ID
- `GET /plantilla_secuencia` - Obtener todas
- `PUT /plantilla_secuencia/:id` - Actualizar
- `DELETE /plantilla_secuencia/:id` - Eliminar

## Notas de Implementación

1. **Plantilla Métrica TC** usa lógica especial de copia de métricas
2. **Plantilla Secuencia** usa CRUD estándar con validaciones
3. Ambas requieren autenticación JWT
4. Ambas validan existencia de relaciones (empleado, métrica/secuencia)
5. Timestamps se manejan automáticamente
