const menuRepository = require("../repositories/menu.repository");
const menuComponentRepository = require("../repositories/menuComponent.repository");

class MenuService {
  async getAllMenuItems() {
    return await menuRepository.getAll();
  }

  async getMenuItemWithComponents(id) {
    const item = await menuRepository.getById(id);
    if (!item) return null;
    const components = await menuComponentRepository.getByMenuId(id);
    return { ...item, components };
  }

  // Reemplaza todos los componentes de un platillo por la lista dada — el
  // cliente ya administra la lista completa en memoria (agregar/quitar
  // filas) y la manda entera al guardar, igual que hace con el resto del
  // formulario, así que no hace falta un CRUD granular por componente.
  async setMenuComponents(menuId, components) {
    await menuComponentRepository.deleteByMenuId(menuId);
    const list = Array.isArray(components) ? components : [];
    const rows = list
      .filter((c) => c.recipeId || c.productId)
      .map((c) => ({
        menuId,
        recipeId: c.recipeId || null,
        productId: c.recipeId ? null : c.productId || null,
        quantity: parseFloat(c.quantity || 1),
        description: c.description || "",
      }));
    if (rows.length > 0) {
      await menuComponentRepository.createBatch(rows);
    }
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
      recipeId: data.recipeId || null,
      productId: data.productId || null,
    };
    if (data.menuId) {
      newMenuItem.menuId = data.menuId;
    }
    const created = await menuRepository.create(newMenuItem);
    if (data.components !== undefined) {
      await this.setMenuComponents(created.id, data.components);
    }
    return created;
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
    if (data.recipeId !== undefined) updateData.recipeId = data.recipeId || null;
    if (data.productId !== undefined) updateData.productId = data.productId || null;

    const updated = await menuRepository.update(id, updateData);
    if (data.components !== undefined) {
      await this.setMenuComponents(id, data.components);
    }
    return updated;
  }

  async deleteMenuItem(id) {
    return await menuRepository.delete(id);
  }
}

module.exports = new MenuService();
