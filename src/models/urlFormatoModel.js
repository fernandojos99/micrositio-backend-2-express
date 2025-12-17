// src/models/urlFormatoModel.js
class UrlFormatoModel {
  constructor(data = {}) {
    this.id_url_formato = data.id_url_formato || null;
    this.url = data.url || '';
    this.created_at = data.created_at || null;
    this.updated_at = data.updated_at || null;
    this.categoria = data.categoria || null;
  }

  static fromDatabase(row) {
    return new UrlFormatoModel({
      id_url_formato: row.id_url_formato,
      url: row.url,
      created_at: row.created_at,
      updated_at: row.updated_at,
      categoria: row.categoria
    });
  }

  toDatabase() {
    const data = {
      url: this.url,
      categoria: this.categoria
    };

    if (this.id_url_formato) {
      data.id_url_formato = this.id_url_formato;
    }

    return data;
  }
}

export default UrlFormatoModel;