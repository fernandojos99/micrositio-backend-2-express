import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import supabase from './config/supabaseClient.js';

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

 
 
// Configurar dotenv
dotenv.config();
 
const app = express();
const PORT = process.env.PORT || 3000;

//Bucket creado en supbase para almacenar las imagenes 
const BUCKET = "image";
 
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

// Middleware adicional para manejar preflight OPTIONS
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

// Middleware para parsear JSON
app.use(bodyParser.json()); 
app.use(express.json());

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


// Multer en memoria: NO guarda en disco, pasa el buffer directo
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    file.mimetype.startsWith("image/") ? cb(null, true) : cb(new Error("Solo imágenes"));
  },
});


// ─── SUBIR IMAGEN ─────────────────────────────────────────
// POST /upload  →  multipart/form-data, campo "image"
app.post("/upload", upload.single("image"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No se recibió imagen" });

  const filename = `${Date.now()}-${req.file.originalname}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(filename, req.file.buffer, {
      contentType: req.file.mimetype,
      upsert: false,
    });
    if (error) return res.status(500).json({ error: error.message });

    // URL pública (el bucket debe ser público, o usar createSignedUrl para privado)
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename);
  
    res.json({ message: "Imagen subida a Supabase", url: data.publicUrl, filename });
  });
  

    // ─── OBTENER URL DE IMAGEN  (usar esta opcion solo si es privado el bucket)────────────────────────────────
  // GET /images/:filename
  app.get("/images/:filename", async (req, res) => {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(req.params.filename, 60 * 60); // URL válida por 1 hora

    if (error) return res.status(404).json({ error: "Imagen no encontrada" });

    res.json({ url: data.signedUrl });
  });




// Agrega esto antes de definir las rutas
async function initStorage() {
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets.some((b) => b.name === BUCKET);

  if (!exists) {
    const { error } = await supabase.storage.createBucket(BUCKET, {
      public: true, // false si quieres URLs firmadas privadas
    });

    if (error) {
      console.error("Error creando bucket:", error.message);
    } else {
      console.log(`Bucket "${BUCKET}" creado`);
    }
  } else {
    console.log(`Bucket "${BUCKET}" ya existe`);
  }
}


// ========================================================

// Manejo de errores
app.use(errorHandler);




 
// Iniciar servidor
app.listen(PORT,async () => {
  //await initStorage();
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

