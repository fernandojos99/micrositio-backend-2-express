# Testing Cards API - Tests con Postman

Este directorio contiene la colección y environment de Postman para probar los endpoints de Testing Cards.

## 📋 Archivos incluidos

- `TestingCard.postman_collection.json` - Colección principal con todos los endpoints
- `TestingCard.postman_environment.json` - Variables de environment

## 🎯 Nuevo Endpoint: Aplicar Plantilla

### Descripción
El endpoint `PATCH /testing_card/aplicar-plantilla` permite aplicar los datos de una plantilla de testing card a una testing card existente.

### Funcionamiento
1. **Verifica** que exista la testing card destino
2. **Verifica** que exista la plantilla especificada
3. **Extrae** los datos de la testing card asociada a la plantilla:
   - `titulo`
   - `hipotesis` 
   - `id_experimento_tipo`
   - `descripcion`
4. **Aplica** esos datos a la testing card destino usando el método de actualización existente
5. **Elimina** todas las métricas existentes de la testing card destino
6. **Copia** todas las métricas de la testing card de la plantilla hacia la testing card destino

### Request
```http
PATCH /testing_card/aplicar-plantilla
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
    "id_testing_card": 123,
    "id_plantilla_testing_card": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

### Response Exitosa (200)
```json
{
    "success": true,
    "message": "Plantilla aplicada exitosamente",
    "data": {
        "id_testing_card": 123,
        "id_secuencia": 456,
        "padre_id": null,
        "titulo": "Título desde plantilla",
        "hipotesis": "Hipótesis desde plantilla",
        "id_experimento_tipo": 789,
        "descripcion": "Descripción desde plantilla",
        "dia_inicio": "2024-01-01",
        "dia_fin": "2024-01-31",
        "anexo_url": null,
        "id_responsable": 101,
        "status": "EN PLANEACION",
        "creado": "2024-01-25T10:00:00.000Z",
        "actualizado": "2024-01-25T14:30:00.000Z",
        "metricas_aplicadas": 3,
        "metricas": [
            {
                "id_metrica": 501,
                "nombre": "Conversión",
                "operador": ">",
                "criterio": "5%"
            },
            {
                "id_metrica": 502,
                "nombre": "Tiempo de Carga",
                "operador": "<",
                "criterio": "2 segundos"
            },
            {
                "id_metrica": 503,
                "nombre": "Satisfacción Usuario",
                "operador": ">=",  
                "criterio": "4.5/5"
            }
        ]
    }
}
```

### Errores Posibles
- **400** - Campo requerido faltante
- **404** - Testing card o plantilla no encontrada
- **500** - Error interno del servidor

## 🚀 Cómo usar

### 1. Importar en Postman
1. Abrir Postman
2. File → Import
3. Seleccionar ambos archivos (collection + environment)

### 2. Configurar Variables
En el environment, actualizar estas variables con valores reales:

- `base_url`: URL de tu servidor (ej: `http://localhost:3000`)
- `testing_card_id`: ID de una testing card existente
- `plantilla_testing_card_id`: UUID de una plantilla existente

### 3. Autenticación
1. Ejecutar el request "Login Editor" en la carpeta "🔐 Auth"
2. El token JWT se guardará automáticamente

### 4. Probar el Endpoint
1. Ir a la carpeta "📝 Testing Cards"
2. Ejecutar "🎯 Aplicar Plantilla"
3. Verificar que la respuesta sea exitosa

## 📝 Tests Incluidos

El endpoint incluye tests automáticos que verifican:
- Status code 200
- Presencia de `success: true`
- Presencia del objeto `data`
- Campos aplicados desde la plantilla
- **NUEVO**: Información de métricas copiadas (`metricas_aplicadas`)
- **NUEVO**: Array de métricas cuando se copiaron métricas

## 🔧 Variables Dinámicas

- `jwt_token`: Se obtiene automáticamente al hacer login
- `testing_card_copia_id`: Se asigna automáticamente al copiar una testing card

## 📚 Endpoints Disponibles

### Gestión Básica
- `GET /testing_card` - Listar todas
- `GET /testing_card/t/{id}` - Obtener por ID
- `GET /testing_card/s?id_secuencia={id}` - Obtener por secuencia
- `POST /testing_card` - Crear nueva
- `PATCH /testing_card` - Actualizar existente
- `DELETE /testing_card` - Eliminar

### Operaciones Especiales
- `POST /testing_card/{id}/copiar` - Copiar testing card
- `PATCH /testing_card/aplicar-plantilla` - **NUEVO** Aplicar plantilla

## 🎯 Flujo de Prueba Recomendado

1. **Autenticarse** (Login Editor)
2. **Listar** testing cards para obtener IDs válidos  
3. **Listar** plantillas para obtener IDs válidos
4. **Aplicar plantilla** usando los IDs obtenidos
5. **Verificar** que los datos se aplicaron correctamente

## ⚠️ Notas Importantes

- Los IDs de plantilla son UUIDs (formato: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)
- Los IDs de testing card son números enteros
- Se requiere autenticación JWT para todos los endpoints
- El endpoint preserva todos los demás campos de la testing card destino
- **IMPORTANTE**: Las métricas existentes de la testing card destino se eliminan antes de copiar las nuevas
- Las métricas copiadas no incluyen el campo `resultado` (se deja null para cálculo posterior)

## 🐛 Troubleshooting

### Error 404 "Testing card no encontrada"
- Verificar que el `id_testing_card` existe en la base de datos
- Usar el endpoint "Listar Todas" para obtener IDs válidos

### Error 404 "Plantilla testing card no encontrada"  
- Verificar que el `id_plantilla_testing_card` existe
- Usar las APIs de plantillas para obtener UUIDs válidos

### Error 401 "Unauthorized"
- Ejecutar "Login Editor" para obtener un token válido
- Verificar que el token no haya expirado
