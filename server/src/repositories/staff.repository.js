const BaseRepository = require("./base.repository");

class StaffRepository extends BaseRepository {
  constructor() {
    super("staff", "id", "staffId");
  }

  async findByEmail(email) {
    const rows = await this.query(
      'SELECT * FROM "staff" WHERE LOWER("email") = LOWER($1)',
      [email]
    );
    return this.mapCustomId(rows[0] || null);
  }
}

module.exports = new StaffRepository();
