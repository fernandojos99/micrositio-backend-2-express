# AGENTS.md — Micrositio Iris Backend

## Comandos
- `npm run dev` — nodemon hot-reload
- `npm start` — `node src/app.js`
- `node src/test/testAccionable.js` — test manual (llamadas comentadas)
- `node batch/crearEmpleados.js` antes que `node batch/crearUsuarios.js`
- No hay scripts de test, lint, typecheck, build, format, ni CI/CD

## Arquitectura
- **Node.js (ESM) + Express**, 5 capas estrictas: Route → Controller → Service → Repository → Model
- **Validación Zod** en `src/middlewares/validation/`, llamada con `schema.parse(req.body)` desde controllers
- **Autenticación JWT** — 4 middlewares en `src/middlewares/authMiddleware.js`:
  - `authMiddleware` — cualquier token válido, adjunta `req.user`
  - `soloEditores` — solo rol `EDITOR`
  - `verificarAccesoProyecto` — visitantes limitados a sus proyectos (`req.user.proyectos`)
  - `configurarFiltroProyectos` — inyecta `req.filtroProyectos` para filtrado downstream
- **ApiError** (`src/utils/ApiError.js`) — `statusCode` + `status: 'fail'|'error'` + `isOperational`
- **errorHandler** (`src/middlewares/errorHandler.js`) — último middleware, stack trace solo en development

## Entrypoint `src/app.js`
- Registra ~30 rutas con prefijos estandarizados en kebab-case y plurales:
  `proyectos`, `celulas-proyecto`, `empleados`, `secuencias`, `categorias`, `experimentos-tipos`,
  `testing-cards`, `learning-cards`, `metricas-testing-card`, `urls-testing-card`, `urls-learning-card`,
  `posiciones-flujo`, `testing-cards-playbook`, `usuarios`, `usuarios-proyectos`, `auth`, `agentes`,
  `agentes-categorias`, `plantillas-testing-card`, `plantillas-metricas-tc`, `plantillas-secuencias`,
  `notificaciones`, `search`, `urls-formatos`, `formatos`, `accionables`, `habilidad`,
  más `/api/chat/stream` (proxy SSE a Lambda) y `/health`
- CORS: 4 orígenes (2 Vercel + localhost:5173/5174). Editar `app.js` para añadir más
- `bodyParser.json()` + `express.json()` — ambos registrados (redundante pero inocuo)
- Multer configurado (memoryStorage) pero **comentado**, no usado
- Endpoint chat stream apunta a `AGENT_API_URL` (Lambda) — configurada en `src/repositories/chatRepository.js` (lee de env con fallback)

## Convenciones críticas (fáciles de omitir)
- **`.bind(controller)`** en cada handler de ruta — los controllers son clases ES6, sin bind se pierde `this`
- **IDs por path params** — todos los endpoints usan `GET/PATCH/DELETE /recurso/:id`. Ya NO se usa body para IDs.
- **Respuesta unificada** — usar helpers de `src/utils/responseHelper.js`: `success(res, data, opts)`, `created(res, data, opts)`, `noContent(res)`, `fail(res, opts)`. Formato: `{ success, data, message?, total?, page?, limit?, totalPages? }`
- **Paginación** en GETs de listas — usar `getPaginationParams(req)` de `src/utils/paginationHelper.js`. Default: `page=1, limit=20`.
- **Prefijos de ruta kebab-case** — ver `app.js` para los prefijos exactos. Rutas anidadas con path params: `/testing-cards/:id/documentos`, `/posiciones-flujo/nodo/...`.
- **Sin sufijos** `/t`, `/s`, `/p`, `/c`, `/e`, `/m`, `/l`, `/u` — reemplazados por query params (`?proyectoId=`, `?testingCardId=`) o path params (`/:id`).
- **Sin endpoints POST duplicados** de GET — se eliminaron `POST /proyectos/p`, `POST /celula_proyecto/e`, `POST /celula_proyecto/p`.
- **Zod schemas** en `src/middlewares/validation/` — `hipotesis`/`descripcion` minLength reducido a 3; `learningCardUpdateSchema` permite actualizar solo `id_responsable`.

## Base de datos
- **Supabase (PostgreSQL)** vía `@supabase/supabase-js` — **NO se usa Sequelize** (aunque está en package.json, junto con `pg`, `pg-hstore`, `mysql2` — todos no utilizados)
- Cliente en `src/config/supabaseClient.js`, requiere `SUPABASE_URL` y `SUPABASE_KEY` (aborta si faltan)
- Schema: `SQL/DML.sql` (ejecutar manualmente en SQL editor de Supabase — **no hay migraciones automatizadas**)
- Código de error `PGRST116` (0 filas) se traga silenciosamente en repositorios → retorna `null`
- Inconsistencia: algunos repositorios usan `.single()`, otros `.maybeSingle()`

## .env (requerido, en `src/.env`)
`SUPABASE_URL`, `SUPABASE_KEY`, `PORT`, `NODE_ENV`, `EMAIL_USER`, `EMAIL_PASSWORD`, `JWT_SECRET`
⚠️ `.env*` en `.gitignore` — no committear

## Referencia
- `MANUAL_BACKEND.md` — arquitectura detallada (668 líneas)
- `Documentacion/` — docs de autenticación, categorías, notificaciones, usuarios
- `Postman/` — colecciones para probar endpoints
