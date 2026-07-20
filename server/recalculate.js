const recipeService = require("./src/services/recipe.service");
const ingredientService = require("./src/services/ingredient.service");
const recipeRepository = require("./src/repositories/recipe.repository");
const ingredientRepository = require("./src/repositories/ingredient.repository");

async function run() {
  try {
    console.log("Recalculating ingredient costs for sub-recipes...");
    const ingredients = await ingredientRepository.getAll();
    for (const data of ingredients) {
      if (data.subRecipeId) {
        const subRecipe = await recipeRepository.getById(data.subRecipeId);
        if (subRecipe) {
          const qty = parseFloat(data.quantityUnitOfMeasurement || data.quantity || 0);
          const unit = (data.unitOfMeasurement || "").toLowerCase();

          let qtyInGrams = 0;
          if (["gramos", "g", "gr", "mililitros", "ml"].includes(unit)) {
            qtyInGrams = qty;
          } else if (["kilogramos", "kg", "kilos", "litros", "l"].includes(unit)) {
            qtyInGrams = qty * 1000;
          } else if (["libras", "lb", "lbs"].includes(unit)) {
            qtyInGrams = qty * 453.592;
          } else {
            qtyInGrams = (parseFloat(subRecipe.weight) || 1) * qty;
          }

          const costPerGram = parseFloat(subRecipe.cost || 0) / (parseFloat(subRecipe.weight) || 1);
          const newCost = costPerGram * qtyInGrams;

          await ingredientRepository.update(data.id, { cost: newCost });
          console.log(`Updated sub-recipe ingredient ${data.id} cost to ${newCost}`);
        }
      }
    }

    console.log("Recalculating recipe totals...");
    const recipes = await recipeRepository.getAll();
    for (const recipe of recipes) {
      const { totalCost, totalWeight } = await recipeService.recalculateRecipeTotals(recipe.id);
      console.log(`Updated recipe ${recipe.id} (${recipe.name}) - Cost: ${totalCost}, Weight: ${totalWeight}`);
    }

    console.log("Recalculation completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Error during recalculation:", error);
    process.exit(1);
  }
}

run();
