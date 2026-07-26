const BaseRepository = require("./base.repository");

class MenuComponentRepository extends BaseRepository {
  constructor() {
    super("menu_components", "id", "componentId");
  }

  async getByMenuId(menuId) {
    const rows = await this.query(
      `SELECT * FROM "${this.tableName}" WHERE ${this.col("menuId")} = $1`,
      [menuId]
    );
    return rows.map(item => this.mapCustomId(item));
  }

  async deleteByMenuId(menuId) {
    await this.query(
      `DELETE FROM "${this.tableName}" WHERE ${this.col("menuId")} = $1`,
      [menuId]
    );
  }
}

module.exports = new MenuComponentRepository();
