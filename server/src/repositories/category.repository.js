const BaseRepository = require("./base.repository");

class CategoryRepository extends BaseRepository {
  constructor() {
    super("categories", "id", "categoryId");
  }
}

module.exports = new CategoryRepository();
