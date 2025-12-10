const { searchService } = require('../services/searchService');

const searchController = {
  /**
   * Controlador para manejar la búsqueda general.
   * @route GET /search
   * @param req - Objeto de solicitud HTTP.
   * @param res - Objeto de respuesta HTTP.
   */
  async search(req, res) {
    try {
      // Validar parámetros de entrada
      const { q, scope = 'all' } = req.query;

      if (!q || typeof q !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'El parámetro "q" es obligatorio y debe ser un string.',
        });
      }

      const validScopes = ['proyectos', 'agentes', 'prompts', 'all'];
      if (scope && !validScopes.includes(scope)) {
        return res.status(400).json({
          success: false,
          message: `El parámetro "scope" debe ser uno de: ${validScopes.join(', ')}.`,
        });
      }

      // Llamar al servicio de búsqueda
      const results = await searchService.search(q, scope);

      // Responder con los resultados
      return res.status(200).json({
        success: true,
        data: results,
      });
    } catch (error) {
      console.error('Error en searchController.search:', error);
      return res.status(500).json({
        success: false,
        message: 'Ocurrió un error interno en el servidor.',
      });
    }
  },
};

module.exports = { searchController };