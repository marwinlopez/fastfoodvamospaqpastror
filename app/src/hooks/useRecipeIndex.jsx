import React, { useContext, useState } from "react";
import apis from "../../api";
import { GlobalContext } from "../context/GlobalContext";
import { useEffect } from "react";
import { set } from "react-hook-form";

const useRecipeIndex = () => {
  const { recipe, setRecipe } = useContext(GlobalContext);
  const [receta, setReceta] = useState();

  useEffect(() => {
    // console.log(recipe);
    if (!recipe)
      setRecipe({
        idRecipe: 0,
        name: "",
        cost: "0.00",
        coin: "USD",
        ingredients: [],
      });
  }, []);

  const create = (newRecipe) => {
    // const { data } = await apis.newRecipe({
    //   id: recipe.idRecipe,
    //   name: recipe.name,
    //   cost: recipe.cost,
    //   coin: recipe.coin,
    //   isActive: 1,
    // });
    // console.log(data);
    setRecipe(newRecipe);
    // if (data) {
    //   recipe.idRecipe = data.data.idRecipe;
    // dispatch({ type: "NEWRECIPE", payload: recipe });
    // }
    return newRecipe;
  };

  return {
    create,
    recipe,
    setRecipe,
  };
};

export default useRecipeIndex;
