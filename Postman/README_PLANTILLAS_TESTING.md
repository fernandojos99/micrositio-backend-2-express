# 🚀 Guía de Testing con Postman - API Plantillas

## 📥 Importar en Postman

### 1. **Importar Colección:**
- Abre Postman
- Click en "Import" 
- Selecciona `PlantillasAPI.postman_collection.json`
- Click "Import"

### 2. **Importar Environment:**
- Click en "Import" nuevamente
- Selecciona `PlantillasAPI.postman_environment.json`
- Click "Import"
- Selecciona el environment "Plantillas API Environment" en la esquina superior derecha

## 🔧 Configuración Inicial

### Variables de Environment (ya configuradas):
```
base_url: http://localhost:3000
jwt_token: (se llenará automáticamente al hacer login)
id_empleado: 1
id_testing_card: 1
id_metrica: 15
```

### 📝 **IMPORTANTE:** Modifica estos valores según tu base de datos:
- `id_empleado`: ID de empleado existente en tu BD
- `id_testing_card`: ID de testing card existente en tu BD  
- `id_metrica`: ID de secuencia (métrica) existente en tu BD

## 🧪 Flujo de Testing Recomendado

### 🔐 **PASO 1: Autenticación**
1. Ejecuta `🔐 Auth > Login Editor`
2. Verifica que obtengas respuesta 200
3. El token JWT se guardará automáticamente en `{{jwt_token}}`

### 📋 **PASO 2: Testing PlantillaTestingCard**

#### 2.1 Listar todas (debería estar vacío inicialmente)
```
GET /plantilla_testing_card
```

#### 2.2 Crear nueva plantilla
```
POST /plantilla_testing_card
Body: {
    "id_testing_card": 1,
    "id_empleado": 1
}
```
- Verifica respuesta 201
- El UUID se guarda automáticamente en `{{plantilla_testing_card_id}}`

#### 2.3 Obtener por ID
```
GET /plantilla_testing_card/{{plantilla_testing_card_id}}
```

#### 2.4 Obtener por empleado
```
GET /plantilla_testing_card/empleado/1
```

#### 2.5 Obtener por testing card
```
GET /plantilla_testing_card/testing-card/1
```

#### 2.6 Actualizar plantilla
```
PATCH /plantilla_testing_card
Body: {
    "id_plantilla_testing_card": "{{plantilla_testing_card_id}}",
    "id_testing_card": 2,
    "id_empleado": 2
}
```

#### 2.7 Eliminar plantilla
```
DELETE /plantilla_testing_card
Body: {
    "id_plantilla_testing_card": "{{plantilla_testing_card_id}}"
}
```

### 📊 **PASO 3: Testing PlantillaMetricaTc**

#### 3.1 Seguir el mismo flujo pero con endpoints de métrica:
- `POST /plantilla_metrica_tc`
- `GET /plantilla_metrica_tc`
- `GET /plantilla_metrica_tc/{{plantilla_metrica_id}}`
- `GET /plantilla_metrica_tc/empleado/1`
- `GET /plantilla_metrica_tc/metrica/15`
- `PATCH /plantilla_metrica_tc`
- `DELETE /plantilla_metrica_tc`

## ✅ Casos de Prueba Importantes

### 🟢 **Casos de Éxito:**
- ✅ Crear plantilla con datos válidos → 201
- ✅ Listar todas las plantillas → 200
- ✅ Obtener plantilla existente por ID → 200
- ✅ Actualizar plantilla existente → 200
- ✅ Eliminar plantilla existente → 204

### 🔴 **Casos de Error:**
- ❌ Crear plantilla sin token → 401
- ❌ Crear plantilla con token inválido → 401
- ❌ Crear plantilla con datos inválidos → 400
- ❌ Crear relación duplicada → 409
- ❌ Obtener plantilla inexistente → 404
- ❌ Actualizar plantilla inexistente → 404
- ❌ Eliminar plantilla inexistente → 404

## 🛠️ Scripts Automáticos Incluidos

### **Login Script:**
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set('jwt_token', response.data.token);
    console.log('Token guardado:', response.data.token);
}
```

### **Create Scripts:**
```javascript
if (pm.response.code === 201) {
    const response = pm.response.json();
    pm.environment.set('plantilla_testing_card_id', response.id_plantilla_testing_card);
    console.log('ID guardado:', response.id_plantilla_testing_card);
}
```

## 🐛 Troubleshooting

### **Error 401 - Unauthorized:**
- Verifica que el token esté en el environment
- Haz login nuevamente
- Verifica que el usuario sea EDITOR

### **Error 404 - Not Found:**
- Verifica que los IDs en el environment existan en tu BD
- Revisa que el servidor esté corriendo en localhost:3000

### **Error 409 - Conflict:**
- La relación ya existe
- Cambia los valores de id_empleado o id_testing_card/id_metrica

### **Error 400 - Bad Request:**
- Revisa el formato del JSON en el body
- Verifica que los IDs sean números enteros positivos

## 📊 Resultados Esperados

### **Respuesta Exitosa (201 - Created):**
```json
{
    "id_plantilla_testing_card": "550e8400-e29b-41d4-a716-446655440000",
    "id_testing_card": 1,
    "id_empleado": 1,
    "creado": "2025-10-16T10:30:00.000Z",
    "actualizado": "2025-10-16T10:30:00.000Z"
}
```

### **Respuesta de Error (400 - Bad Request):**
```json
{
    "message": "Validación fallida: El ID de testing card debe ser un número positivo",
    "statusCode": 400,
    "status": "fail"
}
```

¡Listo para testear! 🎉
