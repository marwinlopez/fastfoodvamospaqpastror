const BaseRepository = require("./base.repository");

class UnitRepository extends BaseRepository {
  constructor() {
    super("units");
  }
}

module.exports = new UnitRepository();
