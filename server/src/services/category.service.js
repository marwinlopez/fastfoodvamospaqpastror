const categoryRepository = require("../repositories/category.repository");

class CategoryService {
  async getAllCategories() {
    return await categoryRepository.getAll();
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
