import express from 'express';
import ProyectoBriefController from '../controllers/proyectoBriefController.js';
import { upload, handleMulterError } from '../middlewares/uploadMiddleware.js';
import {
  authMiddleware,
  soloEditores,
  verificarAccesoProyecto
} from '../middlewares/authMiddleware.js';

const router = express.Router();

const proyectoBriefController = new ProyectoBriefController();

// El nombre del parámetro tiene que ser id_proyecto: es el que lee
// verificarAccesoProyecto para dejar pasar solo a quien tiene ese proyecto.
router.get(
  '/:id_proyecto',
  authMiddleware,
  verificarAccesoProyecto,
  proyectoBriefController.obtener.bind(proyectoBriefController)
);

// Lo que devolvió el procesador de transcripts al pulsar Ejecutar.
router.put(
  '/:id_proyecto',
  authMiddleware,
  soloEditores,
  verificarAccesoProyecto,
  proyectoBriefController.guardar.bind(proyectoBriefController)
);

// El .docx del que salió el brief.
router.post(
  '/:id_proyecto/archivo',
  authMiddleware,
  soloEditores,
  verificarAccesoProyecto,
  upload.single('document'),
  handleMulterError,
  proyectoBriefController.subirArchivo.bind(proyectoBriefController)
);

// La presentación, que puede subirse sin haber ejecutado nada.
router.post(
  '/:id_proyecto/pptx',
  authMiddleware,
  soloEditores,
  verificarAccesoProyecto,
  upload.single('document'),
  handleMulterError,
  proyectoBriefController.subirPptx.bind(proyectoBriefController)
);

export default router;
