const unitRepository = require("../repositories/unit.repository");

class UnitService {
  async getAllUnits() {
    let units = await unitRepository.getAll();
    if (units.length === 0) {
      const defaultUnits = [
        { name: "Gramos" },
        { name: "Kilogramos" },
        { name: "Unidades" },
        { name: "Mililitros" },
        { name: "Litros" },
        { name: "Libras" },
      ];
      units = await unitRepository.createBatch(defaultUnits);
    }
    return units;
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
