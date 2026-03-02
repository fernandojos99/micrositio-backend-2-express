# Micrositio_Iris - Backend API
# 🚀 Backend para Gestión de Proyectos Internos

API desarrollada para administrar proyectos  en Iris Star up Lap. Utiliza Node.js, Express y Supabase (PostgreSQL) para proveer datos al frontend interactivo construido con React Flow.

## 🔍 Funcionalidades Principales
✅ CRUD completo para proyectos internos
✅ Validación robusta de datos con Zod
✅ Autenticación JWT (próximamente)
✅ Conexión segura con Supabase (PostgreSQL)
✅ Documentación API lista para integrar con frontend

## 🛠 Stack Tecnológico
Tecnología	Uso
Node.js	Entorno de ejecución
Express	Framework web
Supabase	Base de datos PostgreSQL
Zod	Validación de esquemas
JWT	Autenticación (en desarrollo)

## ⚙️ Requisitos del Sistema
Node.js >= 18.x

npm >= 9.x

Cuenta en Supabase

Postman (para pruebas API)

## 🌐 Variables de Entorno
Archivo .env requerido:

SUPABASE_URL="https://xxxx.supabase.co"
SUPABASE_KEY="eyJhbGciOiJIUz..."
PORT=3000

# JWT_SECRET="clave_secreta" # (Próximamente)

## 🏗 Estructura del Proyecto
text
src/
├── controllers/     # Lógica de endpoints
├── models/          # Modelos de datos
├── routes/          # Definición de rutas
├── services/        # Reglas de negocio
├── repositories/    # Conexión con Supabase
└── middlewares/     # Validaciones y auth
🔌 Integración con Frontend
Este backend está diseñado para conectarse con el frontend de Micrositio Iris que utiliza React Flow.


## 📊 Próximas Características
Autenticación JWT

Endpoints para Testing/Learning Cards

Integración con WebSockets para updates en tiempo real

Documentación Swagger/OpenAPI

🚀 Instalación Rápida

```bash
# 1. Clonar repositorio
git clone https://github.com/tu-org/micrositio-iris-backend.git

# 2. Instalar dependencias
npm install
npm install multer
npm install uuid
npm install jsonwebtoken bcryptjs

# 3. Configurar entorno (crear archivo .env)
cp .env.example .env
# Editar .env con tus credenciales Supabase

# 4. Iniciar servidor
cd src
node app.js

<!--test of build-->


