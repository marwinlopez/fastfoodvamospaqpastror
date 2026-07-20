const menuRepository = require("../repositories/menu.repository");

class MenuService {
  async getAllMenuItems() {
    return await menuRepository.getAll();
  }

  async createMenuItem(data) {
    const newMenuItem = {
      name: data.name,
      price: parseFloat(data.price || 0),
      description: data.description || "",
      category: data.category || "Hamburguesas",
      imageUrl: data.imageUrl || "",
      stock: parseInt(data.stock !== undefined ? data.stock : 0),
      isActive: data.isActive !== undefined ? data.isActive : true,
    };
    if (data.menuId) {
      newMenuItem.menuId = data.menuId;
    }
    return await menuRepository.create(newMenuItem);
  }

  async updateMenuItem(id, data) {
    const updateData = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.price !== undefined) updateData.price = parseFloat(data.price || 0);
    if (data.description !== undefined) updateData.description = data.description;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
    if (data.stock !== undefined) updateData.stock = parseInt(data.stock);
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    return await menuRepository.update(id, updateData);
  }

  async deleteMenuItem(id) {
    return await menuRepository.delete(id);
  }
}

module.exports = new MenuService();
