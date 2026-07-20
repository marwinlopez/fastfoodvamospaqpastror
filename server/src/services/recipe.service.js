const recipeRepository = require("../repositories/recipe.repository");
const ingredientRepository = require("../repositories/ingredient.repository");

class RecipeService {
  async getAllRecipes() {
    return await recipeRepository.getAll();
  }

  async getRecipeById(id) {
    const recipe = await recipeRepository.getById(id);
    if (!recipe) return null;

    const ingredients = await ingredientRepository.getByRecipeId(id);
    return { ...recipe, ingredients };
  }

  async createRecipe(recipeData) {
    const { name, cost, coin, isActive } = recipeData;
    const newRecipe = {
      name: name || "",
      cost: cost || 0,
      coin: coin || "USD",
      isActive: isActive !== undefined ? isActive : true,
    };
    return await recipeRepository.create(newRecipe);
  }

  async updateRecipe(id, updateData) {
    const { name, merma } = updateData;
    const fieldsToUpdate = {};
    if (name !== undefined) fieldsToUpdate.name = name;
    if (merma !== undefined) fieldsToUpdate.merma = parseFloat(merma);

    const updated = await recipeRepository.update(id, fieldsToUpdate);

    if (merma !== undefined) {
      await this.recalculateRecipeTotals(id);
    }
    return updated;
  }

  async deleteRecipe(id) {
    return await recipeRepository.delete(id);
  }

  async calculateTotalWeight(recipeId) {
    const ingredients = await ingredientRepository.getByRecipeId(recipeId);
    let totalWeightGrams = 0;

    for (const data of ingredients) {
      const qty = parseFloat(data.quantityUnitOfMeasurement || data.quantity || 0);
      const unit = (data.unitOfMeasurement || "").toLowerCase();

      if (["gramos", "g", "gr", "mililitros", "ml"].includes(unit)) {
        totalWeightGrams += qty;
      } else if (["kilogramos", "kg", "kilos", "litros", "l"].includes(unit)) {
        totalWeightGrams += (qty * 1000);
      } else if (["libras", "lb", "lbs"].includes(unit)) {
        totalWeightGrams += (qty * 453.592);
      } else if (data.subRecipeId) {
        const subRecipe = await recipeRepository.getById(data.subRecipeId);
        if (subRecipe && subRecipe.weight) {
          totalWeightGrams += (parseFloat(subRecipe.weight) * qty);
        }
      }
    }

    const recipe = await recipeRepository.getById(recipeId);
    let merma = 0;
    if (recipe && recipe.merma) {
      merma = parseFloat(recipe.merma || 0);
    }

    if (merma > 0) {
      totalWeightGrams = totalWeightGrams - (totalWeightGrams * (merma / 100));
    }

    return totalWeightGrams;
  }

  async recalculateRecipeTotals(recipeId) {
    const ingredients = await ingredientRepository.getByRecipeId(recipeId);
    let totalCost = 0;
    ingredients.forEach((d) => {
      totalCost += parseFloat(d.cost || 0);
    });

    const totalWeight = await this.calculateTotalWeight(recipeId);

    const profitPercentage = 0;
    const profit = profitPercentage > 0 ? (totalCost * (profitPercentage / 100)) : 0;
    const price = totalCost + profit;

    const updatedRecipe = await recipeRepository.update(recipeId, {
      cost: totalCost,
      profit: profit,
      price: price,
      weight: totalWeight,
    });

    return { totalCost, totalWeight, updatedRecipe };
  }
}

module.exports = new RecipeService();
