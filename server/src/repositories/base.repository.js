const { pool } = require("../db");
const { v4: uuidv4 } = require("uuid");

class BaseRepository {
  constructor(tableName, primaryKey = "id", customIdKey = null) {
    this.tableName = tableName;
    this.primaryKey = primaryKey;
    this.customIdKey = customIdKey;
  }

  mapCustomId(record) {
    if (!record) return null;
    if (this.customIdKey) {
      record[this.customIdKey] = record[this.primaryKey];
    }
    return record;
  }

  // Construye un nombre de columna seguro con comillas para preservar camelCase
  col(name) {
    return `"${name}"`;
  }

  async query(sql, params = []) {
    const client = await pool.connect();
    try {
      const result = await client.query(sql, params);
      return result.rows;
    } finally {
      client.release();
    }
  }

  async getAll() {
    const rows = await this.query(`SELECT * FROM "${this.tableName}"`);
    return rows.map(item => this.mapCustomId(item));
  }

  async getById(id) {
    const rows = await this.query(
      `SELECT * FROM "${this.tableName}" WHERE ${this.col(this.primaryKey)} = $1`,
      [id]
    );
    return this.mapCustomId(rows[0] || null);
  }

  async create(data) {
    const record = { ...data };

    // Asignar el ID personalizado si existe
    if (this.customIdKey && record[this.customIdKey] && !record[this.primaryKey]) {
      record[this.primaryKey] = record[this.customIdKey];
    }
    if (!record[this.primaryKey]) {
      record[this.primaryKey] = uuidv4();
    }
    if (this.customIdKey) {
      record[this.customIdKey] = record[this.primaryKey];
    }

    // Eliminar undefined
    Object.keys(record).forEach(k => record[k] === undefined && delete record[k]);

    const keys = Object.keys(record);
    const cols = keys.map(k => this.col(k)).join(", ");
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");
    const values = keys.map(k => record[k]);

    const rows = await this.query(
      `INSERT INTO "${this.tableName}" (${cols}) VALUES (${placeholders}) RETURNING *`,
      values
    );
    return this.mapCustomId(rows[0] || null);
  }

  async createBatch(items) {
    const results = [];
    for (const item of items) {
      const created = await this.create(item);
      results.push(created);
    }
    return results;
  }

  async update(id, data) {
    const record = { ...data };

    if (this.customIdKey && record[this.customIdKey] && !record[this.primaryKey]) {
      record[this.primaryKey] = record[this.customIdKey];
    }
    if (this.customIdKey && id) {
      record[this.customIdKey] = id;
    }

    // Eliminar la clave primaria del SET para no sobreescribirla
    delete record[this.primaryKey];
    Object.keys(record).forEach(k => record[k] === undefined && delete record[k]);

    const keys = Object.keys(record);
    if (keys.length === 0) return await this.getById(id);

    const setClauses = keys.map((k, i) => `${this.col(k)} = $${i + 1}`).join(", ");
    const values = keys.map(k => record[k]);
    values.push(id);

    const rows = await this.query(
      `UPDATE "${this.tableName}" SET ${setClauses} WHERE ${this.col(this.primaryKey)} = $${values.length} RETURNING *`,
      values
    );
    return this.mapCustomId(rows[0] || null);
  }

  async delete(id) {
    await this.query(
      `DELETE FROM "${this.tableName}" WHERE ${this.col(this.primaryKey)} = $1`,
      [id]
    );
    return id;
  }
}

module.exports = BaseRepository;
