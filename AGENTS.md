# AGENTS.md — Micrositio Iris Backend

> Detalle completo y verificado en `CLAUDE.md` (mismo directorio).

## Comandos
- `npm run dev` — nodemon hot-reload (`node src/app.js`)
- `npm start` — `node src/app.js`
- `npm test` — tests puros (los del CI); `npm run test:bd` — escrituras contra la base de `DATABASE_URL`, todo con ROLLBACK
- `node src/test/testAccionable.js` — test manual (llamadas comentadas)
- `node batch/crearEmpleados.js` antes que `node batch/crearUsuarios.js` (FK: usuarios.id_empleado → empleados)
- `node batch/cambiarContraseña.js` — script de reseteo de password
- No hay lint, typecheck, build ni format. CI: `node --check` + `npm test`

## Arranque y `.env`
- `.env` está en **`src/.env`**, NO en raíz. Lo carga `src/config/entorno.js` (primer import de `app.js`), localizándolo por su propia ruta y **solo si `NODE_ENV !== 'production'`**: funciona igual desde `src/` que desde la raíz del paquete.
- Plantilla en `src/.env.example`. Solo `DATABASE_URL` es dura (si falta, `process.exit(1)`). `ARCHIVOS_URL_BASE` debe definirse en producción
- ⚠️ `JWT_SECRET` y `AGENT_API_URL` **no están en el `src/.env` actual** y tienen fallback hardcodeado en `src/config/jwtConfig.js` (`'tu-clave-secreta-muy-segura'`) y `src/config/agentConfig.js`. Los tokens se están firmando con un secreto que está en el repo

## Arquitectura
- **Node.js (ESM, `"type": "module"` en package.json) + Express**, 5 capas: Route → Controller → Service → Repository → Model
- **Validación Zod** en `src/middlewares/validation/` (23 schemas). Se llama con `schema.parse(req.body)` desde controllers, pero **solo 21 de los 32 controllers validan**; los otros 11 (incluido `accionableController`) aceptan el body sin comprobar.
- **Autenticación JWT** — 4 middlewares en `src/middlewares/authMiddleware.js`:
  - `authMiddleware` — cualquier token válido, adjunta `req.user`
  - `soloEditores` — solo rol `EDITOR`
  - `verificarAccesoProyecto` — visitantes limitados a sus proyectos (`req.user.proyectos`)
  - `configurarFiltroProyectos` — inyecta `req.filtroProyectos` para filtrado downstream
- **ApiError** (`src/utils/ApiError.js`) — `statusCode` + `status: 'fail'|'error'` + `isOperational`
- **errorHandler** (`src/middlewares/errorHandler.js`) — último middleware. ⚠️ Devuelve el `stack` completo en la respuesta HTTP **en todos los entornos** y loguea `req.body` y `req.headers` a consola (deuda de seguridad conocida)

## Entrypoint `src/app.js`
- Hace **32 `app.use` de routers sobre 31 prefijos distintos** (`/api/chat` se monta dos veces: `sesionRoutes` y `chatRoutes`), más `GET /` y `GET /health`, y código comentado de upload de imágenes. `src/routes/testRoutes.js` no está montado
- **Despliegue dual**: `app.listen(PORT)` solo si `!process.env.AWS_LAMBDA_FUNCTION_NAME`, y `export default app` siempre — lo necesita `lambda.js` (serverless-http). No romper ninguna de las dos vías al tocar el arranque
- Tuvo 3 conflictos de merge commiteados (commit `55a4a40`) que impedían arrancar; ya resueltos
- CORS: 4 orígenes (2 Vercel + localhost:5173/5174). Editar el bloque `app.use(cors(...))` de `app.js` para añadir más
- `bodyParser.json()` + `express.json()` — ambos registrados (redundante pero inocuo)
- Multer (memoryStorage) en `src/middlewares/uploadMiddleware.js`, usado por las rutas de subida de documentos, formatos y foto de perfil
- Endpoint chat stream (`POST /api/chat/stream`) hace proxy SSE a `AGENT_API_URL` (Lambda) vía `chatRepository.js`

## Convenciones críticas (fáciles de omitir)
- **`.bind(controller)`** en cada handler de ruta — los controllers son clases ES6, sin bind se pierde `this`. Excepciones: `accionableController` y `habilidadController` exportan funciones planas, no clases.
- **IDs por body vs URL params** — inconsistente por recurso:
  - `proyecto` routes: `req.body.id_proyecto` (no params)
  - `usuario` routes: `req.params.id` o `req.params.id_usuario`
  - `usuarioProyecto` routes: `req.params.id_usuario` y/o `req.params.id_proyecto`
  - `sesion` routes: `req.params.thread_id`
  - Verificar cada ruta antes de asumir el patrón.
- **`GET /proyectos/p` y `POST /proyectos/p`** — ambos existen, mismo handler (obtenerProyecto), mismo body con `id_proyecto`
- **`GET /proyectos/usuario/:id_usuario`** — obtiene proyectos de un usuario específico
- **Excepción al patrón de clases**: `accionableController.js`, `habilidadController.js`, `accionableRepository.js` y `habilidadesRepositorio.js` usan named exports de funciones. El resto usa clases ES6. `habilidadesRepositorio.js` además rompe la convención de nombres (español, plural).

## Base de datos
- **PostgreSQL con SQL directo** vía `pg`, en `src/config/db.js` (`consulta`, `uno`, `unoObligatorio`, `ejecutar`, `insertarFilas`, `actualizarFilas`, `upsertFilas`, `transaccion`). Sin ORM. Ya no se usa Supabase
- Las filas salen por `json_agg` para que el JSON sea idéntico al de antes (fechas como texto, numeric como número): no uses `pool.query` a pelo
- "No encontrado": `uno()` devuelve `null`; `unoObligatorio()` lanza `SinFilas`. `conMensaje('Error al X', promesa)` (`src/utils/errorBd.js`) envuelve fallos en `ApiError` 500
- Archivos subidos en disco (`src/config/archivos.js`), servidos en `/archivos`. En Lambda/Render el disco no persiste
- Schema en `SQL/`, aplicado a mano — **no hay migraciones**. ⚠️ `SQL/Funciones.sql` hace DROP de todas las tablas: no ejecutarlo

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
