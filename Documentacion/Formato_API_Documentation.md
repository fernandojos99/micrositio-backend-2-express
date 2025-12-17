# Formato API Documentation

Esta API maneja documentos para la tabla `formato`, permitiendo subir, consultar, actualizar y eliminar archivos.

## Base URL
```
http://localhost:3000/api/formato
```

## Endpoints

### 1. Upload Document
**POST** `/formato/upload`

Sube un nuevo documento al sistema.

#### Parámetros
- **Body**: `multipart/form-data`
  - `document` (File, required): Archivo a subir

#### Tipos de archivo permitidos
- PDF (application/pdf)
- JPEG/JPG (image/jpeg, image/jpg)
- PNG (image/png)
- MP4 (video/mp4)
- AVI (video/avi)

#### Límites
- Tamaño máximo: 10MB

#### Respuesta exitosa (201)
```json
{
  "success": true,
  "message": "Document uploaded successfully",
  "data": {
    "document": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "document_name": "example.pdf",
      "document_url": "/uploads/formatos/formato_1699123456789_abc123.pdf",
      "document_type": "pdf",
      "created_at": "2023-11-04T15:30:00.000Z",
      "updated_at": "2023-11-04T15:30:00.000Z"
    },
    "uploadPath": "/full/path/to/uploads/formatos/formato_1699123456789_abc123.pdf",
    "publicUrl": "/uploads/formatos/formato_1699123456789_abc123.pdf"
  }
}
```

#### Errores posibles
- **400**: No file provided / Invalid file type
- **413**: File too large
- **500**: Storage error / Internal error

---

### 2. Get All Documents
**GET** `/formato`

Obtiene todos los documentos del sistema.

#### Respuesta exitosa (200)
```json
{
  "success": true,
  "message": "Documents retrieved successfully",
  "data": {
    "documents": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "document_name": "example.pdf",
        "document_url": "/uploads/formatos/formato_1699123456789_abc123.pdf",
        "document_type": "pdf",
        "created_at": "2023-11-04T15:30:00.000Z",
        "updated_at": "2023-11-04T15:30:00.000Z"
      }
    ],
    "count": 1
  }
}
```

---

### 3. Get Document by ID
**GET** `/formato/:documentId`

Obtiene un documento específico por su UUID.

#### Parámetros
- **Path**: `documentId` (UUID, required): ID del documento

#### Respuesta exitosa (200)
```json
{
  "success": true,
  "message": "Document retrieved successfully",
  "data": {
    "document": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "document_name": "example.pdf",
      "document_url": "/uploads/formatos/formato_1699123456789_abc123.pdf",
      "document_type": "pdf",
      "created_at": "2023-11-04T15:30:00.000Z",
      "updated_at": "2023-11-04T15:30:00.000Z"
    }
  }
}
```

#### Errores posibles
- **400**: Invalid document ID format
- **404**: Document not found

---

### 4. Update Document
**PUT** `/formato/:documentId`

Actualiza los metadatos de un documento (no actualiza el archivo físico).

#### Parámetros
- **Path**: `documentId` (UUID, required): ID del documento
- **Body**: `application/json`
```json
{
  "document_name": "new_name.pdf",
  "document_type": "pdf"
}
```

#### Campos actualizables
- `document_name` (string): Nuevo nombre del documento
- `document_type` (string): Nuevo tipo del documento
- `document_url` (string): Nueva URL del documento

#### Respuesta exitosa (200)
```json
{
  "success": true,
  "message": "Document updated successfully",
  "data": {
    "document": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "document_name": "new_name.pdf",
      "document_url": "/uploads/formatos/formato_1699123456789_abc123.pdf",
      "document_type": "pdf",
      "created_at": "2023-11-04T15:30:00.000Z",
      "updated_at": "2023-11-04T15:35:00.000Z"
    }
  }
}
```

#### Errores posibles
- **400**: Invalid document ID / No update data provided
- **404**: Document not found

---

### 5. Delete Document
**DELETE** `/formato/:documentId`

Elimina un documento del sistema (base de datos y archivo físico).

#### Parámetros
- **Path**: `documentId` (UUID, required): ID del documento

#### Respuesta exitosa (200)
```json
{
  "success": true,
  "message": "Document deleted successfully",
  "data": {
    "document": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "document_name": "example.pdf",
      "document_url": "/uploads/formatos/formato_1699123456789_abc123.pdf",
      "document_type": "pdf",
      "created_at": "2023-11-04T15:30:00.000Z",
      "updated_at": "2023-11-04T15:30:00.000Z"
    },
    "storageDeleted": true
  }
}
```

#### Errores posibles
- **400**: Invalid document ID format
- **404**: Document not found

---

## Estructura de la base de datos

```sql
CREATE TABLE formato (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_name TEXT NOT NULL,
  document_url TEXT NOT NULL,
  document_type varchar(7), -- 'pdf', 'image', 'video', etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## Códigos de error comunes

| Código | Descripción |
|--------|-------------|
| FILE_REQUIRED | No se proporcionó archivo |
| FILE_TOO_LARGE | Archivo excede el límite de 10MB |
| INVALID_FILE_TYPE | Tipo de archivo no permitido |
| INVALID_DOCUMENT_ID | ID de documento inválido (debe ser UUID) |
| DOCUMENT_NOT_FOUND | Documento no encontrado |
| NO_UPDATE_DATA | No se proporcionaron datos para actualizar |
| STORAGE_ERROR | Error al guardar archivo en disco |
| INTERNAL_ERROR | Error interno del servidor |

## Importar en Postman

1. Abre Postman
2. Haz click en "Import"
3. Selecciona el archivo `Formato_API_Postman_Collection.json`
4. La colección se importará con todos los endpoints configurados

## Variables de entorno recomendadas

- `base_url`: `http://localhost:3000/api`
- `formato_document_id`: Se establece automáticamente al subir un documento