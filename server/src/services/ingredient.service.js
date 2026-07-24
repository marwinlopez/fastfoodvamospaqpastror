const ingredientRepository = require("../repositories/ingredient.repository");
const productRepository = require("../repositories/product.repository");
const recipeRepository = require("../repositories/recipe.repository");
const recipeService = require("./recipe.service");
const { convertUnits } = require("../utils/unit-conversion");

class IngredientService {
  async getIngredientById(id) {
    return await ingredientRepository.getById(id);
  }

  async createIngredient(ingredientData) {
    const {
      recipeId,
      productId,
      subRecipeId,
      unitOfMeasurement,
      quantityUnitOfMeasurement,
    } = ingredientData;

    const { cost, description } = await this.calculateIngredientCostAndDescription({
      productId,
      subRecipeId,
      unitOfMeasurement,
      quantityUnitOfMeasurement,
    });

    const newIng = {
      recipeId,
      productId: subRecipeId ? null : productId,
      subRecipeId: subRecipeId || null,
      description,
      unitOfMeasurement,
      quantityUnitOfMeasurement: parseFloat(quantityUnitOfMeasurement),
      quantity: parseFloat(quantityUnitOfMeasurement),
      cost: cost,
      isActive: true,
    };

    const created = await ingredientRepository.create(newIng);

    // Recalculate totals for the recipe
    await recipeService.recalculateRecipeTotals(recipeId);

    return created;
  }

  async updateIngredient(id, updateData) {
    const existing = await ingredientRepository.getById(id);
    if (!existing) {
      throw new Error("Ingrediente no encontrado");
    }

    const {
      recipeId,
      productId,
      subRecipeId,
      unitOfMeasurement,
      quantityUnitOfMeasurement,
    } = updateData;

    const currentProductId = productId !== undefined ? productId : existing.productId;
    const currentSubRecipeId = subRecipeId !== undefined ? subRecipeId : existing.subRecipeId;
    const currentUnitOfMeasurement = unitOfMeasurement !== undefined ? unitOfMeasurement : existing.unitOfMeasurement;
    const currentQuantity = quantityUnitOfMeasurement !== undefined ? quantityUnitOfMeasurement : existing.quantityUnitOfMeasurement;

    const { cost, description } = await this.calculateIngredientCostAndDescription({
      productId: currentProductId,
      subRecipeId: currentSubRecipeId,
      unitOfMeasurement: currentUnitOfMeasurement,
      quantityUnitOfMeasurement: currentQuantity,
    });

    const updatedIng = {
      recipeId: recipeId || existing.recipeId,
      productId: currentSubRecipeId ? null : currentProductId,
      subRecipeId: currentSubRecipeId || null,
      description,
      unitOfMeasurement: currentUnitOfMeasurement,
      quantityUnitOfMeasurement: parseFloat(currentQuantity),
      quantity: parseFloat(currentQuantity),
      cost: cost,
    };

    const updated = await ingredientRepository.update(id, updatedIng);

    // Recalculate totals for the recipe
    await recipeService.recalculateRecipeTotals(updatedIng.recipeId);

    return updated;
  }

  async deleteIngredient(id) {
    const existing = await ingredientRepository.getById(id);
    if (!existing) {
      throw new Error("Ingrediente no encontrado");
    }

    await ingredientRepository.delete(id);

    // Recalculate totals for the recipe
    await recipeService.recalculateRecipeTotals(existing.recipeId);

    return existing;
  }

  async calculateIngredientCostAndDescription({
    productId,
    subRecipeId,
    unitOfMeasurement,
    quantityUnitOfMeasurement,
  }) {
    let cost = 0;
    let description = "";
    const qty = parseFloat(quantityUnitOfMeasurement || 0);

    if (subRecipeId) {
      const subRecipe = await recipeRepository.getById(subRecipeId);
      if (subRecipe) {
        description = subRecipe.name || "Sub-Receta";
        const unit = (unitOfMeasurement || "").toLowerCase();

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
        cost = costPerGram * qtyInGrams;
      } else {
        description = "Sub-Receta " + subRecipeId;
        cost = 1.0 * qty;
      }
    } else if (productId) {
      const product = await productRepository.getById(productId);
      if (product) {
        description = product.producto || product.name || "";
        const price = parseFloat(product.precioCompra || product.price || 0);
        const packQty = parseFloat(product.cantidadPresentacion || 1);
        const unitQty = parseFloat(product.cantidadEmpaque || 1);
        // Precio por unidad de contenido, en la unidad de medida del producto
        // (ej. precio de la caja / (36 botellas × 244 ml) = precio por ml)
        const unitPrice = price / (packQty * unitQty);
        // Convertir la cantidad usada en la receta a la unidad del producto
        // (ej. receta pide 200 gr de un producto registrado en kg)
        const qtyInProductUnit = convertUnits(
          qty,
          unitOfMeasurement,
          product.unidadMedida
        );
        cost = unitPrice * qtyInProductUnit;
      } else {
        description = "Ingrediente " + productId;
        cost = 1.0 * qty;
      }
    }

    return { cost, description };
  }
}

module.exports = new IngredientService();
