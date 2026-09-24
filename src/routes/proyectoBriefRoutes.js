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

// Deja el brief como si nunca se hubiera ejecutado: vacía la fila y borra de
// disco el .docx y el .pptx. Es irreversible, de ahí que el front confirme.
router.delete(
  '/:id_proyecto',
  authMiddleware,
  soloEditores,
  verificarAccesoProyecto,
  proyectoBriefController.limpiar.bind(proyectoBriefController)
);

export default router;
