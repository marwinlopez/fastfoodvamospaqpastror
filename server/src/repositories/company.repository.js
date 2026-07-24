const BaseRepository = require("./base.repository");

class CompanyRepository extends BaseRepository {
  constructor() {
    super("companies", "id", "companyId");
  }
}

module.exports = new CompanyRepository();
