const BaseRepository = require("./base.repository");

class ProductRepository extends BaseRepository {
  constructor() {
    super("products", "id", "productId");
  }

  async searchByNameOrCoin(query) {
    const searchVal = `%${query || ""}%`;
    const rows = await this.query(
      `SELECT * FROM "${this.tableName}" WHERE ${this.col("producto")} ILIKE $1 OR ${this.col("coin")} ILIKE $1`,
      [searchVal]
    );
    return rows.map(item => this.mapCustomId(item));
  }

  // Incremento atómico de stock (unidades individuales); admite negativos para descontar.
  async addStock(id, unidades) {
    const rows = await this.query(
      `UPDATE "${this.tableName}"
       SET ${this.col("stock")} = GREATEST(COALESCE(${this.col("stock")}, 0) + $1, 0)
       WHERE ${this.col("id")} = $2
       RETURNING *`,
      [unidades, id]
    );
    return rows.length > 0 ? this.mapCustomId(rows[0]) : null;
  }
}

module.exports = new ProductRepository();
