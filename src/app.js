import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import supabase from './config/supabaseClient.js';

import proyectoRoutes from './routes/proyectoRoutes.js';
import celulaProyectoRoutes from './routes/celulaProyectoRoutes.js';
import empleadoRoutes from './routes/empleadoRoutes.js'; 
import secuenciaRoutes from './routes/secuenciaRoutes.js';
import categotiaRoutes from './routes/categoriaRoutes.js';
import experimentosTipoRoutes from './routes/experimentoTipoRoutes.js';
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

import UsuarioService from './services/usuarioService.js';
import {authMiddleware} from './middlewares/authMiddleware.js'; // 👈 IMPORTANTE

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 🔹 Bucket de Supabase
const BUCKET = "image";

// 🔹 Instancia del service
const usuarioService = new UsuarioService();

// ================= CORS =================
app.use(cors({
  origin: [
    'https://micrositio-iris-front.vercel.app',
    'https://micrositio-iris-front-git-dev3-iris-star-up-labs-projects.vercel.app',
    'http://localhost:5173',
    'http://localhost:5174'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

// ================= MIDDLEWARE =================
app.use(bodyParser.json()); 
app.use(express.json());

// ================= ROUTES =================
app.use('/proyectos', proyectoRoutes);
app.use('/celula_proyecto', celulaProyectoRoutes);
app.use('/empleados', empleadoRoutes);
app.use('/secuencias', secuenciaRoutes);
app.use('/categorias', categotiaRoutes);
app.use('/experimento_tipo', experimentosTipoRoutes);
app.use('/testing_card', testingCardRoutes);
app.use('/learning_card', learningCardRoutes);
app.use('/metrica_testing_card', metricaTestingCardRoutes);
app.use('/url_testing_card', urlTestingCardRoutes);
app.use('/url_learning_card', urlLearningCardRoutes);
app.use('/flow-positions', nodePositionRoutes);
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
app.use('/habilidad', habilidadRoutes);

// ================= HEALTH =================
app.get('/', (req, res) => {
  res.send('API funcionando');
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// ================= MULTER =================
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    file.mimetype.startsWith("image/")
      ? cb(null, true)
      : cb(new Error("Solo imágenes"));
  },
});

// ================= UPLOAD =================
app.post(
  "/upload",
  authMiddleware, // 👈 NECESARIO para obtener req.user
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No se recibió imagen" });
      }

      // 🔥 ID del usuario desde JWT
      //const userId = req.user?.id_usuario;
      const userId = req.user?.user_id;

      if (!userId) {
        return res.status(401).json({ error: "Usuario no autenticado" });
      }

      // 🔥 Nombre único
      const filename = `${Date.now()}-${Math.random()}-${req.file.originalname}`;

      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(filename, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: false,
        });

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      // 🔹 URL pública
      const { data } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(filename);

      const imageUrl = data.publicUrl;

      // 🔥 ACTUALIZAR USUARIO AUTOMÁTICAMENTE
      await usuarioService.actualizarImagen(userId, imageUrl);

      res.json({
        message: "Imagen subida y asignada al usuario",
        image: imageUrl,
        filename
      });

    } catch (err) {
      console.error("Error en upload:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

// ================= GET IMAGE =================
app.get("/images/:filename", async (req, res) => {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(req.params.filename, 60 * 60);

  if (error) {
    return res.status(404).json({ error: "Imagen no encontrada" });
  }

  res.json({ url: data.signedUrl });
});

// ================= INIT BUCKET =================
async function initStorage() {
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets.some((b) => b.name === BUCKET);

  if (!exists) {
    const { error } = await supabase.storage.createBucket(BUCKET, {
      public: true,
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

// ================= ERROR HANDLER =================
app.use(errorHandler);

// ================= START =================
app.listen(PORT, async () => {
  // await initStorage();
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});