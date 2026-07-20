const recipeService = require("../services/recipe.service");
const asyncHandler = require("../utils/asyncHandler");

exports.getAll = asyncHandler(async (req, res) => {
  const recipes = await recipeService.getAllRecipes();
  res.json({ success: true, recipes });
});

exports.getById = asyncHandler(async (req, res) => {
  const recipe = await recipeService.getRecipeById(req.params.id);
  if (!recipe) {
    return res.status(404).json({ message: "Receta no encontrada" });
  }
  res.json({ success: true, recipe });
});

exports.create = asyncHandler(async (req, res) => {
  const recipe = await recipeService.createRecipe(req.body);
  res.json({ success: true, recipe });
});

exports.update = asyncHandler(async (req, res) => {
  await recipeService.updateRecipe(req.params.id, req.body);
  res.json({ success: true, message: "Receta actualizada" });
});

exports.delete = asyncHandler(async (req, res) => {
  await recipeService.deleteRecipe(req.params.id);
  res.json({ success: true, message: "Receta eliminada" });
});
