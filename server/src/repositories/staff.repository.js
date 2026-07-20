const BaseRepository = require("./base.repository");

class StaffRepository extends BaseRepository {
  constructor() {
    super("staff", "id", "staffId");
  }
}

module.exports = new StaffRepository();
