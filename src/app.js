import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import supabase from './config/supabaseClient.js';
//import jwt from 'jsonwebtoken'; // para leer el id_usuario del token
import JWTUtils from './utils/jwtUtils.js'; // tu utilitario de JWT
import chatRoutes from './routes/chatRoutes.js';
import sesionRoutes from './routes/sesionRoutes.js';
import proyectoRoutes from './routes/proyectoRoutes.js';
import celulaProyectoRoutes from './routes/celulaProyectoRoutes.js';
import empleadoRoutes from './routes/empleadoRoutes.js'; 
import secuenciaRoutes from './routes/secuenciaRoutes.js';
import categotiaRoutes from './routes/categoriaRoutes.js'
import experimentosTipoRoutes from './routes/experimentoTipoRoutes.js'
import testingCardRoutes from './routes/testingCardRoutes.js';
import learningCardRoutes from './routes/learningCardRoutes.js';
import metricaTestingCardRoutes from './routes/metricaTestingCardRoutes.js';
import urlTestingCardRoutes from './routes/urlTestingCardRoutes.js';
import urlLearningCardRoutes from './routes/urlLearningCardRoutes.js';
import errorHandler from './middlewares/errorHandler.js';
import bodyParser from 'body-parser'; 
import nodePositionRoutes from './routes/nodePositionRoutes.js';
import testingCardPlaybookRoutes from './routes/testingCardPlaybookRoutes.js';
import testingCardDocumentRoutes from './routes/testingCardDocumentRoutes.js';
import learningCardDocumentRoutes from './routes/learningCardDocumentRoutes.js';
import usuarioRoutes from './routes/usuarioRoutes.js';
import usuarioProyectoRoutes from './routes/usuarioProyectoRoutes.js';
import authRoutes from './routes/authRoutes.js';
import agenteRoutes from './routes/agenteRoutes.js';
import agenteCategoriaRoutes from './routes/agenteCategoriaRoutes.js';
import plantillaTestingCardRoutes from './routes/plantillaTestingCardRoutes.js';
import plantillaMetricaTcRoutes from './routes/plantillaMetricaTcRoutes.js';
import plantillaSecuenciaRoutes from './routes/plantillaSecuenciaRoutes.js';
import notificacionRoutes from './routes/notificacionRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import urlFormatoRoutes from './routes/urlFormatoRoutes.js';
import formatoRoutes from './routes/formatoRoutes.js';
import accionableRoutes from './routes/accionableRoutes.js';
import habilidadRoutes from './routes/habilidadRoutes.js';
import servicioRoutes from './routes/servicioRoutes.js';

 
 
// Configurar dotenv
//dotenv.config();



// 👇 PONLO AQUÍ (después de imports)
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION:', err);
});

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
});

 
const app = express();
const PORT = process.env.PORT || 3000;

// Usaba esto cuando subi imagenes desde aqui
//Bucket creado en supbase para almacenar las imagenes 
//const BUCKET = "image";
 
// Configuración de CORS
app.use(cors({
  origin: [
    'https://micrositio-iris-front.vercel.app',
    //'http://localhost:3000',
    //'http://localhost:3001',
    'https://micrositio-iris-front-git-dev3-iris-star-up-labs-projects.vercel.app',
    'http://localhost:5173',
    'http://localhost:5174'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// El preflight OPTIONS lo resuelve ya el middleware cors() de arriba, que
// termina la peticion por si mismo. Aqui habia un app.options('*') que nunca
// llegaba a ejecutarse y que reflejaba req.headers.origin sin whitelist: si
// alguien reordenaba los middlewares, pasaba a aceptar cualquier origen.

// Middleware para parsear JSON
//app.use(bodyParser.json()); 
app.use(express.json());

// Debug de solicitudes entrantes. Fuera de produccion: loguea el body,
// que en POST /auth/login incluye la contrasena en claro.
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log("PATH:", req.path);
    console.log("METHOD:", req.method);
    console.log("BODY:", req.body);
    next();
  });
}
// Rutas
app.use('/proyectos', proyectoRoutes);
app.use('/celula_proyecto', celulaProyectoRoutes);
app.use('/empleados', empleadoRoutes);
app.use('/secuencias', secuenciaRoutes);
app.use('/categorias', categotiaRoutes);
app.use('/experimento_tipo', experimentosTipoRoutes);
app.use('/testing_card', testingCardRoutes)
app.use('/learning_card', learningCardRoutes)
app.use('/metrica_testing_card', metricaTestingCardRoutes)
app.use('/url_testing_card', urlTestingCardRoutes)
app.use('/url_learning_card', urlLearningCardRoutes)
app.use('/flow-positions', nodePositionRoutes)
app.use('/testing_card_playbook', testingCardPlaybookRoutes);
app.use('/api', testingCardDocumentRoutes);
app.use('/api/learning-card', learningCardDocumentRoutes);
app.use('/usuarios', usuarioRoutes);
app.use('/usuario_proyecto', usuarioProyectoRoutes);
app.use('/auth', authRoutes);
app.use('/agentes', agenteRoutes);
app.use('/agente_categoria', agenteCategoriaRoutes);
app.use('/plantilla_testing_card', plantillaTestingCardRoutes);
app.use('/plantilla_metrica_tc', plantillaMetricaTcRoutes);
app.use('/plantilla_secuencia', plantillaSecuenciaRoutes);
app.use('/notificaciones', notificacionRoutes);
app.use('/search', searchRoutes);
app.use('/url_formato', urlFormatoRoutes);
app.use('/formato', formatoRoutes);
app.use('/accionables', accionableRoutes);
app.use('/habilidad',habilidadRoutes);
app.use('/api/chat', sesionRoutes);
app.use('/api/chat', chatRoutes);
app.use('/servicio',servicioRoutes);

// Ruta básica de prueba
app.get('/', (req, res) => {
  res.send('API funcionando');
});

// 🔥 Endpoint de health check para mantener el servicio activo
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: 'Micrositio IRIS Backend',
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
    }
  });
});

// ============  Imagenes Acomodar despues ==================


// // Multer en memoria: NO guarda en disco, pasa el buffer directo
// const upload = multer({
//   storage: multer.memoryStorage(),
//   fileFilter: (req, file, cb) => {
//     file.mimetype.startsWith("image/") ? cb(null, true) : cb(new Error("Solo imágenes"));
//   },
// });




// El bueno
//   app.post("/upload", upload.single("image"), async (req, res) => {
//   if (!req.file) return res.status(400).json({ error: "No se recibió imagen" });

//   // ✅ Leer y verificar token con tu utilitario
//   let userId;
//   try {
//     const token = JWTUtils.extraerTokenDelHeader(req.headers.authorization);
//     const decoded = JWTUtils.verificarToken(token);
//     userId = decoded.user_id;
//   } catch (err) {
//     return res.status(401).json({ error: err.message });
//   }

//   const filename = `${Date.now()}-${req.file.originalname}`;

//   const { error } = await supabase.storage
//     .from(BUCKET)
//     .upload(filename, req.file.buffer, {
//       contentType: req.file.mimetype,
//       upsert: false,
//     });
//   if (error) return res.status(500).json({ error: error.message });

//   const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename);
//   const publicUrl = data.publicUrl;

//   // ✅ Guardar URL en la BD
//   const { error: dbError } = await supabase
//     .from('usuarios')
//     .update({ image: publicUrl })
//     .eq('id_usuario', userId);

//   if (dbError) return res.status(500).json({ error: dbError.message });

//   res.json({ message: "Imagen subida a Supabase", url: publicUrl, filename });
// });






//  ─── OBTENER URL DE IMAGEN  (usar esta opcion solo si es privado el bucket)────────────────────────────────
//
//    GET /images/:filename
//   app.get("/images/:filename", async (req, res) => {
//     const { data, error } = await supabase.storage
//       .from(BUCKET)
//       .createSignedUrl(req.params.filename, 60 * 60); // URL válida por 1 hora

//     if (error) return res.status(404).json({ error: "Imagen no encontrada" });

//     res.json({ url: data.signedUrl });
//   });




//  Agrega esto antes de definir las rutas
// async function initStorage() {
//   const { data: buckets } = await supabase.storage.listBuckets();
//   const exists = buckets.some((b) => b.name === BUCKET);

//   if (!exists) {
//     const { error } = await supabase.storage.createBucket(BUCKET, {
//       public: true, // false si quieres URLs firmadas privadas
//     });

//     if (error) {
//       console.error("Error creando bucket:", error.message);
//     } else {
//       console.log(`Bucket "${BUCKET}" creado`);
//     }
//   } else {
//     console.log(`Bucket "${BUCKET}" ya existe`);
//   }
// }


// ========================================================

// Manejo de errores
app.use(errorHandler);




 
// Iniciar servidor
// En Lambda el handler de lambda.js envuelve la app; solo escuchamos fuera de Lambda.
if (!process.env.AWS_LAMBDA_FUNCTION_NAME) {
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
}

export default app;
