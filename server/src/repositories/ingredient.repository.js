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

  // Ingredientes de otras recetas que usan esta receta como sub-receta
  async getBySubRecipeId(subRecipeId) {
    const rows = await this.query(
      `SELECT * FROM "${this.tableName}" WHERE ${this.col("subRecipeId")} = $1`,
      [subRecipeId]
    );
    return rows.map(item => this.mapCustomId(item));
  }
}

module.exports = new IngredientRepository();
