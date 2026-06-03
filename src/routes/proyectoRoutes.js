// src/routes/proyectoRoutes.js
import express from 'express';
import ProyectoController from '../controllers/proyectoController.js';
import { authMiddleware, soloEditores, configurarFiltroProyectos, verificarAccesoProyecto } from '../middlewares/authMiddleware.js';

const router = express.Router();
const proyectoController = new ProyectoController();

router.get('/', authMiddleware, configurarFiltroProyectos, proyectoController.listarProyectos.bind(proyectoController));
router.get('/:id', authMiddleware, verificarAccesoProyecto, proyectoController.obtenerProyecto.bind(proyectoController));
router.get('/usuario/:id_usuario', authMiddleware, proyectoController.obtenerProyectosPorIdUsuario.bind(proyectoController));
router.post('/', authMiddleware, soloEditores, proyectoController.crearProyecto.bind(proyectoController));
router.patch('/:id', authMiddleware, soloEditores, proyectoController.actualizarProyecto.bind(proyectoController));
router.delete('/:id', authMiddleware, soloEditores, proyectoController.eliminarProyecto.bind(proyectoController));

export default router;
