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
}

module.exports = new ProductRepository();
