const menuService = require("../services/menu.service");
const asyncHandler = require("../utils/asyncHandler");

exports.getAll = asyncHandler(async (req, res) => {
  const data = await menuService.getAllMenuItems();
  res.json({ success: true, menu: data });
});

exports.getById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const menuItem = await menuService.getMenuItemWithComponents(id);
  if (!menuItem) {
    return res.status(404).json({ success: false, message: "Platillo no encontrado" });
  }
  res.json({ success: true, menuItem });
});

exports.create = asyncHandler(async (req, res) => {
  const menuItem = await menuService.createMenuItem(req.body);
  res.json({ success: true, menuItem });
});

exports.update = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updated = await menuService.updateMenuItem(id, req.body);
  res.status(202).json({ success: true, menuItem: updated });
});

exports.delete = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await menuService.deleteMenuItem(id);
  res.json({ success: true, message: "Platillo eliminado correctamente" });
});
