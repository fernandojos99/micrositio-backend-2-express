import { pool } from '../config/database.js';

class FormatoRepository {
  static async create(formatoData) {
    const { document_name, document_url, document_type } = formatoData;
    
    const query = `
      INSERT INTO formato (document_name, document_url, document_type)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    
    const values = [document_name, document_url, document_type];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findAll() {
    const query = `
      SELECT * FROM formato
      ORDER BY created_at DESC
    `;
    
    const result = await pool.query(query);
    return result.rows;
  }

  static async findById(id) {
    const query = `
      SELECT * FROM formato
      WHERE id = $1
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async update(id, formatoData) {
    const { document_name, document_url, document_type } = formatoData;
    
    const query = `
      UPDATE formato
      SET document_name = $1, document_url = $2, document_type = $3, updated_at = NOW()
      WHERE id = $4
      RETURNING *
    `;
    
    const values = [document_name, document_url, document_type, id];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const query = `
      DELETE FROM formato
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

export default FormatoRepository;