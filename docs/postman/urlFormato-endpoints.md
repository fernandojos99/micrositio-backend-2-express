# Documentación API - URL Formato

## Base URL
```
http://localhost:3000/api/url-formato
```

## Endpoints

### 1. Obtener todas las URLs formato
**GET** `/obtener-todas`

**Headers:**
```
Content-Type: application/json
```

**Response (200):**
```json
[
  {
    "id_url_formato": 1,
    "url": "https://example.com",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  },
  {
    "id_url_formato": 2,
    "url": "https://another-example.com",
    "created_at": "2024-01-15T11:00:00.000Z",
    "updated_at": "2024-01-15T11:00:00.000Z"
  }
]
```

---

### 2. Obtener URL formato por ID
**GET** `/obtener-por-id?id_url_formato=1`

**Headers:**
```
Content-Type: application/json
```

**Query Parameters:**
- `id_url_formato` (required): ID de la URL formato

**Response (200):**
```json
{
  "id_url_formato": 1,
  "url": "https://example.com",
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T10:30:00.000Z"
}
```

**Response (404):**
```json
{
  "error": "URL formato no encontrada",
  "status": 404
}
```

---

### 3. Crear nueva URL formato
**POST** `/crear`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "url": "https://new-example.com"
}
```

**Response (201):**
```json
{
  "id_url_formato": 3,
  "url": "https://new-example.com",
  "created_at": "2024-01-15T12:00:00.000Z",
  "updated_at": "2024-01-15T12:00:00.000Z"
}
```

**Response (400) - Validation Error:**
```json
{
  "error": "La URL es requerida",
  "status": 400
}
```

---

### 4. Actualizar URL formato
**PUT** `/actualizar`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "id_url_formato": 1,
  "url": "https://updated-example.com"
}
```

**Response (200):**
```json
{
  "id_url_formato": 1,
  "url": "https://updated-example.com",
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T12:30:00.000Z"
}
```

**Response (404):**
```json
{
  "error": "URL formato no encontrada",
  "status": 404
}
```

---

### 5. Eliminar URL formato
**DELETE** `/eliminar`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "id_url_formato": 1
}
```

**Response (204):**
```
No Content
```

**Response (404):**
```json
{
  "error": "URL formato no encontrada",
  "status": 404
}
```

---

## Ejemplos de Pruebas en Postman

### Collection de Postman (JSON para importar)

```json
{
  "info": {
    "name": "URL Formato API",
    "description": "Collection para probar endpoints de URL Formato",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Obtener todas las URLs formato",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "url": {
          "raw": "{{base_url}}/obtener-todas",
          "host": ["{{base_url}}"],
          "path": ["obtener-todas"]
        }
      }
    },
    {
      "name": "Obtener URL formato por ID",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "url": {
          "raw": "{{base_url}}/obtener-por-id?id_url_formato=1",
          "host": ["{{base_url}}"],
          "path": ["obtener-por-id"],
          "query": [
            {
              "key": "id_url_formato",
              "value": "1"
            }
          ]
        }
      }
    },
    {
      "name": "Crear URL formato",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"url\": \"https://example.com\"\n}"
        },
        "url": {
          "raw": "{{base_url}}/crear",
          "host": ["{{base_url}}"],
          "path": ["crear"]
        }
      }
    },
    {
      "name": "Actualizar URL formato",
      "request": {
        "method": "PUT",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"id_url_formato\": 1,\n  \"url\": \"https://updated-example.com\"\n}"
        },
        "url": {
          "raw": "{{base_url}}/actualizar",
          "host": ["{{base_url}}"],
          "path": ["actualizar"]
        }
      }
    },
    {
      "name": "Eliminar URL formato",
      "request": {
        "method": "DELETE",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"id_url_formato\": 1\n}"
        },
        "url": {
          "raw": "{{base_url}}/eliminar",
          "host": ["{{base_url}}"],
          "path": ["eliminar"]
        }
      }
    }
  ],
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:3000/api/url-formato"
    }
  ]
}
```

## Variables de Entorno

Crear las siguientes variables en Postman:

- `base_url`: `http://localhost:3000/api/url-formato`

## Casos de Prueba Recomendados

1. **Flujo completo:**
   - Obtener todas las URLs (debe estar vacío inicialmente)
   - Crear una nueva URL
   - Obtener todas las URLs (debe mostrar la URL creada)
   - Obtener la URL por ID
   - Actualizar la URL
   - Eliminar la URL
   - Verificar que ya no existe

2. **Casos de error:**
   - Obtener URL con ID inexistente
   - Crear URL con datos inválidos (URL malformada)
   - Actualizar URL sin ID
   - Eliminar URL inexistente

3. **Validaciones:**
   - Campo URL requerido en crear
   - Formato de URL válido
   - ID numérico válido