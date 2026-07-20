const BaseRepository = require("./base.repository");

class MenuRepository extends BaseRepository {
  constructor() {
    super("menu", "id", "menuId");
  }
}

module.exports = new MenuRepository();
