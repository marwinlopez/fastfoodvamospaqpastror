const unitRepository = require("../repositories/unit.repository");

class UnitService {
  async getAllUnits() {
    return await unitRepository.getAll();
  }

  async createUnit(data) {
    return await unitRepository.create({ name: data.name });
  }

  async updateUnit(id, data) {
    return await unitRepository.update(id, { name: data.name });
  }

  async deleteUnit(id) {
    return await unitRepository.delete(id);
  }
}

module.exports = new UnitService();
