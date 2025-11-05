// src/routes/proyectoRoutes.js
import express from 'express';
import ProyectoController from '../controllers/proyectoController.js';
import { authMiddleware, soloEditores, configurarFiltroProyectos, verificarAccesoProyecto } from '../middlewares/authMiddleware.js';

const router = express.Router();
const proyectoController = new ProyectoController();

// Obtener todos los proyectos (editores ven todos, visitantes solo sus asignados)
router.get('/', authMiddleware, configurarFiltroProyectos, proyectoController.listarProyectos.bind(proyectoController));

// Obtener proyecto específico (editores ven todos, visitantes solo los asignados)
router.get('/p', authMiddleware, verificarAccesoProyecto, proyectoController.obtenerProyecto.bind(proyectoController));

router.post('/p', authMiddleware, verificarAccesoProyecto, proyectoController.obtenerProyecto.bind(proyectoController));

/**
 * @swagger
 * /proyecto/usuario/{id_usuario}:
 *   get:
 *     summary: Obtiene proyectos asignados a un usuario específico
 *     tags: [Proyectos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_usuario
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID del usuario
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Lista de proyectos del usuario obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id_proyecto:
 *                         type: integer
 *                         example: 1
 *                       nombre_proyecto:
 *                         type: string
 *                         example: "Proyecto de ejemplo"
 *                       descripcion:
 *                         type: string
 *                         example: "Descripción del proyecto"
 *                       fecha_creacion:
 *                         type: string
 *                         format: date-time
 *                       fecha_estimacion_finalizacion:
 *                         type: string
 *                         format: date-time
 *                       estado:
 *                         type: string
 *                         example: "ACTIVO"
 *                       categoria:
 *                         type: object
 *                         properties:
 *                           id_categoria:
 *                             type: integer
 *                             example: 1
 *                           nombre_categoria:
 *                             type: string
 *                             example: "Desarrollo"
 *                 total:
 *                   type: integer
 *                   example: 5
 *       400:
 *         description: Datos de entrada inválidos
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/usuario/:id_usuario', authMiddleware, proyectoController.obtenerProyectosPorIdUsuario.bind(proyectoController));

// Crear proyecto
router.post('/', authMiddleware, soloEditores, proyectoController.crearProyecto.bind(proyectoController));

// Actualizar proyecto
router.patch('/', authMiddleware, soloEditores, proyectoController.actualizarProyecto.bind(proyectoController));

// Eliminar proyecto
router.delete('/', authMiddleware, soloEditores, proyectoController.eliminarProyecto.bind(proyectoController));

export default router;