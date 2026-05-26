# Saludo

**Session ID:** ses_1b81078ceffeSJLPpRf3qB7FlY
**Created:** 5/20/2026, 6:29:00 PM
**Updated:** 5/20/2026, 6:53:08 PM

---

## User

hola

---

## Assistant (Build · DeepSeek V4 Flash · 2.5s)

_Thinking:_

The user is greeting me in Spanish. I should respond in Spanish briefly.

Hola, ¿en qué puedo ayudarte?

---

## User

Create or update `AGENTS.md` for this repository.

The goal is a compact instruction file that helps future OpenCode sessions avoid mistakes and ramp up quickly. Every line should answer: "Would an agent likely miss this without help?" If not, leave it out.

User-provided focus or constraints (honor these):


## How to investigate

Read the highest-value sources first:
- `README*`, root manifests, workspace config, lockfiles
- build, test, lint, formatter, typecheck, and codegen config
- CI workflows and pre-commit / task runner config
- existing instruction files (`AGENTS.md`, `CLAUDE.md`, `.cursor/rules/`, `.cursorrules`, `.github/copilot-instructions.md`)
- repo-local OpenCode config such as `opencode.json`

If architecture is still unclear after reading config and docs, inspect a small number of representative code files to find the real entrypoints, package boundaries, and execution flow. Prefer reading the files that explain how the system is wired together over random leaf files.

Prefer executable sources of truth over prose. If docs conflict with config or scripts, trust the executable source and only keep what you can verify.

## What to extract

Look for the highest-signal facts for an agent working in this repo:
- exact developer commands, especially non-obvious ones
- how to run a single test, a single package, or a focused verification step
- required command order when it matters, such as `lint -> typecheck -> test`
- monorepo or multi-package boundaries, ownership of major directories, and the real app/library entrypoints
- framework or toolchain quirks: generated code, migrations, codegen, build artifacts, special env loading, dev servers, infra deploy flow
- repo-specific style or workflow conventions that differ from defaults
- testing quirks: fixtures, integration test prerequisites, snapshot workflows, required services, flaky or expensive suites
- important constraints from existing instruction files worth preserving

Good `AGENTS.md` content is usually hard-earned context that took reading multiple files to infer.

## Questions

Only ask the user questions if the repo cannot answer something important. Use the `question` tool for one short batch at most.

Good questions:
- undocumented team conventions
- branch / PR / release expectations
- missing setup or test prerequisites that are known but not written down

Do not ask about anything the repo already makes clear.

## Writing rules

Include only high-signal, repo-specific guidance such as:
- exact commands and shortcuts the agent would otherwise guess wrong
- architecture notes that are not obvious from filenames
- conventions that differ from language or framework defaults
- setup requirements, environment quirks, and operational gotchas
- references to existing instruction sources that matter

Exclude:
- generic software advice
- long tutorials or exhaustive file trees
- obvious language conventions
- speculative claims or anything you could not verify
- content better stored in another file referenced via `opencode.json` `instructions`

When in doubt, omit.

Prefer short sections and bullets. If the repo is simple, keep the file simple. If the repo is large, summarize the few structural facts that actually change how an agent should work.

If `AGENTS.md` already exists at `/home/josefer/Documents/casa-trabajo/codigo/programas-micrositio/despues-unificacion-main/Micrositio-Iris-Backend`, improve it in place rather than rewriting blindly. Preserve verified useful guidance, delete fluff or stale claims, and reconcile it with the current codebase.

---

## Assistant (Build · DeepSeek V4 Flash · 104.0s)

_Thinking:_

Let me start by exploring the repository structure to understand the codebase and gather the information needed to create AGENTS.md.

**Tool: task**

**Input:**
```json
{
  "description": "Explore repo structure deeply",
  "prompt": "Explore the repository at /home/josefer/Documents/casa-trabajo/codigo/programas-micrositio/despues-unificacion-main/Micrositio-Iris-Backend very thoroughly. I need you to return:\n\n1. The full directory tree (top 3 levels) of the repo\n2. Contents of any README* files\n3. Contents of package.json, composer.json, pyproject.toml, go.mod, or any root manifest files\n4. Contents of AGENTS.md, CLAUDE.md, .cursor/rules/, .cursorrules, .github/copilot-instructions.md if they exist\n5. Contents of opencode.json if it exists\n6. Contents of any CI workflow files (.github/workflows/*.yml or similar)\n7. Contents of any build/test/lint config files (Makefile, webpack.config.js, vite.config.ts, tsconfig.json, .eslintrc*, .prettierrc*, ruff.toml, etc.)\n8. Any Dockerfile or docker-compose files\n9. Any .env.example files\n10. What languages/frameworks are used in the repo\n11. The real entrypoint(s) of the application\n\nBe very thorough - read all config files and key source files. Return ALL content verbatim.",
  "subagent_type": "general"
}
```

**Output:**
```
task_id: ses_1b7fc4a77ffeifPN2bkr95DQgg (for resuming to continue this task if needed)

<task_result>
Here is the complete exploration of the repository:

---

## 1. FULL DIRECTORY TREE (Top 3 Levels)

```
Micrositio-Iris-Backend/
├── .git/
├── .gitignore
├── backups/
│   ├── backup.dump
│   └── backup.sql
├── batch/
│   ├── ReadMe.md
│   ├── cambiarContraseña.js
│   ├── crearEmpleados.js
│   ├── crearUsuarios.js
│   ├── generador.js
│   └── passwords.txt
├── batch - Acceso directo.lnk
├── docs/
│   └── postman/
│       └── urlFormato-endpoints.md
├── Documentacion/
│   ├── API_URL_ENDPOINTS.md
│   ├── DOCUMENTACION_AGENTE_CATEGORIA.md
│   ├── DOCUMENTACION_AUTENTICACION_JWT.md
│   ├── DOCUMENTACION_NOTIFICACION_SIGUIENTE_RESPONSABLE.md
│   ├── DOCUMENTACION_USUARIOS.md
│   ├── documentacion_plantilla_secuencia_api.json
│   ├── Formato_API_Documentation.md
│   ├── plantilla_metrica_tc_api_documentation.json
│   └── plantilla_secuencia_api_documentation.json
├── examples/
│   ├── README.md (empty)
│   ├── plantilla_metrica_tc_examples.json
│   ├── plantilla_testing_card_examples.json
│   ├── plantillas_api_documentation.json
│   └── template_email_notificacion.md
├── MANUAL_BACKEND.md
├── node_modules/
├── package-lock.json
├── package.json
├── Postman/
│   ├── AgenteCategoria.postman_collection.json
│   ├── AgenteCategoria.postman_environment.json
│   ├── Agentes.postman_collection.json
│   ├── Agentes.postman_environment.json
│   ├── Categoria/
│   ├── ExperimientoTipo/
│   ├── Formato_API_Postman_Collection.json
│   ├── LearningCardDocuments.postman_collection.json
│   ├── LearningCardDocuments.postman_environment.json
│   ├── NotificacionSiguienteResponsable.postman_collection.json
│   ├── NotificacionSiguienteResponsable.postman_environment.json
│   ├── PlantillaSecuencia.postman_collection.json
│   ├── PlantillaSecuencia.postman_environment.json
│   ├── PlantillasAPI.postman_collection.json
│   ├── PlantillasAPI.postman_environment.json
│   ├── PlantillasCompletas.postman_collection.json
│   ├── PlantillasCompletas.postman_environment.json
│   ├── README_AGENTE_CATEGORIA_TESTS.md
│   ├── README_AGENTES_TESTS.md
│   ├── README_NOTIFICACION_TESTING.md
│   ├── README_PLANTILLA_SECUENCIA_TESTS.md
│   ├── README_PLANTILLAS_COMPLETAS_TESTING.md
│   ├── README_PLANTILLAS_TESTING.md
│   ├── README_TESTING_CARDS.md
│   ├── README_USUARIOS_TESTS.md
│   ├── TestingCard.postman_collection.json
│   ├── TestingCard.postman_environment.json
│   ├── TestingCard/
│   ├── TestingCardDocuments.postman_collection.json
│   ├── TestingCardDocuments.postman_environment.json
│   ├── UrlFormato.postman_collection.json
│   ├── Usuarios.postman_collection.json
│   ├── Usuarios.postman_environment.json
│   ├── celulaProyecto/
│   ├── documentacion_plantilla_secuencia_api.json
│   ├── empleado/
│   ├── metricaTestingCard/
│   ├── nodePosition.txt
│   ├── plantilla_metrica_tc_api_documentation.json
│   ├── plantilla_secuencia_api_documentation.json
│   ├── proyecto/
│   ├── secuencia/
│   ├── urlLearningCard/
│   ├── urlTestingCard/
│   └── urlFormato-endpoints.md (likely docs)
├── README.md
├── SQL/
│   ├── DML.sql
│   ├── Funciones.sql
│   ├── Trigger.sql
│   └── insert_playbook_data.sql
└── src/
    ├── .env
    ├── app.js                          ← ENTRYPOINT
    ├── config/
    │   ├── jwtConfig.js
    │   └── supabaseClient.js
    ├── controllers/ (29 files)
    ├── middlewares/
    │   ├── authMiddleware.js
    │   ├── errorHandler.js
    │   ├── uploadMiddleware.js
    │   └── validation/ (22 files)
    ├── models/ (24 files)
    ├── repositories/ (27 files)
    ├── routes/ (30 files)
    ├── services/ (31 files)
    ├── test/
    │   └── testAccionable.js
    └── utils/
        ├── ApiError.js
        └── jwtUtils.js
```

---

## 2. README FILES

**`README.md`** (shown above - 83 lines) - describes the backend as an API for project management using Node.js, Express, Supabase (PostgreSQL). Lists features: CRUD, Zod validation, JWT auth, Supabase integration.

**`MANUAL_BACKEND.md`** (shown above - 668 lines) - Very detailed architecture manual explaining all layers: App → Routes → Controller → Service → Repository → Model. Includes security, error handling, DB schema, command reference.

**`batch/ReadMe.md`** (shown above - 9 lines) - Brief note on batch scripts to create employees and users.

---

## 3. ROOT MANIFEST FILES

**`package.json`**:
- name: `micrositio_iris-back`
- version: `1.0.0`
- type: `module` (ESM)
- scripts: `start` → `node src/app.js`, `dev` → `nodemon src/app.js`
- Dependencies: `@supabase/supabase-js`, `bcryptjs`, `cors`, `dotenv`, `express`, `jsonwebtoken`, `multer`, `mysql2`, `node-fetch`, `nodemailer`, `pg`, `pg-hstore`, `sequelize`, `uuid`, `zod`
- DevDependencies: `nodemon`

---

## 4. AGENTS / COPILOT / CURSOR FILES

None found. No `AGENTS.md`, `CLAUDE.md`, `.cursor/rules/`, `.cursorrules`, or `.github/copilot-instructions.md` exist.

---

## 5. OPENCODE.JSON

None found.

---

## 6. CI WORKFLOW FILES

None found. No `.github/workflows/` directory.

---

## 7. BUILD/TEST/LINT CONFIG FILES

None found. No `Makefile`, `webpack.config.js`, `vite.config.ts`, `tsconfig.json`, `.eslintrc*`, `.prettierrc*`, `ruff.toml`, or any similar files. The project uses no TypeScript, no bundler, no linter config.

---

## 8. DOCKER FILES

None found. No `Dockerfile` or `docker-compose.yml`.

---

## 9. .ENV.EXAMPLE FILES

None found. There is a live `.env` file directly in `src/.env` (shown above) with actual credentials:
```
SUPABASE_URL=https://xnvkkassmxzqzvlfomsb.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
PORT=3000
NODE_ENV="development"
EMAIL_USER=experimentos.iris@gmail.com
EMAIL_PASSWORD=uecbgvjfbbgyybhh
```

---

## 10. LANGUAGES / FRAMEWORKS

| Technology | Usage |
|---|---|
| **JavaScript (ESM)** | Entire backend codebase |
| **Node.js** | Runtime environment |
| **Express** | HTTP web framework |
| **Supabase** (PostgreSQL) | Database provider |
| **Zod** | Schema validation |
| **JWT** (jsonwebtoken) | Authentication |
| **Nodemailer** | Email sending |
| **Multer** | File upload handling |
| **Sequelize** | ORM (installed but likely unused - code uses Supabase client directly) |
| **bcryptjs** | Password hashing |
| **PostgreSQL** / `pg` | Database (via Supabase) |
| **Nodemon** | Dev hot-reload |

---

## 11. ENTRYPOINT(S)

**Primary entrypoint:** `src/app.js` (`/home/josefer/Documents/casa-trabajo/codigo/programas-micrositio/despues-unificacion-main/Micrositio-Iris-Backend/src/app.js`)

It is launched via:
- `npm start` → `node src/app.js`
- `npm run dev` → `nodemon src/app.js`

**What `app.js` does:**
1. Loads dotenv, Express, CORS, multer
2. Imports Supabase client and JWT utils
3. Registers **28 route modules** at paths like `/proyectos`, `/empleados`, `/secuencias`, `/categorias`, `/testing_card`, `/learning_card`, `/auth`, `/agentes`, `/notificaciones`, `/search`, `/url_formato`, `/formato`, `/accionables`, `/habilidad`, etc.
4. Configures CORS for 4 frontend origins
5. Sets up JSON body parser
6. Defines `GET /` (basic test) and `GET /health` (health check endpoint)
7. Mounts error handler middleware
8. Listens on `PORT` (default 3000)

**Database:** Supabase PostgreSQL, configured in `src/config/supabaseClient.js`. Schema defined in `SQL/DML.sql` with tables: `categoria`, `empleado`, `proyecto`, `experimento_tipo`, `secuencia`, `testing_card`, `learning_card`, `celula_proyecto`, `metrica_testing_card`, `node_positions`, `url_testing_card`, `url_learning_card`, `learning_card_documents`, `testing_card_documents`, `usuarios`, `usuario_proyecto`, `agente`, `categoria_agente`, `relacion_agente_categoria`, `plantilla_testing_card`, `plantilla_secuencia`, `plantilla_metrica_tc`, `formato`, `url_formato`, and playbook data tables.

**Architecture pattern:** Layered (Route → Controller → Service → Repository → Model → Supabase DB) with Zod validation schemas, as documented extensively in `MANUAL_BACKEND.md`.

**Key files to understand the app:**
- `src/app.js` - entrypoint, route registration
- `src/config/supabaseClient.js` - DB client
- `src/config/jwtConfig.js` - JWT configuration
- `src/utils/ApiError.js` - custom error class
- `src/utils/jwtUtils.js` - JWT token utils
- `src/middlewares/authMiddleware.js` - auth + role middleware
- `src/middlewares/errorHandler.js` - global error handler
- `src/services/authService.js` - login/register logic
- `src/services/emailService.js` - email notifications via Nodemailer
- `src/services/searchService.js` - cross-entity search
- `src/services/notificacionService.js` - notification orchestration
</task_result>
```

---

## Assistant (Build · DeepSeek V4 Flash · 6.6s)

_Thinking:_

Now I have a thorough understanding of the repository. Let me read a few more key files to understand the exact details I need for AGENTS.md.

Let me read:
1. The MANUAL_BACKEND.md for any important command reference
2. package.json for exact commands
3. src/app.js for the entrypoint details
4. The test file to understand testing
5. The .env to understand required variables

Actually, I already have all this info from the task result. Let me now create the AGENTS.md file.

Let me think about what's important for an agent working in this repo:

1. **Commands**: `npm start` (node directly), `npm run dev` (nodemon with hot-reload)
2. **Testing**: There's a single test file at `src/test/testAccionable.js` - seems like a manual test script. No test framework is configured.
3. **Architecture**: Layered (Routes → Controller → Service → Repository → Model), Express, Supabase/PostgreSQL, JWT auth, Zod validation
4. **Database**: Supabase PostgreSQL, schema in SQL/DML.sql
5. **CORS**: Configured for 4 specific frontend origins
6. **Ecosystem**: JavaScript/ESM, no TypeScript, no linter, no formatter config
7. **No CI/CD**, no Docker, no build step
8. **No existing AGENTS.md** or similar instruction files

So the repo is relatively simple - a Node.js/Express backend with Supabase. Key things an agent might miss:
- There's no test framework - testing is manual
- No linter/formatter configured
- The .env file has live credentials (important not to commit)
- 30+ routes all registered manually in app.js
- The detailed architecture manual is at MANUAL_BACKEND.md (668 lines)
- Batch scripts for data seeding exist in batch/

Let me also check if Sequelize is actually used or not, since it's in package.json but the code uses Supabase client directly.

Let me check the package.json more carefully and also any Sequelize presence.

**Tool: read**

**Input:**
```json
{
  "filePath": "/home/josefer/Documents/casa-trabajo/codigo/programas-micrositio/despues-unificacion-main/Micrositio-Iris-Backend/package.json"
}
```

**Output:**
```
<path>/home/josefer/Documents/casa-trabajo/codigo/programas-micrositio/despues-unificacion-main/Micrositio-Iris-Backend/package.json</path>
<type>file</type>
<content>
1: {
2:   "name": "micrositio_iris-back",
3:   "version": "1.0.0",
4:   "type": "module",
5:   "scripts": {
6:     "start": "node src/app.js",
7:     "dev": "nodemon src/app.js"
8:   },
9:   "dependencies": {
10:     "@supabase/supabase-js": "^2.50.2",
11:     "bcryptjs": "^3.0.3",
12:     "cors": "^2.8.5",
13:     "dotenv": "^16.6.1",
14:     "express": "^4.18.2",
15:     "jsonwebtoken": "^9.0.3",
16:     "multer": "^2.1.1",
17:     "mysql2": "^3.14.2",
18:     "node-fetch": "^3.3.2",
19:     "nodemailer": "^7.0.11",
20:     "pg": "^8.16.3",
21:     "pg-hstore": "^2.3.4",
22:     "sequelize": "^6.37.7",
23:     "uuid": "^11.1.0",
24:     "zod": "^3.25.67"
25:   },
26:   "devDependencies": {
27:     "nodemon": "^3.0.2"
28:   }
29: }

(End of file - total 29 lines)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "/home/josefer/Documents/casa-trabajo/codigo/programas-micrositio/despues-unificacion-main/Micrositio-Iris-Backend/src/app.js"
}
```

**Output:**
```
<path>/home/josefer/Documents/casa-trabajo/codigo/programas-micrositio/despues-unificacion-main/Micrositio-Iris-Backend/src/app.js</path>
<type>file</type>
<content>
1: import dotenv from 'dotenv';
2: import express from 'express';
3: import cors from 'cors';
4: import multer from 'multer';
5: import supabase from './config/supabaseClient.js';
6: //import jwt from 'jsonwebtoken'; // para leer el id_usuario del token
7: import JWTUtils from './utils/jwtUtils.js'; // tu utilitario de JWT
8: 
9: import proyectoRoutes from './routes/proyectoRoutes.js';
10: import celulaProyectoRoutes from './routes/celulaProyectoRoutes.js';
11: import empleadoRoutes from './routes/empleadoRoutes.js'; 
12: import secuenciaRoutes from './routes/secuenciaRoutes.js';
13: import categotiaRoutes from './routes/categoriaRoutes.js'
14: import experimentosTipoRoutes from './routes/experimentoTipoRoutes.js'
15: import testingCardRoutes from './routes/testingCardRoutes.js';
16: import learningCardRoutes from './routes/learningCardRoutes.js';
17: import metricaTestingCardRoutes from './routes/metricaTestingCardRoutes.js';
18: import urlTestingCardRoutes from './routes/urlTestingCardRoutes.js';
19: import urlLearningCardRoutes from './routes/urlLearningCardRoutes.js';
20: import errorHandler from './middlewares/errorHandler.js';
21: import bodyParser from 'body-parser'; 
22: import nodePositionRoutes from './routes/nodePositionRoutes.js';
23: import testingCardPlaybookRoutes from './routes/testingCardPlaybookRoutes.js';
24: import testingCardDocumentRoutes from './routes/testingCardDocumentRoutes.js';
25: import learningCardDocumentRoutes from './routes/learningCardDocumentRoutes.js';
26: import usuarioRoutes from './routes/usuarioRoutes.js';
27: import usuarioProyectoRoutes from './routes/usuarioProyectoRoutes.js';
28: import authRoutes from './routes/authRoutes.js';
29: import agenteRoutes from './routes/agenteRoutes.js';
30: import agenteCategoriaRoutes from './routes/agenteCategoriaRoutes.js';
31: import plantillaTestingCardRoutes from './routes/plantillaTestingCardRoutes.js';
32: import plantillaMetricaTcRoutes from './routes/plantillaMetricaTcRoutes.js';
33: import plantillaSecuenciaRoutes from './routes/plantillaSecuenciaRoutes.js';
34: import notificacionRoutes from './routes/notificacionRoutes.js';
35: import searchRoutes from './routes/searchRoutes.js';
36: import urlFormatoRoutes from './routes/urlFormatoRoutes.js';
37: import formatoRoutes from './routes/formatoRoutes.js';
38: import accionableRoutes from './routes/accionableRoutes.js';
39: import habilidadRoutes from './routes/habilidadRoutes.js';
40: 
41:  
42:  
43: // Configurar dotenv
44: dotenv.config();
45:  
46: const app = express();
47: const PORT = process.env.PORT || 3000;
48: 
49: // Usaba esto cuando subi imagenes desde aqui
50: //Bucket creado en supbase para almacenar las imagenes 
51: //const BUCKET = "image";
52:  
53: // Configuración de CORS
54: app.use(cors({
55:   origin: [
56:     'https://micrositio-iris-front.vercel.app',
57:     //'http://localhost:3000',
58:     //'http://localhost:3001',
59:     'https://micrositio-iris-front-git-dev3-iris-star-up-labs-projects.vercel.app',
60:     'http://localhost:5173',
61:     'http://localhost:5174'
62:   ],
63:   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
64:   allowedHeaders: ['Content-Type', 'Authorization'],
65:   credentials: true
66: }));
67: 
68: // Middleware adicional para manejar preflight OPTIONS
69: app.options('*', (req, res) => {
70:   res.header('Access-Control-Allow-Origin', req.headers.origin);
71:   res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
72:   res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
73:   res.header('Access-Control-Allow-Credentials', 'true');
74:   res.sendStatus(200);
75: });
76: 
77: // Middleware para parsear JSON
78: app.use(bodyParser.json()); 
79: app.use(express.json());
80: 
81: // Rutas
82: app.use('/proyectos', proyectoRoutes);
83: app.use('/celula_proyecto', celulaProyectoRoutes);
84: app.use('/empleados', empleadoRoutes);
85: app.use('/secuencias', secuenciaRoutes);
86: app.use('/categorias', categotiaRoutes);
87: app.use('/experimento_tipo', experimentosTipoRoutes);
88: app.use('/testing_card', testingCardRoutes)
89: app.use('/learning_card', learningCardRoutes)
90: app.use('/metrica_testing_card', metricaTestingCardRoutes)
91: app.use('/url_testing_card', urlTestingCardRoutes)
92: app.use('/url_learning_card', urlLearningCardRoutes)
93: app.use('/flow-positions', nodePositionRoutes)
94: app.use('/testing_card_playbook', testingCardPlaybookRoutes);
95: app.use('/api', testingCardDocumentRoutes);
96: app.use('/api/learning-card', learningCardDocumentRoutes);
97: app.use('/usuarios', usuarioRoutes);
98: app.use('/usuario_proyecto', usuarioProyectoRoutes);
99: app.use('/auth', authRoutes);
100: app.use('/agentes', agenteRoutes);
101: app.use('/agente_categoria', agenteCategoriaRoutes);
102: app.use('/plantilla_testing_card', plantillaTestingCardRoutes);
103: app.use('/plantilla_metrica_tc', plantillaMetricaTcRoutes);
104: app.use('/plantilla_secuencia', plantillaSecuenciaRoutes);
105: app.use('/notificaciones', notificacionRoutes);
106: app.use('/search', searchRoutes);
107: app.use('/url_formato', urlFormatoRoutes);
108: app.use('/formato', formatoRoutes);
109: app.use('/accionables', accionableRoutes);
110: app.use('/habilidad',habilidadRoutes);
111: 
112: 
113: // Ruta básica de prueba
114: app.get('/', (req, res) => {
115:   res.send('API funcionando');
116: });
117: 
118: // 🔥 Endpoint de health check para mantener el servicio activo
119: app.get('/health', (req, res) => {
120:   res.status(200).json({
121:     status: 'OK',
122:     timestamp: new Date().toISOString(),
123:     uptime: process.uptime(),
124:     service: 'Micrositio IRIS Backend',
125:     memory: {
126:       used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
127:       total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
128:     }
129:   });
130: });
131: 
132: // ============  Imagenes Acomodar despues ==================
133: 
134: 
135: // // Multer en memoria: NO guarda en disco, pasa el buffer directo
136: // const upload = multer({
137: //   storage: multer.memoryStorage(),
138: //   fileFilter: (req, file, cb) => {
139: //     file.mimetype.startsWith("image/") ? cb(null, true) : cb(new Error("Solo imágenes"));
140: //   },
141: // });
142: 
143: 
144: 
145: 
146: // El bueno
147: //   app.post("/upload", upload.single("image"), async (req, res) => {
148: //   if (!req.file) return res.status(400).json({ error: "No se recibió imagen" });
149: 
150: //   // ✅ Leer y verificar token con tu utilitario
151: //   let userId;
152: //   try {
153: //     const token = JWTUtils.extraerTokenDelHeader(req.headers.authorization);
154: //     const decoded = JWTUtils.verificarToken(token);
155: //     userId = decoded.user_id;
156: //   } catch (err) {
157: //     return res.status(401).json({ error: err.message });
158: //   }
159: 
160: //   const filename = `${Date.now()}-${req.file.originalname}`;
161: 
162: //   const { error } = await supabase.storage
163: //     .from(BUCKET)
164: //     .upload(filename, req.file.buffer, {
165: //       contentType: req.file.mimetype,
166: //       upsert: false,
167: //     });
168: //   if (error) return res.status(500).json({ error: error.message });
169: 
170: //   const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename);
171: //   const publicUrl = data.publicUrl;
172: 
173: //   // ✅ Guardar URL en la BD
174: //   const { error: dbError } = await supabase
175: //     .from('usuarios')
176: //     .update({ image: publicUrl })
177: //     .eq('id_usuario', userId);
178: 
179: //   if (dbError) return res.status(500).json({ error: dbError.message });
180: 
181: //   res.json({ message: "Imagen subida a Supabase", url: publicUrl, filename });
182: // });
183: 
184: 
185: 
186: 
187: 
188: 
189: //  ─── OBTENER URL DE IMAGEN  (usar esta opcion solo si es privado el bucket)────────────────────────────────
190: //
191: //    GET /images/:filename
192: //   app.get("/images/:filename", async (req, res) => {
193: //     const { data, error } = await supabase.storage
194: //       .from(BUCKET)
195: //       .createSignedUrl(req.params.filename, 60 * 60); // URL válida por 1 hora
196: 
197: //     if (error) return res.status(404).json({ error: "Imagen no encontrada" });
198: 
199: //     res.json({ url: data.signedUrl });
200: //   });
201: 
202: 
203: 
204: 
205: //  Agrega esto antes de definir las rutas
206: // async function initStorage() {
207: //   const { data: buckets } = await supabase.storage.listBuckets();
208: //   const exists = buckets.some((b) => b.name === BUCKET);
209: 
210: //   if (!exists) {
211: //     const { error } = await supabase.storage.createBucket(BUCKET, {
212: //       public: true, // false si quieres URLs firmadas privadas
213: //     });
214: 
215: //     if (error) {
216: //       console.error("Error creando bucket:", error.message);
217: //     } else {
218: //       console.log(`Bucket "${BUCKET}" creado`);
219: //     }
220: //   } else {
221: //     console.log(`Bucket "${BUCKET}" ya existe`);
222: //   }
223: // }
224: 
225: 
226: // ========================================================
227: 
228: // Manejo de errores
229: app.use(errorHandler);
230: 
231: 
232: 
233: 
234:  
235: // Iniciar servidor
236: app.listen(PORT,async () => {
237:   //await initStorage();
238:   console.log(`Servidor corriendo en http://localhost:${PORT}`);
239: });
240: 

(End of file - total 240 lines)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "/home/josefer/Documents/casa-trabajo/codigo/programas-micrositio/despues-unificacion-main/Micrositio-Iris-Backend/src/test/testAccionable.js"
}
```

**Output:**
```
<path>/home/josefer/Documents/casa-trabajo/codigo/programas-micrositio/despues-unificacion-main/Micrositio-Iris-Backend/src/test/testAccionable.js</path>
<type>file</type>
<content>
1: import {
2:     //obtenerTodos,
3:     crear,
4:     obtenerPorId,
5:     actualizar,
6:     eliminar,
7:     obtenerPorProyecto,
8:     obtenerPorTestingCard,
9:     obtenerPorSecuencia,
10:   } from '../repositories/accionableRepository.js';
11:   
12:   async function test() {
13:   
14:     try {
15:   
16:     // ======================= Creando accionable ================================================
17: 
18:     //   console.log("Creando accionable...");
19:   
20:     //   const nuevo = await crear({
21:     //     contenido: "Optimizar login transformando a JWT",
22:     //     esfuerzo: 4,
23:     //     impacto: 6,
24:     //     // id_accionable = null,
25:     //     id_learning_card:87,
26:     //     realizado : false,
27: 
28: 
29:     //   });
30:   
31:     //   console.log("Creado:", nuevo);
32:   
33:   
34:   //=========================  Consultando todos  =============================================
35: 
36:       // console.log("Consultando todos...");
37:   
38:       // const lista = await obtenerTodos();
39:   
40:       // console.log(lista);
41:   
42:   
43: 
44:     
45: 
46:   //========================= Consultando por id ==============================================
47:   
48:       // console.log("Consultando por id...");
49:   
50:       // // const uno = await obtenerPorId(nuevo.id);
51:       // const uno = await obtenerPorId(1);
52:   
53:       // console.log(uno);
54:   
55:   
56:   
57: // ============================ Actualizando ============================================
58: 
59:       // console.log("Actualizando...");
60:   
61:       // // const actualizado = await actualizar(nuevo.id, {
62:       // const actualizado = await actualizar(3, {
63:       //   esfuerzo: 4,
64:       //   contenido: "Optimizar login transformando a JWT y refreshtoken2" ,
65:       // });
66:   
67:       // console.log(actualizado);
68:   
69:   
70: // ============================ Eliminando ============================================
71:   
72:     //   console.log("Eliminando...");
73:   
74:     //   // const eliminado = await eliminar(nuevo.id);
75:     //   const eliminado = await eliminar(6);
76:   
77:     //   console.log(eliminado);
78:   
79:   
80: 
81: 
82:   //============================ Por Testing Card ============================================
83: 
84: console.log("Accionables por testing card...");
85: 
86: const testing = await obtenerPorTestingCard(465);
87: 
88: console.log(testing);
89: 
90: 
91: 
92: 
93: //============================ Por Secuencia ============================================
94: 
95: console.log("Accionables por secuencia...");
96: 
97: const secuencia = await obtenerPorSecuencia(161);
98: 
99: console.log(secuencia);
100: 
101: 
102: 
103: 
104: //============================ Por Proyecto ============================================
105: 
106: console.log("Accionables por proyecto...");
107: 
108: const proyecto = await obtenerPorProyecto(87);
109: 
110: console.log(proyecto);
111: 
112: 
113:      } catch (err) {
114:        console.error(err);
115:     }
116:   }
117:   
118: //test();

(End of file - total 118 lines)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "/home/josefer/Documents/casa-trabajo/codigo/programas-micrositio/despues-unificacion-main/Micrositio-Iris-Backend/src/config/supabaseClient.js"
}
```

**Output:**
```
<path>/home/josefer/Documents/casa-trabajo/codigo/programas-micrositio/despues-unificacion-main/Micrositio-Iris-Backend/src/config/supabaseClient.js</path>
<type>file</type>
<content>
1: // src/config/supabaseClient.js
2: import { createClient } from '@supabase/supabase-js';
3: import dotenv from 'dotenv';
4: 
5: // Cargar variables de entorno
6: dotenv.config();
7: 
8: // Verificar variables
9: if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
10:   console.error('ERROR: Las variables SUPABASE_URL y SUPABASE_KEY deben estar definidas en .env');
11:   process.exit(1); // Detener la aplicación si faltan variables
12: }
13: 
14: // Crear cliente Supabase
15: const supabase = createClient(
16:   process.env.SUPABASE_URL,
17:   process.env.SUPABASE_KEY
18: );
19: 
20: export default supabase;

(End of file - total 20 lines)
</content>
```

---

## Assistant (Build · DeepSeek V4 Flash · 5.7s)

_Thinking:_

Now I have a very thorough understanding of this repo. Let me create the AGENTS.md file.

Key facts for AGENTS.md:

1. **No existing AGENTS.md** - creating fresh
2. **Commands**:
   - `npm start` → `node src/app.js`
   - `npm run dev` → `nodemon src/app.js` (hot-reload)
   - No test/lint/typecheck scripts exist
3. **Architecture**: Node.js/ESM + Express, layered (Routes → Controller → Service → Repository → Model), Supabase (PostgreSQL), Zod validation, JWT auth
4. **No TypeScript, no linter, no formatter** - pure JS
5. **Testing**: Manual only via `src/test/testAccionable.js` (commented out, run with `node src/test/testAccionable.js`). No test framework.
6. **.env** required vars: `SUPABASE_URL`, `SUPABASE_KEY`, `PORT`, `NODE_ENV`, `EMAIL_USER`, `EMAIL_PASSWORD` (live credentials in src/.env, DO NOT commit)
7. **Entrypoint**: `src/app.js` registers ~28 route modules
8. **Database**: Supabase PostgreSQL schema in `SQL/DML.sql`
9. **CORS**: 4 specific allowed origins (3 production Vercel URLs, 2 localhost)
10. **No Docker, no CI/CD**
11. **Detailed manual**: `MANUAL_BACKEND.md` (668 lines)
12. **Style conventions**: The codebase appears to use Spanish for business logic names, constants naming convention not obvious from package.json
13. **No Sequelize usage despite being in dependencies** - code uses `@supabase/supabase-js` directly
14. `batch/` directory has scripts for seeding data (`crearEmpleados.js`, `crearUsuarios.js`, etc.)

Let me look at a few representative source files to understand conventions better.

**Tool: read**

**Input:**
```json
{
  "filePath": "/home/josefer/Documents/casa-trabajo/codigo/programas-micrositio/despues-unificacion-main/Micrositio-Iris-Backend/src/repositories/accionableRepository.js"
}
```

**Output:**
```
<path>/home/josefer/Documents/casa-trabajo/codigo/programas-micrositio/despues-unificacion-main/Micrositio-Iris-Backend/src/repositories/accionableRepository.js</path>
<type>file</type>
<content>
1: import supabase from '../config/supabaseClient.js'
2: import ApiError from '../utils/ApiError.js'
3: import Accionable from '../models/Accionable.js'
4: 
5: 
6: 
7: /**
8:  * Obtener accionable por ID
9:  */
10: export async function obtenerPorId(id) {
11: 
12:   const { data, error } = await supabase
13:     .from('accionable')
14:     .select('*')
15:     .eq('id_accionable', id)
16:     .maybeSingle()
17: 
18:   if (error) {
19:     throw new ApiError(`Error al obtener accionable: ${error.message}`, 500)
20:   }
21: 
22:   return data ? new Accionable(data) : null
23: }
24: 
25: 
26: /**
27:  * Crear accionable
28:  */
29: export async function crear(accionableData) {
30: 
31:   const { data, error } = await supabase
32:     .from('accionable')
33:     .insert(accionableData)
34:     .select()
35:     .single()
36: 
37:   if (error) {
38:     throw new ApiError(`Error al crear accionable: ${error.message}`, 500)
39:   }
40: 
41:   return new Accionable(data)
42: }
43: 
44: 
45: /**
46:  * Actualizar accionable
47:  */
48: export async function actualizar(id, updateData) {
49: 
50:   const { data, error } = await supabase
51:     .from('accionable')
52:     .update(updateData)
53:     .eq('id_accionable', id)
54:     .select()
55:     .single()
56: 
57:   if (error) {
58:     throw new ApiError(`Error al actualizar accionable: ${error.message}`, 500)
59:   }
60: 
61:   return new Accionable(data)
62: }
63: 
64: 
65: /**
66:  * Eliminar accionable
67:  */
68: export async function eliminar(id) {
69: 
70:   const { data, error } = await supabase
71:     .from('accionable')
72:     .delete()
73:     .eq('id_accionable', id)
74:     .select()
75:     .single()
76: 
77:   if (error) {
78:     throw new ApiError(`Error al eliminar accionable: ${error.message}`, 500)
79:   }
80: 
81:   if (!data) {
82:     throw new ApiError('Accionable no encontrado', 404)
83:   }
84: 
85:   return new Accionable(data)
86: }
87: 
88: 
89: 
90: 
91: /**
92:  * Obtener accionables por learning card
93:  */
94: export async function obtenerPorLearningCard(idLearningCard) {
95: 
96:   const { data, error } = await supabase
97:     .from('accionable')
98:     .select('*')
99:     .eq('id_learning_card', idLearningCard)
100: 
101:   if (error) {
102:     throw new ApiError(`Error al obtener accionables: ${error.message}`, 500)
103:   }
104: 
105:   return data.map(item => new Accionable(item))
106: }
107: 
108: 
109: 
110: /**
111:  * Obtener accionables por testing card
112:  */
113: export async function obtenerPorTestingCard(idTestingCard) {
114: 
115:   const { data: learningCards, error: learningError } = await supabase
116:     .from('learning_card')
117:     .select('id')
118:     .eq('id_testing_card', idTestingCard)
119: 
120:   if (learningError) {
121:     throw new ApiError(`Error obteniendo learning cards: ${learningError.message}`, 500)
122:   }
123: 
124:   if (!learningCards.length) return []
125: 
126:   const learningIds = learningCards.map(l => l.id)
127: 
128:   const { data, error } = await supabase
129:     .from('accionable')
130:     .select('*')
131:     .in('id_learning_card', learningIds)
132: 
133:   if (error) {
134:     throw new ApiError(`Error al obtener accionables: ${error.message}`, 500)
135:   }
136: 
137:   return data.map(item => new Accionable(item))
138: }
139: 
140: 
141: /**
142:  * Obtener accionables por secuencia
143:  */
144: export async function obtenerPorSecuencia(idSecuencia) {
145: 
146:   const { data: testingCards, error: testingError } = await supabase
147:     .from('testing_card')
148:     .select('id_testing_card')
149:     .eq('id_secuencia', idSecuencia)
150: 
151:   if (testingError) {
152:     throw new ApiError(`Error obteniendo testing cards: ${testingError.message}`, 500)
153:   }
154: 
155:   if (!testingCards.length) return []
156: 
157:   const testingIds = testingCards.map(t => t.id_testing_card)
158: 
159:   const { data: learningCards, error: learningError } = await supabase
160:     .from('learning_card')
161:     .select('id')
162:     .in('id_testing_card', testingIds)
163: 
164:   if (learningError) {
165:     throw new ApiError(`Error obteniendo learning cards: ${learningError.message}`, 500)
166:   }
167: 
168:   if (!learningCards.length) return []
169: 
170:   const learningIds = learningCards.map(l => l.id)
171: 
172:   const { data, error } = await supabase
173:     .from('accionable')
174:     .select('*')
175:     .in('id_learning_card', learningIds)
176: 
177:   if (error) {
178:     throw new ApiError(`Error obteniendo accionables: ${error.message}`, 500)
179:   }
180: 
181:   return data.map(item => new Accionable(item))
182: }
183: 
184: 
185: /**
186:  * Obtener accionables por proyecto
187:  */
188: export async function obtenerPorProyecto(idProyecto) {
189: 
190:   const { data: secuencias, error: secuenciaError } = await supabase
191:     .from('secuencia')
192:     .select('id_secuencia')
193:     .eq('id_proyecto', idProyecto)
194: 
195:   if (secuenciaError) {
196:     throw new ApiError(`Error obteniendo secuencias: ${secuenciaError.message}`, 500)
197:   }
198: 
199:   if (!secuencias.length) return []
200: 
201:   const secuenciaIds = secuencias.map(s => s.id_secuencia)
202: 
203:   const { data: testingCards, error: testingError } = await supabase
204:     .from('testing_card')
205:     .select('id_testing_card')
206:     .in('id_secuencia', secuenciaIds)
207: 
208:   if (testingError) {
209:     throw new ApiError(`Error obteniendo testing cards: ${testingError.message}`, 500)
210:   }
211: 
212:   if (!testingCards.length) return []
213: 
214:   const testingIds = testingCards.map(t => t.id_testing_card)
215: 
216:   const { data: learningCards, error: learningError } = await supabase
217:     .from('learning_card')
218:     .select('id')
219:     .in('id_testing_card', testingIds)
220: 
221:   if (learningError) {
222:     throw new ApiError(`Error obteniendo learning cards: ${learningError.message}`, 500)
223:   }
224: 
225:   if (!learningCards.length) return []
226: 
227:   const learningIds = learningCards.map(l => l.id)
228: 
229:   const { data, error } = await supabase
230:     .from('accionable')
231:     .select('*')
232:     .in('id_learning_card', learningIds)
233: 
234:   if (error) {
235:     throw new ApiError(`Error obteniendo accionables: ${error.message}`, 500)
236:   }
237: 
238:   return data.map(item => new Accionable(item))
239: }

(End of file - total 239 lines)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "/home/josefer/Documents/casa-trabajo/codigo/programas-micrositio/despues-unificacion-main/Micrositio-Iris-Backend/src/middlewares/authMiddleware.js"
}
```

**Output:**
```
<path>/home/josefer/Documents/casa-trabajo/codigo/programas-micrositio/despues-unificacion-main/Micrositio-Iris-Backend/src/middlewares/authMiddleware.js</path>
<type>file</type>
<content>
1: import JWTUtils from '../utils/jwtUtils.js';
2: import ApiError from '../utils/ApiError.js';
3: 
4: /**
5:  * Middleware para verificar JWT en requests
6:  */
7: export const authMiddleware = (req, res, next) => {
8:   try {
9:     const authHeader = req.headers.authorization;
10:     const token = JWTUtils.extraerTokenDelHeader(authHeader);
11:     const decoded = JWTUtils.verificarToken(token);
12: 
13:     // Agregar información del usuario al request
14:     req.user = decoded;
15:     next();
16: 
17:   } catch (error) {
18:     next(new ApiError('Token inválido o no proporcionado', 401));
19:   }
20: };
21: 
22: /**
23:  * Middleware para verificar que el usuario sea EDITOR
24:  */
25: export const soloEditores = (req, res, next) => {
26:   if (req.user.tipo !== 'EDITOR') {
27:     return next(new ApiError('Solo los editores pueden realizar esta acción', 403));
28:   }
29:   next();
30: };
31: 
32: /**
33:  * Middleware para verificar acceso a proyecto específico
34:  */
35: export const verificarAccesoProyecto = (req, res, next) => {
36:   const user = req.user;
37:   
38:   // Editores tienen acceso total
39:   if (user.tipo === 'EDITOR') {
40:     return next();
41:   }
42: 
43:   // Visitantes solo a sus proyectos asignados
44:   if (user.tipo === 'VISITANTE') {
45:     const proyectoId = parseInt(req.params.id_proyecto || req.body.id_proyecto);
46:     
47:     if (!user.proyectos || !user.proyectos.includes(proyectoId)) {
48:       return next(new ApiError('Sin acceso a este proyecto', 403));
49:     }
50:     
51:     return next();
52:   }
53: 
54:   next(new ApiError('Tipo de usuario no válido', 403));
55: };
56: 
57: /**
58:  * Middleware para filtrar proyectos según permisos del usuario
59:  * Agrega información de filtrado al request para que el controlador la use
60:  */
61: export const configurarFiltroProyectos = (req, res, next) => {
62:   const user = req.user;
63:   
64:   // Agregar información de filtrado al request
65:   req.filtroProyectos = {
66:     tipo: user.tipo,
67:     proyectosPermitidos: user.tipo === 'VISITANTE' ? user.proyectos : null
68:   };
69:   
70:   next();
71: };

(End of file - total 71 lines)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "/home/josefer/Documents/casa-trabajo/codigo/programas-micrositio/despues-unificacion-main/Micrositio-Iris-Backend/src/utils/ApiError.js"
}
```

**Output:**
```
<path>/home/josefer/Documents/casa-trabajo/codigo/programas-micrositio/despues-unificacion-main/Micrositio-Iris-Backend/src/utils/ApiError.js</path>
<type>file</type>
<content>
1: // src/utils/ApiError.js
2: /**
3:  * Clase personalizada para manejar errores de la API.
4:  * Extiende la clase Error nativa de JavaScript.
5:  * @class
6:  * @extends Error
7:  */
8: class ApiError extends Error {
9:   /**
10:    * Crea una instancia de ApiError.
11:    * @param {string} message - Mensaje descriptivo del error.
12:    * @param {number} statusCode - Código de estado HTTP asociado al error.
13:    */
14:   constructor(message, statusCode) {
15:     super(message);
16:     
17:     /**
18:      * Código de estado HTTP
19:      * @type {number}
20:      */
21:     this.statusCode = statusCode;
22:     
23:     /**
24:      * Estado del error (fail para 4xx, error para 5xx)
25:      * @type {string}
26:      */
27:     this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
28:     
29:     /**
30:      * Indica si el error es operacional (errores esperados)
31:      * @type {boolean}
32:      */
33:     this.isOperational = true;
34: 
35:     // Captura el stack trace para mejor debugging
36:     Error.captureStackTrace(this, this.constructor);
37:   }
38: }
39: 
40: export default ApiError;

(End of file - total 40 lines)
</content>
```

---

## Assistant (Build · DeepSeek V4 Flash · 9.3s)

_Thinking:_

Now I have enough context. Let me create a concise, high-signal AGENTS.md file.

Key things an agent working in this repo should know:

1. **Commands**: 
   - `npm run dev` for development (nodemon with hot-reload)
   - `npm start` for production
   - No test/lint/typecheck scripts exist

2. **Architecture**: Node.js/ESM + Express, layered pattern: Route → Controller → Service → Repository → Model (with Zod validation). Supabase (PostgreSQL) via `@supabase/supabase-js` SDK (NOT Sequelize, despite it being in package.json).

3. **.env** (required): `SUPABASE_URL`, `SUPABASE_KEY`, `PORT`, `NODE_ENV`, `EMAIL_USER`, `EMAIL_PASSWORD`. Live credentials in `src/.env` — DO NOT commit.

4. **Testing**: No test framework. Manual tests only via `node src/test/testAccionable.js` (all calls commented out).

5. **Database schema**: SQL/ directory has DDL + DML + functions + triggers.

6. **CORS**: 4 specific allowed origins in `src/app.js`.

7. **Auth**: JWT-based, three middleware levels: `authMiddleware` (any authenticated), `soloEditores` (EDITOR role), `verificarAccesoProyecto` (project-scoped). User types: EDITOR, VISITANTE.

8. **Error handling**: Custom `ApiError` class with `statusCode` and `status` ('fail' for 4xx, 'error' for 5xx). Global handler in `src/middlewares/errorHandler.js`.

9. **No TypeScript, no linter, no formatter, no CI/CD, no Docker**.

10. **Batch scripts**: In `batch/` for seeding data (`crearEmpleados.js`, `crearUsuarios.js`, etc.).

11. **Reference docs**: `MANUAL_BACKEND.md` (668 lines) has detailed architecture documentation. Postman collections in `Postman/` for API testing.

Let me write a clean, concise AGENTS.md.

Ahora tengo suficiente contexto. Creo el archivo:

**Tool: write**

**Input:**
```json
{
  "filePath": "/home/josefer/Documents/casa-trabajo/codigo/programas-micrositio/despues-unificacion-main/Micrositio-Iris-Backend/AGENTS.md",
  "content": "# AGENTS.md — Micrositio Iris Backend\n\n## Comandos\n- `npm run dev` — desarrollo con nodemon (hot-reload)\n- `npm start` — producción con `node src/app.js`\n- No hay scripts de test, lint, ni typecheck. No hay CI/CD ni Docker.\n\n## Arquitectura\n- **Node.js (ESM) + Express**, capas: Route → Controller → Service → Repository → Model\n- **Validación con Zod** (schemas en `middlewares/validation/`)\n- **Autenticación JWT** — tres middlewares en `middlewares/authMiddleware.js`:\n  - `authMiddleware` —任何 token válido\n  - `soloEditores` — solo rol EDITOR\n  - `verificarAccesoProyecto` — visitantes limitados a sus proyectos\n- Tipos de usuario: `EDITOR` (acceso total), `VISITANTE` (por proyecto)\n- Error handling: `ApiError` (statusCode + status `'fail'`/`'error'`) + `errorHandler.js`\n\n## Base de datos\n- **Supabase (PostgreSQL)** via `@supabase/supabase-js` SDK — **NO se usa Sequelize** a pesar de estar en package.json\n- Cliente en `src/config/supabaseClient.js`, requiere `SUPABASE_URL` y `SUPABASE_KEY`\n- Schema completo en `SQL/DML.sql`, funciones en `SQL/Funciones.sql`, triggers en `SQL/Trigger.sql`\n\n## Entrypoint\n`src/app.js` — registra ~28 rutas. CORS permite 4 orígenes (Vercel producción + localhost:5173/5174).\n\n## .env (requerido)\n`SUPABASE_URL`, `SUPABASE_KEY`, `PORT`, `NODE_ENV`, `EMAIL_USER`, `EMAIL_PASSWORD`\n⚠️ Credenciales reales están en `src/.env` — **no commitear**.\n\n## Testing\nNo hay framework de test. Pruebas manuales en `src/test/testAccionable.js` (ejecutar con `node src/test/testAccionable.js`, todas las llamadas están comentadas).\n\n## Batch / seed data\nScripts en `batch/`: `crearEmpleados.js`, `crearUsuarios.js`, etc.\n\n## Documentación de referencia\n- `MANUAL_BACKEND.md` — arquitectura detallada (668 líneas)\n- `Documentacion/` — docs de autenticación, categorías, notificaciones, usuarios\n- `Postman/` — colecciones para probar todos los endpoints\n"
}
```

**Output:**
```
Wrote file successfully.
```

---

## Assistant (Build · DeepSeek V4 Flash · 3.2s)

_Thinking:_

The file has been created. Let me verify it reads correctly.

Creado `AGENTS.md` con la información verificable del repositorio: comandos exactos, arquitectura de capas, detalle de Supabase (no Sequelize), auth JWT con sus 3 middlewares, esquema SQL, entrypoint con ~28 rutas, .env requerido, y testing manual. Sin especulación ni ruido.

---

