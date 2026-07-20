const categoryRepository = require("../repositories/category.repository");

class CategoryService {
  async getAllCategories() {
    let categories = await categoryRepository.getAll();
    if (categories.length === 0) {
      const defaultCategories = [
        { name: "Hamburguesas" },
        { name: "Papas" },
        { name: "Bebidas" },
      ];
      categories = await categoryRepository.createBatch(defaultCategories);
    }
    return categories;
  }

  async createCategory(data) {
    return await categoryRepository.create({ name: data.name });
  }

  async updateCategory(id, data) {
    return await categoryRepository.update(id, { name: data.name });
  }

  async deleteCategory(id) {
    return await categoryRepository.delete(id);
  }
}

module.exports = new CategoryService();
