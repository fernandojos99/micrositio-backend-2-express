# CLAUDE.md — Micrositio Iris Backend

API REST en Node.js (ESM) + Express sobre Supabase (PostgreSQL). Todo lo de aquí está verificado contra el código; se cita el archivo que lo respalda.

## Comandos

```bash
npm run dev     # nodemon src/app.js (hot reload)
npm start       # node src/app.js
npm test        # node --test (runner nativo, sin dependencias extra)
npm run check   # node --check src/app.js
```

No hay **lint, typecheck, build ni format**. Los tests son un primer caso de humo (`src/utils/__tests__/leerId.test.js`), no cobertura real.

`.github/workflows/ci.yml` ejecuta en cada push un `node --check` sobre todo `src/`, `batch/` y `lambda.js`, más `npm test`. Existe porque ya pasó lo contrario: el commit `55a4a40` dejó conflictos de merge sin resolver dentro de `src/app.js` y el servidor no arrancaba.

Scripts de carga de datos (`batch/`, ver su `ReadMe.md`) — **el orden importa**, hay una FK `usuarios.id_empleado → empleados`:

```bash
node batch/crearEmpleados.js     # primero
node batch/crearUsuarios.js      # después
node batch/cambiarContraseña.js  # reseteo de password
```

## `.env` — la trampa nº 1

**El `.env` vive en `src/.env`, no en la raíz del paquete.**

`src/config/supabaseClient.js` importa dotenv de forma dinámica y **solo si `NODE_ENV !== 'production'`**, y `dotenv.config()` busca el `.env` **en el CWD**. Si faltan `SUPABASE_URL` o `SUPABASE_KEY`, hace `process.exit(1)` sin más.

Consecuencia: `npm start`/`npm run dev` desde la raíz del paquete tienen el CWD en la raíz y **no encuentran `src/.env`**. Formas de arrancar que sí funcionan:

```bash
cd src && node app.js          # la que documenta el README
```

Plantilla en **`src/.env.example`** (versionada; el `.env` real está en `.gitignore`).

| Variable | Si falta |
|---|---|
| `SUPABASE_URL`, `SUPABASE_KEY` | `process.exit(1)` al arrancar |
| `PORT` | Escucha en 3000. El `.env` actual define `3001`, que es el puerto que el frontend tiene hardcodeado |
| `NODE_ENV` | En `'production'` **no** se carga el `.env` |
| `JWT_SECRET` | ⚠️ **Fallback hardcodeado** `'tu-clave-secreta-muy-segura'` en `src/config/jwtConfig.js`. **Hoy el `src/.env` no la define**, así que los tokens se firman con un secreto que está en el repo. Definirla siempre |
| `EMAIL_USER`, `EMAIL_PASSWORD` | Fallan las notificaciones por correo (nodemailer) |
| `AGENT_API_URL` | Fallback a una Lambda Function URL en `src/config/agentConfig.js`. Tampoco está en el `.env` actual |

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
| Repository | `src/repositories/proyectoRepository.js` | Consultas Supabase, lanza `ApiError` |
| Model | `src/models/Proyecto.js` | `fromDatabase(row)` → instancia de dominio |

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

## Datos

- **Supabase JS** (`@supabase/supabase-js`), cliente único en `src/config/supabaseClient.js`.
- No hay ORM: se habla con Supabase directamente. `sequelize`, `pg`, `pg-hstore` y `mysql2` estaban en `package.json` sin un solo import y se eliminaron.
- Patrón de "no encontrado": el código `PGRST116` de PostgREST (0 filas) se traga y se devuelve `null`:
  ```js
  if (error && error.code !== 'PGRST116') throw new ApiError(...);
  return data ? Proyecto.fromDatabase(data) : null;
  ```
- **28 de 30** repositorios usan `.single()`; usan `.maybeSingle()` cuatro: `accionableRepository.js`, `sesionRepository.js`, `learningCardRepository.js` y `servicioRepository.js`. Para un repo nuevo, sigue el patrón mayoritario.
- Esquema en `SQL/`, aplicado a mano en el editor SQL de Supabase — **no hay migraciones**.
- ⚠️ **`SQL/DML.sql` no compila** (typos, paréntesis descuadrados, FK a columnas inexistentes) y ya divergió del esquema real. `SQL/Funciones.sql` no tiene funciones: hace **DROP de todas las tablas**. La fuente de verdad es Supabase. Detalle en `../DOMINIO.md`.

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

Más `GET /` (health textual) y `GET /health` (JSON con uptime y memoria).

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

Al tocar el arranque, no rompas ninguna de las dos vías: `export default app` siempre debe existir.

## Estado del repositorio

Rama de trabajo actual: `docs/init-agentes` (la rama por defecto del remoto es `master`). Los conflictos de merge que el commit `55a4a40 refactor(deploy)` dejó sin resolver dentro de `src/app.js` ya están arreglados, y el `node --check` del CI existe para que no vuelva a pasar.

El bloque comentado del upload de imágenes a Supabase Storage se eliminó de `src/app.js`; sigue en el historial de git.

## Referencia

| Archivo | Contenido |
|---|---|
| `../DOMINIO.md` | **Modelo de negocio**: secuencias, testing/learning cards, métricas, plantillas, flow, y las discrepancias de estados entre capas |
| `AGENTS.md` | Resumen corto de estas mismas convenciones |
| `MANUAL_BACKEND.md` | Arquitectura detallada (668 líneas) |
| `Documentacion/` | Auth JWT, categorías, notificaciones, usuarios, formatos, endpoints |
| `Postman/`, `docs/postman/` | Colecciones para probar endpoints |
| `SQL/` | Esquema, funciones, triggers, datos de playbook |
| `examples/` | Ejemplos de payloads de plantillas, plantilla de email |
| `batch/ReadMe.md` | Scripts de carga de datos |
