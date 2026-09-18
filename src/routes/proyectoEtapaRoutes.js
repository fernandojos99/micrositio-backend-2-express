import express from 'express';
import ProyectoEtapaController from '../controllers/proyectoEtapaController.js';
import {
  authMiddleware,
  soloEditores,
  soloAdmin,
  verificarAccesoProyecto
} from '../middlewares/authMiddleware.js';

const router = express.Router();

const proyectoEtapaController = new ProyectoEtapaController();

// El nombre del parámetro tiene que ser id_proyecto: es el que lee
// verificarAccesoProyecto para dejar pasar solo a quien tiene ese proyecto.
router.get(
  '/:id_proyecto',
  authMiddleware,
  verificarAccesoProyecto,
  proyectoEtapaController.obtener.bind(proyectoEtapaController)
);

// Todo lo que necesita el tablero, en una sola petición.
router.get(
  '/:id_proyecto/avance',
  authMiddleware,
  verificarAccesoProyecto,
  proyectoEtapaController.avance.bind(proyectoEtapaController)
);

router.put(
  '/:id_proyecto',
  authMiddleware,
  soloEditores,
  verificarAccesoProyecto,
  proyectoEtapaController.guardar.bind(proyectoEtapaController)
);

// Aprobar es lo único reservado al ADMIN.
router.post(
  '/:id_proyecto/aprobar',
  authMiddleware,
  soloAdmin,
  proyectoEtapaController.aprobar.bind(proyectoEtapaController)
);

export default router;
