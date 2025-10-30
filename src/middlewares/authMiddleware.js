import JWTUtils from '../utils/jwtUtils.js';
import ApiError from '../utils/ApiError.js';

/**
 * Middleware para verificar JWT en requests
 */
export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = JWTUtils.extraerTokenDelHeader(authHeader);
    const decoded = JWTUtils.verificarToken(token);

    // Agregar información del usuario al request
    req.user = decoded;
    next();

  } catch (error) {
    next(new ApiError('Token inválido o no proporcionado', 401));
  }
};

/**
 * Middleware para verificar que el usuario sea EDITOR
 */
export const soloEditores = (req, res, next) => {
  if (req.user.tipo !== 'EDITOR') {
    return next(new ApiError('Solo los editores pueden realizar esta acción', 403));
  }
  next();
};

/**
 * Middleware para verificar acceso a proyecto específico
 */
export const verificarAccesoProyecto = (req, res, next) => {
  const user = req.user;
  
  // Editores tienen acceso total
  if (user.tipo === 'EDITOR') {
    return next();
  }

  // Visitantes solo a sus proyectos asignados
  if (user.tipo === 'VISITANTE') {
    const proyectoId = parseInt(req.params.id_proyecto || req.body.id_proyecto);
    
    if (!user.proyectos || !user.proyectos.includes(proyectoId)) {
      return next(new ApiError('Sin acceso a este proyecto', 403));
    }
    
    return next();
  }

  next(new ApiError('Tipo de usuario no válido', 403));
};

/**
 * Middleware para filtrar proyectos según permisos del usuario
 * Agrega información de filtrado al request para que el controlador la use
 */
export const configurarFiltroProyectos = (req, res, next) => {
  const user = req.user;
  
  // Agregar información de filtrado al request
  req.filtroProyectos = {
    tipo: user.tipo,
    proyectosPermitidos: user.tipo === 'VISITANTE' ? user.proyectos : null
  };
  
  next();
};