// src/controllers/searchController.js
import SearchService from '../services/searchService.js';

class SearchController {
  constructor() {
    this.searchService = new SearchService();
  }

  // ... (todo tu método search tal como está)
  async search(req, res, next) {
    try {
      const { q, scope = 'all' } = req.query;

      if (!q || typeof q !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'El parámetro "q" es obligatorio y debe ser un string.',
        });
      }

      const validScopes = [
        'proyectos',
        'agentes',
        'prompts',
        'secuencias',
        'testing_cards',
        'learning_cards',
        'documentos',
        'all',
      ];

      if (scope && !validScopes.includes(scope)) {
        return res.status(400).json({
          success: false,
          message: `El parámetro "scope" debe ser uno de: ${validScopes.join(', ')}.`,
        });
      }

      const userContext = req.user
        ? {
            tipo: req.user.tipo,
            proyectosPermitidos: req.user.proyectos || [],
          }
        : { tipo: null, proyectosPermitidos: [] };

      const results = await this.searchService.search(q, scope, userContext);

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
  }
}

// 👇 instancia + exports compatibles con tu ruta
const searchController = new SearchController();

export { searchController };
export default SearchController;
