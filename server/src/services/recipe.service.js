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
    const { name, merma, labor } = updateData;
    const fieldsToUpdate = {};
    if (name !== undefined) fieldsToUpdate.name = name;
    if (merma !== undefined) fieldsToUpdate.merma = parseFloat(merma);
    if (labor !== undefined) {
      fieldsToUpdate.labor = JSON.stringify(this.sanitizeLabor(labor));
    }

    const updated = await recipeRepository.update(id, fieldsToUpdate);

    if (merma !== undefined || labor !== undefined) {
      await this.recalculateRecipeTotals(id);
    }
    return updated;
  }

  // Normaliza el arreglo de mano de obra: [{role, hourlyRate, hours}]
  sanitizeLabor(labor) {
    if (!Array.isArray(labor)) return [];
    return labor
      .map((l) => ({
        role: (l.role || "").toString().trim(),
        hourlyRate: parseFloat(l.hourlyRate) || 0,
        hours: parseFloat(l.hours) || 0,
      }))
      .filter((l) => l.role !== "" && l.hourlyRate > 0 && l.hours > 0);
  }

  // Costo mano de obra = Σ (hourlyRate × hours)
  calculateLaborCost(labor) {
    const list = Array.isArray(labor) ? labor : [];
    return list.reduce(
      (sum, l) => sum + (parseFloat(l.hourlyRate) || 0) * (parseFloat(l.hours) || 0),
      0
    );
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

  async recalculateRecipeTotals(recipeId, visited = new Set()) {
    // Protección contra ciclos entre sub-recetas
    if (visited.has(recipeId)) return;
    visited.add(recipeId);

    const recipe = await recipeRepository.getById(recipeId);
    if (!recipe) return;

    // 1. Costo de insumos (ingredientes + sub-recetas)
    const ingredients = await ingredientRepository.getByRecipeId(recipeId);
    let insumosCost = 0;
    ingredients.forEach((d) => {
      insumosCost += parseFloat(d.cost || 0);
    });

    // 2. Costo de mano de obra = Σ (hourlyRate × hours)
    const laborCost = this.calculateLaborCost(recipe.labor);

    // 3. Costo base + ajuste por merma: costoTotal = base / (1 - M/100)
    const costBase = insumosCost + laborCost;
    const merma = Math.min(Math.max(parseFloat(recipe.merma) || 0, 0), 99);
    const totalCost = merma > 0 ? costBase / (1 - merma / 100) : costBase;

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

    // 4. Cascada: recetas padre que usan esta receta como sub-receta
    //    deben recalcular el costo de su ingrediente y sus totales.
    const dependents = await ingredientRepository.getBySubRecipeId(recipeId);
    for (const ing of dependents) {
      const qty = parseFloat(ing.quantityUnitOfMeasurement || ing.quantity || 0);
      const unit = (ing.unitOfMeasurement || "").toLowerCase();

      let qtyInGrams;
      if (["gramos", "g", "gr", "mililitros", "ml"].includes(unit)) {
        qtyInGrams = qty;
      } else if (["kilogramos", "kg", "kilos", "litros", "l"].includes(unit)) {
        qtyInGrams = qty * 1000;
      } else if (["libras", "lb", "lbs"].includes(unit)) {
        qtyInGrams = qty * 453.592;
      } else {
        qtyInGrams = (totalWeight || 1) * qty;
      }

      const costPerGram = totalCost / (totalWeight || 1);
      const newIngCost = costPerGram * qtyInGrams;

      await ingredientRepository.update(ing.idIngredient || ing.id, {
        cost: newIngCost,
      });
      await this.recalculateRecipeTotals(ing.recipeId, visited);
    }

    return { totalCost, insumosCost, laborCost, totalWeight, updatedRecipe };
  }
}

module.exports = new RecipeService();
