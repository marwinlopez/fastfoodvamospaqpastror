const categoryService = require("../services/category.service");
const asyncHandler = require("../utils/asyncHandler");

exports.getAll = asyncHandler(async (req, res) => {
  const categories = await categoryService.getAllCategories();
  res.json({ success: true, categories });
});

exports.create = asyncHandler(async (req, res) => {
  const category = await categoryService.createCategory(req.body);
  res.json({ success: true, category });
});

exports.update = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updated = await categoryService.updateCategory(id, req.body);
  res.status(202).json({ success: true, category: updated });
});

exports.delete = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await categoryService.deleteCategory(id);
  res.json({ success: true, message: "Categoría eliminada correctamente" });
});
