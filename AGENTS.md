# AGENTS.md — Micrositio Iris Backend

## Comandos
- `npm run dev` — nodemon hot-reload (CWD=root, `node src/app.js`)
- `npm start` — `node src/app.js`
- `node src/test/testAccionable.js` — test manual (llamadas comentadas)
- `node batch/crearEmpleados.js` antes que `node batch/crearUsuarios.js` (FK: usuarios.id_empleado → empleados)
- `node batch/cambiarContraseña.js` — script de reseteo de password
- No hay scripts de test, lint, typecheck, build, format, ni CI/CD

## Arranque y `.env`
- `.env` está en **`src/.env`**, NO en raíz. `dotenv.config()` sin path busca `.env` en CWD.
- `npm start` desde raíz no encuentra `src/.env`. O bien arrancar desde `src/` (`cd src && node app.js` como dice el README), o mover `.env` a raíz, o cambiar el script a `"start": "cd src && node app.js"`.
- `dotenv.config()` se llama independientemente en `src/app.js:45` y `src/config/supabaseClient.js:6`. Ambas usan CWD lookup.
- Variables requeridas: `SUPABASE_URL`, `SUPABASE_KEY`, `PORT`, `NODE_ENV`, `EMAIL_USER`, `EMAIL_PASSWORD`, `JWT_SECRET`, `AGENT_API_URL`

## Arquitectura
- **Node.js (ESM, `"type": "module"` en package.json) + Express**, 5 capas: Route → Controller → Service → Repository → Model
- **Validación Zod** en `src/middlewares/validation/` (22 schemas). Se llama con `schema.parse(req.body)` desde controllers. Excepción: `accionableController` no usa Zod.
- **Autenticación JWT** — 4 middlewares en `src/middlewares/authMiddleware.js`:
  - `authMiddleware` — cualquier token válido, adjunta `req.user`
  - `soloEditores` — solo rol `EDITOR`
  - `verificarAccesoProyecto` — visitantes limitados a sus proyectos (`req.user.proyectos`)
  - `configurarFiltroProyectos` — inyecta `req.filtroProyectos` para filtrado downstream
- **ApiError** (`src/utils/ApiError.js`) — `statusCode` + `status: 'fail'|'error'` + `isOperational`
- **errorHandler** (`src/middlewares/errorHandler.js`) — último middleware, stack trace solo en development

## Entrypoint `src/app.js`
- Registra **32 prefijos de ruta** (líneas 85–115), más `GET /`, `GET /health`, y código comentado de upload de imágenes
- CORS: 4 orígenes (2 Vercel + localhost:5173/5174). Editar `app.js:57-63` para añadir más
- `bodyParser.json()` + `express.json()` — ambos registrados (redundante pero inocuo)
- Multer configurado (memoryStorage) pero **comentado**, no usado
- Endpoint chat stream (`POST /api/chat/stream`) hace proxy SSE a `AGENT_API_URL` (Lambda) vía `chatRepository.js`

## Convenciones críticas (fáciles de omitir)
- **`.bind(controller)`** en cada handler de ruta — los controllers son clases ES6, sin bind se pierde `this`. Excepción: `accionableController` exporta funciones planas, no clase.
- **IDs por body vs URL params** — inconsistente por recurso:
  - `proyecto` routes: `req.body.id_proyecto` (no params)
  - `usuario` routes: `req.params.id` o `req.params.id_usuario`
  - `usuarioProyecto` routes: `req.params.id_usuario` y/o `req.params.id_proyecto`
  - `sesion` routes: `req.params.thread_id`
  - Verificar cada ruta antes de asumir el patrón.
- **`GET /proyectos/p` y `POST /proyectos/p`** — ambos existen, mismo handler (obtenerProyecto), mismo body con `id_proyecto`
- **`GET /proyectos/usuario/:id_usuario`** — obtiene proyectos de un usuario específico
- **Excepción al patrón de clases**: `accionableController.js` y `accionableRepository.js` usan named exports de funciones. El resto del código usa clases ES6.

## Base de datos
- **Supabase (PostgreSQL)** vía `@supabase/supabase-js` — **NO se usa Sequelize** (aunque está en package.json, junto con `pg`, `pg-hstore`, `mysql2` — todos no utilizados)
- Cliente en `src/config/supabaseClient.js`, requiere `SUPABASE_URL` y `SUPABASE_KEY` (aborta si faltan)
- Schema en `SQL/DML.sql` + `SQL/Funciones.sql` + `SQL/Trigger.sql` + `SQL/insert_playbook_data.sql`. Ejecutar manualmente en SQL editor de Supabase — **no hay migraciones automatizadas**
- Código de error `PGRST116` (0 filas) se traga silenciosamente en repositorios → retorna `null`. Hay dos patrones: `if (error && error.code !== 'PGRST116')` o `if (error.code === 'PGRST116') return null`
- Inconsistencia: ~90% de los repos usan `.single()`, solo 3 usan `.maybeSingle()` (accionable, sesion, learningCard). Si añades un repositorio nuevo, usa `.single()` + swallow PGRST116 para consistencia.

## Streaming / SSE
- `POST /api/chat/stream` (en `chatRoutes.js`) usa SSE para streamear respuestas del agente AI
- El controller (`chatController.js`) establece headers SSE y hace pipe del stream de `chatRepository.js`
- `chatRepository.js` llama a `${AGENT_CONFIG.apiUrl}/chat/stream` vía axios con `responseType: 'stream'`
- `sesionRoutes.js` maneja sesiones y mensajes como REST estándar (no SSE)

## Referencia
- `MANUAL_BACKEND.md` — arquitectura detallada (668 líneas)
- `Documentacion/` — docs de autenticación, categorías, notificaciones, usuarios, formato
- `Postman/` — colecciones para probar endpoints (~44 archivos entre collections, environments y READMEs)
- `SQL/` — DML, funciones, triggers, y datos de playbook
- `batch/ReadMe.md` — documentación de los scripts batch
