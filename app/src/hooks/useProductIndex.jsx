import React, { useContext } from "react";
import apis from "../../api";
import { GlobalContext } from "../context/GlobalContext";

const useProductIndex = () => {
  const { recipes, dispatch } = useContext(GlobalContext);
  const create = async (product, ingredient, callback) => {
    const ingredients = {
      id: 0,
      recipeId: product.recetaId,
      productId: product.productoId,
      unitOfMeasurementId: 2,
      quantityUnitOfMeasurement: ingredient.quantity,
      fixedCost: 0,
      isActive: 1,
    };
    let index = recipes.findIndex((x) => x.idRecipe === product.recetaId);
    let temporal = recipes.slice();
    apis
      .newIngredient(ingredients)
      .then(({ data }) => {
        const { recipeId } = data.data;
        apis
          .recipeForId(recipeId)
          .then(({ data }) => {
            return data;
          })
          .then(({ data }) => {
            console.log(temporal[index]);
            temporal[index] = data;
            dispatch({ type: "RECIPES", payload: temporal });
            callback(data)
          });
      })
      .catch((error) => {
        console.log(error);
      });
    return ingredients;
  };

  return {
    create,
  };
};

export default useProductIndex;
