const ingredientService = require("../services/ingredient.service");
const asyncHandler = require("../utils/asyncHandler");

exports.getById = asyncHandler(async (req, res) => {
  const ingredient = await ingredientService.getIngredientById(req.params.id);
  if (!ingredient) {
    return res.status(404).json({ message: "Ingrediente no encontrado" });
  }
  res.json({ success: true, ingredient });
});

exports.create = asyncHandler(async (req, res) => {
  const ingredient = await ingredientService.createIngredient(req.body);
  res.json({ success: true, ingredient });
});

exports.update = asyncHandler(async (req, res) => {
  const ingredient = await ingredientService.updateIngredient(req.params.id, req.body);
  res.json({ success: true, ingredient });
});

exports.delete = asyncHandler(async (req, res) => {
  const ingredient = await ingredientService.deleteIngredient(req.params.id);
  res.json({ success: true, message: "Ingrediente eliminado", deletedIngredient: ingredient });
});
