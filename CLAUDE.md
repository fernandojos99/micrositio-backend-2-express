# CLAUDE.md — Micrositio Iris Backend

API REST en Node.js (ESM) + Express sobre PostgreSQL, con SQL directo mediante `pg`. Todo lo de aquí está verificado contra el código; se cita el archivo que lo respalda.

## Comandos

```bash
npm run dev       # nodemon src/app.js (hot reload)
npm start         # node src/app.js
npm test          # node --test: tests puros, sin base (los que corre el CI)
npm run test:bd   # pruebas-bd/*.mjs contra la base de DATABASE_URL, todo con ROLLBACK
npm run check     # node --check src/app.js
```

No hay **lint, typecheck, build ni format**.

`.github/workflows/ci.yml` ejecuta en cada push un `node --check` sobre todo `src/`, `batch/` y `lambda.js`, más `npm test`. Existe porque ya pasó lo contrario: el commit `55a4a40` dejó conflictos de merge sin resolver dentro de `src/app.js` y el servidor no arrancaba.

`npm run test:bd` **no** está en el CI, porque necesita una base. Cada escritura de los repositorios se ejecuta dentro de `transaccion()` y termina en ROLLBACK, así que no deja filas. Solo se lanza contra una base donde esté permitido escribir, nunca contra producción.

Scripts de carga de datos (`batch/`, ver su `ReadMe.md`). **El orden importa**, porque hay una FK `usuarios.id_empleado → empleados`:

```bash
node batch/crearEmpleados.js     # primero
node batch/crearUsuarios.js      # después
node batch/cambiarContraseña.js  # reseteo de password
```

## `.env`

**El `.env` vive en `src/.env`**, no en la raíz del paquete. Lo carga `src/config/entorno.js`, **solo si `NODE_ENV !== 'production'`**, y lo localiza a partir de su propia ruta y no del CWD. Por eso el backend arranca igual desde `src/` (`node app.js`) que desde la raíz del paquete (`npm run dev`).

`entorno.js` es el primer import de `src/app.js`, y también lo importan `db.js` y `archivos.js`. Tiene que ir antes que cualquier módulo que lea `process.env` al cargarse (`jwtConfig`, `archivos`…).

Plantilla en **`src/.env.example`** (versionada; el `.env` real está en `.gitignore`).

| Variable | Si falta |
|---|---|
| `DATABASE_URL` | `process.exit(1)` al arrancar. `postgres://usuario:clave@host:5432/base` |
| `PG_POOL_MAX` | 10 conexiones. En Lambda conviene bajarlo |
| `ARCHIVOS_DIR` | Los archivos subidos van a `<paquete>/uploads` |
| `ARCHIVOS_URL_BASE` | Las URLs de archivos se construyen con `http://localhost:$PORT`. **En producción hay que definirla** con la URL pública del backend, porque esa URL es la que se guarda en la base |
| `PORT` | Escucha en 3000. El `.env` actual define `3001`, que es el puerto que el frontend tiene hardcodeado |
| `NODE_ENV` | En `'production'` **no** se carga el `.env` |
| `JWT_SECRET` | ⚠️ **Fallback hardcodeado** `'tu-clave-secreta-muy-segura'` en `src/config/jwtConfig.js`. **Hoy el `src/.env` no la define**, así que los tokens se firman con un secreto que está en el repo. Definirla siempre |
| `EMAIL_USER`, `EMAIL_PASSWORD` | Fallan las notificaciones por correo (nodemailer) |
| `AGENT_API_URL` | Fallback a una Lambda Function URL en `src/config/agentConfig.js`. Tampoco está en el `.env` actual |

`src/.env.supabase` (no versionado) guarda la configuración antigua de producción, de cuando el backend usaba Supabase. La app ya no lo lee: es solo un registro.

## Datos: `src/config/db.js`

Un `Pool` de `pg`. No hay ORM ni query builder: los repositorios escriben SQL con parámetros `$1, $2…`.

**Todas las filas las serializa Postgres con `json_agg`**, igual que hacía PostgREST cuando el backend usaba supabase-js. Así la API devuelve el mismo JSON que antes: `date` como `"YYYY-MM-DD"`, `timestamptz` con su zona (`"…-06:00"`, la `TimeZone` del servidor Postgres) y `numeric` como número. **No leas columnas con `pool.query` a pelo**: los parsers por defecto de `pg` convierten `date` en `Date` y `numeric` en texto, y cambiarían el contrato de la API.

| Función | Para |
|---|---|
| `consulta(sql, params)` | SELECT, o INSERT/UPDATE/DELETE **con `RETURNING`** → array de filas |
| `uno(sql, params)` | Primera fila o `null` (lo que era `.maybeSingle()` y `.single()` + tragar `PGRST116`) |
| `unoObligatorio(sql, params)` | Primera fila, o lanza `SinFilas` (lo que era un `.single()` que dejaba pasar el error) |
| `ejecutar(sql, params)` | Sentencia sin `RETURNING` → número de filas afectadas |
| `insertarFilas(tabla, datos)` | INSERT de un objeto o un array; ignora las claves `undefined` |
| `actualizarFilas(tabla, datos, where, paramsWhere)` | UPDATE con los campos del objeto. **Sin campos devuelve `[]`** sin ir a la base, igual que PostgREST ante un update vacío |
| `upsertFilas(tabla, datos, columnasConflicto)` | `INSERT … ON CONFLICT DO UPDATE` |
| `exigirFila(promesa)` / `primeraFila(promesa)` | Primera fila de una escritura, lanzando `SinFilas` o devolviendo `null` si no hay |
| `transaccion(fn)` | BEGIN/COMMIT/ROLLBACK. Con `AsyncLocalStorage`: todo lo que se ejecute dentro de `fn`, repositorios incluidos, usa esa transacción sin pasar el cliente |

El SQL de INSERT/UPDATE lo arma `src/config/sql.js` (puro, con tests en `src/config/__tests__/`). Los nombres de tabla y columna se validan y se entrecomillan, y los valores siempre van como parámetros.

Errores:
- Los de Postgres llegan con su SQLSTATE en `.code`: `23505` (clave duplicada), `23503` (FK), `23514` (CHECK)…
- `SinFilas` tiene `code: 'SIN_FILAS'` y el mensaje `'No se encontró el registro'`.
- `src/utils/errorBd.js` → `conMensaje('Error al X', promesa)` convierte cualquier fallo en `ApiError(\`Error al X: ${mensaje}\`, 500)`. Es el patrón de casi todos los repositorios.

Los joins van como subconsultas correlacionadas con `row_to_json`, que dan un objeto anidado o `null`, con la misma forma que devolvía PostgREST. Ejemplos: `testingCardRepository.buscarPorTexto` y `agenteCategoriaRepository`.

Esquema en `SQL/`, aplicado a mano — **no hay migraciones**. ⚠️ **`SQL/DML.sql` no compila** (typos, paréntesis descuadrados, FK a columnas inexistentes) y ya divergió del esquema real. **`SQL/Funciones.sql` no tiene funciones: hace DROP de todas las tablas.** No lo ejecutes nunca. Detalle en `../DOMINIO.md`.

### La base local

Hoy `DATABASE_URL` apunta a un PostgreSQL local (`micrositio@localhost:5432/micrositio`). Partió de una copia de producción de marzo de 2026 y **el 11 de septiembre de 2026 se sincronizó con producción** (ver abajo).

`local/completar-esquema.sql` añade lo que producción tenía y la copia no. Es **solo aditivo** (`CREATE TABLE` / `ADD COLUMN IF NOT EXISTS`) y se puede reejecutar sin efecto:

| Añadido | Lo usa |
|---|---|
| Tablas `habilidades`, `servicio`, `sesion` | Habilidades de Perfil, `/servicio`, sesiones del Chat |
| `agente.categoria` | Búsqueda global (sin ella, `/search` entera daba 500) y alta/edición de agentes |
| `empleado.cargo`, `departamento`, `infopersonal`, `fecha_ingreso`, `image` | Perfil y Equipo |
| `usuarios.image` | Foto de perfil |
| `agente.modelo`, `temperatura`, `tools` | Nadie (en producción están vacías; tipos supuestos) |
| Tabla `transcript` | La Lambda de transcripciones, no el backend |
| Tablas `checkpoints`, `checkpoint_blobs`, `checkpoint_writes`, `checkpoint_migrations` | Historial del agente (PostgresSaver de LangGraph), lo usa la Lambda del agente, no el backend |

- Los tipos se dedujeron (de valores reales, de los esquemas Zod y del uso en los repositorios), no se copiaron del DDL de producción: la clave anon no da acceso al DDL. Las restricciones son las mínimas que el código necesita.
- Respaldos: `../respaldos/micrositio_public_antes_de_completar_esquema_2026-09-11_0006.sql` (esquema, antes de completarlo) y `../respaldos/micrositio_public_antes_de_sincronizar_2026-09-11_1055.sql` (esquema y datos, antes de sincronizar).

**Sincronizar con producción.** `scripts/sincronizar-desde-supabase.mjs` lee producción por la API REST de Supabase, solo lectura, con las credenciales de `src/.env.supabase`. Añade las filas que faltan y rellena las celdas vacías. Con `--conflictos=prod` además sustituye por el de producción cualquier valor que difiera. Sin `--aplicar` es un simulacro, que termina en ROLLBACK. Nunca borra filas locales y conserva las URLs ya migradas a `/archivos`. Después hay que correr `scripts/migrar-archivos-supabase.mjs --aplicar` para las filas nuevas que traigan archivos.

Con las tablas `checkpoint*` (blobs de hasta 300 KB por fila) el gateway de Supabase corta la petición por tiempo o responde 502. El script reintenta y va reduciendo la página, pero conviene separarlas y pedirlas de poco en poco, que es como entraron:

```bash
node scripts/sincronizar-desde-supabase.mjs --conflictos=prod --aplicar --tablas=<las demás>
node scripts/sincronizar-desde-supabase.mjs --conflictos=prod --aplicar --pagina=50 \
  --tablas=checkpoint_migrations,checkpoints,checkpoint_writes,checkpoint_blobs
```

Lo que quedó distinto tras la sincronización del 11 de septiembre:
- **Filas que solo existen en local:** se conservan. Son filas borradas en producción después de marzo, más las de pruebas locales.
- **Testing card 148:** en producción tiene `status = 'EN EJECUCION'`. El CHECK local, igual que el esquema Zod del backend, no acepta ese estado, así que se quedó con su valor local.

Ojo al probar a mano: `GET /api/chat/sessions` lee `req.user.id_empleado` del JWT. Con un token sin ese claim, o de un `VISITANTE` sin empleado, responde 500. Es del código, no de la base.

## Archivos subidos: `src/config/archivos.js`

Documentos de testing y learning cards, formatos y fotos de perfil se guardan **en disco**, en `ARCHIVOS_DIR/<bucket>/<ruta>`, y el backend los sirve en **`/archivos`** con `express.static` (`src/app.js`). Son públicos, como lo eran los buckets de Supabase.

| Bucket | Carpeta | Quién |
|---|---|---|
| `formato-docs` | `formatos/` | `formatoService` |
| `testing-card-docs` | `testing-cards/` | `testingCardDocumentService` |
| `learning-card-docs` | `learning-card-<id>/` | `learningCardDocumentService` |
| `image` | (raíz) | `usuarioRepository.uploadToBucket` (foto de perfil) |

- `subir()` **no sobrescribe** por defecto, igual que el `upsert: false` de Supabase.
- `borrar()` no falla si el archivo ya no existe.
- Cualquier ruta que se salga de su bucket (`..`, rutas absolutas) se rechaza.
- La URL guardada en la base es `${ARCHIVOS_URL_BASE}/archivos/<bucket>/<carpeta>/<archivo>`. Los servicios recuperan la ruta del archivo a partir de **los dos últimos segmentos** de esa URL para borrarlo: no cambies ese formato.
- ⚠️ **En Lambda y en Render el disco no es persistente.** En producción hace falta montar un disco persistente en `ARCHIVOS_DIR`.
- `uploads/` está en `.gitignore`.

`scripts/migrar-archivos-supabase.mjs` descarga los archivos de Supabase Storage que la base todavía referencia, los guarda en disco y reescribe sus URLs. Sin argumentos solo lista; con `--aplicar` ejecuta. Se puede repetir. En la base local ya se aplicó (5 archivos), y sirve igual para la futura base de producción.

## Arquitectura: 5 capas

```
Route → Controller → Service → Repository → Model
```

Ejemplo real completo, útil como plantilla para cualquier recurso nuevo:

| Capa | Archivo | Responsabilidad |
|---|---|---|
| Route | `src/routes/proyectoRoutes.js` | Monta middlewares de auth y hace `.bind()` del handler |
| Controller | `src/controllers/proyectoController.js` | Valida con Zod (`schema.parse(req.body)`), llama al service, `res.json(...)`, `next(error)` |
| Service | `src/services/proyectoService.js` | Lógica de negocio |
| Repository | `src/repositories/proyectoRepository.js` | SQL con `db.js`, lanza `ApiError` |
| Model | `src/models/Proyecto.js` | `fromDatabase(row)` → instancia de dominio |

`authService` es la excepción: consulta `usuarios` y `usuario_proyecto` directamente, sin repositorio.

### Convenciones de nombres

- Controllers, services, repositories y routes: **camelCase con sufijo** — `proyectoController.js`, `proyectoService.js`, `proyectoRepository.js`, `proyectoRoutes.js`. Excepción: `src/repositories/habilidadesRepositorio.js` (en español y en plural).
- Models: **PascalCase sin sufijo** — `Proyecto.js`, `TestingCard.js`, `UsuarioProyecto.js`. Única excepción: `urlFormatoModel.js`. Solo **17 de los 26** implementan `fromDatabase(row)`; no lo des por hecho.
- Todo son **clases ES6** exportadas por defecto… salvo 4 archivos que usan named exports de funciones planas: `accionableController.js`, `habilidadController.js`, `accionableRepository.js` y `habilidadesRepositorio.js`.

### `.bind(controller)` es obligatorio

Los controllers son clases y se instancian una vez por router. Sin `.bind` se pierde `this` y revienta en runtime:

```js
const proyectoController = new ProyectoController();
router.get('/', authMiddleware, proyectoController.listarProyectos.bind(proyectoController));
```

Excepción: las rutas de `accionable` y `habilidad`, que apuntan a funciones sueltas y por tanto **no** llevan `.bind`.

## Autenticación y autorización

4 middlewares en `src/middlewares/authMiddleware.js`:

| Middleware | Qué hace |
|---|---|
| `authMiddleware` | Verifica el JWT del header `Authorization: Bearer`, adjunta `req.user` |
| `soloEditores` | Corta si `req.user.tipo !== 'EDITOR'` |
| `verificarAccesoProyecto` | Un `VISITANTE` solo accede a los proyectos de `req.user.proyectos` |
| `configurarFiltroProyectos` | Inyecta `req.filtroProyectos` para que la capa de abajo filtre |

Patrón típico: lectura con `authMiddleware`, escritura con `authMiddleware, soloEditores`.
Utilidades de token en `src/utils/jwtUtils.js` (`extraerTokenDelHeader`, `verificarToken`), config en `src/config/jwtConfig.js`.

## Validación

23 schemas Zod en `src/middlewares/validation/`. **No son middlewares**: se invocan desde el controller con `schema.parse(req.body)`, dentro del `try`, para que el `ZodError` caiga en `next(error)`.

⚠️ La cobertura es parcial: **23 de los 32 controllers** llaman a `parse`. Los 9 restantes son los de chat, sesiones, documentos, formatos, habilidad, búsqueda y playbook. Al tocar uno, comprueba si hay schema disponible antes de asumir que los datos vienen validados.

Ojo con un falso negativo: `plantillaSecuenciaController` no llama a `parse`, pero su service sí invoca `PlantillaSecuencia.validateCreate` / `validateUpdate`. La validación por modelo es la otra vía viva (también en `metricaTestingCardService`, `empleadoService` y `usuarioService`).

## Errores

- `src/utils/ApiError.js` — `new ApiError(mensaje, statusCode, { originalError, details })`. Fija `status` a `'fail'` (4xx) o `'error'` (5xx) e `isOperational`.
- `src/middlewares/errorHandler.js` — último `app.use`. Mapea `ZodError` a **400** (antes salía como 500: un payload mal formado se reportaba como error interno). ⚠️ Sigue **devolviendo el `stack` completo y el objeto de error en la respuesta HTTP en todos los entornos**, y logueando `req.body` y `req.headers` (incluido el `Authorization`). Es deuda de seguridad conocida y **no corregida**.

## Rutas

`src/app.js` hace 32 `app.use` de routers sobre 31 prefijos distintos (`/api/chat` va dos veces). Prefijos reales, snake_case singular en su mayoría:

```
/proyectos            /celula_proyecto      /empleados            /secuencias
/categorias           /experimento_tipo     /testing_card         /learning_card
/metrica_testing_card /url_testing_card     /url_learning_card    /flow-positions
/testing_card_playbook /api                 /api/learning-card    /usuarios
/usuario_proyecto     /auth                 /agentes              /agente_categoria
/plantilla_testing_card /plantilla_metrica_tc /plantilla_secuencia /notificaciones
/search               /url_formato          /formato              /accionables
/habilidad            /api/chat             /servicio
```

Más `GET /` (health textual), `GET /health` (JSON con uptime y memoria) y los archivos estáticos en `/archivos`.

Los que rompen el patrón:
- `/api` → `testingCardDocumentRoutes` (prefijo genérico, fácil de colisionar).
- `/api/learning-card` → `learningCardDocumentRoutes`.
- `/api/chat` está montado **dos veces**: `sesionRoutes` (`/sessions`, `/sessions/:thread_id/messages`, `.../title`, DELETE) y `chatRoutes` (`/ping`, `/stream`). No hay colisión hoy, pero cuidado al añadir rutas.
- `/flow-positions` es el único kebab-case.

### El ruteo: rutas nuevas con el ID en el path, viejas todavía vivas

**Proyectos, secuencias, testing cards, learning cards y empleados** ya exponen rutas REST normales con el ID en el path (`GET/PATCH/DELETE /proyectos/:id_proyecto`, `/secuencias/:id`, `/testing_card/:id`, `/learning_card/:id`, `/empleados/:id`). **Son las que hay que usar.**

Se registran **al final de cada router**, después de las literales (`/p`, `/s`, `/padre`, `/plantillas`, `/todos`, `/aplicar-plantilla`), porque Express resuelve por orden de registro y el parámetro se las tragaría. Si añades una ruta literal, ponla antes.

Las antiguas siguen montadas para no romper clientes sin migrar, y son el motivo de que exista `src/utils/leerId.js`, que deja a un mismo controller atender ambas leyendo el ID del path, del body o de la query:

- `GET /proyectos/p` **y** `POST /proyectos/p` — un GET con el ID en el body.
- `PATCH /proyectos`, `DELETE /proyectos`, y sus equivalentes en secuencias, testing cards y learning cards — el ID en el body.
- `POST /empleados` con `{ id }` para **leer** un empleado.

El resto de recursos no está normalizado: `usuario` usa `req.params.id` o `req.params.id_usuario` según la ruta, `sesion` usa `req.params.thread_id`.

**Regla: lee el archivo de `src/routes/` correspondiente antes de escribir un cliente o un test.**

## Streaming (SSE)

`POST /api/chat/stream` → `chatController.stream` fija las cabeceras SSE y hace pipe del stream que devuelve `src/repositories/chatRepository.js`, que llama con axios (`responseType: 'stream'`) a `${AGENT_CONFIG.apiUrl}/chat/stream`.

`src/config/agentConfig.js` define `apiUrl` como `process.env.AGENT_API_URL` con fallback a una Lambda Function URL de AWS. `sesionRoutes` es REST normal, no SSE.

## Despliegue dual

`src/app.js` sirve para los dos destinos:

- **Local / servidor**: llama a `app.listen(PORT)`, pero **solo si no está en Lambda** (`if (!process.env.AWS_LAMBDA_FUNCTION_NAME)`).
- **AWS Lambda**: `lambda.js` (raíz del paquete) importa el `export default app` y lo envuelve con `serverless-http`.

Al tocar el arranque, no rompas ninguna de las dos vías: `export default app` siempre debe existir. En Lambda, recuerda lo del pool (`PG_POOL_MAX`) y que el disco no persiste.

## Verificar que un cambio en los repositorios no altera la API

`scripts/capturar-referencia.mjs <dir>` guarda el JSON de 113 rutas GET del backend en marcha, con ids reales, y `scripts/comparar-referencia.mjs <ref> <nuevo>` compara dos capturas. Una diferencia solo de orden se reporta aparte. `--como <dir>` reutiliza las peticiones y el token de una captura anterior. Las capturas llevan datos personales: guárdalas fuera del repo.

## Estado del repositorio

Rama de trabajo actual: `docs/init-agentes` (la rama por defecto del remoto es `master`).

## Referencia

| Archivo | Contenido |
|---|---|
| `../DOMINIO.md` | **Modelo de negocio**: secuencias, testing/learning cards, métricas, plantillas, flow, y las discrepancias de estados entre capas |
| `AGENTS.md` | Resumen corto de estas mismas convenciones |
| `MANUAL_BACKEND.md` | Arquitectura detallada. ⚠️ Anterior al paso a `pg`: sus ejemplos de repositorio usan supabase-js |
| `Documentacion/` | Auth JWT, categorías, notificaciones, usuarios, formatos, endpoints |
| `Postman/`, `docs/postman/` | Colecciones para probar endpoints |
| `SQL/` | Esquema, funciones, triggers, datos de playbook |
| `local/completar-esquema.sql` | DDL aditivo que completa la base local |
| `examples/` | Ejemplos de payloads de plantillas, plantilla de email |
| `batch/ReadMe.md` | Scripts de carga de datos |
