const BaseRepository = require("./base.repository");

class RecipeRepository extends BaseRepository {
  constructor() {
    super("recipes", "id", "recipeId");
  }
}

module.exports = new RecipeRepository();
