// src/routes/usuarioRoutes.js
/**
 * Módulo de rutas para usuarios.
 * @module routes/usuarioRoutes
 */

import express from 'express';
import UsuarioController from '../controllers/usuarioController.js';
import { authMiddleware, soloEditores } from '../middlewares/authMiddleware.js';
// Corregir la ruta de importación del middleware de subida de imágenes ERA el upload2  
import { uploadImages } from '../middlewares/uploadMiddleware.js';

const router = express.Router();
const usuarioController = new UsuarioController();

/**
 * @swagger
 * components:
 *   schemas:
 *     Usuario:
 *       type: object
 *       required:
 *         - alias
 *         - password
 *         - tipo
 *       properties:
 *         id_usuario:
 *           type: string
 *           format: uuid
 *           description: UUID único del usuario
 *         alias:
 *           type: string
 *           minLength: 3
 *           maxLength: 50
 *           pattern: '^[a-zA-Z0-9_-]+$'
 *           description: Alias único del usuario
 *         password:
 *           type: string
 *           minLength: 8
 *           maxLength: 100
 *           description: Contraseña del usuario (solo para creación/actualización)
 *         tipo:
 *           type: string
 *           enum: [EDITOR, VISITANTE]
 *           description: Tipo de usuario
 *         id_empleado:
 *           type: integer
 *           minimum: 1
 *           description: ID del empleado (requerido para EDITOR, null para VISITANTE)
 *         activo:
 *           type: boolean
 *           default: true
 *           description: Estado activo/inactivo del usuario
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización
 *       example:
 *         id_usuario: "123e4567-e89b-12d3-a456-426614174000"
 *         alias: "juan_editor"
 *         tipo: "EDITOR"
 *         id_empleado: 1
 *         activo: true
 *         created_at: "2024-01-15T10:30:00Z"
 *         updated_at: "2024-01-15T10:30:00Z"
 * 
 *     UsuarioCreate:
 *       type: object
 *       required:
 *         - alias
 *         - password
 *         - tipo
 *       properties:
 *         alias:
 *           type: string
 *           minLength: 3
 *           maxLength: 50
 *           pattern: '^[a-zA-Z0-9_-]+$'
 *         password:
 *           type: string
 *           minLength: 8
 *           maxLength: 100
 *         tipo:
 *           type: string
 *           enum: [EDITOR, VISITANTE]
 *         id_empleado:
 *           type: integer
 *           minimum: 1
 *         activo:
 *           type: boolean
 *           default: true
 *       example:
 *         alias: "nuevo_editor"
 *         password: "Password123"
 *         tipo: "EDITOR"
 *         id_empleado: 1
 * 
 *     UsuarioUpdate:
 *       type: object
 *       properties:
 *         alias:
 *           type: string
 *           minLength: 3
 *           maxLength: 50
 *           pattern: '^[a-zA-Z0-9_-]+$'
 *         password:
 *           type: string
 *           minLength: 8
 *           maxLength: 100
 *         tipo:
 *           type: string
 *           enum: [EDITOR, VISITANTE]
 *         id_empleado:
 *           type: integer
 *           minimum: 1
 *         activo:
 *           type: boolean
 *       example:
 *         alias: "alias_actualizado"
 *         tipo: "VISITANTE"
 * 
 *     Estadisticas:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *           description: Total de usuarios
 *         activos:
 *           type: integer
 *           description: Usuarios activos
 *         inactivos:
 *           type: integer
 *           description: Usuarios inactivos
 *         editores:
 *           type: integer
 *           description: Total de editores
 *         visitantes:
 *           type: integer
 *           description: Total de visitantes
 *         editores_activos:
 *           type: integer
 *           description: Editores activos
 *         visitantes_activos:
 *           type: integer
 *           description: Visitantes activos
 *       example:
 *         total: 25
 *         activos: 20
 *         inactivos: 5
 *         editores: 10
 *         visitantes: 15
 *         editores_activos: 8
 *         visitantes_activos: 12
 * 
 *   responses:
 *     UsuarioResponse:
 *       description: Respuesta exitosa con un usuario
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: true
 *               message:
 *                 type: string
 *                 example: "Usuario obtenido exitosamente"
 *               data:
 *                 $ref: '#/components/schemas/Usuario'
 * 
 *     UsuariosResponse:
 *       description: Respuesta exitosa con lista de usuarios
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: true
 *               data:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Usuario'
 *               total:
 *                 type: integer
 *                 example: 10
 */

/**
 * @swagger
 * /usuarios/estadisticas:
 *   get:
 *     summary: Obtiene estadísticas de usuarios
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Estadisticas'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
// Solo EDITOREs pueden ver estadísticas (información sensible)
router.get('/estadisticas', authMiddleware, soloEditores, usuarioController.obtenerEstadisticas.bind(usuarioController));

/**
 * @swagger
 * /usuarios/empleado/{id_empleado}:
 *   get:
 *     summary: Obtiene usuarios por ID de empleado
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_empleado
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID del empleado
 *     responses:
 *       200:
 *         $ref: '#/components/responses/UsuariosResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/empleado/:id_empleado', authMiddleware, soloEditores, usuarioController.obtenerPorIdEmpleado.bind(usuarioController));

/**
 * @swagger
 * /usuarios:
 *   get:
 *     summary: Obtiene todos los usuarios con filtros opcionales
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: activo
 *         schema:
 *           type: boolean
 *         description: Filtrar por estado activo
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *           enum: [EDITOR, VISITANTE]
 *         description: Filtrar por tipo de usuario
 *     responses:
 *       200:
 *         $ref: '#/components/responses/UsuariosResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *   post:
 *     summary: Crea un nuevo usuario
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UsuarioCreate'
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Usuario creado exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/Usuario'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/', authMiddleware, soloEditores, usuarioController.obtenerTodos.bind(usuarioController));
router.post('/', authMiddleware, usuarioController.crear.bind(usuarioController));

/**
 * @swagger
 * /usuarios/visitante:
 *   post:
 *     summary: Crea un nuevo usuario visitante
 *     tags: [Usuarios]
 *     description: Crea un usuario visitante con solo alias y password. No requiere autenticación.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - alias
 *               - password
 *             properties:
 *               alias:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 50
 *                 pattern: '^[a-zA-Z0-9_@-]+$'
 *                 description: Alias único del usuario visitante
 *                 example: "visitante123"
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 maxLength: 100
 *                 description: Contraseña del usuario (debe contener al menos una minúscula, una mayúscula y un número)
 *                 example: "Password123"
 *     responses:
 *       201:
 *         description: Usuario visitante creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Usuario visitante creado exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/Usuario'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/visitante', usuarioController.crearVisitante.bind(usuarioController));

/**
 * @swagger
 * /usuarios/{id}:
 *   get:
 *     summary: Obtiene un usuario por su UUID
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID del usuario
 *     responses:
 *       200:
 *         $ref: '#/components/responses/UsuarioResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *   patch:
 *     summary: Actualiza un usuario existente
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UsuarioUpdate'
 *     responses:
 *       200:
 *         description: Usuario actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Usuario actualizado exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/Usuario'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *   delete:
 *     summary: Elimina un usuario de forma física
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID del usuario
 *     responses:
 *       200:
 *         description: Usuario eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Usuario eliminado exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/Usuario'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /usuarios/{id}/baja:
 *   patch:
 *     summary: Da de baja a un usuario (activo = false)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID del usuario
 *     responses:
 *       200:
 *         description: Usuario dado de baja exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Usuario dado de baja exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/Usuario'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.patch('/:id/baja', authMiddleware,  usuarioController.darBaja.bind(usuarioController));

/**
 * @swagger
 * /usuarios/{id}/alta:
 *   patch:
 *     summary: Da de alta a un usuario (activo = true)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID del usuario
 *     responses:
 *       200:
 *         description: Usuario dado de alta exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Usuario dado de alta exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/Usuario'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.patch('/:id/alta', authMiddleware, soloEditores, usuarioController.darAlta.bind(usuarioController));

/**
 * @swagger
 * /usuarios/{id}/password:
 *   patch:
 *     summary: Cambia la contraseña de un usuario
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password_actual
 *               - password_nueva
 *             properties:
 *               password_actual:
 *                 type: string
 *                 description: Contraseña actual del usuario
 *               password_nueva:
 *                 type: string
 *                 minLength: 8
 *                 maxLength: 100
 *                 description: Nueva contraseña del usuario
 *             example:
 *               password_actual: "Password123"
 *               password_nueva: "NewPassword456"
 *     responses:
 *       200:
 *         description: Contraseña cambiada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Contraseña cambiada exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/Usuario'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.patch('/:id/password', authMiddleware, soloEditores, usuarioController.cambiarPassword.bind(usuarioController));

router.patch('/:id_usuario/asignar-empleado', authMiddleware, soloEditores, usuarioController.asignarEmpleado.bind(usuarioController));

/**
 * @swagger
 * /usuarios/{id}/tipo:
 *   patch:
 *     summary: Actualiza el tipo de usuario (EDITOR/VISITANTE)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tipo
 *             properties:
 *               tipo:
 *                 type: string
 *                 enum: [EDITOR, VISITANTE]
 *                 description: Nuevo tipo de usuario
 *             example:
 *               tipo: "EDITOR"
 *     responses:
 *       200:
 *         description: Tipo de usuario actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "El usuario ahora es EDITOR"
 *                 data:
 *                   $ref: '#/components/schemas/Usuario'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.patch('/:id/tipo', authMiddleware, soloEditores, usuarioController.actualizarTipo.bind(usuarioController));

// Rutas genéricas - DEBEN IR AL FINAL para evitar conflictos con rutas específicas
router.get('/:id', authMiddleware, soloEditores, usuarioController.obtenerPorId.bind(usuarioController));
router.patch('/:id', authMiddleware, usuarioController.actualizar.bind(usuarioController));
router.delete('/:id', authMiddleware, soloEditores, usuarioController.eliminar.bind(usuarioController));

//Para actualizar la imagen de perfil del usuario
router.post('/upload',authMiddleware,uploadImages.single('image'),usuarioController.uploadImage.bind(usuarioController));



export default router;
