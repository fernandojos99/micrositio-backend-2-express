# 📘 MANUAL DEL BACKEND - MICROSITIO IRIS

## 🏗️ Arquitectura del Proyecto

Este backend sigue una **arquitectura en capas** que separa responsabilidades y facilita el mantenimiento. El flujo de datos va desde la **Route** hasta el **Repository** y regresa transformado al cliente.

```
Cliente HTTP → Route → Controller → Service → Repository → Base de Datos (Supabase)
                ↓          ↓           ↓           ↓
              Schema    Validación   Lógica    Consultas SQL
                                    Negocio
                ↓
              Model (transformación de datos)
```

---

## 📂 CAPA 1: APP (app.js)

### **¿Para qué sirve?**
Es el **punto de entrada** de la aplicación. Configura Express, middlewares globales, CORS, rutas y manejo de errores.

### **Responsabilidades:**
- Inicializar el servidor Express
- Configurar CORS para permitir peticiones desde el frontend
- Registrar todas las rutas del sistema
- Configurar middlewares globales (body-parser, errorHandler)
- Exponer endpoint de health check

### **Consideraciones importantes:**
- **CORS:** Asegúrate de que los orígenes permitidos incluyan las URLs del frontend en producción
- **Puerto:** Se configura con variable de entorno `PORT` (por defecto 3000)
- **Health check:** El endpoint `/health` es útil para monitoreo y mantener el servicio activo en plataformas como Render
- **Body parser:** Necesario para parsear JSON en las peticiones
- **Error handler:** Debe ser el último middleware registrado

### **Variables de entorno requeridas:**
```env
PORT=3000
SUPABASE_URL=tu_url_de_supabase
SUPABASE_KEY=tu_key_de_supabase
JWT_SECRET=tu_secreto_jwt
```

### **Ejemplo del código:**
```javascript
// Configurar rutas
app.use('/proyectos', proyectoRoutes);
app.use('/empleados', empleadoRoutes);
// ... más rutas

// Health check para monitoreo
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Error handler al final
app.use(errorHandler);
```

---

## 📂 CAPA 2: ROUTES (proyectoRoutes.js)

### **¿Para qué sirve?**
Define los **endpoints HTTP** disponibles y los asocia con los métodos del Controller. Aquí se aplican middlewares de autenticación y autorización.

### **Responsabilidades:**
- Definir las rutas (GET, POST, PATCH, DELETE)
- Aplicar middlewares de seguridad (`authMiddleware`, `soloEditores`)
- Vincular cada ruta con un método del Controller
- Documentar endpoints (comentarios Swagger)

### **Consideraciones importantes:**
- **Autenticación:** Usar `authMiddleware` en todas las rutas protegidas
- **Autorización:** Usar `soloEditores` para operaciones de escritura (crear, actualizar, eliminar)
- **Filtros de acceso:** `configurarFiltroProyectos` permite que visitantes solo vean sus proyectos asignados
- **Binding:** Usar `.bind(controller)` para mantener el contexto de `this`
- **Métodos HTTP:** 
  - GET: Consultar
  - POST: Crear
  - PATCH: Actualizar parcialmente
  - DELETE: Eliminar

### **Flujo de seguridad:**
1. **EDITORES:** Pueden crear, ver todos, actualizar y eliminar proyectos
2. **VISITANTES:** Solo pueden ver proyectos que les fueron asignados

### **Ejemplo del código:**
```javascript
// Ver todos los proyectos (con filtro según rol)
router.get('/', authMiddleware, configurarFiltroProyectos, proyectoController.listarProyectos);

// Ver proyecto específico (con verificación de acceso)
router.get('/p', authMiddleware, verificarAccesoProyecto, proyectoController.obtenerProyecto);

// Crear proyecto (solo editores)
router.post('/', authMiddleware, soloEditores, proyectoController.crearProyecto);
```

---

## 📂 CAPA 3: CONTROLLER (proyectoController.js)

### **¿Para qué sirve?**
Recibe las peticiones HTTP, **valida la entrada**, llama al Service correspondiente y devuelve la respuesta HTTP formateada.

### **Responsabilidades:**
- Extraer parámetros de la petición (body, params, query)
- Validar entrada usando schemas de Zod (se hace la llamada a las clases Schema dentro de las carpeta : middleware > validation)
- Llamar al Service para ejecutar la lógica de negocio
- Formatear la respuesta HTTP (códigos de estado, JSON)
- Manejar errores y pasarlos al `next(error)` para el errorHandler

### **Consideraciones importantes:**
- **No contiene lógica de negocio:** Solo orquesta la petición
- **Validación:** Usar schemas de Zod antes de llamar al Service
- **Códigos HTTP:**
  - 200: Éxito en consulta
  - 201: Recurso creado exitosamente
  - 204: Eliminación exitosa (sin contenido)
  - 400: Datos inválidos
  - 404: Recurso no encontrado
  - 500: Error del servidor
- **Try-catch:** Siempre capturar errores y pasarlos a `next(error)`
- **Inyección de dependencias:** El Service se instancia en el constructor

### **Ejemplo del código:**
```javascript
async crearProyecto(req, res, next) {
  try {
    // 1. Validar entrada
    const validatedData = proyectoCreateSchema.parse(req.body);
    
    // 2. Llamar al Service
    const proyecto = await this.proyectoService.crearProyecto(validatedData);
    
    // 3. Devolver respuesta
    res.status(201).json(proyecto);
  } catch (error) {
    next(error); // Pasar al errorHandler
  }
}
```

---

## 📂 CAPA 4: SCHEMA (proyectoSchema.js)

### **¿Para qué sirve?**
Define las **reglas de validación** para los datos de entrada usando **Zod**. Asegura que los datos cumplan con el formato esperado antes de procesarlos.

### **Responsabilidades:**
- Validar tipos de datos (string, number, date, etc.)
- Validar restricciones (min, max, formato UUID, etc.)
- Definir valores por defecto
- Generar mensajes de error descriptivos
- Separar validación de creación vs actualización

### **Consideraciones importantes:**
- **Zod:** Librería de validación con inferencia de tipos TypeScript
- **Schemas separados:**
  - `CreateSchema`: Validación para crear (campos requeridos)
  - `UpdateSchema`: Validación para actualizar (todos los campos opcionales con `.partial()`)
- **Mensajes claros:** Describir exactamente qué está mal
- **Coerción de tipos:** Usar `z.coerce.date()` para convertir strings a fechas
- **Valores por defecto:** Definir con `.default(valor)`
- **Enums:** Para campos con valores fijos (`estado: ACTIVO, INACTIVO, COMPLETADO`)

### **Ejemplo del código:**
```javascript
const proyectoCreateSchema = z.object({
  titulo: z.string()
    .min(3, 'El título debe tener al menos 3 caracteres')
    .max(50, 'El título no puede exceder los 50 caracteres'),
  estado: z.enum(['ACTIVO', 'INACTIVO', 'COMPLETADO'])
    .optional()
    .default('ACTIVO'),
  fecha_inicio: z.coerce.date().optional(),
  id_lider: z.number().int().positive('El ID del líder debe ser un número positivo')
});

// Para actualización: todos los campos opcionales
const proyectoUpdateSchema = proyectoCreateSchema.partial();
```

---

## 📂 CAPA 5: SERVICE (proyectoService.js)

### **¿Para qué sirve?**
Contiene la **lógica de negocio** de la aplicación. Orquesta múltiples repositorios, valida reglas de negocio y coordina operaciones complejas.

### **Responsabilidades:**
- Ejecutar la lógica de negocio
- Coordinar múltiples repositorios (validar relaciones entre entidades)
- Aplicar reglas de negocio complejas
- Validar existencia de entidades relacionadas
- Transformar datos entre capas
- Lanzar errores de negocio con `ApiError`

### **Consideraciones importantes:**
- **Validaciones de negocio:**
  - Verificar que el líder exista antes de asignar un proyecto
  - Verificar que la categoría exista
  - Validar permisos de acceso según roles (Editor vs Visitante)
- **Transacciones:** Si una operación implica múltiples tablas, considerar usar transacciones de Supabase
- **Reutilización:** Los Services pueden llamar a otros Services si es necesario
- **No acceder a la DB directamente:** Siempre usar Repositories
- **Inyección de dependencias:** Instanciar todos los Repositories necesarios en el constructor

### **Flujo típico en Service:**
1. Validar datos de entrada (ya validados por Schema, aquí se valida negocio)
2. Verificar existencia de entidades relacionadas
3. Llamar al Repository para persistir/consultar
4. Transformar respuesta con `.toAPI()`
5. Retornar resultado o lanzar `ApiError`

### **Ejemplo del código:**
```javascript
async crearProyecto(proyectoData) {
  // 1. Validar que la categoría existe
  const categoria = await this.categoriaRepo.obtenerPorId(proyectoData.id_categoria);
  if (!categoria) {
    throw new ApiError('Categoría no encontrada', 404);
  }

  // 2. Validar que el líder existe
  if (proyectoData.id_lider) {
    const lider = await this.empleadoRepo.obtenerPorId(proyectoData.id_lider);
    if (!lider) {
      throw new ApiError('Líder no encontrado', 404);
    }
  }

  // 3. Crear el proyecto
  const proyecto = await this.proyectoRepo.crear(proyectoData);
  
  // 4. Transformar y retornar
  return proyecto.toAPI();
}
```

---

## 📂 CAPA 6: REPOSITORY (proyectoRepository.js)

### **¿Para qué sirve?**
Capa de **acceso a datos**. Interactúa directamente con la base de datos (Supabase) y traduce entre el formato de BD y los Models.

### **Responsabilidades:**
- Ejecutar queries SQL a través del cliente de Supabase
- Mapear resultados de BD a instancias de Model
- Manejar errores de base de datos
- Encapsular toda la lógica de persistencia
- Proveer métodos CRUD básicos

### **Consideraciones importantes:**
- **Supabase client:** Usar el cliente configurado en `supabaseClient.js`
- **Errores:** Siempre capturar errores de Supabase y lanzar `ApiError`
- **Código PGRST116:** Error de Supabase cuando no se encuentra un registro (manejarlo explícitamente)
- **Select:** Especificar columnas con `.select('*')` o campos específicos
- **Single vs múltiples:** Usar `.single()` cuando esperas un solo resultado
- **Mapeo:** Siempre retornar instancias de Model usando `Model.fromDatabase(data)`
- **Métodos comunes:**
  - `obtenerPorId(id)`: Buscar por ID
  - `crear(data)`: Insertar nuevo registro
  - `actualizar(id, data)`: Actualizar registro existente
  - `eliminar(id)`: Borrar registro
  - `listarTodos()`: Obtener todos los registros
  - `listarPorIds(ids)`: Obtener múltiples por array de IDs
  - `buscarPorTexto(q)`: Búsqueda con texto parcial

### **Ejemplo del código:**
```javascript
async obtenerPorId(id_proyecto) {
  const { data, error } = await supabase
    .from('proyecto')
    .select('*')
    .eq('id_proyecto', id_proyecto)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new ApiError(`Error al obtener proyecto: ${error.message}`, 500);
  }

  return data ? Proyecto.fromDatabase(data) : null;
}

async listarPorIds(ids_proyectos) {
  const { data, error } = await supabase
    .from('proyecto')
    .select('*')
    .in('id_proyecto', ids_proyectos); // Filtro con array de IDs

  if (error) {
    throw new ApiError(`Error al listar proyectos: ${error.message}`, 500);
  }

  return data.map(proyecto => Proyecto.fromDatabase(proyecto));
}
```

---

## 📂 CAPA 7: MODEL (Proyecto.js)

### **¿Para qué sirve?**
Representa una **entidad de dominio**. Define la estructura de datos, transforma entre formatos (DB ↔ API) y contiene validaciones básicas.

### **Responsabilidades:**
- Definir la estructura de la entidad
- Transformar datos de BD a formato interno (`fromDatabase`)
- Transformar datos internos a formato API (`toAPI`)
- Transformar datos internos a formato BD (`toDatabase`)
- Aplicar valores por defecto
- Validación de tipos y formatos

### **Consideraciones importantes:**
- **Inmutabilidad:** Los modelos no deben modificarse directamente después de crearse
- **Transformaciones:**
  - `fromDatabase(dbData)`: DB → Model (snake_case → camelCase, strings → Dates)
  - `toAPI()`: Model → JSON para cliente (fechas a ISO, renombrar campos)
  - `toDatabase()`: Model → formato para insertar/actualizar en BD
- **Fechas:** Convertir strings de BD a objetos `Date`, y `Date` a ISO string para API
- **Validación estática:** Métodos `validateCreate` y `validateUpdate` usando schemas de Zod
- **Valores por defecto:** Aplicar en el constructor (ej: `estado = 'ACTIVO'`)

### **Ejemplo del código:**
```javascript
class Proyecto {
  constructor(data) {
    this.id_proyecto = data.id_proyecto;
    this.titulo = data.titulo;
    this.estado = data.estado || 'ACTIVO'; // Valor por defecto
    this.fecha_inicio = data.fecha_inicio ? new Date(data.fecha_inicio) : null;
    this.created_at = new Date(data.created_at || Date.now());
  }

  // Crear desde BD
  static fromDatabase(dbData) {
    return new Proyecto({
      id_proyecto: dbData.id_proyecto,
      titulo: dbData.titulo,
      // ... más campos
    });
  }

  // Formato para la BD
  toDatabase() {
    return {
      titulo: this.titulo,
      estado: this.estado,
      fecha_inicio: this.fecha_inicio,
      // No incluir id_proyecto (auto-generado)
    };
  }

  // Formato para la API
  toAPI() {
    return {
      id: this.id_proyecto,
      titulo: this.titulo,
      estado: this.estado,
      fecha_inicio: this.fecha_inicio?.toISOString().split('T')[0], // Solo fecha
      creado: this.created_at.toISOString()
    };
  }
}
```

---

## 🔄 FLUJO COMPLETO DE UNA PETICIÓN

### **Ejemplo: Crear un Proyecto**

```
1. Cliente envía POST /proyectos
   Body: { titulo: "Nuevo Proyecto", id_categoria: 1, id_lider: 5 }

2. Route (proyectoRoutes.js)
   ↓ Middleware authMiddleware: Verifica JWT
   ↓ Middleware soloEditores: Verifica que el usuario sea EDITOR
   ↓ Llama a proyectoController.crearProyecto()

3. Controller (proyectoController.js)
   ↓ Valida entrada con proyectoCreateSchema.parse(req.body)
   ↓ Llama a proyectoService.crearProyecto(validatedData)

4. Service (proyectoService.js)
   ↓ Verifica que la categoría con id_categoria=1 existe (llama a categoriaRepo)
   ↓ Verifica que el empleado con id_lider=5 existe (llama a empleadoRepo)
   ↓ Llama a proyectoRepo.crear(proyectoData)

5. Repository (proyectoRepository.js)
   ↓ Ejecuta INSERT en Supabase: supabase.from('proyecto').insert(data)
   ↓ Retorna datos insertados
   ↓ Mapea a Model: Proyecto.fromDatabase(data[0])

6. Model (Proyecto.js)
   ↓ Crea instancia de Proyecto con los datos de BD
   ↓ Service llama a proyecto.toAPI() para transformar respuesta

7. Controller devuelve res.status(201).json(proyecto)

8. Cliente recibe:
   {
     id: 123,
     titulo: "Nuevo Proyecto",
     estado: "ACTIVO",
     id_categoria: 1,
     id_lider: 5,
     creado: "2024-01-15T10:30:00.000Z"
   }
```

---

## 🛡️ SEGURIDAD Y AUTENTICACIÓN

### **Middlewares de seguridad:**

1. **authMiddleware:** Verifica que el token JWT sea válido y extrae el usuario
2. **soloEditores:** Verifica que el usuario tenga rol EDITOR
3. **configurarFiltroProyectos:** Configura filtros según el rol del usuario
4. **verificarAccesoProyecto:** Verifica que un visitante tenga acceso al proyecto solicitado

### **Flujo de autenticación:**
```javascript
// En la petición, el frontend envía:
Authorization: Bearer <token_jwt>

// authMiddleware decodifica el token y añade a req:
req.user = {
  id_usuario: 'uuid',
  tipo: 'EDITOR' | 'VISITANTE'
}

// soloEditores verifica:
if (req.user.tipo !== 'EDITOR') {
  throw new ApiError('No autorizado', 403);
}
```

---

## 📦 ESTRUCTURA DEL PROYECTO

```
Micrositio-Iris-Backend/
├── src/
│   ├── app.js                    # ✅ Punto de entrada
│   ├── config/
│   │   └── supabaseClient.js     # Configuración de Supabase
│   ├── controllers/              # ✅ Controladores
│   │   ├── proyectoController.js
│   │   ├── empleadoController.js
│   │   └── ...
│   ├── services/                 # ✅ Lógica de negocio
│   │   ├── proyectoService.js
│   │   └── ...
│   ├── repositories/             # ✅ Acceso a datos
│   │   ├── proyectoRepository.js
│   │   └── ...
│   ├── models/                   # ✅ Modelos de dominio
│   │   ├── Proyecto.js
│   │   └── ...
│   ├── routes/                   # ✅ Definición de endpoints
│   │   ├── proyectoRoutes.js
│   │   └── ...
│   ├── middlewares/
│   │   ├── authMiddleware.js     # Autenticación y autorización
│   │   ├── errorHandler.js       # Manejo global de errores
│   │   └── validation/           # ✅ Schemas de validación
│   │       ├── proyectoSchema.js
│   │       └── ...
│   └── utils/
│       └── ApiError.js           # Clase para errores personalizados
├── .env                          # Variables de entorno
├── package.json
└── README.md
```

---

## 🚀 COMANDOS IMPORTANTES

```bash
# Instalar dependencias
npm install

# Iniciar servidor en desarrollo
npm run dev

# Iniciar servidor en producción
npm start

# Variables de entorno necesarias (.env)
PORT=3000
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_KEY=tu_anon_key
JWT_SECRET=tu_secreto_super_seguro
```

---

## 🔧 DEPENDENCIAS PRINCIPALES

- **express**: Framework web
- **@supabase/supabase-js**: Cliente de Supabase (base de datos)
- **zod**: Validación de schemas
- **jsonwebtoken**: Autenticación con JWT
- **cors**: Configuración de CORS
- **dotenv**: Variables de entorno
- **body-parser**: Parseo de JSON

---

## 🐛 MANEJO DE ERRORES

### **ApiError (utils/ApiError.js)**
Clase personalizada para errores con código de estado HTTP:

```javascript
throw new ApiError('Recurso no encontrado', 404);
throw new ApiError('Datos inválidos', 400);
throw new ApiError('No autorizado', 403);
```

### **errorHandler (middlewares/errorHandler.js)**
Middleware global que captura todos los errores y los formatea:

```javascript
{
  success: false,
  message: "Mensaje de error",
  statusCode: 404
}
```

---

## 📊 BASE DE DATOS (Supabase)

### **Tablas principales relacionadas con Proyectos:**

- **proyecto**: Información de proyectos
- **categoria**: Categorías de proyectos
- **empleado**: Empleados que pueden ser líderes
- **usuario_proyecto**: Relación entre usuarios y proyectos (asignaciones)

### **Configuración en supabaseClient.js:**
```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export default supabase;
```

---

## ✅ CHECKLIST PARA CONTINUAR EL PROYECTO

### **Antes de continuar:**
- [ ] Leer este manual completamente
- [ ] Configurar variables de entorno en `.env`
- [ ] Instalar dependencias con `npm install`
- [ ] Verificar acceso a Supabase
- [ ] Probar endpoint `/health` para confirmar que el servidor inicia

### **Para agregar una nueva entidad:**
1. Crear tabla en Supabase
2. Crear Model en `src/models/`
3. Crear Schema de validación en `src/middlewares/validation/`
4. Crear Repository en `src/repositories/`
5. Crear Service en `src/services/`
6. Crear Controller en `src/controllers/`
7. Crear Routes en `src/routes/`
8. Registrar routes en `src/app.js`

### **Para modificar una entidad existente:**
1. Actualizar tabla en Supabase (migración)
2. Actualizar Model (agregar/modificar campos)
3. Actualizar Schema de validación
4. Actualizar Repository si hay nuevas queries
5. Actualizar Service si hay nueva lógica de negocio
6. Actualizar Controller si hay nuevos endpoints
7. Actualizar Routes si hay nuevos endpoints

---

## 🚨 PROBLEMAS COMUNES Y SOLUCIONES

### **1. Error de CORS**
**Problema:** Frontend no puede hacer peticiones
**Solución:** Agregar el origen del frontend en `app.js`:
```javascript
app.use(cors({
  origin: ['http://localhost:5173', 'https://tu-frontend.vercel.app']
}));
```

### **2. Error de autenticación**
**Problema:** Token JWT inválido o expirado
**Solución:** Verificar que `JWT_SECRET` sea el mismo que genera los tokens. Verificar expiración del token.

### **3. Error de Supabase**
**Problema:** No puede conectarse a la BD
**Solución:** Verificar `SUPABASE_URL` y `SUPABASE_KEY` en `.env`

### **4. Validación fallida**
**Problema:** Zod rechaza datos válidos
**Solución:** Revisar el schema en `*Schema.js` y asegurarse de que los tipos coincidan

---

## 📞 CONTACTOS Y ACCESOS

### **Repositorio:**
- GitHub: 

### **Servicios externos:**
- **Supabase:** 
- **Hosting:** [Render]

### **Documentación adicional:**
- Postman collection: 
- Documentación de API: 

---

## 🎯 DECISIONES ARQUITECTÓNICAS IMPORTANTES

1. **¿Por qué Supabase?** Base de datos PostgreSQL con autenticación integrada y API REST automática
2. **¿Por qué esta arquitectura en capas?** Separación de responsabilidades, testeable, mantenible
3. **¿Por qué Zod?** Validación con inferencia de tipos, mejor que Joi o Yup
4. **¿Por qué JWT?** Autenticación stateless, escalable
5. **Filtros por rol:** Los EDITORES ven todo, los VISITANTES solo sus proyectos asignados

---

## 📚 RECURSOS ÚTILES

- [Documentación de Express](https://expressjs.com/)
- [Documentación de Supabase](https://supabase.com/docs)
- [Documentación de Zod](https://zod.dev/)
- [Guía de REST API](https://restfulapi.net/)

---

## 🎓 GLOSARIO

- **DTO:** Data Transfer Object (objeto de transferencia de datos)
- **CRUD:** Create, Read, Update, Delete
- **JWT:** JSON Web Token (token de autenticación)
- **Middleware:** Función que intercepta peticiones HTTP
- **Repository Pattern:** Patrón que abstrae el acceso a datos
- **Service Layer:** Capa que contiene lógica de negocio
- **Schema:** Definición de estructura y validación de datos

---

**✨ ¡Éxito con el proyecto! Este manual debería facilitar la continuidad del desarrollo.**
