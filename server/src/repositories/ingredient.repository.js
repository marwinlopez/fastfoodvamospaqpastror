const BaseRepository = require("./base.repository");

class IngredientRepository extends BaseRepository {
  constructor() {
    super("ingredients", "id", "idIngredient");
  }

  async getByRecipeId(recipeId) {
    const rows = await this.query(
      `SELECT * FROM "${this.tableName}" WHERE ${this.col("recipeId")} = $1`,
      [recipeId]
    );
    return rows.map(item => this.mapCustomId(item));
  }
}

module.exports = new IngredientRepository();
