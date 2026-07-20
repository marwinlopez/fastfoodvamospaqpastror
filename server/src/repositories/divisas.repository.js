const BaseRepository = require("./base.repository");

class DivisasRepository extends BaseRepository {
  constructor() {
    super("divisas", "name", null);
  }

  async getByName(name) {
    const rows = await this.query(
      `SELECT * FROM "${this.tableName}" WHERE ${this.col("name")} = $1`,
      [name]
    );
    return rows.map(item => this.mapCustomId(item));
  }

  async getByDocumentIdAsArray(id) {
    const data = await this.getById(id);
    return data ? [data] : [];
  }
}

module.exports = new DivisasRepository();
