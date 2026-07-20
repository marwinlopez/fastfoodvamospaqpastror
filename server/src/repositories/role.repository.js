const BaseRepository = require("./base.repository");

class RoleRepository extends BaseRepository {
  constructor() {
    super("roles", "id", "roleId");
  }
}

module.exports = new RoleRepository();
