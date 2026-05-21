# AGENTS.md — Micrositio Iris Backend

## Comandos
- `npm run dev` — desarrollo con nodemon (hot-reload)
- `npm start` — producción con `node src/app.js`
- No hay scripts de test, lint, ni typecheck. No hay CI/CD ni Docker.

## Arquitectura
- **Node.js (ESM) + Express**, capas: Route → Controller → Service → Repository → Model
- **Validación con Zod** (schemas en `middlewares/validation/`)
- **Autenticación JWT** — tres middlewares en `middlewares/authMiddleware.js`:
  - `authMiddleware` —任何 token válido
  - `soloEditores` — solo rol EDITOR
  - `verificarAccesoProyecto` — visitantes limitados a sus proyectos
- Tipos de usuario: `EDITOR` (acceso total), `VISITANTE` (por proyecto)
- Error handling: `ApiError` (statusCode + status `'fail'`/`'error'`) + `errorHandler.js`

## Base de datos
- **Supabase (PostgreSQL)** via `@supabase/supabase-js` SDK — **NO se usa Sequelize** a pesar de estar en package.json
- Cliente en `src/config/supabaseClient.js`, requiere `SUPABASE_URL` y `SUPABASE_KEY`
- Schema completo en `SQL/DML.sql`, funciones en `SQL/Funciones.sql`, triggers en `SQL/Trigger.sql`

## Entrypoint
`src/app.js` — registra ~28 rutas. CORS permite 4 orígenes (Vercel producción + localhost:5173/5174).

## .env (requerido)
`SUPABASE_URL`, `SUPABASE_KEY`, `PORT`, `NODE_ENV`, `EMAIL_USER`, `EMAIL_PASSWORD`
⚠️ Credenciales reales están en `src/.env` — **no commitear**.

## Testing
No hay framework de test. Pruebas manuales en `src/test/testAccionable.js` (ejecutar con `node src/test/testAccionable.js`, todas las llamadas están comentadas).

## Batch / seed data
Scripts en `batch/`: `crearEmpleados.js`, `crearUsuarios.js`, etc.

## Documentación de referencia
- `MANUAL_BACKEND.md` — arquitectura detallada (668 líneas)
- `Documentacion/` — docs de autenticación, categorías, notificaciones, usuarios
- `Postman/` — colecciones para probar todos los endpoints
